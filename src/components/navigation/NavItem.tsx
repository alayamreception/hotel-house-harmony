
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active, collapsed = false }) => {
  return (
    <Link to={to} className="block w-full">
      <Button
        variant={active ? 'default' : 'ghost'}
        className={cn(
          "w-full justify-start mb-1",
          active ? '' : 'text-muted-foreground',
          collapsed ? 'px-2' : ''
        )}
      >
        <span className={cn(
          collapsed ? 'mx-auto' : 'mr-2'
        )}>
          {icon}
        </span>
        {!collapsed && <span>{label}</span>}
      </Button>
    </Link>
  );
};

export default NavItem;
