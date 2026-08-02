import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Sun, LayoutDashboard, CheckSquare, Wallet, BookOpen, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setTab: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, setTab }) => {
  const [search, setSearch] = useState('');
  const { toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // toggle
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'dash', label: 'Go to The Nexus Dashboard', icon: LayoutDashboard, action: () => setTab('dashboard') },
    { id: 'todo', label: 'Go to Chronos Tasks', icon: CheckSquare, action: () => setTab('tasks') },
    { id: 'finance', label: 'Go to Ledger Finance', icon: Wallet, action: () => setTab('ledger') },
    { id: 'notes', label: 'Go to Athena Notes', icon: BookOpen, action: () => setTab('notebook') },
    { id: 'config', label: 'Go to Settings', icon: Settings, action: () => setTab('settings') },
    { id: 'theme', label: 'Toggle Light/Dark Theme', icon: Sun, action: () => toggleTheme() },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/40 backdrop-blur-[2px]"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
            <Search className="text-neutral-400" size={18} />
            <input
              type="text"
              autoFocus
              placeholder="Type a command or search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
            />
            <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 font-mono">
              ESC
            </span>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2">
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-all cursor-pointer"
                  >
                    <Icon size={16} className="text-neutral-400" />
                    <span>{cmd.label}</span>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8 text-sm text-neutral-400">
                No commands matching "{search}"
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
