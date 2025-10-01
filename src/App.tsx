import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Zap, DollarSign, Heart, Share2 } from 'lucide-react';
import SkipDrinkModal from './components/SkipDrinkModal';
import AuthModal from './components/AuthModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import EarlyAccessModal from './components/EarlyAccessModal';
import { supabase } from './lib/supabaseClient';

// Count-up helper (custom hook)
function useCountUp(value: number, durationMs = 700) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);
  useEffect(() => {
    startRef.current = null;
    fromRef.current = display;
    const start = fromRef.current;
    const delta = value - start;
    let raf: number;
    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / durationMs);
      setDisplay(start + delta * p);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return Math.round(display);
}

function AnimatedNumber({ value, formatter }: { value: number; formatter?: (n: number) => string }) {
  const d = useCountUp(value);
  return <>{formatter ? formatter(d) : d}</>;
}

function App() {
  const [isSkipDrinkModalOpen, setIsSkipDrinkModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isEarlyAccessOpen, setIsEarlyAccessOpen] = useState(false);
  const [promoEvents, setPromoEvents] = useState<Array<{ occurred_at: string; total_calories: number; total_money: number; details: any }>>([]);
  const [promoModeDashboard, setPromoModeDashboard] = useState(false);
  const [promoSkipsCount, setPromoSkipsCount] = useState(0);
  const [isAuthed, setIsAuthed] = useState(false);
  const [series, setSeries] = useState<{
    dates: string[];
    skips: number[];
    calories: number[];
    money: number[];
  } | null>(null);
  const [events, setEvents] = useState<Array<{ date: string; calories: number; money: number }>>([]);
  const [topDrinks, setTopDrinks] = useState<Array<{ id: string; count: number }>>([]);
  const [topSnacks, setTopSnacks] = useState<Array<{ id: string; count: number }>>([]);
  const [bestStreak, setBestStreak] = useState(0);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const confettiRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (isMounted) setIsAuthed(!!data.session);
    })();

    const { data: sub } = supabase?.auth.onAuthStateChange(async (event, session) => {
      setIsAuthed(!!session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetModalOpen(true);
      }
    }) || { data: { subscription: { unsubscribe: () => {} } } } as any;

    return () => {
      isMounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // If user lands on /reset-password with tokens in URL, exchange them for a session
  useEffect(() => {
    (async () => {
      if (!supabase) return;
      if (window.location.pathname === '/reset-password') {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (!error) {
            setIsResetModalOpen(true);
          }
        } catch {}
      }
    })();
  }, []);

  const fetchSeries = async (days: number = 30) => {
    if (!supabase || !isAuthed) return;
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    const fromIso = from.toISOString();
    const { data, error } = await supabase
      .from('skip_events')
      .select('occurred_at,total_calories,total_money,details')
      .gte('occurred_at', fromIso)
      .order('occurred_at', { ascending: true });
    if (error) return;

    // Build daily buckets
    const dateKey = (d: Date) => d.toISOString().slice(0, 10);
    const buckets = new Map<string, { skips: number; calories: number; money: number }>();
    // initialize all days to 0
    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      buckets.set(dateKey(d), { skips: 0, calories: 0, money: 0 });
    }
    const raw: Array<{ occurred_at: string; total_calories: number; total_money: number; details?: any }> = (data || []) as any;
    raw.forEach((row) => {
      const d = new Date(row.occurred_at);
      const k = dateKey(d);
      const b = buckets.get(k);
      if (b) {
        b.skips += 1;
        b.calories += row.total_calories || 0;
        b.money += Number(row.total_money || 0);
      }
    });
    const dates: string[] = Array.from(buckets.keys()).sort();
    const skips = dates.map((k) => buckets.get(k)!.skips);
    const calories = dates.map((k) => buckets.get(k)!.calories);
    const money = dates.map((k) => buckets.get(k)!.money);
    setSeries({ dates, skips, calories, money });
    setEvents(raw.map(r => ({ date: new Date(r.occurred_at).toISOString().slice(0,10), calories: r.total_calories || 0, money: Number(r.total_money || 0) })));

    // Aggregate item counts from details
    const drinkCounts: Record<string, number> = {};
    const snackCounts: Record<string, number> = {};
    raw.forEach(r => {
      const det = r.details || {};
      const d = det.drinks || {};
      const s = det.snacks || {};
      Object.entries(d).forEach(([id, qty]) => {
        const q = Number(qty as any) || 0;
        drinkCounts[id] = (drinkCounts[id] || 0) + q;
      });
      Object.entries(s).forEach(([id, qty]) => {
        const q = Number(qty as any) || 0;
        snackCounts[id] = (snackCounts[id] || 0) + q;
      });
    });
    const toSorted = (obj: Record<string, number>) => Object.entries(obj)
      .sort((a,b)=>b[1]-a[1])
      .map(([id,count])=>({ id, count }));
    setTopDrinks(toSorted(drinkCounts));
    setTopSnacks(toSorted(snackCounts));
  };

  useEffect(() => {
    fetchSeries();
  }, [isAuthed]);

  // Derive promo series when in promo mode
  useEffect(() => {
    if (!promoModeDashboard) return;
    const days = 30;
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    const dateKey = (d: Date) => d.toISOString().slice(0, 10);
    const buckets = new Map<string, { skips: number; calories: number; money: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      buckets.set(dateKey(d), { skips: 0, calories: 0, money: 0 });
    }
    promoEvents.forEach((r) => {
      const d = new Date(r.occurred_at);
      const k = dateKey(d);
      const b = buckets.get(k);
      if (b) {
        b.skips += 1;
        b.calories += r.total_calories || 0;
        b.money += Number(r.total_money || 0);
      }
    });
    const dates: string[] = Array.from(buckets.keys()).sort();
    const skips = dates.map((k) => buckets.get(k)!.skips);
    const calories = dates.map((k) => buckets.get(k)!.calories);
    const money = dates.map((k) => buckets.get(k)!.money);
    setSeries({ dates, skips, calories, money });
    setEvents(promoEvents.map(r => ({ date: new Date(r.occurred_at).toISOString().slice(0,10), calories: r.total_calories || 0, money: Number(r.total_money || 0) })));

    // Compute top drinks/snacks from promo details
    const drinkCounts: Record<string, number> = {};
    const snackCounts: Record<string, number> = {};
    promoEvents.forEach(r => {
      const det: any = r.details || {};
      const d: Record<string, number> = det.drinks || {};
      const s: Record<string, number> = det.snacks || {};
      Object.entries(d).forEach(([id, qty]) => {
        const q = Number(qty as any) || 0;
        drinkCounts[id] = (drinkCounts[id] || 0) + q;
      });
      Object.entries(s).forEach(([id, qty]) => {
        const q = Number(qty as any) || 0;
        snackCounts[id] = (snackCounts[id] || 0) + q;
      });
    });
    const toSorted = (obj: Record<string, number>) => Object.entries(obj)
      .sort((a,b)=>b[1]-a[1])
      .map(([id,count])=>({ id, count }));
    setTopDrinks(toSorted(drinkCounts));
    setTopSnacks(toSorted(snackCounts));
  }, [promoModeDashboard, promoEvents]);

  const Sparkline = ({ values, stroke = '#10b981', format, avg }: { values: number[]; stroke?: string; format?: (n: number) => string; avg?: number }) => {
    const w = 200;
    const h = 60;
    const m = 6;
    const max = Math.max(1, ...values);
    const min = Math.min(...values);
    const count = values.length;
    const denom = Math.max(1, count - 1);
    const compact = count < 7;
    const step = count <= 3 ? 60 : 28; // wider spacing for very few points
    const contentWidth = compact ? (count - 1) * step : (w - m * 2);
    const startX = compact ? (w - contentWidth) / 2 : m;
    const toX = (i: number) => count === 1 ? w / 2 : startX + (i * contentWidth) / denom;
    const range = Math.max(1, max - min);
    const rMax = 8; // expected max radius
    const pad = m + rMax; // keep circles inside chart bounds
    const toY = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);
    const last = values[count - 1] ?? 0;
    const lastX = toX(count - 1);
    const lastY = toY(last);
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {/* points only (no connecting line) */}
        {values.map((v, i) => {
          const x = toX(i);
          const y = toY(v);
          const isLast = i === values.length - 1;
          const frac = range === 0 ? 0.5 : (v - min) / range;
          const baseR = 3 + frac * 4; // scale radius by value
          const r = isLast ? baseR + 1 : baseR;
          return <circle key={i} cx={x} cy={y} r={r} fill={stroke} opacity={isLast ? 1 : 0.85} />;
        })}
        {/* second-to-last value label when available */}
        {count >= 2 && (() => {
          const idx = count - 2;
          const v = values[idx] ?? 0;
          const x = toX(idx);
          const y = toY(v);
          return (
            <text x={Math.min(x + 6, w - 30)} y={Math.max(y - 10, 12)} fontSize="11" fill={stroke} opacity={0.75}>
              {format ? format(v) : v}
            </text>
          );
        })()}
        {/* last value marker (label only) */}
        <text x={Math.min(lastX + 6, w - 30)} y={Math.max(lastY - 10, 12)} fontSize="12" fontWeight="700" fill={stroke}>
          {format ? format(last) : last}
        </text>
      </svg>
    );
  };

  const Bars = ({ values, color = '#f59e0b', format, avg }: { values: number[]; color?: string; format?: (n: number) => string; avg?: number }) => {
    const w = 200; const h = 90; const m = 6;
    const max = Math.max(1, ...values);
    const count = values.length;
    const compact = count < 7;
    const gap = 8;
    const fixedBarW = 26;
    const groupWidth = compact ? (count * fixedBarW + Math.max(0, count - 1) * gap) : (w - m * 2);
    const startX = compact ? (w - groupWidth) / 2 : m;
    const computedBarW = (w - m * 2) / Math.max(1, count);
    const barW = compact ? fixedBarW : computedBarW;
    const topLabelPad = 14; // reserve room for labels above bars
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {values.map((v, i) => {
          const usableHeight = h - m * 2 - topLabelPad;
          const bh = (v / max) * usableHeight;
          const y = h - m - bh;
          const x = compact
            ? startX + i * (barW + gap)
            : m + i * computedBarW;
          const wBar = Math.max(1, barW - 2);
          const labelX = x + wBar / 2;
          const labelY = Math.max(y - 4, 10);
          return (
            <g key={i}>
              <rect x={x} y={y} width={wBar} height={bh} fill={color} rx={4} />
              <text x={labelX} y={labelY} textAnchor="middle" fontSize="12" fontWeight="700" fill={color}>
                {format ? format(v) : v}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Donut chart via conic-gradient
  const Donut = ({ segments, label }: { segments: Array<{ value: number; color: string; name: string }>; label?: string }) => {
    const total = Math.max(1, segments.reduce((a, s) => a + s.value, 0));
    let acc = 0;
    const stops: string[] = [];
    segments.forEach((s) => {
      const start = (acc / total) * 100;
      acc += s.value;
      const end = (acc / total) * 100;
      stops.push(`${s.color} ${start}% ${end}%`);
    });
    const bg = `conic-gradient(${stops.join(',')})`;
    return (
      <div className="flex items-center gap-4">
        <div className="relative w-28 h-28">
          <div className="w-full h-full rounded-full" style={{ backgroundImage: bg }} />
          <div className="absolute inset-3 rounded-full bg-gray-900/90 border border-white/10 flex items-center justify-center">
            <div className="text-white text-sm font-bold">{label || ''}</div>
          </div>
        </div>
        <div className="space-y-1">
          {segments.map((s) => (
            <div key={s.name} className="flex items-center gap-2 text-sm text-gray-300">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
              <span className="text-white/90">{s.name}</span>
              <span className="text-white/60">{Math.round((s.value/total)*100)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Ring gauge for single-percentage metrics
  const Gauge = ({ percent, valueLabel, subLabel }: { percent: number; valueLabel: string; subLabel?: string }) => {
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    const size = 140; const r = 56; const cx = size/2; const cy = size/2; const stroke = 12;
    const circumference = 2 * Math.PI * r;
    const dash = (p / 100) * circumference;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#gaugeGrad)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${circumference - dash}`} transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 2} textAnchor="middle" className="fill-white" fontSize="22" fontWeight={800}>{p}%</text>
        <text x={cx} y={cy + 18} textAnchor="middle" className="fill-white/70" fontSize="12">{valueLabel}</text>
        {subLabel && (
          <text x={cx} y={cy + 34} textAnchor="middle" className="fill-white/50" fontSize="11">{subLabel}</text>
        )}
      </svg>
    );
  };

  // Bubble timeline of per-skip events
  const BubbleTimeline = ({ data }: { data: Array<{ value: number; money: number }> }) => {
    const w = 260; const h = 70; const m = 8;
    const maxV = Math.max(1, ...data.map(d => d.value));
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const x = m + (i * (w - m*2)) / Math.max(1, data.length - 1);
          const r = 3 + (d.value / maxV) * 8;
          const col = d.money > 0 ? '#60a5fa' : '#10b981';
          return <circle key={i} cx={x} cy={h/2} r={r} fill={col} opacity={0.9} />;
        })}
      </svg>
    );
  };

  // Dual sparkline (calories vs money)
  const DualSparkline = ({ a, b, colorA = '#10b981', colorB = '#60a5fa' }: { a: number[]; b: number[]; colorA?: string; colorB?: string }) => {
    const w = 260; const h = 90; const m = 8;
    const max = Math.max(1, ...a, ...b);
    const toPts = (vals: number[]) => vals.map((v, i) => {
      const x = m + (i * (w - m * 2)) / Math.max(1, vals.length - 1);
      const y = h - m - (v / max) * (h - m * 2);
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polyline fill="none" stroke={colorA} strokeWidth="3" points={toPts(a)} />
        <polyline fill="none" stroke={colorB} strokeWidth="3" points={toPts(b)} opacity={0.9} />
      </svg>
    );
  };

  // Belly timeline (horizontal slices, thicker = more calories avoided)
  const BellyTimeline = ({ values }: { values: number[] }) => {
    const w = 260; const h = 120; const padX = 8; const padY = 8;
    const slices = Math.min(30, values.length);
    const arr = values.slice(-slices);
    const maxV = Math.max(1, ...arr);
    const base = (w - padX * 2) * 0.25; // minimal belly width
    const extra = (w - padX * 2) * 0.65; // max added width at peak
    const rowH = (h - padY * 2) / Math.max(1, slices);
    const toColor = (v: number) => {
      const t = Math.max(0, Math.min(1, v / maxV));
      const hue = 160 - 70 * t; // 160->90 (teal→lime)
      return `hsl(${hue}, 70%, 50%)`;
    };
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {/* subtle backdrop ellipse */}
        <ellipse cx={w/2} cy={h/2} rx={(w - padX*2)/2} ry={(h - padY*2)/2} fill="rgba(255,255,255,0.03)" />
        {arr.map((v, i) => {
          const t = v / maxV;
          const width = base + extra * t;
          const x = (w - width) / 2;
          const y = padY + i * rowH + 1;
          const r = Math.min(10, rowH / 2);
          return (
            <rect key={i} x={x} y={y} width={width} height={Math.max(1, rowH - 2)} rx={r} fill={toColor(v)} opacity={0.95} />
          );
        })}
      </svg>
    );
  };

  // Real bell photo with masked fill that grows with calories
  const BellySlider = ({ values, dates }: { values: number[]; dates: string[] }) => {
    const [idx, setIdx] = useState(Math.max(0, values.length - 1));
    const maxV = Math.max(1, ...values);
    const v = values[idx] || 0;
    const w = 260; const h = 140;
    const growth = 1 - Math.exp(-Math.max(0, v) / 1800); // eased 0..~0.42 at 1000 cal
    const fillPct = Math.min(96, Math.max(10, Math.round(10 + growth * 82))); // 10%..~92%
    return (
      <div>
        <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          {(() => {
            const cx = w / 2; const top = 16; const base = h - 12;
            const shoulderY = top + 20; const crownY = top + 6; const lipY = base - 6;
            const widthTop = 46; const widthBody = 118;
            const leftTop = cx - widthTop / 2; const rightTop = cx + widthTop / 2;
            const leftLip = cx - widthBody / 2; const rightLip = cx + widthBody / 2;
            const d = [
              `M ${leftLip} ${lipY}`,
              `C ${leftLip - 10} ${lipY - 10}, ${leftTop - 10} ${shoulderY}, ${leftTop} ${crownY}`,
              `C ${leftTop + 22} ${top}, ${rightTop - 22} ${top}, ${rightTop} ${crownY}`,
              `C ${rightTop + 10} ${shoulderY}, ${rightLip + 10} ${lipY - 10}, ${rightLip} ${lipY}`,
              `C ${rightLip - 6} ${base}, ${leftLip + 6} ${base}, ${leftLip} ${lipY}`,
              'Z'
            ].join(' ');
            const clipId = `bellClip-${idx}`;
            const usable = lipY - top;
            const y = lipY - (usable * (fillPct / 100));
            const height = base - y;
            return (
              <g>
                <defs>
                  <clipPath id={clipId}>
                    <path d={d} />
                  </clipPath>
                </defs>
                <path d={d} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={2.2} />
                <rect x={leftLip - 12} y={y} width={rightLip - leftLip + 24} height={height} fill="#ef4444" opacity={0.9} clipPath={`url(#${clipId})`} rx={10} />
              </g>
            );
          })()}
        </svg>
        <input
          aria-label="belly-scrubber"
          type="range"
          min={0}
          max={Math.max(0, values.length - 1)}
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          className="w-full mt-2 accent-emerald-400"
        />
      </div>
    );
  };

  // Heatmap of last 5 weeks (7x5 grid: rows = weekdays)
  const Heatmap30 = ({ values, weeks = 10 }: { values: number[]; weeks?: number }) => {
    const rows = 7; const cols = Math.max(5, weeks); // weekdays x recent weeks
    const days = rows * cols;
    const arr = values.slice(-days);
    const valsBack = arr.slice().reverse(); // [today, yesterday, ...]
    const cells = Array.from({ length: days }, () => 0);
    for (let n = 0; n < valsBack.length; n++) {
      const col = cols - 1 - Math.floor(n / 7);
      if (col < 0) break; // older than the visible window
      const d = new Date();
      d.setDate(d.getDate() - n);
      const row = d.getDay(); // 0=Sun ... 6=Sat
      const idx = row * cols + col;
      cells[idx] = valsBack[n];
    }
    const max = Math.max(1, ...cells);
    const labels = ['S','M','T','W','T','F','S'];
    return (
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1 pt-[2px]">
          {labels.map((l, i) => (
            <div key={i} className="w-6 h-6 flex items-center justify-center text-[10px] text-white/50">{l}</div>
          ))}
        </div>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1.5rem)` }}>
          {cells.map((v, i) => {
            const intensity = v === 0 ? 0 : (0.3 + 0.7 * (v / max));
            const bg = `rgba(16,185,129,${intensity})`;
            return <div key={i} className="w-6 h-6 rounded-[4px] border border-white/10" style={{ backgroundColor: v ? bg : 'rgba(255,255,255,0.05)' }} />;
          })}
        </div>
      </div>
    );
  };

  // Formatting helpers
  const fmtNumber = (n: number) => n.toLocaleString();
  const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const summary = (arr: number[]) => {
    const total = arr.reduce((a,b)=>a+b,0);
    const avg = arr.length ? total/arr.length : 0;
    const last = arr.length ? arr[arr.length-1] : 0;
    return { total, avg, last };
  };

  // Friendly names for items recorded in details
  const itemName: Record<string, string> = {
    // Drinks
    beer: 'Beer', wine: 'Wine Glass', whiskey: 'Whiskey', vodka: 'Vodka Shot', cocktail: 'Cocktail', margarita: 'Margarita',
    cider: 'Cider', 'hard-seltzer': 'Hard Seltzer', tequila: 'Tequila Shot', 'gin-tonic': 'Gin & Tonic', 'rum-coke': 'Rum & Coke',
    champagne: 'Champagne', sangria: 'Sangria', 'long-island': 'Long Island Tea',
    // Snacks
    chips: 'Chips', nuts: 'Mixed Nuts', pizza: 'Pizza Slice', wings: 'Chicken Wings', nachos: 'Nachos', pretzels: 'Pretzels',
    fries: 'French Fries', burger: 'Burger', 'onion-rings': 'Onion Rings', 'hot-dog': 'Hot Dog',
    'cheese-platter': 'Cheese Platter', 'ice-cream': 'Ice Cream', chocolate: 'Chocolate Bar', milkshake: 'Milkshake'
  };

  // UI primitives
  const Card = ({ children, className = '' }: { children: any; className?: string }) => (
    <div className={`bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md ${className}`}>{children}</div>
  );

  const StatCard = ({
    title,
    value,
    hint,
    gradient,
  }: {
    title: string;
    value: string;
    hint?: string;
    gradient?: string;
  }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 border border-white/10 ${gradient || 'bg-gradient-to-br from-white/5 to-white/5'} backdrop-blur-md`}>
      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10 blur-2xl" />
      <div className="text-white/70 text-xs font-semibold mb-1">{title}</div>
      <div className="text-4xl font-extrabold text-white">{value}</div>
      {hint && <div className="text-xs text-white/60 mt-2">{hint}</div>}
    </div>
  );

  // Derived fun dashboard metrics from the last 30 days
  const derived = (() => {
    if (!series) return null;
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const last = (arr: number[]) => (arr.length ? arr[arr.length - 1] : 0);
    const totalSkips30 = sum(series.skips);
    const totalMoney30 = sum(series.money);
    const totalCalories30 = sum(series.calories);
    // streak = consecutive trailing days with at least one skip
    let streak = 0;
    for (let i = series.skips.length - 1; i >= 0; i--) {
      if (series.skips[i] > 0) streak++;
      else break;
    }
    const todaySkips = last(series.skips);
    const avgSkips = series.skips.length ? totalSkips30 / series.skips.length : 0;
    const deltaSkips = todaySkips - avgSkips;
    // weekday distribution from events
    const weekdayCounts = [0,0,0,0,0,0,0];
    events.forEach(e => { const d = new Date(e.date+'T00:00:00'); weekdayCounts[d.getDay()]++; });
    const daysWithSkip = series.skips.filter(s => s > 0).length;
    const totalDays = series.skips.length;
    const consistency = totalDays ? Math.round((daysWithSkip / totalDays) * 100) : 0;
    return { totalSkips30, totalMoney30, totalCalories30, streak, todaySkips, avgSkips, deltaSkips, weekdayCounts, consistency, daysWithSkip, totalDays };
  })();

  // Lightweight confetti (no deps)
  useEffect(() => {
    if (!derived) return;
    if (derived.streak > bestStreak) {
      setBestStreak(derived.streak);
      const canvas = confettiRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width = window.innerWidth;
      const h = canvas.height = 300;
      const particles = Array.from({ length: 120 }).map(() => ({
        x: Math.random() * w,
        y: -20 - Math.random() * 80,
        r: 2 + Math.random() * 3,
        c: ['#10b981','#34d399','#f59e0b','#60a5fa','#f472b6'][Math.floor(Math.random()*5)],
        vy: 2 + Math.random() * 2,
        vx: -1 + Math.random() * 2,
        life: 0
      }));
      let frame = 0;
      const animate = () => {
        frame++;
        ctx.clearRect(0,0,w,h);
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.02;
          p.life++;
          ctx.fillStyle = p.c;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
          ctx.fill();
        });
        if (frame < 120) requestAnimationFrame(animate); else ctx.clearRect(0,0,w,h);
      };
      animate();
      setTimeout(() => {
        const ctx2 = canvas.getContext('2d');
        if (ctx2) ctx2.clearRect(0,0,canvas.width,canvas.height);
      }, 3000);
    }
  }, [derived?.streak]);

  // (moved to top-level) useCountUp + AnimatedNumber

  const handleSkipClick = () => {
    if (isAuthed) {
      setIsSkipDrinkModalOpen(true);
    } else {
      // Promo mode: let user add a local win
      setIsSkipDrinkModalOpen(true);
    }
  };

  const handlePromoSave = (e: { occurred_at: string; total_calories: number; total_money: number; details: any }) => {
    if (promoSkipsCount === 0) {
      setPromoEvents([e]);
      setPromoSkipsCount(1);
      setPromoModeDashboard(true);
    } else if (promoSkipsCount === 1) {
      setPromoEvents(prev => [...prev, e]);
      setPromoSkipsCount(2);
    } else {
      setIsEarlyAccessOpen(true);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const handleShare = async () => {
    if (!series) return;
    const totalMoney = Math.round(series.money.reduce((a,b)=>a+b,0));
    const totalCalories = Math.round(series.calories.reduce((a,b)=>a+b,0));
    const message = `My sober wins: ${derived?.streak ?? 0} day streak, $${totalMoney} saved, ${totalCalories.toLocaleString()} calories avoided. #SoberWins`;
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: 'SoberWins', text: message, url: window.location.origin });
      } else {
        await navigator.clipboard.writeText(message);
        setShareNote('Copied your progress to clipboard');
        setTimeout(()=>setShareNote(null), 2500);
      }
    } catch {}
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background */}
        {!isAuthed ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
            style={{ backgroundImage: 'url("/hero_image.jpg")' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
        </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 overflow-hidden">
            {/* Ambient animated orbs */}
            <div className="orb" style={{ top: '-40px', left: '-60px', width: '320px', height: '320px', background: 'radial-gradient(circle at 30% 30%, rgba(16,185,129,0.6), rgba(16,185,129,0))' }} />
            <div className="orb" style={{ bottom: '80px', right: '-40px', width: '360px', height: '360px', background: 'radial-gradient(circle at 70% 70%, rgba(59,130,246,0.5), rgba(59,130,246,0))', animationDelay: '2s' }} />
            <div className="orb" style={{ bottom: '-60px', left: '30%', width: '280px', height: '280px', background: 'radial-gradient(circle at 50% 50%, rgba(20,184,166,0.4), rgba(20,184,166,0))', animationDelay: '4s' }} />
          </div>
        )}

        {/* Top Bar */}
        <div className="absolute top-8 inset-x-0 z-30">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full"></div>
                </div>
              </div>
              <div className="text-white">
                <div className="text-xl font-bold tracking-tight">SoberWins</div>
                <div className="text-emerald-300 text-xs font-medium -mt-0.5">Track your sober wins</div>
              </div>
            </div>

            {/* Right Controls */}
            <div className="inline-flex items-center gap-3">
              {isAuthed ? (
                <>
                  <button onClick={handleShare} className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/15 text-white/80 bg-white/5 hover:bg-white/10 backdrop-blur-md transition shadow-md">
                    <Share2 className="w-5 h-5" />
                    Share Progress
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-semibold text-white/90 border border-white/20 rounded-xl hover:bg-white/10"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEarlyAccessOpen(true)}
                    className="px-4 py-2 text-sm font-bold text-black bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl hover:opacity-90"
                  >
                    Request Early Access
                  </button>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-4 py-2 text-sm font-semibold text-white/90 border border-white/20 rounded-xl hover:bg-white/10"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        

        {/* Main Content */}
        <div className="relative z-20 min-h-screen flex items-center pt-28 lg:pt-32">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
            {shareNote && (
              <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/10 text-white border border-white/20 rounded-xl px-4 py-2 backdrop-blur-md shadow-lg">
                {shareNote}
              </div>
            )}
            {isAuthed && (
              <canvas ref={confettiRef} className="pointer-events-none absolute left-0 right-0 mx-auto top-24 w-full h-[300px]" />
            )}
            <div className={(isAuthed || promoModeDashboard) ? "w-full" : "max-w-2xl"}>

              

              {/* Main Headline (hidden when signed in) */}
              {!isAuthed && !promoModeDashboard && (
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-8 leading-[0.9] tracking-tight mt-32 sm:mt-0">
                Your first sober win{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  starts here
                </span>
              </h1>
              )}
              
              {(!isAuthed && !promoModeDashboard) && (
              <p className="text-2xl lg:text-3xl text-gray-200 mb-12 leading-relaxed font-light">
                Soon you'll be able to track your own sober wins. Every skip adds up: calories avoided, money saved, energy regained.
              </p>
              )}

              <div className="mb-10 flex flex-wrap items-center gap-4">
                <div className="relative w-full">
                  <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-r from-emerald-400/40 via-teal-400/40 to-cyan-400/40 blur-3xl opacity-80 transition" />
                  <button 
                    onClick={() => {
                      if (!isAuthed && promoSkipsCount >= 2) {
                        setIsEarlyAccessOpen(true);
                      } else {
                        handleSkipClick();
                      }
                    }}
                    className="relative w-full group inline-flex items-center justify-center gap-5 px-14 py-8 text-3xl font-black tracking-tight text-black bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-emerald-400/40 focus:outline-none focus:ring-8 focus:ring-emerald-400/30 shadow-xl"
                  >
                    <span>Skip a Drink</span>
                    <ArrowRight className="w-8 h-8 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
              
              {!isAuthed && !promoModeDashboard && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 hover:bg-white/15 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">Skip a pint</div>
                    <div className="text-gray-300 text-sm">~200 calories saved</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 hover:bg-white/15 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">Skip 3 cocktails</div>
                    <div className="text-gray-300 text-sm">~$25 saved</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 hover:bg-white/15 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">Every skip</div>
                    <div className="text-gray-300 text-sm">energy regained</div>
                  </div>
                </div>
              </div>
              )}

              {(isAuthed || promoModeDashboard) && series && derived && (
                <>
                  {/* Premium clean layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Current Streak" value={`${derived.streak} days`} hint={derived.deltaSkips >= 0 ? 'You’re on a roll' : 'Build momentum today'} gradient="bg-gradient-to-br from-emerald-500/15 to-teal-500/15" />
                    <StatCard title="Money Saved (30d)" value={`$${Math.round(derived.totalMoney30)}`} hint="Treat yourself to something good" gradient="bg-gradient-to-br from-yellow-500/15 to-orange-500/15" />
                    <StatCard title="Calories Avoided (30d)" value={`${derived.totalCalories30.toLocaleString()}`} hint="Light body, clear mind" gradient="bg-gradient-to-br from-rose-500/15 to-pink-500/15" />
                    <StatCard title="Skips (30d)" value={`${derived.totalSkips30}`} hint={`Avg ${Math.max(0, Math.round((derived.avgSkips)*10)/10)}/day`} gradient="bg-gradient-to-br from-blue-500/15 to-indigo-500/15" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    <Card>
                      <div className="text-white font-semibold mb-1">Calories per skip (30d)</div>
                      <div className="text-white/60 text-xs mb-2">Skips {events.length} • Avg {Math.round(summary(events.map(e=>e.calories)).avg)}</div>
                      <Sparkline values={events.map(e=>e.calories)} format={fmtNumber} avg={summary(events.map(e=>e.calories)).avg} />
                    </Card>
                    <Card>
                      <div className="text-white font-semibold mb-1">Money per skip (30d)</div>
                      <div className="text-white/60 text-xs mb-2">Skips {events.length} • Avg {fmtMoney(summary(events.map(e=>e.money)).avg)}</div>
                      <Bars values={events.map(e=>e.money)} format={fmtMoney} avg={summary(events.map(e=>e.money)).avg} />
                    </Card>
                    <Card>
                      <div className="text-white font-semibold mb-1">Streak Calendar</div>
                      <div className="text-white/60 text-xs mb-2">Celebrate every proud sober day</div>
                      <Heatmap30 values={series.skips} weeks={12} />
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-20">
                    <Card>
                      <div className="text-white font-semibold mb-3">When do you win most?</div>
                      <Donut label="7d" segments={[
                        { name: 'Sun', value: derived.weekdayCounts[0], color: '#f87171' },
                        { name: 'Mon', value: derived.weekdayCounts[1], color: '#f59e0b' },
                        { name: 'Tue', value: derived.weekdayCounts[2], color: '#10b981' },
                        { name: 'Wed', value: derived.weekdayCounts[3], color: '#60a5fa' },
                        { name: 'Thu', value: derived.weekdayCounts[4], color: '#a78bfa' },
                        { name: 'Fri', value: derived.weekdayCounts[5], color: '#f472b6' },
                        { name: 'Sat', value: derived.weekdayCounts[6], color: '#22d3ee' },
                      ]} />
                    </Card>
                    
                    <Card>
                      <div className="text-white font-semibold mb-3">Recent wins</div>
                      <ul className="divide-y divide-white/10">
                        {events.slice(-6).reverse().map((e, i) => (
                          <li key={i} className="flex items-center justify-between py-2">
                            <div className="text-white/80 text-sm">
                              {new Date(e.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-400/20">{fmtNumber(e.calories)} cal</span>
                              <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">{fmtMoney(e.money)}</span>
                            </div>
                          </li>
                        ))}
                        {events.length === 0 && (
                          <li className="py-2 text-white/60 text-sm">No wins yet. Tap “Skip a Drink” to start.</li>
                        )}
                      </ul>
                    </Card>
                    <Card>
                      <div className="text-white font-semibold mb-3">Consistency (30d)</div>
                      <div className="flex items-center gap-6">
                        <Gauge percent={derived.consistency} valueLabel={`${derived.daysWithSkip}/${derived.totalDays} days`} subLabel="with at least one win" />
                        <div className="space-y-2 text-sm">
                          <div className="text-white/80"><span className="text-white font-semibold">Current streak:</span> {derived.streak} days</div>
                          <div className="text-white/80"><span className="text-white font-semibold">Avg wins/day:</span> {Math.max(0, Math.round((derived.avgSkips)*100)/100)}</div>
                          <div className="text-white/60">Aim for 4+ wins/week to build momentum</div>
                        </div>
                      </div>
                    </Card>
                    <Card>
                      <div className="text-white font-semibold mb-3">Top drinks skipped</div>
                      <ul className="space-y-2">
                        {(topDrinks.slice(0,6)).map((d) => (
                          <li key={d.id} className="flex justify-between text-white/90">
                            <span>{itemName[d.id] || d.id}</span>
                            <span className="text-white/70">× {d.count}</span>
                          </li>
                        ))}
                        {topDrinks.length === 0 && (
                          <li className="text-white/50">No data yet</li>
                        )}
                      </ul>
                    </Card>
                    <Card>
                      <div className="text-white font-semibold mb-3">Top snacks avoided</div>
                      <ul className="space-y-2">
                        {(topSnacks.slice(0,6)).map((s) => (
                          <li key={s.id} className="flex justify-between text-white/90">
                            <span>{itemName[s.id] || s.id}</span>
                            <span className="text-white/70">× {s.count}</span>
                          </li>
                        ))}
                        {topSnacks.length === 0 && (
                          <li className="text-white/50">No data yet</li>
                        )}
                      </ul>
                    </Card>
                  </div>
                </>
              )}
              
              {/* removed hero sign-in button for promo mode */}
              
              {/* Bottom Text (hidden when signed in) */}
              {!isAuthed && !promoModeDashboard && (
              <div className="space-y-3">
                <p className="text-xl text-gray-200 font-medium">
                  Be among the first to join the sober wins movement
                </p>
                <p className="text-base text-gray-400">
                  Launching soon • Free to join • No credit card required
                </p>
                <p className="text-sm text-gray-500">
                  *Based on average beer/cocktail calories & prices
                </p>
              </div>
              )}
              
            </div>
          </div>
        </div>
        
        {/* Enhanced Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent pointer-events-none"></div>
      </section>
      
      {!isAuthed && (
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-24 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-transparent to-teal-500/20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            {/* Section Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-400/20 rounded-2xl text-emerald-300 text-base font-semibold mb-8 backdrop-blur-md">
              <span className="text-2xl">🧬</span>
              <span>Science-Backed</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight tracking-tight">
              Why SoberWins Works
              <span className="block text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-light">
                (Backed by Psychology)
              </span>
            </h2>
            <p className="text-2xl lg:text-3xl text-gray-200 max-w-4xl mx-auto mb-16 leading-relaxed font-light">
              Every time you mark a drink you could have had but didn't, you turn self-control into a visible win. This simple shift makes all the difference.
            </p>
          </div>
          
          {/* Enhanced Psychology Proof Points */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-blue-500/30">
                <span className="text-4xl">🧠</span>
              </div>
              <h3 className="text-white font-bold text-2xl mb-6 group-hover:text-blue-300 transition-colors">Loss Aversion Hack</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Skipping feels like a gain, not a sacrifice. Your brain rewards wins over avoiding losses.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-xl backdrop-blur-sm">
                <span className="text-blue-400 text-sm font-medium">Kahneman & Tversky, 1979</span>
              </div>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-emerald-500/30">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-white font-bold text-2xl mb-6 group-hover:text-emerald-300 transition-colors">Instant Reward Loop</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Every tap gives you a dopamine boost that reinforces your choice. Immediate wins build lasting habits.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-400/20 rounded-xl backdrop-blur-sm">
                <span className="text-emerald-400 text-sm font-medium">Skinner, 1953</span>
              </div>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-orange-500/30">
                <span className="text-4xl">🔥</span>
              </div>
              <h3 className="text-white font-bold text-2xl mb-6 group-hover:text-orange-300 transition-colors">Streak Power</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Wins stack into streaks you don't want to break. The chain effect keeps you motivated long-term.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-400/20 rounded-xl backdrop-blur-sm">
                <span className="text-orange-400 text-sm font-medium">Milkman, 2021</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Key Insight */}
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-5xl mx-auto shadow-2xl">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-400/30">
                <span className="text-3xl">💡</span>
              </div>
              <h4 className="text-3xl lg:text-4xl font-bold text-white">The Key Difference</h4>
            </div>
            <p className="text-2xl lg:text-3xl text-gray-200 leading-relaxed text-center font-light">
              You don't just count drinks consumed <span className="text-gray-400 italic">(that's depressing)</span>. 
              You mark the ones you{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-semibold">
                could have had but didn't
              </span>. 
              This flips the frame from loss → gain.
            </p>
          </div>
        </div>
      </section>
      )}

      {!isAuthed && (
      <section className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Track Your Wins, Not Your Slips
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Join the sober-curious movement. Every skip makes you stronger.
            </p>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span>Building something special</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">💪</span>
                </div>
                <span>Every choice counts</span>
              </div>
            </div>
          </div>
          
          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Streak Power */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">🔥</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Current Streak</h3>
              <p className="text-3xl font-bold text-green-400 mb-2">47 days</p>
              <p className="text-gray-400 text-sm">Personal best!</p>
            </div>
            
            {/* Money Saved */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">💰</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Money Saved</h3>
              <p className="text-3xl font-bold text-yellow-400 mb-2">$1,127</p>
              <p className="text-gray-400 text-sm">Last 47 days</p>
            </div>
            
            {/* Health Gains */}
            <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Calories Avoided</h3>
              <p className="text-3xl font-bold text-red-400 mb-2">6,580</p>
              <p className="text-gray-400 text-sm">That's 2 lbs!</p>
            </div>
            
            {/* Pride Level */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">💪</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Pride Level</h3>
              <p className="text-3xl font-bold text-purple-400 mb-2">High</p>
              <p className="text-gray-400 text-sm">Growing daily</p>
            </div>
          </div>
          
          {/* How It Works */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-8">Build Your Streak in 3 Steps</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-400/30">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">💧</span>
                  <h4 className="text-white font-semibold">Skip a Drink</h4>
                </div>
                <p className="text-gray-300 text-sm">Tap to lock your sober win. Every skip counts.</p>
              </div>
              
              <div className="hidden md:block text-gray-500">→</div>
              
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-400/30">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">📈</span>
                  <h4 className="text-white font-semibold">Watch Your Wins Add Up</h4>
                </div>
                <p className="text-gray-300 text-sm">Track money saved, calories avoided, and days gained.</p>
              </div>
              
              <div className="hidden md:block text-gray-500">→</div>
              
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-400/30">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🔥</span>
                  <h4 className="text-white font-semibold">Stay Motivated</h4>
                </div>
                <p className="text-gray-300 text-sm">See your streak grow, feel stronger, and celebrate progress.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}
      
      {/* Skip Drink Modal */}
      <SkipDrinkModal 
        isOpen={isSkipDrinkModalOpen} 
        onClose={() => setIsSkipDrinkModalOpen(false)} 
        onRequestSignIn={() => setIsAuthModalOpen(true)}
        isAuthed={isAuthed}
        onSaved={() => fetchSeries()}
        promoMode={!isAuthed}
        onPromoSave={handlePromoSave}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSignedIn={() => setIsAuthed(true)}
        onRequestEarlyAccess={() => setIsEarlyAccessOpen(true)}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onUpdated={() => {
          setIsResetModalOpen(false);
        }}
      />

      {/* Early Access Modal */}
      <EarlyAccessModal
        isOpen={isEarlyAccessOpen}
        onClose={() => setIsEarlyAccessOpen(false)}
      />

      
    </div>
  );
}

export default App;