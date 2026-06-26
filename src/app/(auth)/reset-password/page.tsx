'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import SubmitButton from '@/components/auth/SubmitButton';

type PageState = 'verifying' | 'invalid' | 'form' | 'success';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>('verifying');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwError, setPwError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase JS v2 auto-parses the URL hash fragment (#access_token=...&type=recovery)
    // on client initialization and fires PASSWORD_RECOVERY via onAuthStateChange.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('form');
      }
    });

    // Fallback: if PASSWORD_RECOVERY hasn't fired after 5 seconds, the link is
    // invalid or the user navigated here directly without a token.
    const timeout = setTimeout(() => {
      setPageState((current) => (current === 'verifying' ? 'invalid' : current));
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  function validate(): boolean {
    let valid = true;

    if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setPwError('Password must be at least 8 characters and include letters and numbers.');
      valid = false;
    } else {
      setPwError('');
    }

    if (password !== confirm) {
      setConfirmError('Passwords do not match.');
      valid = false;
    } else {
      setConfirmError('');
    }

    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    setPageState('success');
    // Sign out the temporary recovery session; user must log in fresh.
    await supabase.auth.signOut();
    setTimeout(() => router.push('/login'), 2500);
  }

  if (pageState === 'verifying') {
    return (
      <AuthCard title="Reset your password">
        <p className="text-sm text-gray-500 mb-4">Verifying your reset link...</p>
        <div className="flex justify-center">
          <svg
            className="h-6 w-6 animate-spin text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      </AuthCard>
    );
  }

  if (pageState === 'invalid') {
    return (
      <AuthCard title="Link expired or invalid">
        <p className="text-sm text-gray-600 mb-4">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          Request a new reset link
        </Link>
      </AuthCard>
    );
  }

  if (pageState === 'success') {
    return (
      <AuthCard title="Password updated">
        <p className="text-sm text-gray-600">
          Your password has been changed successfully. Redirecting you to sign in...
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a strong password for your account.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <InputField
          id="password"
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={pwError}
          autoComplete="new-password"
          placeholder="Min. 8 chars with letters &amp; numbers"
        />
        <InputField
          id="confirm"
          label="Confirm New Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={confirmError}
          autoComplete="new-password"
          placeholder="Re-enter your new password"
        />

        {serverError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-200">
            {serverError}
          </p>
        )}

        <SubmitButton
          loading={loading}
          label="Update Password"
          loadingLabel="Updating..."
        />
      </form>
    </AuthCard>
  );
}
