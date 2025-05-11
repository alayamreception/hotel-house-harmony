
import React from 'react';
import { cn } from '@/lib/utils';
import { RoomStatus, TaskStatus } from '@/types';

interface StatusBadgeProps {
  status: RoomStatus | TaskStatus;
  className?: string;
}

const statusConfig: Record<string, { className: string; label: string }> = {
  // Room statuses
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
  },
  // Task statuses
  pending: {
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    label: 'Pending'
  },
  'in-progress': {
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'In Progress'
  },
  completed: {
    className: 'bg-green-100 text-green-800 border-green-200',
    label: 'Completed'
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || {
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    label: status
  };
  
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
