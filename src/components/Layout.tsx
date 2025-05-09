
import React, { useState, useEffect } from 'react';
import { Hotel, CalendarDays, Clock, House, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PwaInstallPrompt } from './PwaInstallPrompt';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import Sidebar from './navigation/Sidebar';
import Header from './navigation/Header';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const { isInstallable, isInstalled } = usePwaInstall();
  
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    
    // Show install prompt after 3 seconds if the app is installable and not installed
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`,
      description: `The application is now in ${newTheme} mode.`,
    });
  };
  
  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };
  
  const navItems = [
    { 
      to: '/', 
      label: 'Dashboard', 
      icon: <Hotel className="h-4 w-4" /> 
    },
    { 
      to: '/rooms', 
      label: 'Rooms', 
      icon: <House className="h-4 w-4" /> 
    },
    { 
      to: '/tasks', 
      label: 'Tasks', 
      icon: <Trash className="h-4 w-4" /> 
    },
    { 
      to: '/staff', 
      label: 'Staff', 
      icon: <Clock className="h-4 w-4" /> 
    },
  ];
  
  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-background">
        <Header 
          collapsed={collapsed} 
          toggleSidebar={toggleSidebar}
          navItems={navItems}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className="p-6 dark:text-white">{children}</main>
        
        {/* PWA Install Prompt */}
        {showInstallPrompt && (
          <div className="fixed bottom-4 right-4 z-50 max-w-sm">
            <PwaInstallPrompt onClose={() => setShowInstallPrompt(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
