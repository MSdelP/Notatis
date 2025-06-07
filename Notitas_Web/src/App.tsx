// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';
import { ThemeProvider } from './context/ThemeContext';

import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import PagesList from './pages/PagesList';
import PageDetail from './pages/PageDetail';
import DatabasesList from './pages/DatabasesList';
import DatabaseDetail from './pages/DatabaseDetail';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DatabaseProvider>
          <BrowserRouter>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Rutas protegidas: el path "/" renderiza Layout dentro de PrivateRoute */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to="/pages" replace />} />
                <Route path="pages" element={<PagesList />} />
                <Route path="pages/:id" element={<PageDetail />} />
                <Route path="databases" element={<DatabasesList />} />
                <Route path="databases/:id" element={<DatabaseDetail />} />
              </Route>

              {/* Cualquier ruta “*” redirige a "/" (que a su vez irá a /pages o /login) */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DatabaseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
