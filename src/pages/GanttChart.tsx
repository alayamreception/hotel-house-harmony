import React, { useMemo } from 'react';
import { useHotel } from '@/context/HotelContext';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CleaningTask } from '@/types';
import { ChartContainer } from '@/components/ui/chart';
import StaffGanttChart from '@/components/gantt/StaffGanttChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const GanttChart = () => {
  const { staff, tasks, fetchTasks } = useHotel();
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [filterStaff, setFilterStaff] = React.useState<string>('all');
  
  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  // Filter tasks for the selected date and staff
  const filteredTasks = useMemo(() => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    return tasks.filter((task) => {
      // Filter by date
      const taskDate = new Date(task.scheduledDate);
      const isOnSelectedDate = taskDate >= startOfDay && taskDate <= endOfDay;
      
      // Filter by staff
      const isStaffMatch = filterStaff === 'all' || 
        (task.assignedStaff && task.assignedStaff.some(a => a.staffId === filterStaff));
      
      return isOnSelectedDate && isStaffMatch;
    });
  }, [tasks, selectedDate, filterStaff]);
  
  // Group tasks by staff - Converting Map to a Record object for compatibility
  const tasksByStaff = useMemo(() => {
    const result: Record<string, {
      staffId: string;
      tasks: {
        taskId: string;
        startHour: number;
        duration: number;
        status: string;
        roomNumber: string;
        taskDetails: CleaningTask;
      }[];
    }> = {};
    
    // Initialize with all staff (even those without tasks)
    staff.forEach(s => {
      result[s.id] = {
        staffId: s.id,
        tasks: []
      };
    });
    
    // Add tasks to appropriate staff
    filteredTasks.forEach(task => {
      if (task.assignedStaff && task.assignedStaff.length > 0) {
        task.assignedStaff.forEach(assignment => {
          const staffId = assignment.staffId;
          if (result[staffId]) {
            // Calculate start hour and duration
            const startHour = task.cleaningStartTime 
              ? new Date(task.cleaningStartTime).getHours() + (new Date(task.cleaningStartTime).getMinutes() / 60)
              : new Date(task.scheduledDate).getHours();
              
            const endHour = task.cleaningEndTime
              ? new Date(task.cleaningEndTime).getHours() + (new Date(task.cleaningEndTime).getMinutes() / 60)
              : startHour + 1; // Default 1 hour if no end time
              
            result[staffId].tasks.push({
              taskId: task.id,
              startHour,
              duration: endHour - startHour,
              status: task.status,
              roomNumber: task.roomId,
              taskDetails: task
            });
          }
        });
      }
    });
    
    return result;
  }, [filteredTasks, staff]);
  
  // Get active staff (those with tasks on the selected date)
  const activeStaff = useMemo(() => {
    if (filterStaff !== 'all') {
      return staff.filter(s => s.id === filterStaff);
    }
    
    // Get staff that have tasks on this day
    return staff.filter(s => tasksByStaff[s.id]?.tasks.length > 0);
  }, [staff, tasksByStaff, filterStaff]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Staff Schedule Gantt Chart</h2>
      </div>
      
      <div className="flex flex-wrap gap-4 items-center">
        {/* Date Picker */}
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Staff Filter */}
        <div className="w-[240px]">
          <Select value={filterStaff} onValueChange={setFilterStaff}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} - {s.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card className="overflow-auto">
        <CardHeader>
          <CardTitle>Daily Staff Schedule - {format(selectedDate, 'EEEE, MMMM d, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[500px] w-full">
            <ChartContainer 
              config={{
                pending: { color: '#fbbf24' },
                'in-progress': { color: '#3b82f6' },
                completed: { color: '#10b981' }
              }}
              className="min-h-[500px] w-full"
            >
              <StaffGanttChart 
                staff={activeStaff}
                tasksByStaff={tasksByStaff}
                selectedDate={selectedDate}
              />
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      {activeStaff.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
          <p className="text-muted-foreground dark:text-gray-400">
            No tasks scheduled for staff on this date.
          </p>
        </div>
      )}
    </div>
  );
};

export default GanttChart;
