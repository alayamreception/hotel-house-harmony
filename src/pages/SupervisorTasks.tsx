import React, { useState, useMemo, useEffect } from 'react';
import { useHotel } from '@/context/HotelContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, ClipboardList } from 'lucide-react';
import TaskItem from '@/components/TaskItem';
import { supabase } from '@/integrations/supabase/client';

const SupervisorTasks = () => {
  const { tasks, rooms, staff, updateTaskStatus, fetchTasks } = useHotel();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [supervisorId, setSupervisorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userCottage, setUserCottage] = useState<string | null>(null);
  
  const roomMap = useMemo(() => Object.fromEntries(rooms.map(r => [r.id, r])), [rooms]);
  const staffMap = useMemo(() => Object.fromEntries(staff.map(s => [s.id, s])), [staff]);

  // Fetch user profile and supervisor ID on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get user profile to check role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, assigned_cottage')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) throw profileError;
        
        if (profileData) {
          setUserRole(profileData.role);
          setUserCottage(profileData.assigned_cottage);
          
          // If not supervisor or manager in profile, check staff table
          if (profileData.role !== 'Supervisor' && profileData.role !== 'Manager') {
            const { data: staffData, error: staffError } = await supabase
              .from('staff')
              .select('id, role')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (staffError) throw staffError;
            
            if (staffData && (staffData.role === 'Supervisor' || staffData.role === 'Manager')) {
              setUserRole(staffData.role);
              setSupervisorId(staffData.id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  // Refresh tasks when the page loads
  useEffect(() => {
    fetchTasks();
  }, []); // Only on mount
  
  // Filter tasks based on supervisor role and assigned cottage
  const supervisorTasks = useMemo(() => {
    if (!userRole) return [];
    
    // Get all tasks for managers
    if (userRole === 'Manager') {
      if (userCottage) {
        // Filter by assigned cottage if there is one
        return tasks.filter(task => {
          const room = roomMap[task.roomId];
          return room && room.type === userCottage;
        });
      } else {
        // No cottage filter for managers
        return tasks;
      }
    }
    
    // For supervisors, only show tasks they're assigned to
    if (userRole === 'Supervisor' && supervisorId) {
      return tasks.filter(task => task.supervisorId === supervisorId);
    }
    
    return [];
  }, [tasks, roomMap, supervisorId, userRole, userCottage]);
  
  // Filter tasks by status
  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') return supervisorTasks;
    return supervisorTasks.filter(task => 
      activeTab === 'pending' ? task.status !== 'completed' : task.status === 'completed'
    );
  }, [supervisorTasks, activeTab]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading supervisor data...</p>
        </div>
      </div>
    );
  }
  
  if (!userRole || (userRole !== 'Supervisor' && userRole !== 'Manager')) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Supervisor Tasks</h2>
        </div>
        
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              You need to be logged in as a supervisor or manager to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {userRole === 'Manager' ? 'Management Dashboard' : 'Supervisor Dashboard'}
        </h2>
        
        <Button variant="outline" size="sm" onClick={() => fetchTasks()}>
          Refresh
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="pending">Pending & In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
          </TabsList>
          
          <div className="text-sm text-muted-foreground">
            Total tasks: {supervisorTasks.length}
          </div>
        </div>
        
        <TabsContent value={activeTab} className="mt-4">
          {filteredTasks.length > 0 ? (
            <div className="space-y-4">
              {filteredTasks.map(task => {
                const room = roomMap[task.roomId];
                const mainStaff = staffMap[task.supervisorId];
                
                if (!room || !mainStaff) return null;
                
                return (
                  <TaskItem
                    key={task.id}
                    task={task}
                    room={room}
                    staff={mainStaff}
                    onStatusChange={updateTaskStatus}
                  />
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Tasks Found</h3>
                <p className="text-muted-foreground">
                  There are no tasks matching the selected filter.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupervisorTasks;
