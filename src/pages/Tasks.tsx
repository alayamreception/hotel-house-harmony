import React, { useState, useMemo, useEffect } from 'react';
import { useHotel } from '@/context/HotelContext';
import TaskItem from '@/components/TaskItem';
import { Input } from '@/components/ui/input';
import {
  Dialog,
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
  const [taskTypeFilter, setTaskTypeFilter] = useState('all');
  const [cleaningTypeFilter, setCleaningTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // <-- put back status filter
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  // Unique task types and cleaning types for dropdowns
  const taskTypes = useMemo(() => {
    const types = Array.from(new Set(tasks.map(t => t.task_type).filter(Boolean)));
    return types;
  }, [tasks]);
  const cleaningTypes = useMemo(() => {
    const types = Array.from(new Set(tasks.map(t => t.cleaning_type).filter(Boolean)));
    return types;
  }, [tasks]);

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

      // Filter by status
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      // Filter by task_type
      const matchesTaskType = taskTypeFilter === 'all' || task.task_type === taskTypeFilter;
      // Filter by cleaning_type
      const matchesCleaningType = cleaningTypeFilter === 'all' || task.cleaning_type === cleaningTypeFilter;

      return matchesSearch && matchesStatus && matchesTaskType && matchesCleaningType;
    });
  }, [tasks, rooms, staff, searchTerm, statusFilter, taskTypeFilter, cleaningTypeFilter]);

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
      await updateTaskAssignment(
        selectedTaskId,
        selectedStaffIds,
        undefined // supervisorId removed
      );
      setAssignDialogOpen(false);
      setSelectedTaskId(null);
      setSelectedStaffIds([]);
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
          className={`cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-200 dark:bg-amber-700/60 scale-105 shadow-lg'
              : 'bg-amber-50 dark:bg-amber-900/30'
          } transition-all`}
          onClick={() => { setStatusFilter('pending') }}
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgressTasks}
          icon={<Clock className="h-4 w-4" />}
          className={`cursor-pointer ${
            statusFilter === 'in-progress'
              ? 'bg-blue-200 dark:bg-blue-700/60 scale-105 shadow-lg'
              : 'bg-blue-50 dark:bg-blue-900/30'
          } transition-all`}
          onClick={() => setStatusFilter('in-progress')}
        />
        <StatsCard
          title="Completed"
          value={stats.completedTasks}
          icon={<CheckCircle className="h-4 w-4" />}
          className={`cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-green-200 dark:bg-green-700/60 scale-105 shadow-lg'
              : 'bg-green-50 dark:bg-green-900/30'
          } transition-all`}
          onClick={() => setStatusFilter('completed')}
        />
        <StatsCard
          title="Total Tasks"
          value={stats.assignedTasks}
          icon={<AlertTriangle className="h-4 w-4" />}
          className={`cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-gray-300 dark:bg-gray-600 scale-105 shadow-lg'
              : 'bg-gray-50 dark:bg-gray-800/50'
          } transition-all`}
          onClick={() => setStatusFilter('all')}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by room number, staff name ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-1/2"
        />

        {/* Task Type Dropdown */}
        <Select value={taskTypeFilter} onValueChange={setTaskTypeFilter}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Filter by task type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Task Types</SelectItem>
            {taskTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Cleaning Type Dropdown */}
        <Select value={cleaningTypeFilter} onValueChange={setCleaningTypeFilter}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Filter by cleaning type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cleaning Types</SelectItem>
            {cleaningTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => {
            const room = rooms.find(r => r.id === task.roomId);
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
                  supervisorStaff={supervisorStaff}
                  onStatusChange={updateTaskStatus}
                />

                {/* Additional info badges */}
                <div className="mt-1 space-x-2">
                  {task.checkout_extended && (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Stay Extended
                    </Badge>
                  )}
                  {task.cleaningStartTime && (
                    <Badge variant="outline" className="text-sm bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Started: {formatDate(task.cleaningStartTime)}
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
              Select staff members for this cleaning task.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staff">Cleaning Staff</Label>
              <div className="border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto">
                {staff.map((staffMember) => (
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
