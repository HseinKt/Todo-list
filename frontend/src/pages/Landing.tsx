import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Target, TrendingUp, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface LandingProps {
  onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden select-none relative flex flex-col justify-between">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-[150px] pointer-events-none" />

      <header className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between border-b border-border/40 relative z-10">
        <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
          Horizon OS
        </span>
        <Button variant="outline" size="sm" onClick={onGetStarted}>
          Sign In
        </Button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20 flex-1 flex flex-col items-center justify-center text-center relative z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-xs font-semibold text-accent mb-4">
            <Sparkles size={12} className="animate-pulse" />
            <span>Horizon OS v1.0 is officially live</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-3xl mx-auto">
            The cognitive operating system for <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-indigo-500">human potential</span>.
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Consolidate your daily actions, wealth, notes, and habits into a single, high-fidelity productivity matrix powered by context-aware AI.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center justify-center gap-4"
        >
          <Button size="lg" onClick={onGetStarted} className="flex items-center gap-2 font-semibold">
            <span>Launch Workspace</span>
            <ArrowRight size={16} />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 w-full text-left"
        >
          <Card hoverEffect glass>
            <Target className="text-accent mb-4" size={24} />
            <h3 className="text-sm font-semibold tracking-tight text-foreground mb-2">Chronos Engine</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Align task boards, habits, and daily plans with XP metrics to gamify your lifetime execution consistency.
            </p>
          </Card>

          <Card hoverEffect glass>
            <TrendingUp className="text-emerald-500 mb-4" size={24} />
            <h3 className="text-sm font-semibold tracking-tight text-foreground mb-2">Ledger Wealth</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Precisely track inflows, outflows, and active budgets with double-precision math to protect assets.
            </p>
          </Card>

          <Card hoverEffect glass>
            <BookOpen className="text-violet-500 mb-4" size={24} />
            <h3 className="text-sm font-semibold tracking-tight text-foreground mb-2">Athena Notebook</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A workspace for capturing notes, structuring thoughts, and logging AI-driven life blueprints.
            </p>
          </Card>
        </motion.div>
      </main>

      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-border/40 text-center text-xs text-muted-foreground relative z-10">
        <p>© 2026 Horizon OS. Built with premium Apple & Stripe-level minimalist design principles.</p>
      </footer>
    </div>
  );
};
