
import { Room, Staff, CleaningTask, DashboardStats, TaskAssignment, StaffBasicInfo, TaskStatus } from '@/types';

export interface HotelContextType {
  rooms: Room[];
  staff: Staff[];
  tasks: CleaningTask[];
  stats: DashboardStats;
  loading: {
    rooms: boolean;
    staff: boolean;
    tasks: boolean;
  };
  selectedCottage: string | null;
  setSelectedCottage: (cottage: string | null) => void;
  availableCottages: string[];
  updateRoomStatus: (roomId: string, status: Room['status']) => Promise<void>;
  assignTask: (roomId: string, staffIds: string[], supervisorId?: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  addStaff: (staff: Omit<Staff, 'id'>) => Promise<void>;
  fetchRooms: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  getSupervisorTasks: (supervisorId: string) => CleaningTask[];
  updateTaskAssignment: (taskId: string, staffIds: string[], supervisorId?: string) => Promise<void>;
  markRoomForEarlyCheckout: (roomId: string) => Promise<void>;
  extendRoomStay: (roomId: string) => Promise<void>;
  addRoomLog: (roomId: string, logType: string, notes?: string) => Promise<void>;
}
