import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import NavItem from './NavItem';
import { Home, ClipboardList, Users, Building2, ClipboardCheck, LogOut, FileInput, UserCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHotel } from '@/context/HotelContext';

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = true }) => {
  const location = useLocation();
  const { sessionUserEmail,user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const { selectedCottage, setSelectedCottage, availableCottages } = useHotel();
  
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
  }, [sessionUserEmail]);
  
  const handleSignOut = () => {
    signOut();
  };
  
  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r transition-all duration-300",
      collapsed ? "w-[70px]" : "w-[240px]"
    )}>
      <div className="px-2 py-3 flex items-center justify-center">
        {collapsed ? (
          <img src="/icons/icon-152x152.png" alt="Logo" className="h-8 w-8 rounded" />
        ) : (
          <div className="flex items-center space-x-2 w-full justify-center">
            <img
              src="/images/UpKeeep_Logo.webp"
              alt="UpKeeep Logo"
              className="h-auto"
              style={{ width: 112, maxWidth: 112 }}
            />
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
            to="/assign-tasks"
            icon={<UserCheck className="h-4 w-4" />}
            label="Assign Tasks"
            active={location.pathname === '/assign-tasks'}
            collapsed={collapsed}
          />
          <NavItem
            to="/import-tasks"
            icon={<FileInput className="h-4 w-4" />}
            label="Import Tasks"
            active={location.pathname === '/import-tasks'}
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
        {!collapsed && (
          <div className="mb-4 px-2">
            <p className="text-xs text-muted-foreground mb-1">Select Cottage</p>
            <Select
              value={selectedCottage || ''}
              onValueChange={(value) => setSelectedCottage(value === 'all' ? null : value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Cottages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cottages</SelectItem>
                {availableCottages.map((cottage) => (
                  <SelectItem key={cottage} value={cottage}>
                    {cottage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <Separator className="my-2" />
        
        <NavItem
          to="/auth"
          icon={<LogOut className="h-4 w-4" />}
          label="Sign Out"
          active={false}
          collapsed={collapsed}
          onClick={handleSignOut}
        />
      </div>
    </div>
  );
};

export default Sidebar;
