import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewGuest from './pages/NewGuest';
import GuestList from './pages/GuestList';
import Ledger from './pages/Ledger';
import Calendar from './pages/Calendar';
import Properties from './pages/Properties';
import Profile from './pages/Profile';
import Help from './pages/Help';
import Download from './pages/Download';
import Layout from './components/Layout';
import MarketingLayout from './components/marketing/MarketingLayout';
import Home from './pages/marketing/Home';
import Product from './pages/marketing/Product';
import Prices from './pages/marketing/Prices';
import Contact from './pages/marketing/Contact';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Layout>
      {children}
    </Layout>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Marketing Routes */}
          <Route
            path="/"
            element={
              <MarketingLayout>
                <Home />
              </MarketingLayout>
            }
          />
          <Route
            path="/product"
            element={
              <MarketingLayout>
                <Product />
              </MarketingLayout>
            }
          />
          <Route
            path="/prices"
            element={
              <MarketingLayout>
                <Prices />
              </MarketingLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <MarketingLayout>
                <Contact />
              </MarketingLayout>
            }
          />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected App Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guests/new"
            element={
              <ProtectedRoute>
                <NewGuest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guests"
            element={
              <ProtectedRoute>
                <GuestList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ledger"
            element={
              <ProtectedRoute>
                <Ledger />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties"
            element={
              <ProtectedRoute>
                <Properties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/download"
            element={
              <ProtectedRoute>
                <Download />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
