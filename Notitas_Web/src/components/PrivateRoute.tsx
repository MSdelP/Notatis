// src/components/PrivateRoute.tsx
import React, { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

interface PrivateRouteProps {
  children: ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { token } = useContext(AuthContext);

  // Si no hay token, redirige a /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si existe token, renderiza el componente hijo
  return children;
};

export default PrivateRoute;
