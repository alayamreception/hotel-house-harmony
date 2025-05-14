import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { CleaningTask, Room, Staff } from '@/types';
import StatusBadge from './StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskItemProps {
  task: CleaningTask;
  room: Room;
  supervisorStaff?: Staff;
  onStatusChange: (taskId: string, status: CleaningTask['status']) => void;
  onAssign?: (taskId: string) => void;
  onCancel?: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, room, supervisorStaff, onStatusChange, onAssign, onCancel }) => {
  const getStatusStyles = () => {
    switch (task.status) {
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700';
      case 'in-progress':
        return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className={`p-4 border rounded-md mb-2 ${getStatusStyles()} dark:text-gray-200`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-medium">{room.roomNumber}</h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400">{room.type}</p>
          {/* Show task_type and cleaning_type */}
          <div className="flex gap-2 mt-1">
            {task.task_type && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                {task.task_type}
              </span>
            )}
            {task.cleaning_type && (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
                {task.cleaning_type}
              </span>
            )}
          </div>
        </div>
        {/* Show task status as a badge */}
        <span className={
          `text-xs font-semibold px-2 py-1 rounded
          ${
            task.status === 'completed'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : task.status === 'in-progress'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : task.status === 'cancelled'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`
        }>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </span>
      </div>
      
      <div className="mb-2">
        {task.assignedStaff && task.assignedStaff.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Assigned Staff:</p>
            <div className="flex flex-wrap gap-2">
              {task.assignedStaff.map(assignment =>
                assignment.staff && (
                  <span
                    key={assignment.id}
                    className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium"
                  >
                    {assignment.staff.name}
                  </span>
                )
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm">
            <span className="font-medium">Unassigned</span>
          </p>
        )}

        {supervisorStaff && (
          <p className="text-sm mt-1">
            <span className="font-medium">Supervisor:</span> {supervisorStaff.name}
          </p>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-muted-foreground dark:text-gray-400" />
          <span className="text-xs dark:text-gray-300">
            {format(new Date(task.scheduledDate), 'MMM dd, h:mm a')}
          </span>
        </div>
        
        {task.completedDate && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground dark:text-gray-400" />
            <span className="text-xs dark:text-gray-300">
              Completed: {format(new Date(task.completedDate), 'MMM dd, h:mm a')}
            </span>
          </div>
        )}
      </div>

      {task.notes && (
        <div className="mt-1">
          <span className="text-xs font-semibold text-red-700 dark:text-red-300">Notes:</span>
          <span className="text-xs text-muted-foreground ml-2">{task.notes}</span>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-end items-center gap-2 mt-4">
        {/* Place your Assign and Cancel buttons here */}
        {typeof onAssign === 'function' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onAssign(task.id)}
          >
            Assign
          </Button>
        )}
        {typeof onCancel === 'function' && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onCancel(task.id)}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Other status buttons */}
      <div className="flex flex-wrap gap-2 mt-2">
        {task.status !== 'completed' && (
          <Button 
            size="sm" 
            variant="default"
            onClick={() => onStatusChange(task.id, 'completed')}
          >
            Mark Complete
          </Button>
        )}
        
        {task.status === 'pending' && (
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => onStatusChange(task.id, 'in-progress')}
          >
            Start Cleaning
          </Button>
        )}
        
        {task.status === 'in-progress' && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onStatusChange(task.id, 'pending')}
          >
            Pause
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
