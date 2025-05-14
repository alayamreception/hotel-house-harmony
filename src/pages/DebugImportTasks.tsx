import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const DebugImportTasks = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const handleImportTasks = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    const sampleData = [
      {
        room_no: "ND-AK-001",
        arrival: "2025-05-10T13:00:00.000Z",
        dep: "2025-05-13T11:00:00.000Z",
        cleaning_type: "Tmrw C.Out",
        supervisor: "karthickeyan",
        remarks: ""
      },
      {
        room_no: "ND-AK-002",
        arrival: "2025-05-11T14:00:00.000Z",
        dep: "2025-05-14T12:00:00.000Z",
        cleaning_type: "Cleaning",
        supervisor: "karthickeyan",
        remarks: "Test Remark"
      }
    ];

    try {
      let { data, error } = await supabase
        .rpc('import_tasks', {
          data: sampleData
        });

      if (error) {
        console.error(error);
        setError(error);
      } else {
        console.log(data);
        setResult(data);
      }
    } catch (e: any) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Import Tasks</h1>
      <Button onClick={handleImportTasks} disabled={loading}>
        {loading ? "Loading..." : "Run Import Tasks"}
      </Button>

      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Result:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div className="mt-4">
          <h2 className="text-lg font-bold text-red-500">Error:</h2>
          <pre className="text-red-500">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DebugImportTasks;