import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tag, Check, ArrowRight, Trash2, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useTasks } from '../hooks/useTasks';

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
    <div className="space-y-6 max-w-6xl mx-auto py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Chronos Planner</h1>
          <p className="text-xs text-muted-foreground">
            Manage your daily pipeline, schedule, and milestones.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 self-start">
          <Plus size={14} />
          <span>Add Task</span>
        </Button>
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
    </div>
  );
};
