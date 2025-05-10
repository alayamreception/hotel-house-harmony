
export type RoomStatus = 'clean' | 'dirty' | 'maintenance' | 'occupied';

export interface Room {
  id: string;
  roomNumber: string;
  type: string;
  status: RoomStatus;
  notes: string;
  priority: number;
  lastCleaned?: Date;
  today_checkout?: boolean;
  early_checkout?: boolean;
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
  supervisorId?: string;
  status: 'pending' | 'in-progress' | 'completed';
  scheduledDate: Date;
  completedDate?: Date;
  notes: string;
  assignedStaff?: TaskAssignment[];
  booking_id?: string;
  checkout_extended?: boolean;
  arrival_time?: Date;
  departure_time?: Date;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  staffId: string;
  assignedAt: Date;
  staff?: Staff;
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
