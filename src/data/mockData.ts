
import { Room, Staff, CleaningTask, RoomStatus } from '../types';

export const generateMockRooms = (): Room[] => {
  const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Executive'];
  const statuses: RoomStatus[] = ['clean', 'dirty', 'maintenance', 'occupied'];
  
  return Array.from({ length: 30 }, (_, i) => {
    const floor = Math.floor(i / 10) + 1;
    const roomNum = (i % 10) + 1;
    const roomNumber = `${floor}${roomNum.toString().padStart(2, '0')}`;
    
    return {
      id: `room-${i + 1}`,
      roomNumber,
      type: roomTypes[Math.floor(Math.random() * roomTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      notes: '',
      priority: Math.floor(Math.random() * 3) + 1,
      lastCleaned: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    };
  });
};

export const generateMockStaff = (): Staff[] => {
  const names = [
    'Emma Thompson', 
    'Juan Perez', 
    'Lisa Wong', 
    'Michael Johnson',
    'Sarah Davis', 
    'Robert Smith', 
    'Maria Garcia', 
    'David Brown'
  ];
  const roles = ['Housekeeper', 'Supervisor', 'Manager'];
  const shifts = ['Morning', 'Afternoon', 'Night'];
  
  return names.map((name, i) => ({
    id: `staff-${i + 1}`,
    name,
    role: roles[Math.floor(Math.random() * roles.length)],
    shift: shifts[Math.floor(Math.random() * shifts.length)],
    assignedRooms: [],
    avatar: `/avatar-${i + 1}.jpg`
  }));
};

export const generateMockTasks = (rooms: Room[], staff: Staff[]): CleaningTask[] => {
  const statuses = ['pending', 'in-progress', 'completed'] as const;
  
  return rooms
    .filter(room => room.status !== 'clean')
    .map((room, i) => {
      const staffMember = staff[Math.floor(Math.random() * staff.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const today = new Date();
      
      // Update staff assigned rooms
      if (!staffMember.assignedRooms.includes(room.id)) {
        staffMember.assignedRooms.push(room.id);
      }
      
      return {
        id: `task-${i + 1}`,
        roomId: room.id,
        staffId: staffMember.id,
        status: status,
        scheduledDate: new Date(today.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0)),
        completedDate: status === 'completed' ? new Date() : undefined,
        notes: ''
      };
    });
};

export const generateDashboardData = (rooms: Room[], tasks: CleaningTask[]) => {
  return {
    totalRooms: rooms.length,
    cleanRooms: rooms.filter(room => room.status === 'clean').length,
    dirtyRooms: rooms.filter(room => room.status === 'dirty').length,
    occupiedRooms: rooms.filter(room => room.status === 'occupied').length,
    maintenanceRooms: rooms.filter(room => room.status === 'maintenance').length,
    assignedTasks: tasks.length,
    completedTasks: tasks.filter(task => task.status === 'completed').length
  };
};
