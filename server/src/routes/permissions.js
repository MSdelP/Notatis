const express = require('express');
const Permission = require('../models/Permission');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Protegemos todas las rutas
router.use(protect);

// POST /api/permissions
// Asignar o actualizar permiso a un usuario (solo ‘owner’ de resource)
router.post('/', async (req, res) => {
  const { resourceType, resourceId, email, role } = req.body;
  try {
    // 1) Verificar que el usuario que invoca es owner del recurso
    const permisoOwner = await Permission.findOne({
      resourceType,
      resourceId,
      user: req.user.id,
      role: 'owner'
    });
    if (!permisoOwner) {
      return res.status(403).json({ message: 'No tienes permiso para asignar permisos' });
    }

    // 2) Buscar al usuario a invitar por email
    const userInvitado = await User.findOne({ email });
    if (!userInvitado) {
      return res.status(404).json({ message: 'Usuario a invitar no existe' });
    }

    // 3) Si ya existe permiso previo, actualizar rol; si no, crear nuevo
    let permiso = await Permission.findOne({
      resourceType,
      resourceId,
      user: userInvitado._id
    });

    if (permiso) {
      permiso.role = role;
      await permiso.save();
    } else {
      permiso = await Permission.create({
        resourceType,
        resourceId,
        user: userInvitado._id,
        role
      });
    }

    return res.json(permiso);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error asignando permiso' });
  }
});

// GET /api/permissions
// Listar todos los permisos de un recurso
// Query: ?resourceType=database&resourceId=<id>
router.get('/', async (req, res) => {
  const { resourceType, resourceId } = req.query;
  if (!resourceType || !resourceId) {
    return res.status(400).json({ message: 'Faltan resourceType o resourceId en la query' });
  }

  try {
    // Solo el owner del recurso puede consultar la lista de permisos
    const permisoOwner = await Permission.findOne({
      resourceType,
      resourceId,
      user: req.user.id,
      role: 'owner'
    });
    if (!permisoOwner) {
      return res.status(403).json({ message: 'No tienes permiso para ver la lista de colaboradores' });
    }

    // Traer todos los permisos para ese recurso, con datos de usuario “populated”
    const permisos = await Permission.find({
      resourceType,
      resourceId
    }).populate('user', 'email'); // solo email del usuario

    return res.json(permisos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error obteniendo permisos' });
  }
});

// DELETE /api/permissions/:id
// Revocar permiso (solo owner)
router.delete('/:id', async (req, res) => {
  try {
    const permisoAEliminar = await Permission.findById(req.params.id);
    if (!permisoAEliminar) {
      return res.status(404).json({ message: 'Permiso no encontrado' });
    }

    // Validar que el user actual es owner del resource referenciado
    const ownerPermiso = await Permission.findOne({
      resourceType: permisoAEliminar.resourceType,
      resourceId: permisoAEliminar.resourceId,
      user: req.user.id,
      role: 'owner'
    });
    if (!ownerPermiso) {
      return res.status(403).json({ message: 'No tienes permiso para revocar permisos' });
    }

    // No permitir borrar el permiso del propio owner
    if (
      permisoAEliminar.user.toString() === req.user.id &&
      permisoAEliminar.role === 'owner'
    ) {
      return res.status(400).json({ message: 'No puedes revocar tu propio permiso de owner' });
    }

    await permisoAEliminar.deleteOne();
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error revocando permiso' });
  }
});

module.exports = router;
