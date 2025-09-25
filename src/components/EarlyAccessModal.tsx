import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function EarlyAccessModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  if (!isOpen) return null;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      if (!supabase) {
        setStatus('error');
        setMessage('Database not configured. Please try again later.');
        return;
      }
      
      const { error } = await supabase.from('early_access_leads').insert({ email });
      if (error) throw error;
      
      setStatus('success');
      setMessage('Thanks! You are on the list.');
      setEmail('');
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong. Please try again.';
      setStatus('error');
      setMessage(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-xl font-bold">Get Early Access</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-bold hover:opacity-90 disabled:opacity-60"
          >
            {status === 'loading' ? 'Saving…' : 'Join Waitlist'}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${status === 'error' ? 'text-red-400' : 'text-emerald-300'}`}>{message}</p>
        )}
      </div>
    </div>
  );
}


