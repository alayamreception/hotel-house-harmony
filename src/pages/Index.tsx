
import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { HotelProvider } from '@/context/HotelContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Rooms from '@/pages/Rooms';
import Tasks from '@/pages/Tasks';
import Staff from '@/pages/Staff';
import SupervisorTasks from '@/pages/SupervisorTasks';
import Auth from '@/pages/Auth';
import { useAuth } from '@/context/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={
        <ProtectedRoute>
          <HotelProvider>
            <Layout>
              <Dashboard />
            </Layout>
          </HotelProvider>
        </ProtectedRoute>
      } />
      <Route path="/rooms" element={
        <ProtectedRoute>
          <HotelProvider>
            <Layout>
              <Rooms />
            </Layout>
          </HotelProvider>
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute>
          <HotelProvider>
            <Layout>
              <Tasks />
            </Layout>
          </HotelProvider>
        </ProtectedRoute>
      } />
      <Route path="/staff" element={
        <ProtectedRoute>
          <HotelProvider>
            <Layout>
              <Staff />
            </Layout>
          </HotelProvider>
        </ProtectedRoute>
      } />
      <Route path="/supervisor-tasks" element={
        <ProtectedRoute>
          <HotelProvider>
            <Layout>
              <SupervisorTasks />
            </Layout>
          </HotelProvider>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default Index;
