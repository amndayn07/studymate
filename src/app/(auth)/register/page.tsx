'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import SubmitButton from '@/components/auth/SubmitButton';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const e: FormErrors = {};

    if (!fullName.trim()) {
      e.fullName = 'Full name is required.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Enter a valid email address.';
    }
    if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      e.password = 'Password must be at least 8 characters and include letters and numbers.';
    }
    if (password !== confirm) {
      e.confirmPassword = 'Passwords do not match.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);

    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: redirectUrl },
    });
    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <AuthCard title="Check your email">
        <p className="text-sm text-gray-600">
          We sent a verification link to <strong>{email}</strong>. Click it to
          activate your account.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Already verified?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create an account" subtitle="Join StudyMate today">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <InputField
          id="fullName"
          label="Full Name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          autoComplete="name"
          placeholder="Jane Doe"
        />
        <InputField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
          placeholder="jane@example.com"
        />
        <InputField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
          placeholder="Min. 8 chars with letters &amp; numbers"
        />
        <InputField
          id="confirm"
          label="Confirm Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="Re-enter your password"
        />

        {serverError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-200">
            {serverError}
          </p>
        )}

        <SubmitButton
          loading={loading}
          label="Create Account"
          loadingLabel="Creating account..."
        />

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
