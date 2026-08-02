import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

const signupSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

const mfaSchema = z.object({
  mfaCode: z.string().length(6, { message: 'MFA verification code must be exactly 6 digits' }),
});

interface LoginProps {
  onBackToLanding: () => void;
}

interface AuthFormData {
  email?: string;
  password?: string;
  fullName?: string;
  mfaCode?: string;
}

export const Login: React.FC<LoginProps> = ({ onBackToLanding }) => {
  const { login, signup, verify2Fa, require2Fa } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentSchema = require2Fa ? mfaSchema : isRegister ? signupSchema : loginSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(currentSchema) as any,
  });

  const onSubmit = async (values: any) => {
    if (isLoading) return;
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      if (require2Fa) {
        await verify2Fa(values.mfaCode);
      } else if (isRegister) {
        await signup(values.email, values.password, values.fullName);
        setSuccess('Registration successful! You can now log in.');
        setIsRegister(false);
        reset();
      } else {
        await login(values.email, values.password);
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {require2Fa ? (
            <Input
              label="6-Digit Verification Code"
              type="text"
              placeholder="e.g. 123456"
              maxLength={6}
              error={errors.mfaCode?.message as string}
              {...register('mfaCode')}
            />
          ) : (
            <>
              {isRegister && (
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Your Name"
                  error={errors.fullName?.message as string}
                  {...register('fullName')}
                />
              )}
              <Input
                label="Email address"
                type="email"
                placeholder="you@domain.com"
                error={errors.email?.message as string}
                {...register('email')}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message as string}
                {...register('password')}
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
                reset();
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
