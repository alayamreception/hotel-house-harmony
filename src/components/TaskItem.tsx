import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { CleaningTask, Room, Staff } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface TaskItemProps {
  task: CleaningTask;
  room: Room;
  supervisorStaff?: Staff;
  onStatusChange: (taskId: string, status: CleaningTask['status']) => void;
  onAssign?: (taskId: string) => void;
  onCancel?: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  room,
  supervisorStaff,
  onStatusChange,
  onAssign,
  onCancel,
}) => {
  // Ensure assignedStaff is always an array
  const assignedStaff = Array.isArray(task.assignedStaff) ? task.assignedStaff : [];

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value={task.id}
        className="border rounded-lg mb-2 transition-shadow hover:shadow-md focus-within:shadow-lg"
      >
        {/* Header */}
        <AccordionTrigger className="w-full flex flex-row items-start justify-between p-4 text-left gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-medium">{room.roomNumber}</h3>
            <p className="text-sm text-muted-foreground dark:text-gray-400">{room.type}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
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
              {/* Assigned staff chips */}
              {assignedStaff.length > 0 && assignedStaff.map(
                assignment =>
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
          <div className="flex flex-col items-end gap-2">
            {/* Status badge */}
            <span
              className={`text-xs font-semibold px-2 py-1 rounded
              ${
                task.status === 'completed'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : task.status === 'in-progress'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : task.status === 'cancelled'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            {/* Notes badge at the top if notes exist */}
            {task.notes && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 mt-1">
                Notes
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-4 pt-0">
          <div className="mb-2">
            {/* Supervisor info */}
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

          {/* Show notes content if present */}
          {task.notes && (
            <div className="mt-2">
              <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">Notes:</span>
              <span className="text-xs text-muted-foreground ml-2">{task.notes}</span>
            </div>
          )}

          {/* Action buttons only if not cancelled or completed */}
          {task.status !== 'cancelled' && task.status !== 'completed' && (
            <div className="flex flex-col sm:flex-row flex-wrap justify-end items-stretch gap-2 mt-4">
              {typeof onAssign === 'function' && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => onAssign(task.id)}
                >
                  Assign
                </Button>
              )}
              {typeof onCancel === 'function' && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full sm:w-auto"
                  onClick={() => onCancel(task.id)}
                >
                  Cancel
                </Button>
              )}
              {/* Only show Start Cleaning and Mark Complete if assignedStaff exists and has at least one staff */}
              {task.status === 'pending' && assignedStaff.length > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => onStatusChange(task.id, 'in-progress')}
                >
                  Start Cleaning
                </Button>
              )}
              {task.status === 'in-progress' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => onStatusChange(task.id, 'pending')}
                >
                  Pause
                </Button>
              )}
              {task.status !== 'completed' && assignedStaff.length > 0 && (
                <Button
                  size="sm"
                  variant="default"
                  className="w-full sm:w-auto"
                  onClick={() => onStatusChange(task.id, 'completed')}
                >
                  Mark Complete
                </Button>
              )}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default TaskItem;
