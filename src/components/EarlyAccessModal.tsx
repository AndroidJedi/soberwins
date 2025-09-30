import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function EarlyAccessModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMessage('Enter a valid email');
      return;
    }
    if (!supabase) {
      setSubmitted(true);
      setTimeout(onClose, 1200);
      return;
    }
    try {
      setSubmitting(true);
      const payload: any = { email: trimmed };
      const { error } = await supabase.from('early_access_leads').insert(payload);
      if (error && (error as any).code !== '23505') { // ignore unique violation as success
        throw error;
      }
      setSubmitted(true);
      setTimeout(onClose, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-xl font-bold">Request Early Access</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-gray-300 text-sm">Drop your email and we’ll invite you when it’s ready.</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
            <button type="submit" disabled={submitting} className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-bold hover:opacity-90 disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Request Access'}
            </button>
            {errorMessage && (
              <p className="text-sm text-red-400">{errorMessage}</p>
            )}
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-emerald-300 font-semibold">Thanks! We’ll be in touch soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}


