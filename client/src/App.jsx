
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import { TaskProvider } from "./context/TaskContext";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/login" element={<Login />} />

        {/* Normal User Dashboard */}
        <Route
          path="/Dashboard"
          element={
            <ProtectedRoute>
              <TaskProvider>
                <Dashboard />
              </TaskProvider>
            </ProtectedRoute>
          }
        />

        
        
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AdminAnalytics />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
