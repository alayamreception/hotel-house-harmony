import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, Staff, CleaningTask, DashboardStats, TaskAssignment, StaffBasicInfo } from '../types';
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
  selectedCottage: string | null;
  setSelectedCottage: (cottage: string | null) => void;
  availableCottages: string[];
  updateRoomStatus: (roomId: string, status: Room['status']) => Promise<void>;
  assignTask: (roomId: string, staffIds: string[], supervisorId?: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: CleaningTask['status']) => Promise<void>;
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  addStaff: (staff: Omit<Staff, 'id'>) => Promise<void>;
  fetchRooms: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  getSupervisorTasks: (supervisorId: string) => CleaningTask[];
  updateTaskAssignment: (taskId: string, staffIds: string[], supervisorId?: string) => Promise<void>;
  markRoomForEarlyCheckout: (roomId: string) => Promise<void>;
  extendRoomStay: (roomId: string) => Promise<void>;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([]);
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
  const [selectedCottage, setSelectedCottage] = useState<string | null>(null);
  const [availableCottages, setAvailableCottages] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  
  const { session } = useAuth();

  // Fetch user profile to get assigned cottage
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) throw error;
        
        setUserProfile(data);
        if (data?.assigned_cottage && !selectedCottage) {
          setSelectedCottage(data.assigned_cottage);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, [session, selectedCottage]);

  // Fetch available cottages
  useEffect(() => {
    const fetchCottages = async () => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('type')
          .order('type');
        
        if (error) throw error;
        
        const uniqueCottages = Array.from(
          new Set(data.map(room => room.type))
        );
        
        setAvailableCottages(uniqueCottages);
      } catch (error) {
        console.error('Error fetching cottages:', error);
      }
    };
    
    fetchCottages();
  }, []);

  // Fetch rooms data
  const fetchRooms = async () => {
    try {
      setLoading(prev => ({ ...prev, rooms: true }));
      
      let query = supabase.from('rooms').select('*');
      
      // Filter by cottage if selected
      if (selectedCottage) {
        query = query.eq('type', selectedCottage);
      }
      
      const { data, error } = await query;
      
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
        lastCleaned: room.last_cleaned ? new Date(room.last_cleaned) : undefined,
        today_checkout: room.today_checkout || false,
        early_checkout: room.early_checkout || false
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

  // Fetch task assignments - UPDATED to fix recursive type issue
  const fetchTaskAssignments = async () => {
    try {
      // Use specific fields selection to avoid recursive type issues
      const { data, error } = await supabase
        .from('task_assignments')
        .select('id, task_id, staff_id, assigned_at, staff:staff(id, name, role, shift, avatar)');
      
      if (error) {
        throw error;
      }
      
      // Map the response to our defined types to avoid recursion
      const formattedAssignments: TaskAssignment[] = data.map(assignment => ({
        id: assignment.id,
        taskId: assignment.task_id,
        staffId: assignment.staff_id,
        assignedAt: new Date(assignment.assigned_at),
        staff: assignment.staff ? {
          id: assignment.staff.id,
          name: assignment.staff.name,
          role: assignment.staff.role,
          shift: assignment.staff.shift,
          avatar: assignment.staff.avatar
        } : undefined
      }));
      
      setTaskAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching task assignments:', error);
      toast.error('Failed to load task assignments');
    }
  };

  // Fetch tasks data - UPDATED to work with the new type structure
  const fetchTasks = async () => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      
      let query = supabase.from('cleaning_tasks').select('*');
      
      // Filter by cottage if selected
      if (selectedCottage) {
        query = query.eq('cottage_type', selectedCottage);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      const formattedTasks: CleaningTask[] = data.map(task => ({
        id: task.id,
        roomId: task.room_id,
        staffId: task.staff_id,
        supervisorId: task.supervisor_id,
        status: task.status as CleaningTask['status'],
        scheduledDate: new Date(task.scheduled_date),
        completedDate: task.completed_date ? new Date(task.completed_date) : undefined,
        notes: task.notes || '',
        booking_id: task.booking_id,
        checkout_extended: task.checkout_extended || false,
        arrival_time: task.arrival_time ? new Date(task.arrival_time) : undefined,
        departure_time: task.departure_time ? new Date(task.departure_time) : undefined
      }));
      
      // Fetch task assignments to associate with tasks
      await fetchTaskAssignments();
      
      // Merge task assignments with tasks using the predefined types
      const tasksWithAssignments = formattedTasks.map(task => {
        const assignments = taskAssignments.filter(
          assignment => assignment.taskId === task.id
        );
        
        return {
          ...task,
          assignedStaff: assignments
        };
      });
      
      setTasks(tasksWithAssignments);
      
      // Update staff assigned rooms
      const staffAssignedRooms: Record<string, string[]> = {};
      taskAssignments.forEach(assignment => {
        const task = formattedTasks.find(t => t.id === assignment.taskId);
        if (task && task.roomId) {
          if (!staffAssignedRooms[assignment.staffId]) {
            staffAssignedRooms[assignment.staffId] = [];
          }
          staffAssignedRooms[assignment.staffId].push(task.roomId);
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

  // Fetch data when the component mounts or when the user logs in or cottage changes
  useEffect(() => {
    if (session) {
      fetchRooms();
      fetchStaff();
      fetchTasks();
    }
  }, [session, selectedCottage]);

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

  // Create a new task assignment
  const updateTaskAssignment = async (taskId: string, staffIds: string[], supervisorId?: string) => {
    try {
      // First, delete existing assignments for this task
      const { error: deleteError } = await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', taskId);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Update the task with the new supervisor if provided
      if (supervisorId) {
        const { error: updateError } = await supabase
          .from('cleaning_tasks')
          .update({ supervisor_id: supervisorId })
          .eq('id', taskId);
        
        if (updateError) throw updateError;
      }
      
      // Create new assignments for all staff members
      const assignments = staffIds.map(staffId => ({
        task_id: taskId,
        staff_id: staffId,
        assigned_at: new Date().toISOString()
      }));
      
      const { error: assignmentError } = await supabase
        .from('task_assignments')
        .insert(assignments);
      
      if (assignmentError) {
        throw assignmentError;
      }
      
      // Refresh tasks to update the UI
      await fetchTasks();
      
      const staffNames = staffIds.map(id => {
        const s = staff.find(s => s.id === id);
        return s ? s.name : 'Unknown';
      }).join(', ');
      
      toast.success(`Task assigned to ${staffNames}`);
    } catch (error) {
      console.error('Error updating task assignment:', error);
      toast.error('Failed to update task assignment');
    }
  };

  // Assign task to multiple staff members
  const assignTask = async (roomId: string, staffIds: string[], supervisorId?: string) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      
      if (!room) {
        toast.error('Room not found');
        return;
      }
      
      if (staffIds.length === 0) {
        toast.error('At least one staff member must be assigned');
        return;
      }
      
      console.log('Assigning task:', { roomId, staffIds, supervisorId });
      
      // Create new task in Supabase
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .insert({
          room_id: roomId,
          staff_id: staffIds[0], // Keep this for backward compatibility
          supervisor_id: supervisorId,
          status: 'pending',
          scheduled_date: new Date().toISOString(),
          notes: '',
          cottage_type: room.type // Add the cottage type to the task
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating task:', error);
        toast.error('Failed to assign task: ' + error.message);
        return;
      }
      
      if (!data || !data.id) {
        console.error('No data returned from task creation');
        toast.error('Failed to create task - no data returned');
        return;
      }
      
      console.log('Task created:', data);
      
      // Create task assignments for all staff members
      const assignments = staffIds.map(staffId => ({
        task_id: data.id,
        staff_id: staffId
      }));
      
      const { error: assignmentError } = await supabase
        .from('task_assignments')
        .insert(assignments);
      
      if (assignmentError) {
        console.error('Error creating assignments:', assignmentError);
        toast.error('Failed to assign staff members: ' + assignmentError.message);
        return;
      }
      
      // Fetch updated data to refresh the UI
      await fetchTasks();
      
      const staffNames = staffIds.map(id => {
        const s = staff.find(s => s.id === id);
        return s ? s.name : 'Unknown';
      }).join(', ');
      
      toast.success(`Task assigned to ${staffNames}`);
    } catch (error: any) {
      console.error('Error assigning task:', error);
      toast.error(`Failed to assign task: ${error.message || 'Unknown error'}`);
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

  // Mark room for early checkout
  const markRoomForEarlyCheckout = async (roomId: string) => {
    try {
      // Update room status in database
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ 
          early_checkout: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId);
      
      if (roomError) throw roomError;
      
      // Update local state
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId 
            ? { ...room, early_checkout: true } 
            : room
        )
      );
      
      // Create a new cleaning task for early checkout if one doesn't exist
      const room = rooms.find(r => r.id === roomId);
      if (!room) return;
      
      const { data: existingTasks, error: queryError } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .eq('room_id', roomId)
        .eq('status', 'pending');
      
      if (queryError) throw queryError;
      
      // Only create a new task if no pending task exists
      if (!existingTasks || existingTasks.length === 0) {
        const { error: taskError } = await supabase
          .from('cleaning_tasks')
          .insert({
            room_id: roomId,
            status: 'pending',
            scheduled_date: new Date().toISOString(),
            notes: 'Early checkout cleaning',
            cottage_type: room.type
          });
        
        if (taskError) throw taskError;
        
        // Refresh tasks list
        await fetchTasks();
      }
      
      toast.success(`Room ${room.roomNumber} marked for early checkout`);
    } catch (error) {
      console.error('Error marking room for early checkout:', error);
      toast.error('Failed to mark room for early checkout');
    }
  };

  // Extend room stay
  const extendRoomStay = async (roomId: string) => {
    try {
      // Find any existing tasks for this room
      const roomTasks = tasks.filter(task => task.roomId === roomId);
      
      if (roomTasks.length === 0) {
        toast.error('No tasks found for this room');
        return;
      }
      
      // Update the most recent task to mark it as extended
      const latestTask = roomTasks.reduce((latest, current) => {
        return !latest.scheduledDate || (current.scheduledDate > latest.scheduledDate) 
          ? current 
          : latest;
      }, roomTasks[0]);
      
      const { error } = await supabase
        .from('cleaning_tasks')
        .update({
          checkout_extended: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', latestTask.id);
      
      if (error) throw error;
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === latestTask.id 
            ? { ...task, checkout_extended: true } 
            : task
        )
      );
      
      const room = rooms.find(r => r.id === roomId);
      toast.success(`Stay extended for room ${room?.roomNumber}`);
      
      // Refresh tasks list
      await fetchTasks();
    } catch (error) {
      console.error('Error extending room stay:', error);
      toast.error('Failed to extend room stay');
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
        priority: data.priority || 1,
        today_checkout: false,
        early_checkout: false
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

  // Get tasks for a specific supervisor
  const getSupervisorTasks = (supervisorId: string) => {
    return tasks.filter(task => task.supervisorId === supervisorId);
  };

  return (
    <HotelContext.Provider
      value={{
        rooms,
        staff,
        tasks,
        stats,
        loading,
        selectedCottage,
        setSelectedCottage,
        availableCottages,
        updateRoomStatus,
        assignTask,
        updateTaskStatus,
        addRoom,
        addStaff,
        fetchRooms,
        fetchTasks,
        getSupervisorTasks,
        updateTaskAssignment,
        markRoomForEarlyCheckout,
        extendRoomStay
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
