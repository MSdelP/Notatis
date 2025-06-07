import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import axios from 'axios';

// === CONFIGURACIÓN DE AXIOS PARA PRODUCCIÓN ===
// process.env.REACT_APP_API_URL viene del entorno de Render al build time
axios.defaults.baseURL = process.env.REACT_APP_API_URL;
// si usas cookies: axios.defaults.withCredentials = true;
// ===============================================

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
