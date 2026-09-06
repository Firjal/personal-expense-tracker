'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Wallet, AlertCircle } from 'lucide-react';
import { signInWithGoogle } from '@/lib/actions/auth';

export default function LoginPage() {
  const searchParams = useSearchParams();

  const [errorMsg, setErrorMsg] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Show error passed via URL query param (e.g. from OAuth callback failure)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setErrorMsg(decodeURIComponent(urlError));
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;
    setErrorMsg('');
    setIsGoogleLoading(true);

    const res = await signInWithGoogle();

    if (res.error) {
      setErrorMsg(res.error);
      setIsGoogleLoading(false);
      return;
    }

    if (res.url) {
      window.location.href = res.url;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-8">

        {/* Logo & heading */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Personal Expense Tracker
            </h1>
            <p className="text-sm text-slate-400">
              Masuk untuk mengelola keuangan Anda
            </p>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Sign-In button */}
        <button
          id="btn-google-login"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <>
              <svg
                className="animate-spin w-5 h-5 text-slate-500"
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
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                />
              </svg>
              <span>Mengarahkan ke Google...</span>
            </>
          ) : (
            <>
              {/* Official Google G logo */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500">
          Dengan masuk, Anda menyetujui kebijakan privasi kami.
        </p>
      </div>
    </div>
  );
}
