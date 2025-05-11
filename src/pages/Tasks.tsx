
import React, { useState, useMemo, useEffect } from 'react';
import { useHotel } from '@/context/HotelContext';
import TaskItem from '@/components/TaskItem';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format, parseISO } from 'date-fns';
import StatsCard from '@/components/StatsCard';
import { CheckCircle, Clock, AlertTriangle, ClipboardList } from 'lucide-react';

const Tasks = () => {
  const { tasks, rooms, staff, stats, updateTaskStatus, updateTaskAssignment } = useHotel();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('none');
  
  // Filter staff by role for supervisor selection
  const supervisors = useMemo(() => {
    return staff.filter(s => s.role === 'Supervisor' || s.role === 'Manager');
  }, [staff]);
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchingRoom = rooms.find(room => room.id === task.roomId);
      const matchingStaff = staff.find(s => s.id === task.staffId);
      const assignedStaffNames = task.assignedStaff?.map(a => a.staff?.name).filter(Boolean) || [];
      
      // Check if there's a search term to match against
      const matchesSearch = searchTerm ? (
        matchingRoom?.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matchingStaff?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignedStaffNames.some(name => name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.booking_id && task.booking_id.toLowerCase().includes(searchTerm.toLowerCase()))
      ) : true;
      
      // Check if the task matches the status filter
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [tasks, rooms, staff, searchTerm, statusFilter]);
  
  const handleAssignClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      setSelectedTaskId(taskId);
      // Pre-select currently assigned staff
      setSelectedStaffIds(
        task.assignedStaff ? 
          task.assignedStaff.map(a => a.staffId) : 
          task.staffId ? [task.staffId] : []
      );
      setSelectedSupervisorId(task.supervisorId || 'none');
      setAssignDialogOpen(true);
    }
  };
  
  const handleToggleStaff = (staffId: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };
  
  const handleAssignSubmit = async () => {
    if (selectedTaskId && selectedStaffIds.length > 0) {
      // Use undefined for 'none' value, or the actual supervisor ID
      const supervisorId = selectedSupervisorId === 'none' ? undefined : selectedSupervisorId;
      
      await updateTaskAssignment(
        selectedTaskId, 
        selectedStaffIds, 
        supervisorId
      );
      setAssignDialogOpen(false);
      setSelectedTaskId(null);
      setSelectedStaffIds([]);
      setSelectedSupervisorId('none');
    }
  };
  
  // Format date function
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return format(date, 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Cleaning Tasks</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={<ClipboardList className="h-4 w-4" />}
          className="bg-amber-50 dark:bg-amber-900/30"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgressTasks}
          icon={<Clock className="h-4 w-4" />}
          className="bg-blue-50 dark:bg-blue-900/30"
        />
        <StatsCard
          title="Completed"
          value={stats.completedTasks}
          icon={<CheckCircle className="h-4 w-4" />}
          className="bg-green-50 dark:bg-green-900/30"
        />
        <StatsCard
          title="Total Tasks"
          value={stats.assignedTasks}
          icon={<AlertTriangle className="h-4 w-4" />}
          className="bg-gray-50 dark:bg-gray-800/50"
        />
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by room number, staff name, or booking ID..."
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
            const room = rooms.find(r => r.id === task.roomId);
            const mainStaff = staff.find(s => s.id === task.staffId);
            const supervisorStaff = task.supervisorId ? staff.find(s => s.id === task.supervisorId) : undefined;
            
            // Skip rendering if we can't find the room or staff
            if (!room) return null;
            
            return (
              <div key={task.id} className="relative">
                {/* Assign Staff button */}
                <Button 
                  className="absolute top-2 right-2 z-10" 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAssignClick(task.id)}
                >
                  Assign Staff
                </Button>
                
                <TaskItem
                  task={task}
                  room={room}
                  staff={mainStaff || { id: '', name: 'Unassigned', role: '', shift: '', assignedRooms: [] }}
                  supervisorStaff={supervisorStaff}
                  onStatusChange={updateTaskStatus}
                />
                
                {/* Additional info badges */}
                <div className="mt-1 space-x-2">
                  {task.booking_id && (
                    <Badge variant="outline" className="text-sm">
                      Booking: {task.booking_id}
                    </Badge>
                  )}
                  {task.checkout_extended && (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Extended Stay
                    </Badge>
                  )}
                  {task.arrival_time && (
                    <Badge variant="outline" className="text-sm bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Arrival: {formatDate(task.arrival_time)}
                    </Badge>
                  )}
                  {task.departure_time && (
                    <Badge variant="outline" className="text-sm bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      Departure: {formatDate(task.departure_time)}
                    </Badge>
                  )}
                  {task.cleaningStartTime && (
                    <Badge variant="outline" className="text-sm bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Started: {formatDate(task.cleaningStartTime)}
                    </Badge>
                  )}
                  {task.cleaningEndTime && (
                    <Badge variant="outline" className="text-sm bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Finished: {formatDate(task.cleaningEndTime)}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            <p className="text-muted-foreground dark:text-gray-400">No tasks found matching your filters.</p>
          </div>
        )}
      </div>
      
      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>
              Select staff members and a supervisor for this cleaning task.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staff">Cleaning Staff</Label>
              <div className="border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto">
                {staff.filter(s => s.role === 'Housekeeper').map((staffMember) => (
                  <div key={staffMember.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`staff-${staffMember.id}`}
                      checked={selectedStaffIds.includes(staffMember.id)}
                      onCheckedChange={() => handleToggleStaff(staffMember.id)}
                    />
                    <Label htmlFor={`staff-${staffMember.id}`} className="flex items-center gap-2 cursor-pointer">
                      {staffMember.name} - {staffMember.shift} shift
                    </Label>
                  </div>
                ))}
              </div>
              {selectedStaffIds.length === 0 && (
                <p className="text-sm text-destructive">Please select at least one staff member</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supervisor">Supervisor (Optional)</Label>
              <Select value={selectedSupervisorId} onValueChange={setSelectedSupervisorId}>
                <SelectTrigger id="supervisor" className="w-full">
                  <SelectValue placeholder="Select supervisor (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No supervisor</SelectItem>
                  {supervisors.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} - {s.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignSubmit}
              disabled={selectedStaffIds.length === 0}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
