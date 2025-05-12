
import React, { useState, useMemo } from "react";
import { useHotel } from "@/context/HotelContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ClipboardList, Users } from "lucide-react";

const AssignTasks = () => {
  const { tasks, rooms, staff, updateTaskAssignment } = useHotel();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [searchTasks, setSearchTasks] = useState("");
  const [searchStaff, setSearchStaff] = useState("");

  // Filter tasks that are pending or in-progress
  const availableTasks = useMemo(() => {
    return tasks
      .filter(task => task.status !== "completed")
      .filter(task => {
        const room = rooms.find(r => r.id === task.roomId);
        return room?.roomNumber.toLowerCase().includes(searchTasks.toLowerCase()) || 
               task.notes?.toLowerCase().includes(searchTasks.toLowerCase()) || 
               !searchTasks;
      });
  }, [tasks, rooms, searchTasks]);

  // Filter available staff
  const availableStaff = useMemo(() => {
    return staff.filter(s => 
      s.name.toLowerCase().includes(searchStaff.toLowerCase()) || 
      s.role?.toLowerCase().includes(searchStaff.toLowerCase()) ||
      !searchStaff
    );
  }, [staff, searchStaff]);

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    );
  };

  // Toggle staff selection
  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId) 
        : [...prev, staffId]
    );
  };

  // Handle assignment
  const handleAssign = async () => {
    if (selectedTasks.length === 0) {
      toast.error("Please select at least one task");
      return;
    }

    if (selectedStaff.length === 0) {
      toast.error("Please select at least one staff member");
      return;
    }

    // Process each selected task
    let successCount = 0;
    for (const taskId of selectedTasks) {
      const success = await updateTaskAssignment(taskId, selectedStaff);
      if (success) successCount++;
    }

    if (successCount > 0) {
      toast.success(`Successfully assigned ${successCount} tasks to ${selectedStaff.length} staff members`);
      // Clear selections after successful assignment
      setSelectedTasks([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Assign Tasks</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedTasks.length} tasks and {selectedStaff.length} staff selected
          </span>
          <Button 
            onClick={handleAssign}
            disabled={selectedTasks.length === 0 || selectedStaff.length === 0}
          >
            Assign
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="w-full mb-4 grid grid-cols-2">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Tasks ({availableTasks.length})
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Staff ({availableStaff.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Input
            placeholder="Search tasks by room number or notes..."
            value={searchTasks}
            onChange={(e) => setSearchTasks(e.target.value)}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableTasks.length > 0 ? (
              availableTasks.map(task => {
                const room = rooms.find(r => r.id === task.roomId);
                const isSelected = selectedTasks.includes(task.id);
                
                return (
                  <Card 
                    key={task.id}
                    className={`cursor-pointer hover:shadow-md transition ${isSelected ? 'border-primary border-2' : ''}`}
                    onClick={() => toggleTaskSelection(task.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex justify-between items-center">
                        Room {room?.roomNumber || "Unknown"}
                        <Badge variant={task.status === "pending" ? "outline" : "secondary"}>
                          {task.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.notes || "No notes available"}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-1">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs text-muted-foreground">
                          Type: {room?.type || "Unknown"}
                        </span>
                        {isSelected && (
                          <Badge variant="default">Selected</Badge>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full p-8 text-center border rounded-lg">
                <p className="text-muted-foreground">No tasks available</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Input
            placeholder="Search staff by name or role..."
            value={searchStaff}
            onChange={(e) => setSearchStaff(e.target.value)}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableStaff.length > 0 ? (
              availableStaff.map(staffMember => {
                const isSelected = selectedStaff.includes(staffMember.id);
                
                return (
                  <Card 
                    key={staffMember.id}
                    className={`cursor-pointer hover:shadow-md transition ${isSelected ? 'border-primary border-2' : ''}`}
                    onClick={() => toggleStaffSelection(staffMember.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex justify-between items-center">
                        {staffMember.name}
                        <Badge variant="outline">
                          {staffMember.role || "Staff"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {staffMember.shift || "No shift specified"}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-1">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs text-muted-foreground">
                          Assigned: {staffMember.assignedRooms?.length || 0} rooms
                        </span>
                        {isSelected && (
                          <Badge variant="default">Selected</Badge>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full p-8 text-center border rounded-lg">
                <p className="text-muted-foreground">No staff available</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary of selected items */}
      {(selectedTasks.length > 0 || selectedStaff.length > 0) && (
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">Assignment Summary</h3>
          
          {selectedTasks.length > 0 && (
            <div className="mb-2">
              <p className="text-sm font-medium">Selected Tasks:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedTasks.map(taskId => {
                  const task = tasks.find(t => t.id === taskId);
                  const room = rooms.find(r => r.id === task?.roomId);
                  return (
                    <Badge key={taskId} variant="outline" className="cursor-pointer" onClick={() => toggleTaskSelection(taskId)}>
                      Room {room?.roomNumber} ✕
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          
          {selectedStaff.length > 0 && (
            <div>
              <p className="text-sm font-medium">Selected Staff:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedStaff.map(staffId => {
                  const staffMember = staff.find(s => s.id === staffId);
                  return (
                    <Badge key={staffId} variant="outline" className="cursor-pointer" onClick={() => toggleStaffSelection(staffId)}>
                      {staffMember?.name} ✕
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <Button onClick={handleAssign} className="w-full">
              Assign {selectedTasks.length} Tasks to {selectedStaff.length} Staff
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignTasks;
