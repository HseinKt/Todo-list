import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tag, Check, ArrowRight, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category?: string;
}

export const Chronos: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Define SaaS typography presets', status: 'TODO', priority: 'HIGH', category: 'Design' },
    { id: '2', title: 'Connect database transaction pooler', status: 'IN_PROGRESS', priority: 'HIGH', category: 'Dev' },
    { id: '3', title: 'Scaffold marketing landing template', status: 'COMPLETED', priority: 'MEDIUM', category: 'Marketing' },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [category, setCategory] = useState('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description: desc,
      status: 'TODO',
      priority,
      category: category || 'General',
    };
    setTasks((prev) => [...prev, newTask]);
    setTitle('');
    setDesc('');
    setPriority('MEDIUM');
    setCategory('');
    setIsOpen(false);
  };

  const moveTask = (id: string, nextStatus: 'TODO' | 'IN_PROGRESS' | 'COMPLETED') => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
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
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3.5 min-h-[500px] bg-secondary/15 rounded-xl p-3 border border-border/40">
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
                                    moveTask(
                                      task.id,
                                      task.status === 'TODO' ? 'IN_PROGRESS' : 'COMPLETED'
                                    )
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
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create New Chronos Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description
            </label>
            <textarea
              className="w-full bg-card border border-border px-4 py-2.5 rounded-lg text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition min-h-[80px]"
              placeholder="Provide a detailed task description..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Priority
              </label>
              <select
                className="w-full bg-card border border-border px-3 py-2.5 rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/40"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <Input
              label="Category"
              placeholder="e.g. Design, Dev"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
