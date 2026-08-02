import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { Dashboard } from './pages/Dashboard';
import { Chronos } from './pages/Chronos';
import { Ledger } from './pages/Ledger';
import { Notebook } from './pages/Notebook';
import { SettingsPage } from './pages/Settings';
import { Login } from './pages/Login';

const MainLayout: React.FC = () => {
  const [currentTab, setTab] = useState('dashboard');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onOpenCommandPalette={() => setIsCommandOpen(true)} setTab={setTab} />;
      case 'tasks':
        return <Chronos />;
      case 'ledger':
        return <Ledger />;
      case 'notebook':
        return <Notebook />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onOpenCommandPalette={() => setIsCommandOpen(true)} setTab={setTab} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-100 dark:bg-neutral-950">
      <Sidebar currentTab={currentTab} setTab={setTab} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {renderContent()}
      </div>

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        setTab={setTab}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
