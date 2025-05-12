
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
import GanttChart from "./GanttChart";
import Auth from "./Auth"; // Import Auth page

import { HotelProvider } from "@/context/HotelContext";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

// Protected route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const Index = () => {
  const { user } = useAuth();
  
  return (
    <HotelProvider>
      <Routes>
        {/* Public route for authentication */}
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/rooms" element={
          <ProtectedRoute>
            <Layout>
              <Rooms />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <Layout>
              <Tasks />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/schedule" element={
          <ProtectedRoute>
            <Layout>
              <Schedule />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/staff" element={
          <ProtectedRoute>
            <Layout>
              <Staff />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/supervisor" element={
          <ProtectedRoute>
            <Layout>
              <SupervisorTasks />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/import" element={
          <ProtectedRoute>
            <Layout>
              <ImportTasks />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/assign" element={
          <ProtectedRoute>
            <Layout>
              <AssignTasks />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/gantt" element={
          <ProtectedRoute>
            <Layout>
              <GanttChart />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HotelProvider>
  );
};

export default Index;
