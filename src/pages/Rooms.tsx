
import React, { useState, useMemo } from 'react';
import { useHotel } from '@/context/HotelContext';
import RoomCard from '@/components/RoomCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, House, Loader2 } from 'lucide-react';
import { RoomStatus } from '@/types';
import RoomRealtimeListener from '@/components/RoomRealtimeListener';
import { CheckboxItem, CheckboxIndicator, Checkbox } from '@/components/ui/checkbox';

const Rooms = () => {
  const { rooms, staff, updateRoomStatus, assignTask, addRoom, loading } = useHotel();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // New room form state
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    type: 'Standard',
    status: 'clean' as RoomStatus,
    notes: '',
    priority: 1
  });
  
  // Filter room types for the dropdown
  const roomTypes = useMemo(() => {
    return Array.from(new Set(rooms.map(room => room.type)));
  }, [rooms]);
  
  // Filter staff by role for supervisor selection
  const supervisors = useMemo(() => {
    return staff.filter(s => s.role === 'Supervisor' || s.role === 'Manager');
  }, [staff]);
  
  // Filter rooms based on search term and filters
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.notes && room.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
      const matchesType = typeFilter === 'all' || room.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [rooms, searchTerm, statusFilter, typeFilter]);
  
  const handleAssignClick = (roomId: string) => {
    setSelectedRoomId(roomId);
    setSelectedStaffIds([]);
    setSelectedSupervisorId('');
    setAssignDialogOpen(true);
  };
  
  const handleToggleStaff = (staffId: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };
  
  const handleAssignSubmit = async () => {
    if (selectedRoomId && selectedStaffIds.length > 0) {
      await assignTask(
        selectedRoomId, 
        selectedStaffIds, 
        selectedSupervisorId || undefined
      );
      setAssignDialogOpen(false);
      setSelectedRoomId(null);
      setSelectedStaffIds([]);
      setSelectedSupervisorId('');
    }
  };
  
  const handleAddRoom = async () => {
    await addRoom(newRoom);
    setNewRoom({
      roomNumber: '',
      type: 'Standard',
      status: 'clean',
      notes: '',
      priority: 1
    });
    setDialogOpen(false);
  };
  
  if (loading.rooms) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading rooms data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Include the realtime listener */}
      <RoomRealtimeListener />
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Rooms Management</h2>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
              <DialogDescription>
                Enter the details for the new room.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roomNumber" className="text-right">
                  Room #
                </Label>
                <Input
                  id="roomNumber"
                  value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select 
                  value={newRoom.type} 
                  onValueChange={(value) => setNewRoom({ ...newRoom, type: value })}
                >
                  <SelectTrigger id="type" className="col-span-3">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                    <SelectItem value="Suite">Suite</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={newRoom.status} 
                  onValueChange={(value: RoomStatus) => setNewRoom({ ...newRoom, status: value })}
                >
                  <SelectTrigger id="status" className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clean">Clean</SelectItem>
                    <SelectItem value="dirty">Dirty</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Select 
                  value={String(newRoom.priority)} 
                  onValueChange={(value) => setNewRoom({ ...newRoom, priority: parseInt(value) })}
                >
                  <SelectTrigger id="priority" className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Low</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  value={newRoom.notes}
                  onChange={(e) => setNewRoom({ ...newRoom, notes: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddRoom}>Add Room</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/3">
              <Input
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="clean">Clean</SelectItem>
                  <SelectItem value="dirty">Dirty</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {roomTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {rooms.length === 0 ? (
        <div className="bg-muted/30 rounded-lg p-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 p-3 bg-background rounded-full">
            <House className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Rooms Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding rooms to your hotel inventory.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Room
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onStatusChange={updateRoomStatus}
              onAssign={handleAssignClick}
            />
          ))}
        </div>
      )}
      
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Room Cleaning</DialogTitle>
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
                  <SelectItem value="">No supervisor</SelectItem>
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

export default Rooms;
