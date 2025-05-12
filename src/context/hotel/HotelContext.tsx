
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, Staff, CleaningTask, TaskStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '../AuthContext';
import { HotelContextType } from './types';
import { useRooms } from './useRooms';
import { useStaff } from './useStaff';
import { useTasks } from './useTasks';
import { useStats } from './useStats';
import { useUser } from './useUser';

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCottage, setSelectedCottage] = useState<string | null>(null);
  
  const { session } = useAuth();
  const { userProfile } = useUser();
  
  // Use our custom hooks
  const roomsManager = useRooms(selectedCottage);
  const staffManager = useStaff(selectedCottage);
  const tasksManager = useTasks(selectedCottage);
  
  // Compute stats from rooms and tasks
  const stats = useStats(roomsManager.rooms, tasksManager.tasks);

  // Initialize selected cottage based on user profile when it loads
  useEffect(() => {
    if (userProfile?.assigned_cottage && !selectedCottage) {
      setSelectedCottage(userProfile.assigned_cottage);
    }
  }, [userProfile, selectedCottage]);

  // Fetch data when the component mounts or when the user logs in or cottage changes
  useEffect(() => {
    if (session) {
      roomsManager.fetchRooms();
      roomsManager.fetchCottages();
      staffManager.fetchStaff();
      tasksManager.fetchTasks();
    }
  }, [session, selectedCottage]);

  // Function to update room assigned status based on task assignments
  useEffect(() => {
    const updateStaffAssignments = async () => {
      if (tasksManager.tasks.length === 0 || staffManager.staff.length === 0) return;
      
      const staffAssignedRooms: Record<string, string[]> = {};
      
      // Loop through all tasks to build the room-staff mapping
      tasksManager.tasks.forEach(task => {
        if (task.assignedStaff && task.roomId) {
          task.assignedStaff.forEach(assignment => {
            if (!staffAssignedRooms[assignment.staffId]) {
              staffAssignedRooms[assignment.staffId] = [];
            }
            if (!staffAssignedRooms[assignment.staffId].includes(task.roomId)) {
              staffAssignedRooms[assignment.staffId].push(task.roomId);
            }
          });
        }
      });
      
      // Update staff with assigned rooms
      staffManager.setStaff(prevStaff => 
        prevStaff.map(s => ({
          ...s,
          assignedRooms: staffAssignedRooms[s.id] || []
        }))
      );
    };
    
    updateStaffAssignments();
  }, [tasksManager.tasks, staffManager.staff]);

  // Combined function to assign task and handle room checkout
  const markRoomForEarlyCheckout = async (roomId: string) => {
    // First update the room status
    const room = await roomsManager.markRoomForEarlyCheckout(roomId);
    
    if (!room) return;
    
    // Create a new cleaning task for early checkout if one doesn't exist
    const { data: existingTasks, error: queryError } = await supabase
      .from('cleaning_tasks')
      .select('*')
      .eq('room_id', roomId)
      .eq('status', 'pending');
    
    if (queryError) {
      console.error('Error checking existing tasks:', queryError);
      toast.error('Failed to check existing tasks');
      return;
    }
    
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
      
      if (taskError) {
        console.error('Error creating task:', taskError);
        toast.error('Failed to create cleaning task');
        return;
      }
      
      // Add to room log
      await tasksManager.addRoomLog(roomId, "Early checkout", `Room ${room.roomNumber} marked for early checkout`);
      
      // Refresh tasks list
      await tasksManager.fetchTasks();
    }
    
    toast.success(`Room ${room.roomNumber} marked for early checkout`);
  };

  // Function to assign task that uses our task manager but also updates room status
  const assignTask = async (roomId: string, staffIds: string[], supervisorId?: string) => {
    const room = roomsManager.rooms.find(r => r.id === roomId);
      
    if (!room) {
      toast.error('Room not found');
      return;
    }
    
    const success = await tasksManager.assignTask(roomId, staffIds, room.type, supervisorId);
    
    if (success) {
      // Refresh tasks to update the UI
      await tasksManager.fetchTasks();
      
      const staffNames = staffIds.map(id => {
        const s = staffManager.staff.find(s => s.id === id);
        return s ? s.name : 'Unknown';
      }).join(', ');
      
      toast.success(`Task assigned to ${staffNames}`);
    }
  };

  // Function to update task status that also updates room status if needed
  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const success = await tasksManager.updateTaskStatus(taskId, status);
    
    if (success && status === 'completed') {
      // Find the task to get the room ID
      const task = tasksManager.tasks.find(t => t.id === taskId);
      
      if (task?.roomId) {
        // Update the room status to clean when task is completed
        await roomsManager.updateRoomStatus(task.roomId, 'clean');
        // Log the room status change
        await tasksManager.addRoomLog(task.roomId, "Room cleaned", "Room status updated to clean");
      }
    }
  };

  // Function to update task assignment that refreshes tasks after
  const updateTaskAssignment = async (taskId: string, staffIds: string[], supervisorId?: string) => {
    const success = await tasksManager.updateTaskAssignment(taskId, staffIds, supervisorId);
    
    if (success) {
      // Refresh tasks to update the UI
      await tasksManager.fetchTasks();
      
      const staffNames = staffIds.map(id => {
        const s = staffManager.staff.find(s => s.id === id);
        return s ? s.name : 'Unknown';
      }).join(', ');
      
      toast.success(`Task assigned to ${staffNames}`);
    }
  };

  // Function to extend room stay
  const extendRoomStay = async (roomId: string) => {
    const success = await tasksManager.extendRoomStay(roomId);
    
    if (success) {
      const room = roomsManager.rooms.find(r => r.id === roomId);
      toast.success(`Stay extended for room ${room?.roomNumber}`);
      
      // Refresh tasks list
      await tasksManager.fetchTasks();
    }
  };

  return (
    <HotelContext.Provider
      value={{
        rooms: roomsManager.rooms,
        staff: staffManager.staff,
        tasks: tasksManager.tasks,
        stats,
        loading: {
          rooms: roomsManager.loading,
          staff: staffManager.loading,
          tasks: tasksManager.loading,
        },
        selectedCottage,
        setSelectedCottage,
        availableCottages: roomsManager.availableCottages,
        updateRoomStatus: roomsManager.updateRoomStatus,
        assignTask,
        updateTaskStatus,
        addRoom: roomsManager.addRoom,
        addStaff: staffManager.addStaff,
        fetchRooms: roomsManager.fetchRooms,
        fetchTasks: tasksManager.fetchTasks,
        getSupervisorTasks: tasksManager.getSupervisorTasks,
        updateTaskAssignment,
        markRoomForEarlyCheckout,
        extendRoomStay,
        addRoomLog: tasksManager.addRoomLog
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
