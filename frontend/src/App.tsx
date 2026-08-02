import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Chronos } from './pages/Chronos';
import { Ledger } from './pages/Ledger';
import { Notebook } from './pages/Notebook';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

const MainLayout: React.FC = () => {
  const [currentTab, setTab] = useState('dashboard');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If the user is not authenticated, toggle between Landing Page and Login Page
  if (!user) {
    return showLogin ? (
      <Login onBackToLanding={() => setShowLogin(false)} />
    ) : (
      <Landing onGetStarted={() => setShowLogin(true)} />
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <Chronos />;
      case 'ledger':
        return <Ledger />;
      case 'notebook':
        return <Notebook />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar currentTab={currentTab} setTab={setTab} />
      <div className="flex-1 flex flex-col overflow-y-auto p-8 relative">
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
      <ToastProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
