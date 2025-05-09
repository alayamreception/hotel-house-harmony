
import React, { useState, useMemo } from 'react';
import { useHotel } from '@/context/HotelContext';
import TaskItem from '@/components/TaskItem';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Tasks = () => {
  const { tasks, rooms, staff, updateTaskStatus } = useHotel();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchingRoom = rooms.find(room => room.id === task.roomId);
      const matchingStaff = staff.find(s => s.id === task.staffId);
      const assignedStaffNames = task.assignedStaff?.map(a => a.staff?.name).filter(Boolean) || [];
      
      // Check if there's a search term to match against
      const matchesSearch = searchTerm ? (
        matchingRoom?.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matchingStaff?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignedStaffNames.some(name => name?.toLowerCase().includes(searchTerm.toLowerCase()))
      ) : true;
      
      // Check if the task matches the status filter
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [tasks, rooms, staff, searchTerm, statusFilter]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Cleaning Tasks</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by room number or staff name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-1/2"
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => {
            const room = rooms.find(r => r.id === task.roomId)!;
            const mainStaff = staff.find(s => s.id === task.staffId)!;
            const supervisorStaff = task.supervisorId ? staff.find(s => s.id === task.supervisorId) : undefined;
            
            return (
              <TaskItem
                key={task.id}
                task={task}
                room={room}
                staff={mainStaff}
                supervisorStaff={supervisorStaff}
                onStatusChange={updateTaskStatus}
              />
            );
          })
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No tasks found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
