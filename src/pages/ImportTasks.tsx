import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format as formatDate, parse } from 'date-fns';

export type ImportTaskType = {
  room_no: string;
  arrival: string | null;
  dep: string | null;
  cleaning_type: string;
  task_type: string;
};

const ImportTasks = () => {
  const [csvData, setCsvData] = useState<ImportTaskType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'text/csv') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid CSV file",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    console.log("File selected:", file.name);

    setFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      console.log("Parsed CSV data:", result);
      setCsvData(result);
      setIsLoading(false);

      toast({
        title: "CSV Processed",
        description: `Successfully processed ${result.length} rows from the CSV file`,
      });
    };

    reader.onerror = () => {
      setIsLoading(false);
      toast({
        title: "Error Reading File",
        description: "There was an error reading the CSV file",
        variant: "destructive",
      });
    };

    reader.readAsText(file);
  };

  const parseCSV = (csvText: string): ImportTaskType[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    return lines.slice(1)
      .filter(line => line.trim() !== '')
      .map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      })
      .filter(row => row['isha status'] && row['isha status'] !== 'CLEAN' && row['isha status'] !== 'DIRTY')
      .map(row => {
        let arrival: string | null = null;
        let dep: string | null = null;

        if (row['check-in']) {
          try {
            const arrivalDate = parse(row['check-in'], 'd-MMM-yyyy h a', new Date());
            arrival = formatDate(arrivalDate, 'yyyy-MM-dd HH:mm:ss');
          } catch (error) {
            console.error("Error parsing arrival date:", row['check-in'], error);
          }
        }

        if (row['check-out']) {
          try {
            const depDate = parse(row['check-out'], 'd-MMM-yyyy h a', new Date());
            dep = formatDate(depDate, 'yyyy-MM-dd HH:mm:ss');
          } catch (error) {
            console.error("Error parsing departure date:", row['check-out'], error);
          }
        }

        return {
          room_no: row['room id'] || '',
          arrival: arrival,
          dep: dep,
          cleaning_type: row['isha status'] || '',
          task_type: row['status'] || '',
        };
      });
  };

  const importTasks = async () => {
    if (csvData.length === 0) {
      toast({
        title: "No Data to Import",
        description: "Please upload a CSV file first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { error } = await supabase.rpc('import_tasks_from_sf', {
        data: csvData,
        file_name: fileName,
      });
      if (error) {
        console.error("Error importing tasks:", error);
        throw error;
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${csvData.length} tasks`,
      });

      setCsvData([]);
      setFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error("Error importing tasks:", error);
      toast({
        title: "Import Failed",
        description: error.message || "There was an error importing the tasks",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Import Cleaning Tasks</h2>
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="md:w-1/2"
            disabled={isLoading || isUploading}
          />

          <Button
            onClick={importTasks}
            className="md:w-1/4"
            disabled={csvData.length === 0 || isUploading}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Import Tasks
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Preview ({csvData.length} tasks)</h3>

          {csvData.length > 0 ? (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room No</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Cleaning Type</TableHead>
                    <TableHead>Task Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((task, index) => (
                    <TableRow key={index}>
                      <TableCell>{task.room_no}</TableCell>
                      <TableCell>
                        {task.arrival}
                      </TableCell>
                      <TableCell>
                        {task.dep}
                      </TableCell>
                      <TableCell>{task.cleaning_type}</TableCell>
                      <TableCell>{task.task_type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-8 border rounded-md bg-gray-50 dark:bg-gray-900">
              <p className="text-muted-foreground">
                Upload a CSV file to preview and import tasks
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportTasks;
