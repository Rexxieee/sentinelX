'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid credentials');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gunmetal border border-slateBlack rounded-lg p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-neonBlue/10 blur-[50px] rounded-full pointer-events-none" />

        <div className="flex flex-col items-center mb-8 relative z-10">
          <ShieldAlert className="w-12 h-12 text-neonBlue mb-4" />
          <h1 className="text-3xl font-bold tracking-wider text-neonBlue">Sentinel<span className="text-neonRed">X</span></h1>
          <p className="text-slate-400 mt-2">Secure Command Center</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {error && (
            <div className="p-3 rounded bg-neonRed/10 border border-neonRed/30 text-neonRed text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              className="w-full px-4 py-3 rounded bg-slateBlack border border-slate-700 text-white focus:outline-none focus:border-neonBlue focus:ring-1 focus:ring-neonBlue transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded bg-slateBlack border border-slate-700 text-white focus:outline-none focus:border-neonBlue focus:ring-1 focus:ring-neonBlue transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded bg-neonBlue text-slateBlack font-bold tracking-wide hover:bg-neonBlue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gunmetal focus:ring-neonBlue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'ACCESS SYSTEM'}
          </button>
        </form>
      </div>
    </div>
  );
}
