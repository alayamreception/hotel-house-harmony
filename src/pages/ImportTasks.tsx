
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, parse } from 'date-fns';

interface CleaningTask {
  cottage: string;
  room_no: string;
  room_type: string;
  arrival: string | null;
  dep: string | null;
  cleaning_type: string;
  supervisor: string;
  cleaned_time: string | null;
  status: string;
  sevadhar: string;
  remarks: string;
}

const ImportTasks = () => {
  const [csvData, setCsvData] = useState<CleaningTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
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
  
  const parseCSV = (csvText: string): CleaningTask[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1)
      .filter(line => line.trim() !== '')
      .map(line => {
        const values = line.split(',').map(v => v.trim());
        const currentYear = new Date().getFullYear();
        
        // Convert dates from format like "4-May" to ISO strings
        let arrival = null;
        let departure = null;
        
        if (values[3] && values[3] !== '') {
          try {
            const arrivalDate = parse(`${values[3]}-${currentYear}`, 'd-MMM-yyyy', new Date());
            arrival = arrivalDate.toISOString();
          } catch (error) {
            console.error("Error parsing arrival date:", values[3], error);
          }
        }
        
        if (values[4] && values[4] !== '') {
          try {
            const departureDate = parse(`${values[4]}-${currentYear}`, 'd-MMM-yyyy', new Date());
            departure = departureDate.toISOString();
          } catch (error) {
            console.error("Error parsing departure date:", values[4], error);
          }
        }
        
        return {
          cottage: values[0] || '',
          room_no: values[1] || '',
          room_type: values[2] || '',
          arrival,
          dep: departure,
          cleaning_type: values[5] || '',
          supervisor: values[6] || '',
          cleaned_time: values[7] || null,
          status: values[8] || '',
          sevadhar: values[9] || '',
          remarks: values[10] || ''
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
      // Generate row IDs for task_for_the_day (using simple incrementing integers for now)
      // In a production app, you might want to check for existing IDs to avoid conflicts
      const { data: maxIdData, error: maxIdError } = await supabase
        .from('tasks_for_the_day')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      if (maxIdError) throw maxIdError;
      
      let startId = 1;
      if (maxIdData && maxIdData.length > 0) {
        startId = maxIdData[0].id + 1;
      }
      
      // Prepare the data with proper IDs
      const tasksToInsert = csvData.map((task, index) => ({
        ...task,
        id: startId + index
      }));
      
      // Insert into Supabase
      const { error } = await supabase
        .from('tasks_for_the_day')
        .insert(tasksToInsert);
      
      if (error) throw error;
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${csvData.length} tasks`,
      });
      
      // Clear the data and file input
      setCsvData([]);
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
                    <TableHead>Cottage</TableHead>
                    <TableHead>Room No</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Cleaning Type</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sevadhar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((task, index) => (
                    <TableRow key={index}>
                      <TableCell>{task.cottage}</TableCell>
                      <TableCell>{task.room_no}</TableCell>
                      <TableCell>{task.room_type}</TableCell>
                      <TableCell>
                        {task.arrival ? format(new Date(task.arrival), 'dd-MMM') : '-'}
                      </TableCell>
                      <TableCell>
                        {task.dep ? format(new Date(task.dep), 'dd-MMM') : '-'}
                      </TableCell>
                      <TableCell>{task.cleaning_type}</TableCell>
                      <TableCell>{task.supervisor}</TableCell>
                      <TableCell>{task.status || '-'}</TableCell>
                      <TableCell>{task.sevadhar}</TableCell>
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
