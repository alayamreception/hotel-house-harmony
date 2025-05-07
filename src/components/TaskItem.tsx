
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { CleaningTask, Room, Staff } from '@/types';
import StatusBadge from './StatusBadge';

interface TaskItemProps {
  task: CleaningTask;
  room: Room;
  staff: Staff;
  onStatusChange: (taskId: string, status: CleaningTask['status']) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, room, staff, onStatusChange }) => {
  const getStatusStyles = () => {
    switch (task.status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <div className={`p-4 border rounded-md mb-2 ${getStatusStyles()}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-medium">Room {room.roomNumber}</h3>
          <p className="text-sm text-muted-foreground">{room.type} Room</p>
        </div>
        <StatusBadge status={room.status} />
      </div>
      
      <div className="mb-2">
        <p className="text-sm">
          <span className="font-medium">Assigned to:</span> {staff.name}
        </p>
        <p className="text-sm">
          <span className="font-medium">Role:</span> {staff.role}, {staff.shift} Shift
        </p>
      </div>
      
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className="text-xs">
            {format(new Date(task.scheduledDate), 'MMM dd, h:mm a')}
          </span>
        </div>
        
        {task.completedDate && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-xs">
              Completed: {format(new Date(task.completedDate), 'MMM dd, h:mm a')}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
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
