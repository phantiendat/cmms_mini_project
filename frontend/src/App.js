import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';
import AppNavbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import AssetForm from './pages/AssetForm';
import AssetDetail from './pages/AssetDetail';
import ActionList from './pages/ActionList';
import ActionForm from './pages/ActionForm';
import ActionDetail from './pages/ActionDetail';
import Register from './pages/Register';
import FailureList from './pages/FailureList';
import FailureForm from './pages/FailureForm';
import FailureDetail from './pages/FailureDetail';
import Reports from './pages/Reports';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = 'http://localhost:8080/api';

const ProtectedRoute = ({ children }) => {
  const storedUser = localStorage.getItem('user');
  let user = null;
  
  if (storedUser && storedUser !== 'undefined') {
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      localStorage.removeItem('user');
      console.error('Invalid user data in localStorage:', error);
    }
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppNavbar />
        <Container className="py-3">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard Route */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Asset Routes */}
            <Route 
              path="/assets" 
              element={
                <ProtectedRoute>
                  <AssetList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assets/add" 
              element={
                <ProtectedRoute>
                  <AssetForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assets/edit/:id" 
              element={
                <ProtectedRoute>
                  <AssetForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assets/:id" 
              element={
                <ProtectedRoute>
                  <AssetDetail />
                </ProtectedRoute>
              } 
            />
            
            {/* Action Routes */}
            <Route 
              path="/actions" 
              element={
                <ProtectedRoute>
                  <ActionList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/actions/add" 
              element={
                <ProtectedRoute>
                  <ActionForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/actions/edit/:id" 
              element={
                <ProtectedRoute>
                  <ActionForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/actions/:id" 
              element={
                <ProtectedRoute>
                  <ActionDetail />
                </ProtectedRoute>
              } 
            />
            
            {/* Failure Routes */}
            <Route 
              path="/failures" 
              element={
                <ProtectedRoute>
                  <FailureList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/failures/add" 
              element={
                <ProtectedRoute>
                  <FailureForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/failures/edit/:id" 
              element={
                <ProtectedRoute>
                  <FailureForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/failures/:id" 
              element={
                <ProtectedRoute>
                  <FailureDetail />
                </ProtectedRoute>
              } 
            />
            
            {/* Reports Route */}
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;
