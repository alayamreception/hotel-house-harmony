
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Hotel, 
  CalendarDays, 
  Clock, 
  House, 
  Trash, 
  ConciergeBell, 
  LogOut, 
  Menu, 
  Moon, 
  Sun, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active, collapsed }) => {
  return (
    <Link to={to}>
      <Button
        variant={active ? 'default' : 'ghost'}
        className={cn(
          "w-full justify-start mb-1",
          active ? '' : 'text-muted-foreground',
          collapsed ? 'px-2' : ''
        )}
      >
        <span className={collapsed ? '' : 'mr-2'}>{icon}</span>
        {!collapsed && label}
      </Button>
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);
  
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
      to: '/schedule', 
      label: 'Schedule', 
      icon: <CalendarDays className="h-4 w-4" /> 
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
    <div className={cn("flex h-screen", theme === 'dark' ? 'dark' : '')}>
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-white dark:bg-sidebar shadow-sm border-r dark:border-sidebar-border transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className={cn("p-4 border-b dark:border-sidebar-border flex items-center justify-between", 
          collapsed ? "flex-col" : "")}>
          <div className={cn("flex items-center", collapsed ? "flex-col" : "space-x-2")}>
            <Hotel className="h-6 w-6 text-hotel-primary" />
            {!collapsed && <h1 className="text-xl font-bold text-hotel-dark dark:text-white">HouseHarmony</h1>}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto" 
            onClick={toggleSidebar}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        {!collapsed && (
          <p className="text-xs text-muted-foreground dark:text-sidebar-foreground/70 px-4 pt-1">Hotel Management System</p>
        )}
        
        <div className="p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItem 
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                active={location.pathname === item.to}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </div>
        <div className="p-4 mt-auto border-t dark:border-sidebar-border">
          <div className="flex mb-2 justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme} 
              className="dark:text-white"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            
            {!collapsed && (
              <span className="text-xs text-muted-foreground dark:text-sidebar-foreground/70 flex items-center">
                {theme === 'light' ? 'Light' : 'Dark'} mode
              </span>
            )}
          </div>
          
          <Button 
            variant="outline" 
            className={cn(
              "justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 dark:border-sidebar-border",
              collapsed ? "w-full px-2" : "w-full"
            )}
            onClick={signOut}
          >
            <LogOut className={collapsed ? "" : "mr-2"} size={16} />
            {!collapsed && "Sign Out"}
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-background">
        <header className="bg-white dark:bg-sidebar shadow-sm border-b dark:border-sidebar-border h-16 flex items-center px-6">
          {collapsed && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-4" 
              onClick={toggleSidebar}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <h2 className="text-lg font-medium dark:text-white">
            {navItems.find(item => item.to === location.pathname)?.label || 'Dashboard'}
          </h2>
          {user && (
            <div className="ml-auto flex items-center space-x-2">
              <span className="text-sm text-muted-foreground dark:text-sidebar-foreground/70">
                {user.email}
              </span>
            </div>
          )}
        </header>
        <main className="p-6 dark:text-white">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
