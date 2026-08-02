import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Wallet, 
  BookOpen, 
  Settings, 
  Menu, 
  Sun, 
  Moon, 
  LogOut 
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'The Nexus', icon: LayoutDashboard },
    { id: 'tasks', label: 'Chronos Tasks', icon: CheckSquare },
    { id: 'ledger', label: 'Ledger Finance', icon: Wallet },
    { id: 'notebook', label: 'Athena Notes', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between p-4 select-none relative"
    >
      <div>
        <div className="flex items-center justify-between mb-8 px-2">
          {!isCollapsed && (
            <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              Horizon OS
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 cursor-pointer"
          >
            <Menu size={18} />
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer relative ${
                  isActive
                    ? 'text-neutral-950 dark:text-white bg-neutral-200/60 dark:bg-neutral-800'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200/30 dark:hover:bg-neutral-800/40'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-violet-600 dark:text-violet-400' : ''} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        {user && !isCollapsed && (
          <div className="bg-neutral-200/40 dark:bg-neutral-800/40 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-neutral-600 dark:text-neutral-400">
              <span>{user.fullName || 'Visionary'}</span>
              <span className="bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded text-[10px]">
                Lvl 1
              </span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-violet-600 dark:bg-violet-400 h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 cursor-pointer"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          {!isCollapsed && (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
            >
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
