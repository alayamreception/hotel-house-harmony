
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../AuthContext';

export interface UserProfile {
  id: string;
  assigned_cottage: string | null;
  role: string | null;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
}

export function useUser() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const fetchUserProfile = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return null;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      setUserProfile(data as UserProfile);
      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!session?.user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id);
      
      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }
      
      // Refetch the profile to ensure we have the latest data
      await fetchUserProfile();
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  };

  // Fetch user profile when session changes
  useEffect(() => {
    if (session) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [session]);

  return {
    userProfile,
    loading,
    fetchUserProfile,
    updateUserProfile
  };
}
