
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "./Dashboard";
import Rooms from "./Rooms";
import Tasks from "./Tasks";
import Schedule from "./Schedule";
import Staff from "./Staff";
import NotFound from "./NotFound";
import SupervisorTasks from "./SupervisorTasks";
import ImportTasks from "./ImportTasks";
import AssignTasks from "./AssignTasks";
import GanttChart from "./GanttChart"; // Import the new GanttChart component

import { HotelProvider } from "@/context/HotelContext";

const Index = () => {
  return (
    <HotelProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/supervisor" element={<SupervisorTasks />} />
          <Route path="/import" element={<ImportTasks />} />
          <Route path="/assign" element={<AssignTasks />} />
          <Route path="/gantt" element={<GanttChart />} /> {/* Add the new route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </HotelProvider>
  );
};

export default Index;
