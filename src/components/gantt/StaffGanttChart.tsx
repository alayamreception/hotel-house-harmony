import React from 'react';
import { useTooltip } from '@/hooks/use-tooltip';
import { CleaningTask, Staff } from '@/types';
import { format } from 'date-fns';
import {
  Label,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';

interface StaffGanttChartProps {
  staff: Staff[];
  tasksByStaff: Map<string, CleaningTask[]>;
  selectedDate: Date;
}

// Define a custom data type for our bar data
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
  // Generate hour labels for y-axis (0-23)
  const hourLabels = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: `${i}:00`,
  }));
  
  // Format the data for the chart
  const chartData = staff.map((staffMember) => {
    const tasks = tasksByStaff.get(staffMember.id) || [];
    
    const formattedTasks = tasks.map((task) => {
      // Calculate start and end times
      const startTime = task.cleaningStartTime || task.scheduledDate;
      const endTime = task.cleaningEndTime || task.completedDate || new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour if no end time
      
      // Get hours as decimals for positioning (e.g., 14.5 for 2:30pm)
      const startHour = startTime.getHours() + startTime.getMinutes() / 60;
      const endHour = endTime.getHours() + endTime.getMinutes() / 60;
      
      // Duration in hours
      const duration = endHour - startHour;
      
      return {
        taskId: task.id,
        roomNumber: task.roomId, // Will display room number
        status: task.status,
        startHour,
        endHour,
        duration,
        startTime,
        endTime,
        taskDetails: task, // Store the full task object here
      };
    });
    
    return {
      staffId: staffMember.id,
      staffName: staffMember.name,
      tasks: formattedTasks,
    };
  });
  
  // Custom bar for tasks
  const CustomBar = (props: any) => {
    const { x, y, width, height, status, roomNumber, taskDetails } = props;
    
    // Choose color based on status
    let fill;
    switch (status) {
      case 'pending':
        fill = 'var(--color-pending)';
        break;
      case 'in-progress':
        fill = 'var(--color-in-progress)';
        break;
      case 'completed':
        fill = 'var(--color-completed)';
        break;
      default:
        fill = '#94a3b8';
    }
    
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize={10}
        >
          {roomNumber}
        </text>
      </g>
    );
  };
  
  // Custom tooltip for task details
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const task = data.taskDetails; // Get task from taskDetails property
      const room = data.roomNumber;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-md shadow-md">
          <p className="font-medium">Room: {room}</p>
          <p>Status: {task.status}</p>
          {task.scheduledDate && (
            <p>Scheduled: {format(task.scheduledDate, 'HH:mm')}</p>
          )}
          {task.cleaningStartTime && (
            <p>Started: {format(task.cleaningStartTime, 'HH:mm')}</p>
          )}
          {task.cleaningEndTime && (
            <p>Completed: {format(task.cleaningEndTime, 'HH:mm')}</p>
          )}
          {task.notes && <p>Notes: {task.notes}</p>}
        </div>
      );
    }
    
    return null;
  };
  
  // Current time line
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const showCurrentTimeLine = now.toDateString() === selectedDate.toDateString();
  
  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart
        data={chartData}
        layout="vertical"
        barCategoryGap={10}
        margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
      >
        <XAxis
          type="number"
          domain={[0, 24]}
          ticks={hourLabels.map(h => h.hour)}
          tickFormatter={(hour) => `${hour}:00`}
        />
        <YAxis
          type="category"
          dataKey="staffName"
          width={100}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {/* Hour reference lines */}
        {hourLabels.map((hour) => (
          <ReferenceLine
            key={hour.hour}
            x={hour.hour}
            stroke="#e2e8f0"
            strokeDasharray="3 3"
          />
        ))}
        
        {/* Current time reference line */}
        {showCurrentTimeLine && (
          <ReferenceLine
            x={currentHour}
            stroke="#ef4444"
            strokeWidth={2}
            label={{
              position: 'top',
              value: 'Current Time',
              fill: '#ef4444',
            }}
          />
        )}
        
        {/* Render task bars for each staff */}
        {chartData.map((staffData, index) => (
          <React.Fragment key={staffData.staffId}>
            {staffData.tasks.map((task) => (
              <Bar
                key={`${staffData.staffId}-${task.taskId}`}
                dataKey="width"
                isAnimationActive={false}
                shape={
                  <CustomBar 
                    status={task.status} 
                    roomNumber={task.roomNumber}
                    taskDetails={task.taskDetails}
                  />
                }
                background={{ fill: '#f3f4f6' }}
                data={[
                  {
                    // Only include standard Bar properties in the data object
                    // Custom props are passed via the shape prop above
                    y: index, // Staff index
                    x: task.startHour, // Start hour
                    width: task.duration, // Duration in hours
                    fill: getStatusColor(task.status)
                  } as TaskBarData
                ]}
              />
            ))}
          </React.Fragment>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StaffGanttChart;
