import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Target, Flame, Calendar, Plus, Zap, Check, TrendingUp, BarChart3 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { api } from '../lib/axios';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewPeriod, setReviewPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'YEARLY'>('WEEKLY');

  const { data: burnoutData } = useQuery({
    queryKey: ['burnout-risk'],
    queryFn: async () => {
      const { data } = await api.get('/ai/burnout-risk');
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: reviewData, isLoading: reviewLoading } = useQuery({
    queryKey: ['executive-review', reviewPeriod],
    queryFn: async () => {
      const { data } = await api.get(`/ai/executive-review?period=${reviewPeriod}`);
      return data.data;
    },
    enabled: isReviewOpen,
    staleTime: 1000 * 60 * 10,
  });

  const { data: nexusData } = useQuery({
    queryKey: ['nexus-briefing'],
    queryFn: async () => {
      const { data } = await api.get('/ai/nexus-briefing');
      return data.data;
    },
    staleTime: 1000 * 60 * 2,
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
        <div className="flex items-center gap-2 self-start flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsReviewOpen(true)}
            className="flex items-center gap-1.5 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
          >
            <BarChart3 size={14} className="text-amber-500 animate-pulse" />
            <span>Executive AI Briefing</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/notebook')}
            className="flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>New Insight</span>
          </Button>
        </div>
      </div>

      {nexusData && (
        <Card className="bg-gradient-to-r from-accent/5 via-accent/10 to-indigo-500/5 border-accent/20 relative overflow-hidden text-left" glass>
          <div className="absolute top-[-30px] right-[-30px] w-28 h-28 rounded-full bg-accent/25 blur-xl pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-accent/15 text-accent rounded-xl">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div className="space-y-1.5 text-left flex-1">
              <h4 className="text-sm font-semibold tracking-tight text-foreground">Daily Inspiration & Strategic Recommendation</h4>
              <p className="text-xs font-serif italic text-foreground/90 leading-relaxed">
                "{nexusData.quote}"
              </p>
              <p className="text-[11px] text-accent font-medium pt-1">
                💡 AI Focus Tip: {nexusData.aiRecommendation}
              </p>
            </div>
          </div>
        </Card>
      )}

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

      {nexusData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card hoverEffect glass className="text-left space-y-2 cursor-pointer" onClick={() => navigate('/app/tasks')}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Productivity Index</span>
              <Target size={16} className="text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{nexusData.productivityScore}%</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">{nexusData.completedTasksCount} / {nexusData.completedTasksCount + nexusData.pendingTasksCount} tasks completed</p>
            </div>
          </Card>

          <Card hoverEffect glass className="text-left space-y-2 cursor-pointer" onClick={() => navigate('/app/tasks')}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Tasks</span>
              <Flame size={16} className="text-amber-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{nexusData.pendingTasksCount} Pending</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Chronos Kanban Pipeline</p>
            </div>
          </Card>

          <Card hoverEffect glass className="text-left space-y-2 cursor-pointer" onClick={() => navigate('/app/ledger')}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net Worth Balance</span>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-emerald-400">${nexusData.currentBalance}</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Ledger Wealth Capital</p>
            </div>
          </Card>

          <Card hoverEffect glass className="text-left space-y-2 cursor-pointer" onClick={() => navigate('/app/notebook')}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Athena Knowledge</span>
              <Calendar size={16} className="text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{nexusData.totalNotesCount} Notes</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Captured thoughts & blueprints</p>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="text-left space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Today's Active Tasks</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/app/tasks')} className="text-[11px] h-7 px-2">View All</Button>
          </div>
          <div className="space-y-2">
            {nexusData?.todayTasks?.length > 0 ? (
              nexusData.todayTasks.map((t: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-secondary/40 border border-border/40 rounded-lg text-xs flex justify-between items-center">
                  <span className="font-medium text-foreground">{t.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">{t.priority}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No pending tasks today!</p>
            )}
          </div>
        </Card>

        <Card className="text-left space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Recent Captured Ideas</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/app/notebook')} className="text-[11px] h-7 px-2">View Notebook</Button>
          </div>
          <div className="space-y-2">
            {nexusData?.recentNotes?.length > 0 ? (
              nexusData.recentNotes.map((n: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-secondary/40 border border-border/40 rounded-lg text-xs space-y-0.5">
                  <span className="font-semibold text-foreground block">{n.title || 'Untitled Note'}</span>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{n.content || 'Empty Note'}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No notes captured yet!</p>
            )}
          </div>
        </Card>
      </div>

      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="👔 Executive AI Retrospective Briefing">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-1.5 p-1 bg-secondary/50 rounded-lg">
              {(['WEEKLY', 'MONTHLY', 'YEARLY'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setReviewPeriod(period)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    reviewPeriod === period ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {reviewData && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
                <span>Productivity Index: {reviewData.productivityScore}/100</span>
              </div>
            )}
          </div>

          {reviewLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
              <Sparkles size={24} className="animate-spin text-amber-400" />
              <span className="text-xs font-medium">Generating executive retrospective briefing with Gemini 2.5 Flash...</span>
            </div>
          ) : reviewData ? (
            <div className="space-y-4 text-left">
              <div className="p-4 rounded-xl bg-card/60 border border-border/40 space-y-1.5">
                <h4 className="text-xs font-bold text-accent uppercase tracking-wider">Executive Overview</h4>
                <p className="text-xs leading-relaxed text-foreground/90">{reviewData.executiveSummary}</p>
              </div>

              {reviewData.keyAccomplishments?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Key Milestones & Wins</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {reviewData.keyAccomplishments.map((win: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-xs text-foreground/90">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{win}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reviewData.financialTrend && (
                <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40 space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span>Capital & Financial Trajectory</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">{reviewData.financialTrend}</p>
                </div>
              )}

              {reviewData.growthAreas?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Strategic Next Pacing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {reviewData.growthAreas.map((area: string, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-accent/5 border border-accent/15 text-xs text-foreground/90 flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className="flex justify-end pt-3 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setIsReviewOpen(false)}>
              Close Briefing
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
