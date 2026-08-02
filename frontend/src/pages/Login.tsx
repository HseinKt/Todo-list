import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, signup, verify2Fa, require2Fa } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      if (require2Fa) {
        await verify2Fa(mfaCode);
      } else if (isRegister) {
        await signup(email, password, fullName);
        setSuccess('Registration successful! You can now log in.');
        setIsRegister(false);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6 select-none">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center">
          <div className="inline-flex p-3 bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-full mb-3">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {require2Fa ? 'MFA Security Challenge' : isRegister ? 'Join Horizon OS' : 'Sign in to Horizon OS'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {require2Fa ? 'Verify your identity to proceed.' : 'The operating system for human potential.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs p-3 rounded-lg border border-red-250 dark:border-red-900/50 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 text-xs p-3 rounded-lg border border-emerald-250 dark:border-emerald-900/50 font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {require2Fa ? (
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1 flex items-center gap-1">
                <Shield size={12} />
                One-Time OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="w-full text-center tracking-[1em] text-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-850 px-4 py-2.5 rounded-lg focus:outline-violet-500 text-neutral-950 dark:text-white"
              />
            </div>
          ) : (
            <>
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Sarah Jenkins"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-850 px-4 py-2.5 rounded-lg text-sm focus:outline-violet-500 text-neutral-950 dark:text-white"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Email address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-850 px-4 py-2.5 rounded-lg text-sm focus:outline-violet-500 text-neutral-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-850 px-4 py-2.5 rounded-lg text-sm focus:outline-violet-500 text-neutral-950 dark:text-white"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
              isLoading
                ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-750 text-white'
            }`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin"></span>
            ) : null}
            <span>
              {isLoading
                ? 'Connecting...'
                : require2Fa
                ? 'Verify Code'
                : isRegister
                ? 'Create Account'
                : 'Sign In'}
            </span>
          </button>
        </form>

        {!require2Fa && (
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccess('');
              }}
              className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline cursor-pointer"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
