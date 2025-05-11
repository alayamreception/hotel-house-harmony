import { useState } from 'react';
import { CleaningTask, TaskAssignment, StaffBasicInfo } from '@/types';
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
          staffId: task.staff_id || '',
          supervisorId: task.supervisor_id,
          status: task.status as CleaningTask['status'],
          scheduledDate: new Date(task.scheduled_date),
          completedDate: task.completed_date ? new Date(task.completed_date) : undefined,
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

  // Add other task-related functions that can use the properly typed data
  // ... (Rest of the functions unchanged)

  const updateTaskStatus = async (taskId: string, status: CleaningTask['status']) => {
    try {
      const { error } = await supabase
        .from('cleaning_tasks')
        .update({
          status,
          completed_date: status === 'completed' ? new Date().toISOString() : null
        })
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
            completedDate: status === 'completed' ? new Date() : t.completedDate
          } : t
        )
      );
      
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
      
      return true;
    } catch (error) {
      console.error('Error extending room stay:', error);
      toast.error('Failed to extend room stay');
      return false;
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
    extendRoomStay
  };
}
