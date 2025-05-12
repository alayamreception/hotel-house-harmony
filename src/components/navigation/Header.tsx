
import React, { useState } from 'react';
import { Bell, Search, Menu, X, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSidebar } from '@/hooks/use-sidebar';

interface HeaderProps {
  navItems: {
    to: string;
    label: string;
    icon: React.ReactNode;
  }[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  collapsed?: boolean;
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  navItems, 
  theme, 
  toggleTheme,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const { isOpen, toggleSidebar } = useSidebar();
  
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
      <div className="flex justify-between items-center p-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white hidden md:block">Hotel Manager</h1>
        </div>
        
        {/* Right section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            {showSearch ? (
              <div className="absolute right-0 top-0 flex items-center bg-white dark:bg-gray-800 rounded-md shadow-md">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="px-3 py-2 rounded-l-md border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
                <button 
                  onClick={() => setShowSearch(false)}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowSearch(true)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <button 
            onClick={toggleTheme} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          <Link to="/profile" className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              JD
            </div>
          </Link>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <nav className="md:hidden bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between px-2 py-3 overflow-x-auto">
          {navItems.map((item) => (
            <Link 
              key={item.label}
              to={item.to} 
              className="flex flex-col items-center px-3 py-1 text-xs text-gray-600 dark:text-gray-300"
            >
              <div className="mb-1">{item.icon}</div>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
