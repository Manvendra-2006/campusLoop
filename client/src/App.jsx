import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import SubmitComplaint from './pages/student/SubmitComplaint';
import MyComplaints from './pages/student/MyComplaints';
import ComplaintDetail from './pages/student/ComplaintDetail';
import StudentProfile from './pages/student/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminComplaints from './pages/admin/Complaints';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLogin from './pages/admin/Login';
import PortalLayout from './components/PortalLayout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Student protected routes */}
      <Route element={<ProtectedRoute requiredRole="student" />}>
        <Route element={<PortalLayout role="student" />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/submit" element={<SubmitComplaint />} />
          <Route path="/student/complaints" element={<MyComplaints />} />
          <Route path="/student/complaints/:id" element={<ComplaintDetail />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      {/* Admin protected routes */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route element={<PortalLayout role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/complaints/:id" element={<ComplaintDetail />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
