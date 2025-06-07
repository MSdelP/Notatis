// server/src/routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const router = express.Router();

// ─── Registro ───────────────────────────────────────────────────────────
// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1) Verificar si ya existe el usuario
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Usuario ya existe' });
    }

    // 2) Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // 3) Crear usuario
    const user = await User.create({ email, password: hashed });

    // 4) Generar JWT
    const token = generateToken(user);

    // 5) Devolver token y datos de usuario
    return res.status(201).json({
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    console.error('Error en REGISTER:', err);
    return res.status(500).json({ message: 'Error de servidor' });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1) Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // 2) Comparar contraseña
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // 3) Generar JWT
    const token = generateToken(user);

    // 4) Devolver token y datos de usuario
    return res.json({
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    console.error('Error en LOGIN:', err);
    return res.status(500).json({ message: 'Error de servidor' });
  }
});

// ─── Refresh Token ───────────────────────────────────────────────────────
// GET /api/auth/refresh-token
router.get('/refresh-token', async (req, res) => {
  try {
    // 1) Extraer token de cabecera Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }
    const oldToken = authHeader.split(' ')[1];

    // 2) Intentar verificarlo
    jwt.verify(oldToken, process.env.JWT_SECRET, async (err, decoded) => {
      let payload;
      if (err) {
        // Si no es expiración, rechazamos
        if (err.name !== 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token inválido' });
        }
        // Si expiró, decodificamos para recuperar el payload
        payload = jwt.decode(oldToken);
      } else {
        payload = decoded;
      }

      // 3) Comprobar que el usuario sigue existiendo
      const user = await User.findById(payload.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // 4) Emitir nuevo token
      const newToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      return res.json({
        token: newToken,
        user: { id: user._id, email: user.email }
      });
    });
  } catch (err) {
    console.error('Error en REFRESH-TOKEN:', err);
    return res.status(500).json({ message: 'Error de servidor' });
  }
});

// ─── Logout ───────────────────────────────────────────────────────────────
// POST /api/auth/logout
// Simplemente devolvemos 204; el cliente borrará su token local
router.post('/logout', (req, res) => {
  return res.sendStatus(204);
});

module.exports = router;

