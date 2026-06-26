'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import SubmitButton from '@/components/auth/SubmitButton';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [serverError, setServerError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError('');
    setServerError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    // window.location.origin makes the redirect URL work in any environment
    // (localhost in dev, production domain when deployed).
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="Check your inbox">
        <p className="text-sm text-gray-600">
          If <strong>{email}</strong> is registered, you&apos;ll receive a password reset
          link shortly. Check your spam folder if it doesn&apos;t arrive within a few
          minutes.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <InputField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          autoComplete="email"
          placeholder="jane@example.com"
        />

        {serverError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-200">
            {serverError}
          </p>
        )}

        <SubmitButton
          loading={loading}
          label="Send Reset Link"
          loadingLabel="Sending..."
        />

        <Link
          href="/login"
          className="text-center text-sm font-medium text-indigo-600 hover:underline"
        >
          Back to sign in
        </Link>
      </form>
    </AuthCard>
  );
}
