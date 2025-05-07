
import React from 'react';
import { useHotel } from '@/context/HotelContext';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/StatusBadge';

const Schedule = () => {
  const { tasks, rooms, staff } = useHotel();
  
  // Get the current week's start date (Sunday)
  const todayDate = new Date();
  const startOfTheWeek = startOfWeek(todayDate, { weekStartsOn: 0 });
  
  // Generate weekdays
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfTheWeek, i);
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd')
    };
  });
  
  // Group tasks by date
  const tasksByDay = weekDays.map(day => {
    const tasksForDay = tasks.filter(task => 
      isSameDay(new Date(task.scheduledDate), day.date)
    );
    
    return {
      ...day,
      tasks: tasksForDay
    };
  });

  const getSlotHeight = (tasks: typeof tasksByDay[0]['tasks']) => {
    return tasks.length > 0 ? `${Math.max(tasks.length * 80, 100)}px` : '100px';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Weekly Schedule</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Week of {format(startOfTheWeek, 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div 
                key={day.dayName} 
                className={`text-center p-2 rounded-md ${
                  isSameDay(day.date, todayDate) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/50'
                }`}
              >
                <div className="font-medium">{day.dayName}</div>
                <div className="text-sm">{day.dayNumber}</div>
              </div>
            ))}
            
            {tasksByDay.map((day, index) => (
              <div 
                key={`slot-${index}`} 
                className="border rounded-md bg-card p-2 overflow-y-auto"
                style={{ height: getSlotHeight(day.tasks) }}
              >
                {day.tasks.length > 0 ? (
                  day.tasks.map(task => {
                    const room = rooms.find(r => r.id === task.roomId)!;
                    const staffMember = staff.find(s => s.id === task.staffId)!;
                    
                    return (
                      <div 
                        key={task.id}
                        className="mb-2 p-2 bg-muted/50 rounded border text-xs"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium">Room {room.roomNumber}</div>
                          <StatusBadge status={room.status} />
                        </div>
                        <div className="text-muted-foreground">
                          {staffMember.name}
                        </div>
                        <div className="mt-1 text-muted-foreground">
                          {format(new Date(task.scheduledDate), 'h:mm a')}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                    No tasks
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedule;
