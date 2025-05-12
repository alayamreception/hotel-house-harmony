
import { useState } from 'react';
import { CleaningTask, TaskStatus, TaskAssignment, StaffBasicInfo } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTasks(selectedCottage: string | null) {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // First, fetch all cleaning tasks
      const tasksQuery = supabase
        .from('cleaning_tasks')
        .select('*');
        
      // Filter by cottage if selected
      if (selectedCottage) {
        const { data: roomsWithType, error: roomsError } = await supabase
          .from('rooms')
          .select('id')
          .eq('type', selectedCottage);
          
        if (roomsError) throw roomsError;
        
        if (roomsWithType && roomsWithType.length > 0) {
          const roomIds = roomsWithType.map(r => r.id);
          tasksQuery.in('room_id', roomIds);
        }
      }
      
      const { data: tasksData, error: tasksError } = await tasksQuery;
      
      if (tasksError) throw tasksError;
      
      // Fetch all task assignments separately
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('task_assignments')
        .select('*');
        
      if (assignmentsError) throw assignmentsError;
      
      // Fetch staff data for assignments
      const staffIds = [...new Set(assignmentsData?.map(a => a.staff_id) || [])];
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, name, role, shift, avatar')
        .in('id', staffIds.length > 0 ? staffIds : ['no-staff']);
        
      if (staffError) throw staffError;
      
      // Create a map of staff by ID for quick lookup
      const staffMap = new Map<string, StaffBasicInfo>();
      staffData?.forEach(staff => {
        staffMap.set(staff.id, {
          id: staff.id,
          name: staff.name,
          role: staff.role,
          shift: staff.shift,
          avatar: staff.avatar
        });
      });
      
      // Create a map of assignments by task ID
      const assignmentsByTask = new Map<string, TaskAssignment[]>();
      
      assignmentsData?.forEach(a => {
        const staff = staffMap.get(a.staff_id);
        
        if (!assignmentsByTask.has(a.task_id)) {
          assignmentsByTask.set(a.task_id, []);
        }
        
        const assignment: TaskAssignment = {
          id: a.id,
          taskId: a.task_id,
          staffId: a.staff_id,
          assignedAt: new Date(a.assigned_at || Date.now()),
          staff: staff
        };
        
        assignmentsByTask.get(a.task_id)?.push(assignment);
      });
      
      // Map tasks to the final format with typed properties
      const formattedTasks: CleaningTask[] = tasksData?.map(task => {
        return {
          id: task.id,
          roomId: task.room_id || '',
          supervisorId: task.supervisor_id,
          status: task.status as TaskStatus,
          scheduledDate: new Date(task.scheduled_date),
          completedDate: task.completed_date ? new Date(task.completed_date) : undefined,
          cleaningStartTime: task.cleaning_start_time ? new Date(task.cleaning_start_time) : undefined,
          cleaningEndTime: task.cleaning_end_time ? new Date(task.cleaning_end_time) : undefined,
          notes: task.notes || '',
          assignedStaff: assignmentsByTask.get(task.id) || [],
          booking_id: task.booking_id,
          checkout_extended: task.checkout_extended,
          arrival_time: task.arrival_time ? new Date(task.arrival_time) : undefined,
          departure_time: task.departure_time ? new Date(task.departure_time) : undefined
        };
      }) || [];
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return false;
      
      const updates: any = { status };
      
      // Handle cleaning start and end times
      if (status === 'in-progress' && !task.cleaningStartTime) {
        updates.cleaning_start_time = new Date().toISOString();
      }
      
      if (status === 'completed') {
        updates.completed_date = new Date().toISOString();
        updates.cleaning_end_time = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('cleaning_tasks')
        .update(updates)
        .eq('id', taskId);
        
      if (error) {
        console.error('Error updating task status:', error);
        toast.error('Failed to update task status');
        return false;
      }
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId ? {
            ...t,
            status,
            completedDate: status === 'completed' ? new Date() : t.completedDate,
            cleaningStartTime: status === 'in-progress' && !t.cleaningStartTime ? new Date() : t.cleaningStartTime,
            cleaningEndTime: status === 'completed' ? new Date() : t.cleaningEndTime
          } : t
        )
      );
      
      // Add to room log
      const roomId = task.roomId;
      if (roomId) {
        await addRoomLog(roomId, `Task ${status}`, `Cleaning task marked as ${status}`);
      }
      
      toast.success(`Task marked as ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
      return false;
    }
  };

  const assignTask = async (roomId: string, staffIds: string[], cottageType: string, supervisorId?: string) => {
    try {
      // Create a new cleaning task
      const { data: taskData, error: taskError } = await supabase
        .from('cleaning_tasks')
        .insert({
          room_id: roomId,
          status: 'pending',
          scheduled_date: new Date().toISOString(),
          supervisor_id: supervisorId,
          cottage_type: cottageType
        })
        .select()
        .single();
        
      if (taskError) {
        console.error('Error creating task:', taskError);
        toast.error('Failed to create cleaning task');
        return false;
      }
      
      // Create task assignments for each staff member
      const assignments = staffIds.map(staffId => ({
        task_id: taskData.id,
        staff_id: staffId,
        assigned_at: new Date().toISOString()
      }));
      
      const { error: assignmentsError } = await supabase
        .from('task_assignments')
        .insert(assignments);
        
      if (assignmentsError) {
        console.error('Error creating task assignments:', assignmentsError);
        toast.error('Failed to assign staff to task');
        return false;
      }
      
      // Add to room log
      await addRoomLog(roomId, "Task assigned", `Cleaning task assigned to ${staffIds.length} staff members`);
      
      // Fetch the updated task to get the full data
      await fetchTasks();
      return true;
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error('Failed to assign task');
      return false;
    }
  };

  const updateTaskAssignment = async (taskId: string, staffIds: string[], supervisorId?: string) => {
    try {
      // Update the task supervisor if provided
      if (supervisorId) {
        const { error: taskError } = await supabase
          .from('cleaning_tasks')
          .update({ supervisor_id: supervisorId })
          .eq('id', taskId);
          
        if (taskError) {
          console.error('Error updating task supervisor:', taskError);
          toast.error('Failed to update task supervisor');
          return false;
        }
      }
      
      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', taskId);
        
      if (deleteError) {
        console.error('Error deleting existing assignments:', deleteError);
        toast.error('Failed to update task assignments');
        return false;
      }
      
      // Create new assignments
      const assignments = staffIds.map(staffId => ({
        task_id: taskId,
        staff_id: staffId,
        assigned_at: new Date().toISOString()
      }));
      
      const { error: assignmentsError } = await supabase
        .from('task_assignments')
        .insert(assignments);
        
      if (assignmentsError) {
        console.error('Error creating task assignments:', assignmentsError);
        toast.error('Failed to assign staff to task');
        return false;
      }
      
      // Find the task to get the room ID for logging
      const task = tasks.find(t => t.id === taskId);
      if (task?.roomId) {
        await addRoomLog(task.roomId, "Task reassigned", `Cleaning task reassigned to ${staffIds.length} staff members`);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating task assignment:', error);
      toast.error('Failed to update task assignment');
      return false;
    }
  };

  const getSupervisorTasks = (supervisorId: string) => {
    return tasks.filter(task => task.supervisorId === supervisorId);
  };

  const extendRoomStay = async (roomId: string) => {
    try {
      // Find tasks for this room
      const roomTasks = tasks.filter(t => t.roomId === roomId);
      
      if (roomTasks.length === 0) {
        toast.error('No task found for this room');
        return false;
      }
      
      // Update the latest task for this room
      const latestTask = roomTasks.sort((a, b) => 
        b.scheduledDate.getTime() - a.scheduledDate.getTime()
      )[0];
      
      const { error } = await supabase
        .from('cleaning_tasks')
        .update({ checkout_extended: true })
        .eq('id', latestTask.id);
        
      if (error) {
        console.error('Error extending stay:', error);
        toast.error('Failed to extend stay');
        return false;
      }
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === latestTask.id ? { ...t, checkout_extended: true } : t
        )
      );
      
      // Add to room log
      await addRoomLog(roomId, "Stay extended", "Guest stay has been extended");
      
      return true;
    } catch (error) {
      console.error('Error extending room stay:', error);
      toast.error('Failed to extend room stay');
      return false;
    }
  };
  
  // Helper function to add entries to room_log
  const addRoomLog = async (roomId: string, logType: string, notes?: string) => {
    try {
      const userName = "System"; // You can replace this with actual user name from context
      
      const { error } = await supabase
        .from('room_log')
        .insert({
          room_id: roomId,
          log_type: logType,
          user_name: userName,
          notes: notes || ''
        });
        
      if (error) {
        console.error('Error adding room log:', error);
      }
    } catch (error) {
      console.error('Error adding room log:', error);
    }
  };
  
  return {
    tasks,
    loading,
    fetchTasks,
    updateTaskStatus,
    assignTask,
    updateTaskAssignment,
    getSupervisorTasks,
    extendRoomStay,
    addRoomLog
  };
}
