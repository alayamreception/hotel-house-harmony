
import React from 'react';
import { cn } from '@/lib/utils';
import { RoomStatus } from '@/types';

interface StatusBadgeProps {
  status: RoomStatus;
  className?: string;
}

const statusConfig = {
  clean: {
    className: 'bg-status-clean/10 text-status-clean border-status-clean/20',
    label: 'Clean'
  },
  dirty: {
    className: 'bg-status-dirty/10 text-status-dirty border-status-dirty/20',
    label: 'Dirty'
  },
  maintenance: {
    className: 'bg-status-maintenance/10 text-status-maintenance border-status-maintenance/20',
    label: 'Maintenance'
  },
  occupied: {
    className: 'bg-status-occupied/10 text-status-occupied border-status-occupied/20',
    label: 'Occupied'
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];
  
  return (
    <span 
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
