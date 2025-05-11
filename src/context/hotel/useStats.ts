
import { useMemo } from 'react';
import { Room, CleaningTask, DashboardStats } from '@/types';

export function useStats(rooms: Room[], tasks: CleaningTask[]) {
  return useMemo(() => {
    const stats: DashboardStats = {
      totalRooms: rooms.length,
      cleanRooms: rooms.filter(room => room.status === 'clean').length,
      dirtyRooms: rooms.filter(room => room.status === 'dirty').length,
      occupiedRooms: rooms.filter(room => room.status === 'occupied').length,
      maintenanceRooms: rooms.filter(room => room.status === 'maintenance').length,
      assignedTasks: tasks.length,
      completedTasks: tasks.filter(task => task.status === 'completed').length,
      pendingTasks: tasks.filter(task => task.status === 'pending').length,
      inProgressTasks: tasks.filter(task => task.status === 'in-progress').length
    };
    
    return stats;
  }, [rooms, tasks]);
}
