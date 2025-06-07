require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Rutas
const authRoutes = require('./routes/auth');
const databasesRoutes = require('./routes/databases');
const permissionsRoutes = require('./routes/permissions');
const pagesRoutes = require('./routes/pages');
const pageVersionsRoutes = require('./routes/pageVersions');

// Middleware de protección
const { protect } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// 1) Conectar a MongoDB
connectDB();

// 2) Configuración de CORS reforzada
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',  // e.g. https://notitas-39d7.onrender.com
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};
app.use(cors(corsOptions));
// Responder preflight en todas las rutas
app.options('*', cors(corsOptions));

// 3) Parseo de JSON
app.use(express.json());

// 4) Rutas públicas (Auth)
app.use('/api/auth', authRoutes);

// 5) Rutas protegidas
app.use('/api/databases', protect, databasesRoutes);
app.use('/api/permissions', protect, permissionsRoutes);
app.use('/api/pages', protect, pagesRoutes);
app.use('/api/pages/:id/versions', protect, pageVersionsRoutes);

// 6) Servir frontend en producción (si existe carpeta build)
if (process.env.NODE_ENV === 'production') {
  // Ajusta esta ruta según tu estructura de carpetas en Render
  const clientBuildPath = path.resolve(__dirname, '..', 'Notitas_Web', 'build');
  const indexHtml = path.join(clientBuildPath, 'index.html');

  const fs = require('fs');
  if (fs.existsSync(indexHtml)) {
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => res.sendFile(indexHtml));
    console.log('✔ Serviendo frontend desde:', clientBuildPath);
  } else {
    console.warn('⚠ build de frontend no encontrado en', clientBuildPath);
  }
}

// 7) Manejador global de errores
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Error de servidor' });
});

// 8) Iniciar servidor
app.listen(PORT, () => console.log(`🚀 Server corriendo en puerto ${PORT}`));
