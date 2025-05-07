
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, Staff, CleaningTask, DashboardStats } from '../types';
import { 
  generateMockRooms, 
  generateMockStaff, 
  generateMockTasks, 
  generateDashboardData 
} from '../data/mockData';
import { toast } from 'sonner';

interface HotelContextType {
  rooms: Room[];
  staff: Staff[];
  tasks: CleaningTask[];
  stats: DashboardStats;
  updateRoomStatus: (roomId: string, status: Room['status']) => void;
  assignTask: (roomId: string, staffId: string) => void;
  updateTaskStatus: (taskId: string, status: CleaningTask['status']) => void;
  addRoom: (room: Omit<Room, 'id'>) => void;
  addStaff: (staff: Omit<Staff, 'id'>) => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    cleanRooms: 0,
    dirtyRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    assignedTasks: 0,
    completedTasks: 0
  });

  // Initialize mock data
  useEffect(() => {
    const mockRooms = generateMockRooms();
    const mockStaff = generateMockStaff();
    const mockTasks = generateMockTasks(mockRooms, mockStaff);
    
    setRooms(mockRooms);
    setStaff(mockStaff);
    setTasks(mockTasks);
    
    const dashboardStats = generateDashboardData(mockRooms, mockTasks);
    setStats(dashboardStats);
  }, []);

  // Update stats when rooms or tasks change
  useEffect(() => {
    if (rooms.length && tasks.length) {
      const updatedStats = generateDashboardData(rooms, tasks);
      setStats(updatedStats);
    }
  }, [rooms, tasks]);

  const updateRoomStatus = (roomId: string, status: Room['status']) => {
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === roomId 
          ? { 
              ...room, 
              status, 
              lastCleaned: status === 'clean' ? new Date() : room.lastCleaned 
            } 
          : room
      )
    );
    
    toast.success(`Room status updated to ${status}`);
  };

  const assignTask = (roomId: string, staffId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const staffMember = staff.find(s => s.id === staffId);
    
    if (!room || !staffMember) {
      toast.error('Room or staff member not found');
      return;
    }
    
    // Create new task
    const newTask: CleaningTask = {
      id: `task-${Date.now()}`,
      roomId,
      staffId,
      status: 'pending',
      scheduledDate: new Date(),
      notes: ''
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    
    // Update staff assigned rooms
    setStaff(prevStaff => 
      prevStaff.map(s => 
        s.id === staffId 
          ? { 
              ...s, 
              assignedRooms: [...s.assignedRooms, roomId] 
            } 
          : s
      )
    );
    
    toast.success(`Task assigned to ${staffMember.name}`);
  };

  const updateTaskStatus = (taskId: string, status: CleaningTask['status']) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { 
            ...task, 
            status,
            completedDate: status === 'completed' ? new Date() : task.completedDate 
          };
          
          // If task is completed, update room status to clean
          if (status === 'completed') {
            updateRoomStatus(task.roomId, 'clean');
          }
          
          return updatedTask;
        }
        return task;
      })
    );
    
    toast.success(`Task status updated to ${status}`);
  };

  const addRoom = (room: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...room,
      id: `room-${Date.now()}`
    };
    
    setRooms(prevRooms => [...prevRooms, newRoom]);
    toast.success(`Room ${room.roomNumber} added successfully`);
  };

  const addStaff = (staffData: Omit<Staff, 'id'>) => {
    const newStaff: Staff = {
      ...staffData,
      id: `staff-${Date.now()}`
    };
    
    setStaff(prevStaff => [...prevStaff, newStaff]);
    toast.success(`${staffData.name} added to staff`);
  };

  return (
    <HotelContext.Provider
      value={{
        rooms,
        staff,
        tasks,
        stats,
        updateRoomStatus,
        assignTask,
        updateTaskStatus,
        addRoom,
        addStaff
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
