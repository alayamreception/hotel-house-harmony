
import React from 'react';
import { HotelProvider } from '@/context/HotelContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Rooms from '@/pages/Rooms';
import Schedule from '@/pages/Schedule';
import Tasks from '@/pages/Tasks';
import Staff from '@/pages/Staff';

const Index = () => {
  return (
    <HotelProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HotelProvider>
  );
};

export default Index;
