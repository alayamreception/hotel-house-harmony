
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useHotel } from '@/context/HotelContext';
import { useNotification } from '@/context/NotificationContext';
import { toast } from 'sonner';
import { Room } from '@/types';

const RoomRealtimeListener = () => {
  const { fetchRooms } = useHotel();
  const { permission, sendNotification } = useNotification();

  useEffect(() => {
    // Set up realtime listener for the rooms table
    const channel = supabase
      .channel('rooms-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rooms'
        },
        (payload) => {
          console.log('New room inserted:', payload);
          
          // Refresh the rooms data
          fetchRooms();
          
          // Show toast notification
          toast.success(`New room ${payload.new.room_number} added`);
          
          // Show browser notification if permission granted
          if (permission === 'granted') {
            sendNotification('New Room Added', {
              body: `Room ${payload.new.room_number} has been added`
            });
          }
          
          // Push notification via service worker
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
              const roomData = {
                type: 'room_insert',
                roomNumber: payload.new.room_number,
                status: payload.new.status,
                id: payload.new.id
              };
              
              // This would normally go to a backend that would then send the push notification
              // Here we're simulating by showing a local notification
              sendNotification('New Room Added', {
                body: `Room ${payload.new.room_number} has been added`,
                data: { roomId: payload.new.id }
              });
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms'
        },
        (payload) => {
          console.log('Room updated:', payload);
          
          // Refresh the rooms data
          fetchRooms();
          
          // Show toast notification
          toast.info(`Room ${payload.new.room_number} updated`);
          
          // Show browser notification if permission granted
          if (permission === 'granted') {
            sendNotification('Room Updated', {
              body: `Room ${payload.new.room_number} has been updated to ${payload.new.status} status`
            });
          }
          
          // Push notification via service worker
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
              const roomData = {
                type: 'room_update',
                roomNumber: payload.new.room_number,
                status: payload.new.status,
                id: payload.new.id
              };
              
              // This would normally go to a backend that would then send the push notification
              // Here we're simulating by showing a local notification
              sendNotification('Room Updated', {
                body: `Room ${payload.new.room_number} has been updated to ${payload.new.status} status`,
                data: { roomId: payload.new.id }
              });
            });
          }
        }
      )
      .subscribe();

    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRooms, permission, sendNotification]);

  return null; // This component doesn't render anything
};

export default RoomRealtimeListener;
