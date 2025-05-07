
import React from 'react';
import { useHotel } from '@/context/HotelContext';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel, CalendarDays, Clock, House, Trash } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import StatusBadge from '@/components/StatusBadge';

const Dashboard = () => {
  const { stats, rooms, tasks, staff } = useHotel();
  
  // Calculate completion percentage
  const occupancyRate = Math.round((stats.occupiedRooms / stats.totalRooms) * 100) || 0;
  const cleaningRate = Math.round((stats.cleanRooms / stats.totalRooms) * 100) || 0;
  const taskCompletionRate = Math.round((stats.completedTasks / (stats.assignedTasks || 1)) * 100) || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Rooms"
          value={stats.totalRooms}
          icon={<House />}
          description="Hotel capacity"
        />
        <StatsCard
          title="Clean Rooms"
          value={stats.cleanRooms}
          icon={<Hotel />}
          description="Ready for guests"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Tasks Assigned"
          value={stats.assignedTasks}
          icon={<CalendarDays />}
          description="Cleaning tasks scheduled"
        />
        <StatsCard
          title="Tasks Completed"
          value={stats.completedTasks}
          icon={<Trash />}
          description="Finished today"
          trend={{ value: 10, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Room Status */}
        <Card>
          <CardHeader>
            <CardTitle>Room Status</CardTitle>
            <CardDescription>Current room status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status="clean" />
                  <span className="text-sm font-medium">{stats.cleanRooms} rooms</span>
                </div>
                <Progress value={cleaningRate} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status="dirty" />
                  <span className="text-sm font-medium">{stats.dirtyRooms} rooms</span>
                </div>
                <Progress value={(stats.dirtyRooms / stats.totalRooms) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status="occupied" />
                  <span className="text-sm font-medium">{stats.occupiedRooms} rooms</span>
                </div>
                <Progress value={occupancyRate} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status="maintenance" />
                  <span className="text-sm font-medium">{stats.maintenanceRooms} rooms</span>
                </div>
                <Progress 
                  value={(stats.maintenanceRooms / stats.totalRooms) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Completion */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>Today's cleaning progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-hotel-primary">
                {taskCompletionRate}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {stats.completedTasks} of {stats.assignedTasks} tasks completed
              </p>
            </div>
            
            <div>
              <Progress value={taskCompletionRate} className="h-4" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 pt-4">
              <div className="text-center">
                <div className="text-xl font-bold">{tasks.filter(t => t.status === 'pending').length}</div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{tasks.filter(t => t.status === 'in-progress').length}</div>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{tasks.filter(t => t.status === 'completed').length}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Summary</CardTitle>
            <CardDescription>Housekeeping team overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="text-lg font-bold">{staff.length}</div>
                  <p className="text-xs text-muted-foreground">Active Staff</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="text-lg font-bold">
                    {staff.reduce((sum, s) => sum + s.assignedRooms.length, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Assigned Tasks</p>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-medium">Staff by Shift</h4>
                <div className="space-y-1">
                  {['Morning', 'Afternoon', 'Night'].map(shift => (
                    <div key={shift} className="flex justify-between items-center">
                      <span className="text-sm">{shift}</span>
                      <span className="text-sm font-medium">
                        {staff.filter(s => s.shift === shift).length} staff
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-medium">Staff by Role</h4>
                <div className="space-y-1">
                  {['Housekeeper', 'Supervisor', 'Manager'].map(role => (
                    <div key={role} className="flex justify-between items-center">
                      <span className="text-sm">{role}</span>
                      <span className="text-sm font-medium">
                        {staff.filter(s => s.role === role).length} staff
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
