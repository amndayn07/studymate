'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import SubmitButton from '@/components/auth/SubmitButton';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const { error: sbError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (sbError) {
      setError(sbError.message);
      return;
    }

    // Supabase v2 uses localStorage by default (session persists across tabs).
    // Full "forget on browser close" requires SSR cookies — planned for a future phase.
    void rememberMe;

    router.push('/dashboard');
  }

  return (
    <AuthCard title="Sign in to StudyMate" subtitle="Welcome back">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <InputField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="jane@example.com"
        />
        <InputField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="Your password"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-200">
            {error}
          </p>
        )}

        <SubmitButton loading={loading} label="Sign In" loadingLabel="Signing in..." />

        <p className="text-center text-sm text-gray-500">
          No account?{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
