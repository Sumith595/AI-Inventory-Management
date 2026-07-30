import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import CustomerHome from "./pages/customers/CustomerHome";
import Dashboard from "./pages/customers/Admin/Dashboard";
import DailySales from "./pages/customers/Admin/DailySales";
import AIPrediction from "./pages/customers/Admin/AIPrediction";
import Reports from "./pages/customers/Admin/Reports";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        {/* Auth */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/admin" replace /> : <Signup />} />

        {/* Customer */}
        <Route path="/home" element={<CustomerHome />} />

        {/* Admin - protected */}
        <Route path="/admin" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/admin/daily-sales" element={isAuthenticated ? <DailySales /> : <Navigate to="/" />} />
        <Route path="/admin/ai-predictions" element={isAuthenticated ? <AIPrediction /> : <Navigate to="/" />} />
        <Route path="/admin/reports" element={isAuthenticated ? <Reports /> : <Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;