import React from 'react';
import { useTooltip } from '@/hooks/use-tooltip';
import { CleaningTask, Staff } from '@/types';
import { formatTime } from '@/lib/utils';
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format, isSameDay } from 'date-fns';

interface StaffGanttChartProps {
  staff: Staff[];
  tasksByStaff: Record<string, { 
    staffId: string;
    tasks: {
      taskId: string;
      startHour: number;
      duration: number;
      status: string;
      roomNumber: string;
      taskDetails: CleaningTask;
    }[] 
  }>;
  selectedDate: Date;
}

interface TaskBarData {
  y: number;
  x: number;
  width: number;
  fill?: string;
  height?: number;
  // These are custom props we'll handle in our custom rendering
  roomNumber?: string;
  status?: string;
  taskDetails?: CleaningTask; // Store task details here instead of using 'task' directly
}

const StaffGanttChart: React.FC<StaffGanttChartProps> = ({ staff, tasksByStaff, selectedDate }) => {
  const { setTooltipContent, TooltipProvider } = useTooltip();
  
  // Function to get color based on status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return '#10b981'; // green
      case 'in-progress':
        return '#3b82f6'; // blue
      default:
        return '#a1a1aa'; // gray
    }
  };

  // Generate hours for the x-axis (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: `${i}:00`
  }));

  // Current hour for the reference line
  const currentHour = new Date().getHours() + (new Date().getMinutes() / 60);
  const isToday = isSameDay(selectedDate, new Date());
  
  // Custom bar component with tooltip
  const CustomBar = (props: any) => {
    const { x, y, width, height, status, roomNumber, taskDetails } = props;
    
    if (!x || !width || width <= 0) return null;
    
    const barHeight = height || 20;
    const yPosition = y - barHeight / 2;
    
    // Set color based on status
    const fill = getStatusColor(status);
    
    return (
      <TooltipProvider>
        <TooltipTrigger asChild>
          <g
            onMouseEnter={() => {
              if (taskDetails) {
                setTooltipContent(
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">Room {roomNumber}</p>
                      <p className="text-sm text-muted-foreground capitalize">Status: {status}</p>
                      {taskDetails.scheduledDate && (
                        <p className="text-sm text-muted-foreground">
                          Scheduled: {format(new Date(taskDetails.scheduledDate), 'MMM dd, h:mm a')}
                        </p>
                      )}
                      {taskDetails.arrival_time && (
                        <p className="text-sm text-muted-foreground">
                          Arrival: {format(new Date(taskDetails.arrival_time), 'h:mm a')}
                        </p>
                      )}
                      {taskDetails.departure_time && (
                        <p className="text-sm text-muted-foreground">
                          Departure: {format(new Date(taskDetails.departure_time), 'h:mm a')}
                        </p>
                      )}
                      {taskDetails.notes && (
                        <p className="text-sm text-muted-foreground">Notes: {taskDetails.notes}</p>
                      )}
                    </div>
                  </TooltipContent>
                );
              }
            }}
            onMouseLeave={() => setTooltipContent(null)}
          >
            <rect
              x={x}
              y={yPosition}
              width={width}
              height={barHeight}
              rx={4}
              fill={fill}
              className="cursor-pointer"
            />
            <text
              x={x + 5}
              y={yPosition + barHeight / 2 + 4}
              fontSize={10}
              fill="white"
              className="pointer-events-none"
            >
              {roomNumber}
            </text>
          </g>
        </TooltipTrigger>
      </TooltipProvider>
    );
  };

  // Custom Y-axis label to show staff names
  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const staffIndex = payload.value;
    const staffMember = staff[staffIndex];
    
    if (!staffMember) return null;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={-5} y={0} dy={4} textAnchor="end" fontSize={12}>
          {staffMember.name}
        </text>
        <text x={-5} y={16} dy={4} textAnchor="end" fontSize={10} opacity={0.7}>
          {staffMember.shift} shift
        </text>
      </g>
    );
  };
  
  // Format hours on x-axis
  const formatXAxis = (hour: number) => {
    return `${hour}:00`;
  };

  return (
    <div className="w-full h-full border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Staff Schedule - {format(selectedDate, 'MMM dd, yyyy')}</h3>
      <div className="w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={hours}
            margin={{
              top: 20,
              right: 30,
              left: 100,
              bottom: 5,
            }}
            barSize={20}
            barGap={0}
          >
            <XAxis 
              type="number" 
              domain={[0, 24]} 
              tickFormatter={formatXAxis} 
              ticks={[0, 4, 8, 12, 16, 20, 24]}
            />
            <YAxis 
              type="number" 
              dataKey="hour"
              domain={[0, staff.length - 1]}
              tick={CustomYAxisTick}
              tickCount={staff.length}
              interval={0}
            />
            
            {/* Reference line for current time if viewing today */}
            {isToday && (
              <ReferenceLine 
                x={currentHour} 
                stroke="red" 
                strokeWidth={2}
                label={{ value: 'Now', position: 'top', fill: 'red' }}
              />
            )}
            
            {/* Render tasks for each staff member */}
            {staff.map((staffMember, index) => {
              const staffData = tasksByStaff[staffMember.id];
              if (!staffData || !staffData.tasks || staffData.tasks.length === 0) return null;
              
              return (
                <React.Fragment key={staffMember.id}>
                  {staffData.tasks.map((task) => (
                    <Bar
                      key={`${staffData.staffId}-${task.taskId}`}
                      dataKey="hour"
                      isAnimationActive={false}
                      shape={
                        <CustomBar 
                          status={task.status} 
                          roomNumber={task.roomNumber} 
                          taskDetails={task.taskDetails}
                        />
                      }
                      data={[
                        {
                          y: index, // Staff index
                          x: task.startHour, // Start hour
                          width: task.duration, // Duration in hours
                          fill: getStatusColor(task.status)
                        } as TaskBarData
                      ]}
                    />
                  ))}
                </React.Fragment>
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StaffGanttChart;
