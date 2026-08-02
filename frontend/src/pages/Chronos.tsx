import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Calendar, CheckCircle2 } from 'lucide-react';

export const Chronos: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: '1', text: 'Scaffold NestJS endpoints', completed: true, priority: 'HIGH', date: 'Today' },
    { id: '2', text: 'Configure Tailwind v4 compiler', completed: false, priority: 'MEDIUM', date: 'Tomorrow' },
    { id: '3', text: 'Setup MFA security filters', completed: false, priority: 'HIGH', date: 'Aug 2' },
  ]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        text: newTask,
        completed: false,
        priority,
        date: 'Today',
      },
    ]);
    setNewTask('');
  };

  const handleToggle = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="flex-1 bg-white dark:bg-neutral-950 p-8 overflow-y-auto text-neutral-800 dark:text-neutral-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Chronos Engine</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Align your daily operations with your lifetime goals.</p>
        </div>
      </div>

      <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3 mb-8 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <input
          type="text"
          placeholder="I want to..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 rounded-lg text-sm focus:outline-violet-500 text-neutral-800 dark:text-white"
        />
        <div className="flex gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 focus:outline-none"
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>
          <button
            type="submit"
            className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {tasks.map((task) => (
          <motion.div
            layout
            key={task.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:shadow-sm transition duration-200"
          >
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => handleToggle(task.id)}
                className="text-neutral-350 hover:text-violet-600 dark:hover:text-violet-400 transition cursor-pointer"
              >
                <CheckCircle2
                  size={20}
                  className={task.completed ? 'text-violet-600 dark:text-violet-400 fill-violet-50 dark:fill-violet-950/20' : 'text-neutral-300 dark:text-neutral-700'}
                />
              </button>
              <span className={`text-sm font-medium ${task.completed ? 'line-through opacity-50 text-neutral-500' : 'text-neutral-800 dark:text-neutral-200'}`}>
                {task.text}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                task.priority === 'HIGH'
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400'
                  : task.priority === 'MEDIUM'
                  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-650 dark:text-amber-400'
                  : 'bg-neutral-100 dark:bg-neutral-850 text-neutral-600'
              }`}>
                {task.priority}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-neutral-450">
                <Calendar size={12} />
                {task.date}
              </span>
              <button
                onClick={() => handleDelete(task.id)}
                className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
