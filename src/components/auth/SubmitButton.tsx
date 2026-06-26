'use client';

interface SubmitButtonProps {
  loading: boolean;
  label: string;
  loadingLabel?: string;
}

export default function SubmitButton({
  loading,
  label,
  loadingLabel = 'Please wait...',
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600
        px-4 py-2.5 text-sm font-semibold text-white transition
        hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500
        disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
      )}
      {loading ? loadingLabel : label}
    </button>
  );
}
