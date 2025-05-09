
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, Staff, CleaningTask, DashboardStats } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface HotelContextType {
  rooms: Room[];
  staff: Staff[];
  tasks: CleaningTask[];
  stats: DashboardStats;
  loading: {
    rooms: boolean;
    staff: boolean;
    tasks: boolean;
  };
  updateRoomStatus: (roomId: string, status: Room['status']) => Promise<void>;
  assignTask: (roomId: string, staffId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: CleaningTask['status']) => Promise<void>;
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  addStaff: (staff: Omit<Staff, 'id'>) => Promise<void>;
  fetchRooms: () => Promise<void>; // Exposing the fetchRooms function
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [loading, setLoading] = useState({
    rooms: true,
    staff: true,
    tasks: true,
  });
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    cleanRooms: 0,
    dirtyRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    assignedTasks: 0,
    completedTasks: 0
  });
  
  const { session } = useAuth();

  // Fetch rooms data
  const fetchRooms = async () => {
    try {
      setLoading(prev => ({ ...prev, rooms: true }));
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      const formattedRooms: Room[] = data.map(room => ({
        id: room.id,
        roomNumber: room.room_number,
        type: room.type,
        status: room.status as Room['status'],
        notes: room.notes || '',
        priority: room.priority || 1,
        lastCleaned: room.last_cleaned ? new Date(room.last_cleaned) : undefined
      }));
      
      setRooms(formattedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(prev => ({ ...prev, rooms: false }));
    }
  };

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      setLoading(prev => ({ ...prev, staff: true }));
      
      const { data, error } = await supabase
        .from('staff')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      const formattedStaff: Staff[] = data.map(staffMember => ({
        id: staffMember.id,
        name: staffMember.name,
        role: staffMember.role,
        shift: staffMember.shift,
        assignedRooms: [], // We'll populate this from tasks
        avatar: staffMember.avatar
      }));
      
      setStaff(formattedStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff');
    } finally {
      setLoading(prev => ({ ...prev, staff: false }));
    }
  };

  // Fetch tasks data
  const fetchTasks = async () => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      const formattedTasks: CleaningTask[] = data.map(task => ({
        id: task.id,
        roomId: task.room_id,
        staffId: task.staff_id,
        status: task.status as CleaningTask['status'],
        scheduledDate: new Date(task.scheduled_date),
        completedDate: task.completed_date ? new Date(task.completed_date) : undefined,
        notes: task.notes || ''
      }));
      
      setTasks(formattedTasks);
      
      // Update staff assigned rooms
      const staffAssignedRooms: Record<string, string[]> = {};
      formattedTasks.forEach(task => {
        if (task.staffId) {
          if (!staffAssignedRooms[task.staffId]) {
            staffAssignedRooms[task.staffId] = [];
          }
          staffAssignedRooms[task.staffId].push(task.roomId);
        }
      });
      
      setStaff(prevStaff => 
        prevStaff.map(s => ({
          ...s,
          assignedRooms: staffAssignedRooms[s.id] || []
        }))
      );
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Update stats based on rooms and tasks
  const updateStats = () => {
    if (rooms.length && tasks.length) {
      const stats: DashboardStats = {
        totalRooms: rooms.length,
        cleanRooms: rooms.filter(room => room.status === 'clean').length,
        dirtyRooms: rooms.filter(room => room.status === 'dirty').length,
        occupiedRooms: rooms.filter(room => room.status === 'occupied').length,
        maintenanceRooms: rooms.filter(room => room.status === 'maintenance').length,
        assignedTasks: tasks.filter(task => task.status !== 'completed').length,
        completedTasks: tasks.filter(task => task.status === 'completed').length
      };
      
      setStats(stats);
    }
  };

  // Fetch data when the component mounts or when the user logs in
  useEffect(() => {
    if (session) {
      fetchRooms();
      fetchStaff();
      fetchTasks();
    }
  }, [session]);

  // Update stats when rooms or tasks change
  useEffect(() => {
    updateStats();
  }, [rooms, tasks]);

  // Update room status
  const updateRoomStatus = async (roomId: string, status: Room['status']) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ 
          status,
          last_cleaned: status === 'clean' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId);
      
      if (error) {
        throw error;
      }
      
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
    } catch (error) {
      console.error('Error updating room status:', error);
      toast.error('Failed to update room status');
    }
  };

  // Assign task
  const assignTask = async (roomId: string, staffId: string) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      const staffMember = staff.find(s => s.id === staffId);
      
      if (!room || !staffMember) {
        toast.error('Room or staff member not found');
        return;
      }
      
      // Create new task in Supabase
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .insert({
          room_id: roomId,
          staff_id: staffId,
          status: 'pending',
          scheduled_date: new Date().toISOString(),
          notes: ''
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Add new task to state
      const newTask: CleaningTask = {
        id: data.id,
        roomId: data.room_id,
        staffId: data.staff_id,
        status: data.status as CleaningTask['status'],
        scheduledDate: new Date(data.scheduled_date),
        notes: data.notes || ''
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
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error('Failed to assign task');
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, status: CleaningTask['status']) => {
    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString()
      };
      
      if (status === 'completed') {
        updateData.completed_date = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('cleaning_tasks')
        .update(updateData)
        .eq('id', taskId);
      
      if (error) {
        throw error;
      }
      
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
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  // Add new room
  const addRoom = async (room: Omit<Room, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          room_number: room.roomNumber,
          type: room.type,
          status: room.status,
          notes: room.notes,
          priority: room.priority
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const newRoom: Room = {
        id: data.id,
        roomNumber: data.room_number,
        type: data.type,
        status: data.status as Room['status'],
        notes: data.notes || '',
        priority: data.priority || 1
      };
      
      setRooms(prevRooms => [...prevRooms, newRoom]);
      toast.success(`Room ${room.roomNumber} added successfully`);
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error('Failed to add room');
    }
  };

  // Add new staff
  const addStaff = async (staffData: Omit<Staff, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert({
          name: staffData.name,
          role: staffData.role,
          shift: staffData.shift,
          avatar: staffData.avatar
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const newStaff: Staff = {
        id: data.id,
        name: data.name,
        role: data.role,
        shift: data.shift,
        assignedRooms: [],
        avatar: data.avatar
      };
      
      setStaff(prevStaff => [...prevStaff, newStaff]);
      toast.success(`${staffData.name} added to staff`);
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('Failed to add staff');
    }
  };

  return (
    <HotelContext.Provider
      value={{
        rooms,
        staff,
        tasks,
        stats,
        loading,
        updateRoomStatus,
        assignTask,
        updateTaskStatus,
        addRoom,
        addStaff,
        fetchRooms // Exposing the fetchRooms function
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
