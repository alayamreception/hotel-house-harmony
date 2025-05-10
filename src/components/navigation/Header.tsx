
import React from 'react';
import { Menu, Bell, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  navItems: Array<{ to: string; label: string; icon: React.ReactNode }>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, toggleSidebar, navItems, theme, toggleTheme }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { isSupported, permission, requestPermission } = useNotification();
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 h-16 flex items-center px-6">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mr-4" 
        onClick={toggleSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button>
      
      <h2 className="text-lg font-medium dark:text-white">
        {navItems.find(item => item.to === location.pathname)?.label || 'Dashboard'}
      </h2>
      
      {user && (
        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="px-2"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          
          {isSupported && permission !== 'granted' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm" 
              onClick={requestPermission}
            >
              <Bell className="h-4 w-4 mr-1" /> Enable Notifications
            </Button>
          )}
          <span className="text-sm text-muted-foreground dark:text-gray-300">
            {user.email}
          </span>
        </div>
      )}
    </header>
  );
};

export default Header;
