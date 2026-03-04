import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Layout from './Layout';

import Login from './LoginPage';
import Dashboard from './Dashboard';
import Carreras from './Carreras';
import Alumnos from './Alumnos';
import Personal from './Personal';
import Usuarios from './Usuarios';
import Configuracion from './Configuracion';
import Perfil from './Perfil';
import ExpedienteDetalle from './ExpedienteDetalle';
import Bitacora from './components/Bitacora'; 
import Calendario from './Calendario';
import Reportes from './Reportes'; 

function ProtectedRoute({ children, rolesPermitidos }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Validación de Rol 
  if (rolesPermitidos && !rolesPermitidos.includes(user?.rol)) {
     return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      {children}
    </Layout>
  );
}

function App() {

  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/alumnos" 
        element={
          <ProtectedRoute>
            <Alumnos />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/carreras" 
        element={
          <ProtectedRoute>
            <Carreras />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/personal" 
        element={
          <ProtectedRoute>
            <Personal />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/usuarios" 
        element={
          <ProtectedRoute>
            <Usuarios />
          </ProtectedRoute>
         } 
      />
      <Route 
        path="/admin/config" 
        element={
          <ProtectedRoute>
            <Configuracion />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/reportes" 
        element={
          <ProtectedRoute rolesPermitidos={['Administrador']}>
            <Reportes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/perfil" 
        element={
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/expediente/:no_cuenta" 
        element={
          <ProtectedRoute>
            <ExpedienteDetalle />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/auditoria" 
        element={
          <ProtectedRoute rolesPermitidos={['Administrador']}>
             <Bitacora />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/calendario" 
        element={
        <ProtectedRoute>
          <Calendario />
        </ProtectedRoute>
        }
      />
      <Route
        path="/reportes" 
        element={
        <ProtectedRoute>
          <Reportes />
        </ProtectedRoute>} />
    </Routes>
  );
}

export default App;