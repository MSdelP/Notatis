// server/src/index.js
// Carga variables de entorno lo antes posible
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

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
const CLIENT_URL = process.env.CLIENT_URL || '*';

// 1) Verificar variable de entorno
if (!process.env.MONGO_URI) {
  console.error('❌ Error: la variable de entorno MONGO_URI no está definida.');
  process.exit(1);
}
console.log('📡 URI Mongo:', process.env.MONGO_URI);

// 2) Conectar a MongoDB con mongoose
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB conectado');

    // 3) Parseo de JSON
    app.use(express.json());

    // 4) Configuración de CORS reforzada
    const corsOptions = {
      origin: CLIENT_URL,
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));

    // 5) Rutas públicas (Auth)
    app.use('/api/auth', authRoutes);

    // 6) Rutas protegidas
    app.use('/api/databases', protect, databasesRoutes);
    app.use('/api/permissions', protect, permissionsRoutes);
    app.use('/api/pages', protect, pagesRoutes);
    app.use('/api/pages/:id/versions', protect, pageVersionsRoutes);

    // 7) Servir frontend en producción
    if (process.env.NODE_ENV === 'production') {
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

    // 8) Manejador global de errores
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ message: 'Error de servidor' });
    });

    // 9) Iniciar servidor
    app.listen(PORT, () => console.log(`🚀 Server corriendo en puerto ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection error:', err.message);
    process.exit(1);
  });
