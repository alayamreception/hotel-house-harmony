
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const RealtimeNotifications = () => {
  useEffect(() => {
    // Enable realtime for the rooms table - this is a client-side confirmation
    // that realtime is working correctly
    const channel = supabase.channel('system')
      .on('presence', { event: 'sync' }, () => {
        console.log('Realtime connection synced');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('system', { event: 'extension' }, (payload) => {
        console.log('Extension event:', payload);
        if (payload.extension === 'postgres_changes') {
          toast.success('Realtime database updates are working');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
};

export default RealtimeNotifications;
