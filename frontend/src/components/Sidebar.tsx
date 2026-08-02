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
import { Card } from './ui/Card';

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
    { id: 'ledger', label: 'Ledger Wealth', icon: Wallet },
    { id: 'notebook', label: 'Athena Notes', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen bg-card border-r border-border flex flex-col justify-between p-4 select-none relative z-20"
    >
      <div>
        <div className="flex items-center justify-between mb-8 px-2">
          {!isCollapsed && (
            <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
              Horizon OS
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition"
          >
            <Menu size={16} />
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
                    ? 'text-foreground bg-secondary/80 border-l-2 border-accent pl-2.5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-accent' : ''} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        {user && !isCollapsed && (
          <Card className="p-3 bg-secondary/30 border-border/40" glass>
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-muted-foreground">
              <span className="truncate max-w-[130px]">{user.fullName || 'Visionary'}</span>
              <span className="bg-accent/10 text-accent px-1.5 py-0.5 rounded text-[10px] font-bold">
                Lvl 1
              </span>
            </div>
            <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
              <div className="bg-accent h-full rounded-full" style={{ width: '45%' }} />
            </div>
          </Card>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          
          {!isCollapsed && (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-destructive font-medium hover:bg-destructive/10 rounded-lg cursor-pointer transition"
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
