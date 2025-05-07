
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Hotel, CalendarDays, Clock, House, Trash, ConciergeБell } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active }) => {
  return (
    <Link to={to}>
      <Button
        variant={active ? 'default' : 'ghost'}
        className={`w-full justify-start mb-1 ${active ? '' : 'text-muted-foreground'}`}
      >
        <span className="mr-2">{icon}</span>
        {label}
      </Button>
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Hotel className="h-6 w-6 text-hotel-primary" />
            <h1 className="text-xl font-bold text-hotel-dark">HouseHarmony</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Hotel Management System</p>
        </div>
        <div className="p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItem 
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                active={location.pathname === item.to}
              />
            ))}
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b h-16 flex items-center px-6">
          <h2 className="text-lg font-medium">
            {navItems.find(item => item.to === location.pathname)?.label || 'Dashboard'}
          </h2>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
