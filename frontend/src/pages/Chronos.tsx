import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Plus, Tag, Check, ArrowRight, Trash2, AlertCircle, Sparkles, Calendar, Target } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useTasks } from '../hooks/useTasks';
import { api } from '../lib/axios';

const taskSchema = z.object({
  title: z.string().min(3, { message: 'Task title must be at least 3 characters' }),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  category: z.string().min(1, { message: 'Category is required' }),
});

type TaskFormData = z.infer<typeof taskSchema>;

export const Chronos: React.FC = () => {
  const { tasks, isLoading, error, createTask, updateTask, deleteTask } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  const { data: matrixData, isLoading: matrixLoading } = useQuery({
    queryKey: ['ai-tasks-eisenhower'],
    queryFn: async () => {
      const { data } = await api.get('/ai/tasks/eisenhower');
      return data.data;
    },
    enabled: isMatrixOpen,
    staleTime: 1000 * 60 * 5,
  });

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitGoal, setHabitGoal] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [habitLoading, setHabitLoading] = useState(false);

  const handleGenerateHabitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitGoal.trim()) return;
    setHabitLoading(true);
    try {
      const { data } = await api.post('/ai/planner/habit-plan', { habitGoal, daysPerWeek });
      const sessions = data.data?.sessions || [];
      sessions.forEach((s: any) => {
        createTask({
          title: `[Habit] ${s.title}`,
          description: `${s.focusArea} (${s.recommendedTime}, ${s.durationMinutes} mins)`,
          priority: 'MEDIUM',
          status: 'TODO',
          category: 'Habits & Study',
        });
      });
      setHabitGoal('');
      setIsHabitModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setHabitLoading(false);
    }
  };

  const handleAiDecompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiGoal.trim()) return;
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/decompose', { goalTitle: aiGoal, targetDays: 14 });
      const milestones = data.data?.milestones || [];
      milestones.forEach((m: any) => {
        createTask({
          title: m.title,
          description: m.description,
          priority: m.priority || 'MEDIUM',
          status: 'TODO',
          category: 'AI Milestone',
        });
      });
      setAiGoal('');
      setIsAiModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      category: '',
    },
  });

  const onSubmit = (data: TaskFormData) => {
    createTask({ ...data, status: 'TODO' });
    reset();
    setIsOpen(false);
  };

  const columns: { id: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'; label: string }[] = [
    { id: 'TODO', label: 'Todo' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  const getPriorityColor = (p: string) => {
    if (p === 'HIGH') return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (p === 'MEDIUM') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-destructive gap-2 text-sm font-medium">
        <AlertCircle size={24} />
        <span>Failed to load tasks from the database server.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Chronos Planner</h1>
          <p className="text-xs text-muted-foreground">
            Manage your daily pipeline, schedule, and milestones.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsMatrixOpen(true)}
            className="flex items-center gap-1.5 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
          >
            <Target size={14} className="text-amber-500" />
            <span>AI Eisenhower Matrix</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsHabitModalOpen(true)}
            className="flex items-center gap-1.5 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
          >
            <Calendar size={14} className="text-amber-500" />
            <span>AI Habit Planner</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
          >
            <Sparkles size={14} className="text-amber-500 animate-pulse" />
            <span>AI Decompose Goal</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsOpen(true)} className="flex items-center gap-1.5">
            <Plus size={14} />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div key={col.id} className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  {col.label}
                </span>
                <span className="bg-secondary text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {isLoading ? '...' : colTasks.length}
                </span>
              </div>

              <div className="space-y-3.5 min-h-[500px] bg-secondary/15 rounded-xl p-3 border border-border/40">
                {isLoading ? (
                  [...Array(3)].map((_, idx) => (
                    <div key={idx} className="p-4 bg-card border border-border/80 rounded-xl space-y-3 animate-pulse">
                      <div className="h-4 bg-secondary rounded w-3/4" />
                      <div className="h-3 bg-secondary rounded w-5/6" />
                      <div className="flex justify-between">
                        <div className="h-3 bg-secondary rounded w-1/4" />
                        <div className="h-3 bg-secondary rounded w-1/6" />
                      </div>
                    </div>
                  ))
                ) : (
                  <AnimatePresence>
                    {colTasks.length > 0 ? (
                      colTasks.map((task) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          key={task.id}
                        >
                          <Card className="p-4 bg-card border-border/80 text-left space-y-3 shadow-apple-sm relative group" hoverEffect>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-xs font-semibold text-foreground tracking-tight line-clamp-1">
                                {task.title}
                              </h4>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition p-0.5 rounded cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            {task.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                                {task.category && (
                                  <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded font-medium border border-border/40">
                                    <Tag size={8} />
                                    {task.category}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                {task.status !== 'COMPLETED' && (
                                  <button
                                    onClick={() =>
                                      updateTask({
                                        id: task.id,
                                        status: task.status === 'TODO' ? 'IN_PROGRESS' : 'COMPLETED',
                                      })
                                    }
                                    className="p-1 rounded bg-secondary hover:bg-accent/10 hover:text-accent transition cursor-pointer text-muted-foreground"
                                  >
                                    <ArrowRight size={10} />
                                  </button>
                                )}
                                {task.status === 'COMPLETED' && (
                                  <span className="p-1 rounded bg-emerald-500/10 text-emerald-500">
                                    <Check size={10} />
                                  </span>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground space-y-2">
                        <span className="text-xs">No tasks in this stage</span>
                      </div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create New Chronos Task">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="What needs to be done?"
            error={errors.title?.message}
            {...register('title')}
          />
          
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description
            </label>
            <textarea
              className="w-full bg-card border border-border px-4 py-2.5 rounded-lg text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition min-h-[80px]"
              placeholder="Provide a detailed task description..."
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Priority
              </label>
              <select
                className="w-full bg-card border border-border px-3 py-2.5 rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/40"
                {...register('priority')}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <Input
              label="Category"
              placeholder="e.g. Design, Dev"
              error={errors.category?.message}
              {...register('category')}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Task
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="✨ AI Goal Decomposer">
        <form onSubmit={handleAiDecompose} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Objective or Milestone
            </label>
            <Input
              placeholder="e.g. Prepare for AWS Certified Solutions Architect exam in 3 weeks"
              value={aiGoal}
              onChange={(e) => setAiGoal(e.target.value)}
              required
            />
            <p className="text-[11px] text-muted-foreground pt-1">
              Google Gemini 2.5 Flash AI will analyze your goal and automatically generate structured sub-tasks for your Kanban pipeline.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsAiModalOpen(false)} disabled={aiLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={aiLoading} className="flex items-center gap-2">
              {aiLoading ? (
                <>
                  <Sparkles size={14} className="animate-spin text-amber-400" />
                  <span>Decomposing Goal...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Generate Sub-tasks</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isHabitModalOpen} onClose={() => setIsHabitModalOpen(false)} title="📅 AI Habit & Study Planner">
        <form onSubmit={handleGenerateHabitPlan} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Habit Goal or Study Routine
            </label>
            <Input
              placeholder="e.g. Read 12 books this year or 5k workout plan"
              value={habitGoal}
              onChange={(e) => setHabitGoal(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Target Frequency (Days Per Week)
            </label>
            <select
              className="w-full bg-card border border-border px-3 py-2.5 rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/40"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value))}
            >
              <option value={2}>2 days / week</option>
              <option value={3}>3 days / week</option>
              <option value={5}>5 days / week</option>
              <option value={7}>Daily (7 days / week)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsHabitModalOpen(false)} disabled={habitLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={habitLoading} className="flex items-center gap-2">
              {habitLoading ? (
                <>
                  <Calendar size={14} className="animate-spin text-amber-400" />
                  <span>Scheduling Habits...</span>
                </>
              ) : (
                <>
                  <Calendar size={14} className="text-amber-400" />
                  <span>Generate Habit Schedule</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isMatrixOpen} onClose={() => setIsMatrixOpen(false)} title="🎯 AI Eisenhower Matrix • Urgency & Impact Analysis">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground text-left">
            Gemini 2.5 Flash analyzes your active tasks along Urgency (1-10) and Impact (1-10) dimensions to place them into the 4 strategic execution quadrants.
          </p>

          {matrixLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
              <Sparkles size={24} className="animate-spin text-amber-400" />
              <span className="text-xs font-medium">Analyzing task urgency and strategic impact with Gemini 2.5 Flash...</span>
            </div>
          ) : matrixData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {/* Q1: DO FIRST */}
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
                <div className="flex justify-between items-center border-b border-red-500/20 pb-2">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider">🔴 Q1: DO FIRST (Urgent & Important)</span>
                  <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-bold">{matrixData.q1DoFirst?.length || 0}</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {matrixData.q1DoFirst?.length > 0 ? (
                    matrixData.q1DoFirst.map((t: any, idx: number) => (
                      <div key={idx} className="p-2 bg-card/80 border border-border/50 rounded-lg text-xs space-y-1">
                        <span className="font-semibold text-foreground">{t.title}</span>
                        <p className="text-[10px] text-muted-foreground">{t.advice}</p>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">No urgent critical tasks flagged.</span>
                  )}
                </div>
              </div>

              {/* Q2: SCHEDULE */}
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                <div className="flex justify-between items-center border-b border-indigo-500/20 pb-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">🔵 Q2: SCHEDULE (High Impact Focus)</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">{matrixData.q2Schedule?.length || 0}</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {matrixData.q2Schedule?.length > 0 ? (
                    matrixData.q2Schedule.map((t: any, idx: number) => (
                      <div key={idx} className="p-2 bg-card/80 border border-border/50 rounded-lg text-xs space-y-1">
                        <span className="font-semibold text-foreground">{t.title}</span>
                        <p className="text-[10px] text-muted-foreground">{t.advice}</p>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">No strategic growth tasks flagged.</span>
                  )}
                </div>
              </div>

              {/* Q3: BATCH / DELEGATE */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">🟡 Q3: BATCH (Urgent, Low Impact)</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-bold">{matrixData.q3Delegate?.length || 0}</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {matrixData.q3Delegate?.length > 0 ? (
                    matrixData.q3Delegate.map((t: any, idx: number) => (
                      <div key={idx} className="p-2 bg-card/80 border border-border/50 rounded-lg text-xs space-y-1">
                        <span className="font-semibold text-foreground">{t.title}</span>
                        <p className="text-[10px] text-muted-foreground">{t.advice}</p>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">No low-impact urgent tasks.</span>
                  )}
                </div>
              </div>

              {/* Q4: ELIMINATE */}
              <div className="p-3.5 rounded-xl bg-secondary/60 border border-border/50 space-y-2">
                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">⚪ Q4: ELIMINATE (Low Priority)</span>
                  <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-bold">{matrixData.q4Eliminate?.length || 0}</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {matrixData.q4Eliminate?.length > 0 ? (
                    matrixData.q4Eliminate.map((t: any, idx: number) => (
                      <div key={idx} className="p-2 bg-card/80 border border-border/50 rounded-lg text-xs space-y-1">
                        <span className="font-semibold text-foreground">{t.title}</span>
                        <p className="text-[10px] text-muted-foreground">{t.advice}</p>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">No tasks to eliminate.</span>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end pt-3 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setIsMatrixOpen(false)}>
              Close Matrix
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
