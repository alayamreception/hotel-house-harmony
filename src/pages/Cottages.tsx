import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Cottage = {
  id: number;
  cottage_name: string;
  supervisor: string | null;
};

type Staff = {
  id: string;
  name: string;
};

const UpdateCottageSupervisors = () => {
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: cottagesData } = await supabase.from('cottages').select('*');
      const { data: staffData } = await supabase.from('staff').select('id, name').eq('role', 'Supervisor');
      setCottages(cottagesData || []);
      setStaff(staffData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSupervisorChange = async (cottageId: number, supervisorId: string | null) => {
    setSaving(true);
    // Update the supervisor in the database
    try{
        // Check if the supervisorId is "None" and set it to null
        if (supervisorId === 'None') {
            supervisorId = null;
        }
        // Update the cottage with the new supervisor
    await supabase.from('cottages').update({ supervisor: supervisorId }).eq('id', cottageId);
    setCottages(cottages =>
      cottages.map(c =>
        c.id === cottageId ? { ...c, supervisor: supervisorId } : c
      )
    );
  } catch (error) {
      console.error('Error updating supervisor:', error);
        alert('Failed to update supervisor');
  }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Update Cottage Supervisors</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1 text-left">Cottage Name</th>
            <th className="border px-2 py-1 text-left">Supervisor</th>
            <th className="border px-2 py-1"></th>
          </tr>
        </thead>
        <tbody>
          {cottages.map(cottage => (
            <tr key={cottage.id}>
              <td className="border px-2 py-1">{cottage.cottage_name}</td>
              <td className="border px-2 py-1">
                <Select
                  value={cottage.supervisor ?? ''}
                  onValueChange={val => handleSupervisorChange(cottage.id, val || null)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    {staff.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="border px-2 py-1">
                {saving && <span className="text-xs text-gray-500">Saving...</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UpdateCottageSupervisors;