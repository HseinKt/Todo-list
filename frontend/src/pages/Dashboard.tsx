import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Flame, 
  ChevronRight, 
  TrendingUp,
  Target 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  onOpenCommandPalette: () => void;
  setTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenCommandPalette, setTab }) => {
  const { user } = useAuth();

  const mockHabits = [
    { name: 'Meditate (Mindfulness)', streak: 12, maxStreak: 30 },
    { name: 'Gym / Workout', streak: 4, maxStreak: 10 },
    { name: 'Read 15 Pages', streak: 7, maxStreak: 14 },
  ];

  const mockBudgets = [
    { category: 'Housing & Rent', spent: 1200.0, limit: 1500, color: 'bg-violet-500' },
    { category: 'Food & Dining', spent: 145.0, limit: 300, color: 'bg-amber-500' },
    { category: 'Transport', spent: 48.20, limit: 120, color: 'bg-emerald-500' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-neutral-950 p-8 text-neutral-800 dark:text-neutral-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Good morning, {user?.fullName || 'Visionary'}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Here is your daily cognitive summary.
          </p>
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 rounded-lg text-sm text-neutral-500 cursor-pointer"
        >
          <Search size={15} />
          <span>Search or type a command...</span>
          <kbd className="text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded ml-4 font-mono">
            Ctrl+K
          </kbd>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-violet-200 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase opacity-90">
                Aether AI Blueprint
              </span>
            </div>
            <h2 className="text-lg font-semibold mb-2 leading-snug">
              "Your energy level is peaking. Unblock your high-focus coding goals before 2 PM."
            </h2>
            <p className="text-sm text-violet-100 opacity-85 leading-relaxed">
              We noticed you skipped hydration habits yesterday. Balance task execution with active wellness routines today.
            </p>
          </motion.div>

          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                <Target size={16} className="text-violet-600 dark:text-violet-400" />
                Active Focus Tasks
              </h3>
              <button
                onClick={() => setTab('tasks')}
                className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center cursor-pointer"
              >
                Go to Chronos <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-800 transition">
                <input type="checkbox" className="w-4 h-4 rounded text-violet-600 border-neutral-300 focus:ring-violet-500" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Design final database ERD diagrams</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-800 transition">
                <input type="checkbox" className="w-4 h-4 rounded text-violet-600 border-neutral-300 focus:ring-violet-500" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Log gym workout routines</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl">
            <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Flame size={16} className="text-orange-500" />
              Streak Momentum
            </h3>
            <div className="space-y-3">
              {mockHabits.map((h, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-semibold text-neutral-950 dark:text-white">{h.name}</p>
                    <p className="text-[10px] text-neutral-500">Target: {h.maxStreak} days</p>
                  </div>
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold text-sm">
                    <Flame size={14} className="fill-orange-600 dark:fill-orange-400" />
                    <span>{h.streak}d</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-violet-600 dark:text-violet-400" />
                Ledger Budgets
              </h3>
              <button
                onClick={() => setTab('ledger')}
                className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center cursor-pointer"
              >
                Ledger <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-4">
              {mockBudgets.map((b, i) => {
                const percent = Math.min((b.spent / b.limit) * 100, 100);
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      <span>{b.category}</span>
                      <span>${b.spent.toFixed(2)} / ${b.limit}</span>
                    </div>
                    <div className="w-full bg-neutral-255 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${b.color}`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
