
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
  staff: Staff;
  supervisorStaff?: Staff;
  onStatusChange: (taskId: string, status: CleaningTask['status']) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, room, staff, supervisorStaff, onStatusChange }) => {
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
          <h3 className="text-lg font-medium">Room {room.roomNumber}</h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400">{room.type} Room</p>
        </div>
        <StatusBadge status={task.status} />
      </div>
      
      <div className="mb-2">
        {task.assignedStaff && task.assignedStaff.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Assigned Staff:</p>
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                {task.assignedStaff.map(assignment => (
                  assignment.staff && (
                    <Tooltip key={assignment.id}>
                      <TooltipTrigger asChild>
                        <Avatar className="h-8 w-8 cursor-pointer">
                          {assignment.staff.avatar ? (
                            <img src={assignment.staff.avatar} alt={assignment.staff.name} />
                          ) : (
                            <AvatarFallback>{getInitials(assignment.staff.name)}</AvatarFallback>
                          )}
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{assignment.staff.name}</p>
                        <p className="text-xs text-muted-foreground">{assignment.staff.role}, {assignment.staff.shift} Shift</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                ))}
              </TooltipProvider>
            </div>
          </div>
        ) : (
          <p className="text-sm">
            <span className="font-medium">Assigned to:</span> {staff?.name || 'Unassigned'}
          </p>
        )}

        {supervisorStaff && (
          <p className="text-sm mt-1">
            <span className="font-medium">Supervisor:</span> {supervisorStaff.name} ({supervisorStaff.role})
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
      
      <div className="flex flex-wrap gap-2">
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
