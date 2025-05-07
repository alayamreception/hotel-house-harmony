
export type RoomStatus = 'clean' | 'dirty' | 'maintenance' | 'occupied';

export interface Room {
  id: string;
  roomNumber: string;
  type: string;
  status: RoomStatus;
  notes: string;
  priority: number;
  lastCleaned?: Date;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  shift: string;
  assignedRooms: string[];
  avatar?: string;
}

export interface CleaningTask {
  id: string;
  roomId: string;
  staffId: string;
  status: 'pending' | 'in-progress' | 'completed';
  scheduledDate: Date;
  completedDate?: Date;
  notes: string;
}

export interface DashboardStats {
  totalRooms: number;
  cleanRooms: number;
  dirtyRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  assignedTasks: number;
  completedTasks: number;
}
