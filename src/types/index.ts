export type RoomStatus = 'clean' | 'dirty' | 'maintenance' | 'occupied';

export type TaskStatus = 'pending' | 'assigned' | 'in-progress' | 'completed';

export interface Room {
  id: string;
  roomNumber: string;
  type: string;  // We'll keep the interface field name as 'type' for backward compatibility
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
  assignedCottage: string; // added assignedCottage
  avatar?: string;
}

// Create a simpler type for staff info to prevent recursive type issues
export interface StaffBasicInfo {
  id: string;
  name: string;
  role: string;
  shift: string;
  avatar?: string;
  assignedCottage?: string; // added assignedCottage
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  staffId: string;
  assignedAt: Date;
  staff?: StaffBasicInfo;
}

export interface CleaningTask {

  id: string;
  roomId: string;
  staffId?: string;
  supervisorId?: string;
  status: TaskStatus;
  scheduledDate: Date;
  completedDate?: Date;
  cleaningStartTime?: Date;
  cleaningEndTime?: Date;
  notes: string;
  assignedStaff?: TaskAssignment[];
  booking_id?: string;
  checkout_extended?: boolean;
  arrival_time?: Date;
  departure_time?: Date;
  cleaning_type: string;
  task_type: string;
}

export interface DashboardStats {
  totalRooms: number;
  cleanRooms: number;
  dirtyRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
}

export interface RoomLog {
  id: string;
  roomId: string;
  logTimestamp: Date;
  userName: string;
  logType: string;
  notes?: string;
}
