
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import NavItem from './NavItem';
import { Home, CalendarRange, ClipboardList, Users, Building2, ClipboardCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSupervisor, setIsSupervisor] = useState(false);
  
  // Fetch the user's role from the staff table if they are logged in
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setUserRole(data.role);
          setIsSupervisor(data.role === 'Supervisor' || data.role === 'Manager');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    
    fetchUserRole();
  }, [user]);
  
  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r transition-all duration-300",
      collapsed ? "w-[70px]" : "w-[240px]"
    )}>
      <div className="px-4 py-6 flex items-center justify-center">
        {collapsed ? (
          <Building2 className="h-6 w-6" />
        ) : (
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">CleanSweep</h1>
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          <NavItem
            to="/"
            icon={<Home className="h-4 w-4" />}
            label="Dashboard"
            active={location.pathname === '/'}
            collapsed={collapsed}
          />
          <NavItem
            to="/rooms"
            icon={<Building2 className="h-4 w-4" />}
            label="Rooms"
            active={location.pathname === '/rooms'}
            collapsed={collapsed}
          />
          <NavItem
            to="/tasks"
            icon={<ClipboardList className="h-4 w-4" />}
            label="Tasks"
            active={location.pathname === '/tasks'}
            collapsed={collapsed}
          />
          <NavItem
            to="/staff"
            icon={<Users className="h-4 w-4" />}
            label="Staff"
            active={location.pathname === '/staff'}
            collapsed={collapsed}
          />
          
          {isSupervisor && (
            <NavItem
              to="/supervisor-tasks"
              icon={<ClipboardCheck className="h-4 w-4" />}
              label="Supervisor Dashboard"
              active={location.pathname === '/supervisor-tasks'}
              collapsed={collapsed}
            />
          )}
        </div>
      </ScrollArea>
      <div className="px-2 py-4 border-t">
        <div className={cn(
          "flex items-center justify-between px-3 py-2",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <div className={cn(
            "flex items-center gap-3",
            collapsed ? "justify-center" : ""
          )}>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold">
                {user?.email ? user.email.substring(0, 2).toUpperCase() : 'GU'}
              </span>
            </div>
            {!collapsed && (
              <div className="text-sm">
                <p className="font-semibold truncate max-w-[120px]">
                  {user?.email || 'Guest User'}
                </p>
                <p className="text-xs text-muted-foreground">{userRole || 'No role'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
