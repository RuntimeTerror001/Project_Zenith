'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { 
    console.error('Project Zenith render error', error); 
  }, [error]);

  const isChunkError = 
    error.name === 'ChunkLoadError' || 
    error.message?.includes('Loading chunk') || 
    error.message?.includes('Loading CSS chunk');

  const handleAction = () => {
    if (isChunkError) {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 text-center text-white">
      <div className="glass-card max-w-md rounded-3xl p-8">
        <h1 className="text-2xl font-bold">
          {isChunkError ? "New update available" : "The signal was interrupted"}
        </h1>
        <p className="mt-3 text-white/60">
          {isChunkError 
            ? "We've deployed a new version of Project Zenith. Refresh to load the latest features." 
            : "Project Zenith could not load this view. Your settings are safe."}
        </p>
        <button className="btn-primary mt-6" onClick={handleAction}>
          {isChunkError ? "Refresh Page" : "Try again"}
        </button>
      </div>
    </main>
  );
}
