import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Target, Flame, Calendar, Plus, Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../lib/axios';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: burnoutData } = useQuery({
    queryKey: ['burnout-risk'],
    queryFn: async () => {
      const { data } = await api.get('/ai/burnout-risk');
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto py-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {getGreeting()}, Visionary
          </h1>
          <p className="text-xs text-muted-foreground">
            Here is the status of your cognitive workspace for today.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/app/notebook')}
          className="flex items-center gap-1.5 self-start"
        >
          <Plus size={14} />
          <span>New Insight</span>
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-accent/5 via-accent/10 to-indigo-500/5 border-accent/20 relative overflow-hidden" glass>
        <div className="absolute top-[-30px] right-[-30px] w-28 h-28 rounded-full bg-accent/25 blur-xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-accent/15 text-accent rounded-xl">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div className="space-y-1.5 text-left">
            <h4 className="text-sm font-semibold tracking-tight text-foreground">Aether AI • Daily Focus</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">
              "Focus is a matter of deciding what things you're not going to do. Today, complete your financial ledger entry early to secure budget alerts, and commit to completing 2 high-priority tasks in Chronos."
            </p>
          </div>
        </div>
      </Card>

      {burnoutData && (
        <Card glass className="bg-gradient-to-r from-emerald-500/10 via-accent/5 to-amber-500/10 border-border/50 text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-amber-400 animate-pulse" />
              <h3 className="text-sm font-bold text-foreground">Chronos Life Guard • Energy & Burnout Risk</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                burnoutData.riskLevel === 'HIGH'
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : burnoutData.riskLevel === 'MODERATE'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              }`}>
                {burnoutData.riskLevel} RISK
              </span>
              <span className="text-xs font-bold text-foreground">{burnoutData.energyIndex}% Energy</span>
            </div>
          </div>

          <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                burnoutData.energyIndex < 40 ? 'bg-red-500' : burnoutData.energyIndex < 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${burnoutData.energyIndex}%` }}
            />
          </div>

          <p className="text-xs text-muted-foreground">{burnoutData.recommendation}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverEffect glass className="text-left space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Chronos Focus
            </span>
            <Target size={16} className="text-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">4 / 9</h2>
            <p className="text-[11px] text-muted-foreground mt-1">Tasks completed today</p>
          </div>
          <div className="w-full bg-border h-1 rounded-full overflow-hidden">
            <div className="bg-accent h-full rounded-full" style={{ width: '44%' }} />
          </div>
        </Card>

        <Card hoverEffect glass className="text-left space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Daily Streak
            </span>
            <Flame size={16} className="text-amber-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">12 Days</h2>
            <p className="text-[11px] text-muted-foreground mt-1">Consistent workspace habits</p>
          </div>
          <div className="flex gap-1.5 pt-1.5">
            {[...Array(7)].map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < 5 ? 'bg-amber-500' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </Card>

        <Card hoverEffect glass className="text-left space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Athena Logs
            </span>
            <Calendar size={16} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">18 Drafts</h2>
            <p className="text-[11px] text-muted-foreground mt-1">Insight documents logged</p>
          </div>
          <div className="text-[11px] text-emerald-500 font-medium">
            +3 new ideas added this week
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="text-left space-y-4">
          <h3 className="text-sm font-semibold text-foreground tracking-tight border-b border-border/40 pb-2.5">
            Active Targets
          </h3>
          <div className="space-y-3.5">
            {[
              { title: 'Rebuild UI design system', progress: '90%', active: true },
              { title: 'Connect NestJS endpoints', progress: '40%', active: true },
              { title: 'Launch beta version', progress: '0%', active: false },
            ].map((target, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="font-medium text-foreground">{target.title}</span>
                <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded font-mono">
                  {target.progress}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="text-left space-y-4">
          <h3 className="text-sm font-semibold text-foreground tracking-tight border-b border-border/40 pb-2.5">
            Timeline Planner
          </h3>
          <div className="space-y-4 relative pl-4 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
            {[
              { time: '10:00 AM', desc: 'Completed design tokens definition' },
              { time: '01:30 PM', desc: 'Pushed codebase to main branch' },
              { time: '04:00 PM', desc: 'Redesigned core dashboards' },
            ].map((item, idx) => (
              <div key={idx} className="relative text-xs space-y-0.5">
                <span className="absolute left-[-16px] top-1.5 w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] font-semibold text-muted-foreground font-mono uppercase">
                  {item.time}
                </span>
                <p className="font-medium text-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
