
import { useState } from 'react';
import { CleaningTask, TaskAssignment, StaffBasicInfo } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTasks(selectedCottage: string | null) {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch task assignments separately to avoid type recursion
  const fetchTaskAssignments = async () => {
    try {
      // Step 1: First, fetch just the basic assignment data
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('task_assignments')
        .select('id, task_id, staff_id, assigned_at');
      
      if (assignmentError) throw assignmentError;
      
      // Initialize assignments with basic data, no staff info yet
      const basicAssignments = assignmentData.map(assignment => ({
        id: assignment.id,
        taskId: assignment.task_id,
        staffId: assignment.staff_id,
        assignedAt: new Date(assignment.assigned_at)
      }));
      
      // Step 2: Get unique staff IDs to fetch
      const staffIds = [...new Set(assignmentData.map(a => a.staff_id))];
      
      // Step 3: If we have staff IDs, fetch their information
      if (staffIds.length > 0) {
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('id, name, role, shift, avatar')
          .in('id', staffIds);
        
        if (staffError) throw staffError;
        
        // Create a lookup map for staff data
        const staffMap: Record<string, StaffBasicInfo> = {};
        staffData.forEach(s => {
          staffMap[s.id] = {
            id: s.id,
            name: s.name,
            role: s.role,
            shift: s.shift,
            avatar: s.avatar
          };
        });
        
        // Combine the assignment data with staff info
        const formattedAssignments = basicAssignments.map(assignment => ({
          ...assignment,
          staff: staffMap[assignment.staffId]
        }));
        
        return formattedAssignments;
      }
      
      // Return basic assignments if no staff info was needed/available
      return basicAssignments;
    } catch (error) {
      console.error('Error fetching task assignments:', error);
      toast.error('Failed to load task assignments');
      return [];
    }
  };

  // Fetch tasks data
  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('cleaning_tasks').select('*');
      
      // Filter by cottage if selected
      if (selectedCottage) {
        query = query.eq('cottage_type', selectedCottage);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Step 1: Format the tasks without assignments first
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
        departure_time: task.departure_time ? new Date(task.departure_time) : undefined,
        assignedStaff: [] // Initialize empty, we'll fill this later
      }));
      
      // Step 2: Get assignment data separately to avoid type recursion
      const assignments = await fetchTaskAssignments();
      
      // Step 3: Create a map of task ID to its assignments
      const taskAssignmentMap: Record<string, TaskAssignment[]> = {};
      assignments.forEach(assignment => {
        if (!taskAssignmentMap[assignment.taskId]) {
          taskAssignmentMap[assignment.taskId] = [];
        }
        taskAssignmentMap[assignment.taskId].push(assignment);
      });
      
      // Step 4: Merge assignments with tasks
      const tasksWithAssignments = formattedTasks.map(task => ({
        ...task,
        assignedStaff: taskAssignmentMap[task.id] || []
      }));
      
      setTasks(tasksWithAssignments);
      
      return {
        tasks: tasksWithAssignments,
        assignments
      };
      
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      return { tasks: [], assignments: [] };
    } finally {
      setLoading(false);
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
      
      // Return true to indicate success
      return true;
    } catch (error) {
      console.error('Error updating task assignment:', error);
      toast.error('Failed to update task assignment');
      return false;
    }
  };

  // Assign task to multiple staff members
  const assignTask = async (roomId: string, staffIds: string[], roomType: string, supervisorId?: string) => {
    try {
      if (staffIds.length === 0) {
        toast.error('At least one staff member must be assigned');
        return false;
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
          cottage_type: roomType // Add the cottage type to the task
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating task:', error);
        toast.error('Failed to assign task: ' + error.message);
        return false;
      }
      
      if (!data || !data.id) {
        console.error('No data returned from task creation');
        toast.error('Failed to create task - no data returned');
        return false;
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
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Error assigning task:', error);
      toast.error(`Failed to assign task: ${error.message || 'Unknown error'}`);
      return false;
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
            return { 
              ...task, 
              status,
              completedDate: status === 'completed' ? new Date() : task.completedDate 
            };
          }
          return task;
        })
      );
      
      toast.success(`Task status updated to ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
      return false;
    }
  };

  // Get tasks for a specific supervisor
  const getSupervisorTasks = (supervisorId: string) => {
    return tasks.filter(task => task.supervisorId === supervisorId);
  };

  // Extend room stay
  const extendRoomStay = async (roomId: string) => {
    try {
      // Find any existing tasks for this room
      const roomTasks = tasks.filter(task => task.roomId === roomId);
      
      if (roomTasks.length === 0) {
        toast.error('No tasks found for this room');
        return false;
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
