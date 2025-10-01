import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function ResetPasswordModal({ isOpen, onClose, onUpdated }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [infoMessage, setInfoMessage] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (mounted) setHasSession(!!data.session);
    })();
    return () => { mounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    try {
      setStatus('loading');
      setErrorMessage('');
      setInfoMessage('');
      if (!supabase) throw new Error('Auth not configured');
      if (!hasSession) throw new Error('Recovery link invalid or expired. Request a new one.');
      if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
      if (password !== confirm) throw new Error('Passwords do not match');
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStatus('success');
      setInfoMessage('Password updated. You can continue.');
      onUpdated?.();
      // Clean the URL if on /reset-password with tokens
      try {
        if (window.location.pathname === '/reset-password') {
          window.history.replaceState({}, '', '/');
        }
      } catch {}
      // Close the modal after a short delay
      setTimeout(onClose, 800);
    } catch (e: any) {
      setStatus('error');
      setErrorMessage(e?.message || 'Could not update password');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-xl font-bold">Set a new password</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="space-y-3">
          {!hasSession && (
            <p className="text-sm text-amber-300">Open this page from the password reset link in your email.</p>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={handleUpdate}
            disabled={status === 'loading' || !hasSession}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-bold hover:opacity-90 disabled:opacity-60"
          >
            {status === 'loading' ? 'Updating…' : 'Update password'}
          </button>
        </div>
        {errorMessage && (
          <p className="mt-3 text-sm text-red-400">{errorMessage}</p>
        )}
        {infoMessage && (
          <p className="mt-3 text-sm text-emerald-300">{infoMessage}</p>
        )}
      </div>
    </div>
  );
}


