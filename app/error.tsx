'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Project Zenith render error', error); }, [error]);
  return <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 text-center text-white"><div className="glass-card max-w-md rounded-3xl p-8"><h1 className="text-2xl font-bold">The signal was interrupted</h1><p className="mt-3 text-white/60">Project Zenith could not load this view. Your settings are safe.</p><button className="btn-primary mt-6" onClick={reset}>Try again</button></div></main>;
}
