import React, { useState } from 'react';
import { useHotel } from '@/context/HotelContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Clock, Loader2 } from 'lucide-react';
import { Staff as StaffType } from '@/types';

const Staff = () => {
  const { staff, rooms, tasks, addStaff, loading, selectedCottage } = useHotel();
  const [open, setOpen] = useState(false);

  const [newStaff, setNewStaff] = useState<Omit<StaffType, 'id' | 'assignedRooms' | 'assignedCottage'>>({
    name: '',
    role: 'Housekeeper',
    shift: 'Morning',
    assignedCottage: selectedCottage, // Initialize with selectedCottage
  });

  const handleAddStaff = async () => {
    await addStaff({
      ...newStaff,
      assignedRooms: [],
      assignedCottage: newStaff.assignedCottage || selectedCottage, // Use the selected value or default
    });

    setNewStaff({
      name: '',
      role: 'Housekeeper',
      shift: 'Morning',
      assignedCottage: selectedCottage, // Reset to selectedCottage
    });

    setOpen(false);
  };

  if (loading.staff) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Sevadhars</h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Enter the details for the new staff member.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={newStaff.role}
                  onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}
                >
                  <SelectTrigger id="role" className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Housekeeper">Housekeeper</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shift" className="text-right">
                  Shift
                </Label>
                <Select
                  value={newStaff.shift}
                  onValueChange={(value) => setNewStaff({ ...newStaff, shift: value })}
                >
                  <SelectTrigger id="shift" className="col-span-3">
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Afternoon">Afternoon</SelectItem>
                    <SelectItem value="Night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Cottage Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cottage" className="text-right">
                  Cottage
                </Label>
                <Select
                  value={newStaff.assignedCottage || selectedCottage}
                  onValueChange={(value) => setNewStaff({ ...newStaff, assignedCottage: value })}
                >
                  <SelectTrigger id="cottage" className="col-span-3">
                    <SelectValue placeholder="Select Cottage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={selectedCottage}>{selectedCottage}</SelectItem>
                    {/* Add other cottages if available */}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddStaff}>Add Staff</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {staff.length === 0 ? (
        <div className="bg-muted/30 rounded-lg p-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 p-3 bg-background rounded-full">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Staff Members Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding staff members to assign them cleaning tasks.
          </p>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Staff Member
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((staffMember) => {
            const assignedTasks = tasks.filter(task => task.staffId === staffMember.id);
            const assignedRooms = staffMember.assignedRooms.map(roomId =>
              rooms.find(room => room.id === roomId)
            ).filter(Boolean);

            const completedTasks = assignedTasks.filter(task => task.status === 'completed').length;
            const pendingTasks = assignedTasks.filter(task => task.status !== 'completed').length;

            return (
              <Card key={staffMember.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{staffMember.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {staffMember.role}
                      </p>
                    </div>
                    <div className="flex items-center bg-muted/50 px-2 py-1 rounded">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="text-xs">{staffMember.shift} Shift</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 p-2 rounded text-center">
                        <div className="text-xl font-bold">{pendingTasks}</div>
                        <p className="text-xs text-muted-foreground">Pending Tasks</p>
                      </div>
                      <div className="bg-muted/50 p-2 rounded text-center">
                        <div className="text-xl font-bold">{completedTasks}</div>
                        <p className="text-xs text-muted-foreground">Completed Today</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Assigned Rooms</h4>
                      <div className="flex flex-wrap gap-1">
                        {assignedRooms.length > 0 ? (
                          assignedRooms.map((room, index) => (
                            <div
                              key={`${staffMember.id}-${index}`}
                              className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                            >
                              Room {room?.roomNumber}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No rooms assigned</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" size="sm">View Details</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Staff;
