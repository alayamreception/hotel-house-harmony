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
// import RoomRealtimeListener from '@/components/RoomRealtimeListener';

const Rooms = () => {
  const { 
    rooms, 
    updateRoomStatus, 
    addRoom, 
    loading, 
    markRoomForEarlyCheckout,
    extendRoomStay
  } = useHotel();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
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
  
  // Filter rooms based on search term and filters, then sort by room number
  const filteredRooms = useMemo(() => {
    return rooms
      .filter(room => {
        const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (room.notes && room.notes.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
        const matchesType = typeFilter === 'all' || room.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        // Sort numerically if possible, otherwise lexicographically
        const numA = parseInt(a.roomNumber, 10);
        const numB = parseInt(b.roomNumber, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
      });
  }, [rooms, searchTerm, statusFilter, typeFilter]);
  
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
      {/* <RoomRealtimeListener /> */}
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Rooms Management</h2>
        
        {/* Commented out the dialog and button for adding a new room */}
        {/*
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
        */}
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
          {/* Commented out the button for adding the first room */}
          /*
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Room
          </Button>
          */
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onStatusChange={updateRoomStatus}
              onEarlyCheckout={markRoomForEarlyCheckout}
              onExtendStay={extendRoomStay}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;
