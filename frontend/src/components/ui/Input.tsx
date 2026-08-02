import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = 'text', className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full text-left">
        {label && (
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full bg-card border border-border px-4 py-2.5 rounded-lg text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition duration-200 ${
            error ? 'border-destructive focus:ring-destructive/30' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
