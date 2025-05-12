
import { useState } from 'react';
import { Room } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useRooms(selectedCottage: string | null) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCottages, setAvailableCottages] = useState<string[]>([]);

  // Fetch rooms data
  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('rooms').select('*');
      
      // Filter by cottage if selected
      if (selectedCottage) {
        query = query.eq('cottage', selectedCottage);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      const formattedRooms: Room[] = data.map(room => ({
        id: room.id,
        roomNumber: room.room_number,
        type: room.room_type,
        status: room.status as Room['status'],
        notes: room.notes || '',
        priority: room.priority || 1,
        lastCleaned: room.last_cleaned ? new Date(room.last_cleaned) : undefined,
        today_checkout: room.today_checkout || false,
        early_checkout: room.early_checkout || false
      }));
      
      setRooms(formattedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available cottages
  const fetchCottages = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('cottage')
        .order('cottage');
      
      if (error) throw error;
      
      const uniqueCottages = Array.from(
        new Set(data.map(room => room.cottage))
      ).filter(cottage => cottage !== null);
      
      setAvailableCottages(uniqueCottages);
    } catch (error) {
      console.error('Error fetching cottages:', error);
    }
  };

  // Update room status
  const updateRoomStatus = async (roomId: string, status: Room['status']) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ 
          status,
          last_cleaned: status === 'clean' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId);
      
      if (error) {
        throw error;
      }
      
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId 
            ? { 
                ...room, 
                status, 
                lastCleaned: status === 'clean' ? new Date() : room.lastCleaned 
              } 
            : room
        )
      );
      
      toast.success(`Room status updated to ${status}`);
    } catch (error) {
      console.error('Error updating room status:', error);
      toast.error('Failed to update room status');
    }
  };

  // Add new room
  const addRoom = async (room: Omit<Room, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          room_number: room.roomNumber,
          room_type: room.type,
          status: room.status,
          notes: room.notes,
          priority: room.priority
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const newRoom: Room = {
        id: data.id,
        roomNumber: data.room_number,
        type: data.room_type,
        status: data.status as Room['status'],
        notes: data.notes || '',
        priority: data.priority || 1,
        today_checkout: false,
        early_checkout: false
      };
      
      setRooms(prevRooms => [...prevRooms, newRoom]);
      toast.success(`Room ${room.roomNumber} added successfully`);
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error('Failed to add room');
    }
  };

  // Mark room for early checkout
  const markRoomForEarlyCheckout = async (roomId: string) => {
    try {
      // Update room status in database
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ 
          early_checkout: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId);
      
      if (roomError) throw roomError;
      
      // Update local state
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId 
            ? { ...room, early_checkout: true } 
            : room
        )
      );
      
      // Get room data for task creation
      const room = rooms.find(r => r.id === roomId);
      return room;
    } catch (error) {
      console.error('Error marking room for early checkout:', error);
      toast.error('Failed to mark room for early checkout');
      return null;
    }
  };

  return {
    rooms,
    loading,
    availableCottages,
    fetchRooms,
    fetchCottages,
    updateRoomStatus,
    addRoom,
    markRoomForEarlyCheckout,
    setRooms
  };
}
