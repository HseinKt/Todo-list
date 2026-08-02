import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

interface LoginProps {
  onBackToLanding: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBackToLanding }) => {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 select-none relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer transition"
      >
        ← Back to home
      </button>

      <Card className="w-full max-w-md p-8 shadow-apple-lg border border-border/80" glass>
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-accent/10 text-accent rounded-full mb-3">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {require2Fa ? 'MFA Security Challenge' : isRegister ? 'Join Horizon OS' : 'Sign in to Horizon OS'}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {require2Fa ? 'Verify your identity to proceed.' : 'The operating system for human potential.'}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-lg text-left mb-4 font-medium flex items-center gap-2">
            <Shield size={14} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-lg text-left mb-4 font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {require2Fa ? (
            <Input
              label="6-Digit Verification Code"
              type="text"
              placeholder="e.g. 123456"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              required
            />
          ) : (
            <>
              {isRegister && (
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Your Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              )}
              <Input
                label="Email address"
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {require2Fa ? 'Verify Code' : isRegister ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        {!require2Fa && (
          <div className="text-center pt-4">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccess('');
              }}
              className="text-xs text-accent font-semibold hover:underline cursor-pointer transition"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};
