import React, { useState, useEffect } from 'react';
import { useHotel } from '@/context/HotelContext';
import { Staff, CleaningTask } from '@/types';
import { toast } from 'sonner';
import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface TaskItemProps {
  task: CleaningTask;
  roomNumber: string;
}

const AssignTasks = () => {
  const { staff, tasks, updateTaskAssignment, fetchTasks } = useHotel();
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const staffOptions = staff
    .filter(s => s.role === 'Housekeeper')
    .map(s => ({
      label: `${s.name} - ${s.shift} shift`,
      value: s.id,
    }));

  const taskOptions = tasks.map(task => {
    return {
      label: `Task ${task.id} - Room ${task.roomId}`,
      value: task.id,
    };
  });

  const handleAssignTasksSubmit = async () => {
    if (selectedStaff.length === 0 || selectedTasks.length === 0) {
      toast.error('Please select staff and tasks');
      return;
    }

    setIsAssigning(true);
    
    // Process each selected task
    let successCount = 0;
    for (const taskId of selectedTasks) {
      try {
        const result = await updateTaskAssignment(taskId, selectedStaff);
        if (result) successCount++;  // Check if result is truthy
      } catch (error) {
        console.error('Error assigning task:', error);
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully assigned ${successCount} task(s)`);
      setSelectedStaff([]);
      setSelectedTasks([]);
      await fetchTasks();
    } else {
      toast.error('Failed to assign tasks');
    }
    
    setIsAssigning(false);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Assign Tasks to Staff</CardTitle>
          <CardDescription>Select staff members and tasks to assign.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Select Staff</h3>
            <MultiSelect
              options={staffOptions}
              value={selectedStaff}
              onChange={setSelectedStaff}
              placeholder="Select staff members"
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Select Tasks</h3>
            <MultiSelect
              options={taskOptions}
              value={selectedTasks}
              onChange={setSelectedTasks}
              placeholder="Select tasks to assign"
            />
          </div>
          <Button onClick={handleAssignTasksSubmit} disabled={isAssigning}>
            {isAssigning ? (
              <>
                Assigning...
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              'Assign Tasks'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignTasks;
