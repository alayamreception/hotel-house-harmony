import { useState } from 'react';
import { Staff } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useStaff(selectedCottage: string | null) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('staff')
        .select('*');

      // Conditionally filter by selectedCottage
      if (selectedCottage) {
        query = query.eq('assigned_cottage', selectedCottage); // Assuming 'assigned_cottage' is the column name
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const formattedStaff: Staff[] = data.map(staffMember => ({
        id: staffMember.id,
        name: staffMember.name,
        role: staffMember.role,
        shift: staffMember.shift,
        assignedRooms: [], // We'll populate this from tasks
        avatar: staffMember.avatar
      }));

      setStaff(formattedStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  // Add new staff
  const addStaff = async (staffData: Omit<Staff, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert({
          name: staffData.name,
          role: staffData.role,
          shift: staffData.shift,
          avatar: staffData.avatar,
          assigned_cottage: staffData.assignedCottage // ADD THIS LINE
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newStaff: Staff = {
        id: data.id,
        name: data.name,
        role: data.role,
        shift: data.shift,
        assignedRooms: [],
        avatar: data.avatar,
        assignedCottage: data.assigned_cottage,
      };

      setStaff(prevStaff => [...prevStaff, newStaff]);
      toast.success(`${staffData.name} added to staff`);
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('Failed to add staff');
    }
  };

  return {
    staff,
    loading,
    fetchStaff,
    addStaff,
    setStaff
  };
}
