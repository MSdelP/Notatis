import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <div className="dashboard-container">
      <h2>Bienvenido, {user?.email}</h2>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
};

export default Dashboard;
