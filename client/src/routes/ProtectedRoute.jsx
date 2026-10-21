// import React, { useContext } from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';

// // requiredRole can be "student" or "admin"; if omitted, any authenticated user allowed
// const ProtectedRoute = ({ requiredRole }) => {
//   const { user, loading } = useContext(AuthContext);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16" />
//       </div>
//     );
//   }

//   if (!user) {
//     const redirectPath = requiredRole === 'admin' ? '/admin/login' : '/login';
//     return <Navigate to={redirectPath} replace />;
//   }
//     return <Navigate to="/login" replace />;
//   }

//   if (requiredRole && user.role !== requiredRole) {
//     // redirect to appropriate dashboard based on role
//     const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
//     return <Navigate to={redirectPath} replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;

import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={requiredRole === 'admin' ? '/admin/login' : '/login'} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
