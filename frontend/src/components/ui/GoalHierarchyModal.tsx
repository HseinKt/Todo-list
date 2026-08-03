import React, { useState } from 'react';
import { Target, Sparkles, Flag } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { api } from '../../lib/axios';

interface GoalHierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalHierarchyModal: React.FC<GoalHierarchyModalProps> = ({ isOpen, onClose }) => {
  const [goalTitle, setGoalTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [hierarchy, setHierarchy] = useState<any>(null);

  const handleDecomposeGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || loading) return;
    setLoading(true);

    try {
      const { data } = await api.post('/ai/decompose', { goal: goalTitle, timeframe: '4 weeks' });
      setHierarchy({
        goal: goalTitle,
        milestones: [
          {
            title: `Phase 1: Foundation & Setup`,
            tasks: data.data?.subTasks?.slice(0, 2) || [{ title: 'Setup repository and core dependencies', priority: 'HIGH' }],
          },
          {
            title: `Phase 2: Execution & Implementation`,
            tasks: data.data?.subTasks?.slice(2, 4) || [{ title: 'Implement feature architecture', priority: 'MEDIUM' }],
          },
          {
            title: `Phase 3: Launch & Review`,
            tasks: data.data?.subTasks?.slice(4, 6) || [{ title: 'Deploy to production and perform review', priority: 'HIGH' }],
          },
        ],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎯 Visual Goal & Milestone Pathway Breakdown">
      <div className="space-y-4 text-left">
        <form onSubmit={handleDecomposeGoal} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              High-Level Achievement Goal
            </label>
            <Input
              placeholder="e.g. Become a Software Engineer or Read 12 books"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              required
            />
          </div>
          <Button variant="primary" type="submit" disabled={loading || !goalTitle.trim()} className="w-full flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Sparkles size={14} className="animate-spin text-amber-400" />
                <span>Mapping Goal Pathway...</span>
              </>
            ) : (
              <>
                <Target size={14} className="text-amber-400" />
                <span>Generate Goal Pathway</span>
              </>
            )}
          </Button>
        </form>

        {hierarchy && (
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-2 text-xs font-bold text-accent">
              <Flag size={16} />
              <span>Goal: {hierarchy.goal}</span>
            </div>

            <div className="space-y-3 pl-2 relative before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-[2px] before:bg-border/60">
              {hierarchy.milestones.map((m: any, idx: number) => (
                <div key={idx} className="relative pl-6 space-y-2">
                  <div className="absolute left-[-1px] top-1.5 w-3.5 h-3.5 rounded-full bg-accent border-2 border-background flex items-center justify-center text-[9px] font-bold text-white">
                    {idx + 1}
                  </div>
                  <h4 className="text-xs font-bold text-foreground">{m.title}</h4>
                  <div className="space-y-1.5">
                    {m.tasks?.map((t: any, tIdx: number) => (
                      <div key={tIdx} className="p-2.5 rounded-lg bg-card/70 border border-border/50 text-xs flex justify-between items-center">
                        <span className="text-foreground/90 font-medium">{t.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                          {t.priority || 'MEDIUM'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-border/40">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Pathway
          </Button>
        </div>
      </div>
    </Modal>
  );
};
