import React, { useState } from 'react';
import { X, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSignedIn?: () => void;
};

export default function AuthModal({ isOpen, onClose, onSignedIn }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [infoMessage, setInfoMessage] = useState<string>('');

  if (!isOpen) return null;

  const signInAnonymously = async () => {
    try {
      setStatus('loading');
      setErrorMessage('');
      if (!supabase) throw new Error('Auth not configured');
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      if (!data.session) throw new Error('No session returned');
      setStatus('idle');
      onSignedIn?.();
      onClose();
    } catch (e: any) {
      setStatus('error');
      setErrorMessage(e?.message || 'Sign-in failed');
    }
  };

  const handleEmailAuth = async () => {
    try {
      setStatus('loading');
      setErrorMessage('');
      setInfoMessage('');
      if (!supabase) throw new Error('Auth not configured');

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Enter a valid email');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (mode === 'sign_in') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.session) throw new Error('No session returned');
        setStatus('idle');
        onSignedIn?.();
        onClose();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        setStatus('idle');
        if (data.session) {
          onSignedIn?.();
          onClose();
        } else {
          setInfoMessage('Check your email to confirm your account.');
        }
      }
    } catch (e: any) {
      setStatus('error');
      setErrorMessage(e?.message || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-xl font-bold">{mode === 'sign_in' ? 'Sign In' : 'Create account'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={handleEmailAuth}
            disabled={status === 'loading'}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-bold hover:opacity-90 disabled:opacity-60"
          >
            {status === 'loading' ? (mode === 'sign_in' ? 'Signing in…' : 'Creating account…') : (mode === 'sign_in' ? 'Sign in' : 'Create account')}
          </button>
          <button
            onClick={signInAnonymously}
            disabled={status === 'loading'}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Continue anonymously
          </button>
        </div>
        {errorMessage && (
          <p className="mt-3 text-sm text-red-400">{errorMessage}</p>
        )}
        {infoMessage && (
          <p className="mt-3 text-sm text-emerald-300">{infoMessage}</p>
        )}
        <div className="text-gray-400 text-sm mt-4">
          {mode === 'sign_in' ? (
            <button onClick={() => setMode('sign_up')} className="text-emerald-300 hover:underline">Create an account</button>
          ) : (
            <button onClick={() => setMode('sign_in')} className="text-emerald-300 hover:underline">Have an account? Sign in</button>
          )}
        </div>
      </div>
    </div>
  );
}


