
import { useState, useEffect } from 'react';
import { Room, CleaningTask, DashboardStats } from '@/types';

export function useStats(rooms: Room[], tasks: CleaningTask[]) {
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    cleanRooms: 0,
    dirtyRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    assignedTasks: 0,
    completedTasks: 0
  });

  // Update stats based on rooms and tasks
  useEffect(() => {
    if (rooms.length || tasks.length) {
      const newStats: DashboardStats = {
        totalRooms: rooms.length,
        cleanRooms: rooms.filter(room => room.status === 'clean').length,
        dirtyRooms: rooms.filter(room => room.status === 'dirty').length,
        occupiedRooms: rooms.filter(room => room.status === 'occupied').length,
        maintenanceRooms: rooms.filter(room => room.status === 'maintenance').length,
        assignedTasks: tasks.filter(task => task.status !== 'completed').length,
        completedTasks: tasks.filter(task => task.status === 'completed').length
      };
      
      setStats(newStats);
    }
  }, [rooms, tasks]);

  return stats;
}
