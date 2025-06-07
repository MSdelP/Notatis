// server/src/routes/databases.js

const express = require('express');
const Database = require('../models/Database');
const Permission = require('../models/Permission');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// GET /api/databases
router.get('/', async (req, res) => {
  try {
    const dbs = await Database.find({ owner: req.user.id }).sort({ updatedAt: -1 });
    return res.json(dbs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error listando bases de datos' });
  }
});

// POST /api/databases
router.post('/', async (req, res) => {
  const { name, description, schema } = req.body;
  try {
    if (!name || !Array.isArray(schema)) {
      return res.status(400).json({ message: 'Debe enviar name y schema (array)' });
    }
    const newDb = await Database.create({
      owner: req.user.id,
      name,
      description: description || '',
      schema,
      entries: [],
    });
    await Permission.create({
      resourceType: 'database',
      resourceId: newDb._id,
      user: req.user.id,
      role: 'owner',
    });
    return res.status(201).json(newDb);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creando database' });
  }
});

// GET /api/databases/:id
router.get('/:id', async (req, res) => {
  try {
    const db = await Database.findById(req.params.id);
    if (!db) {
      return res.status(404).json({ message: 'Database no encontrada' });
    }
    const permiso = await Permission.findOne({
      resourceType: 'database',
      resourceId: db._id,
      user: req.user.id,
    });
    if (!permiso) {
      return res.status(403).json({ message: 'No tienes permiso para ver esta base' });
    }
    return res.json(db);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error obteniendo la database' });
  }
});

// PATCH /api/databases/:id
router.patch('/:id', async (req, res) => {
  const { name, description, schema } = req.body;
  try {
    const db = await Database.findById(req.params.id);
    if (!db) {
      return res.status(404).json({ message: 'Database no encontrada' });
    }
    const permiso = await Permission.findOne({
      resourceType: 'database',
      resourceId: db._id,
      user: req.user.id,
      role: 'owner',
    });
    if (!permiso) {
      return res.status(403).json({ message: 'No tienes permiso para editar esta base' });
    }
    if (typeof name === 'string') db.name = name;
    if (typeof description === 'string') db.description = description;
    if (Array.isArray(schema)) db.schema = schema;
    await db.save();
    return res.json(db);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error actualizando la database' });
  }
});

// DELETE /api/databases/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await Database.findById(req.params.id);
    if (!db) {
      return res.status(404).json({ message: 'Database no encontrada' });
    }
    const permiso = await Permission.findOne({
      resourceType: 'database',
      resourceId: db._id,
      user: req.user.id,
      role: 'owner',
    });
    if (!permiso) {
      return res.status(403).json({ message: 'No tienes permiso para borrar esta base' });
    }
    await db.deleteOne();
    await Permission.deleteMany({
      resourceType: 'database',
      resourceId: req.params.id,
    });
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error borrando database' });
  }
});

// POST /api/databases/:id/entries
router.post('/:id/entries', async (req, res) => {
  const { data } = req.body;
  try {
    const db = await Database.findById(req.params.id);
    if (!db) {
      return res.status(404).json({ message: 'Database no encontrada' });
    }
    const permiso = await Permission.findOne({
      resourceType: 'database',
      resourceId: db._id,
      user: req.user.id,
      role: { $in: ['owner', 'edit'] },
    });
    if (!permiso) {
      return res.status(403).json({ message: 'No tienes permiso para agregar entradas' });
    }
    db.entries.push({ data });
    const saved = await db.save();
    const newEntry = saved.entries[saved.entries.length - 1];
    return res.status(201).json(newEntry);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creando entrada' });
  }
});

// PATCH /api/databases/:id/entries/:entryId
router.patch('/:id/entries/:entryId', async (req, res) => {
  const { data } = req.body;
  try {
    const db = await Database.findById(req.params.id);
    if (!db) {
      return res.status(404).json({ message: 'Database no encontrada' });
    }
    const permiso = await Permission.findOne({
      resourceType: 'database',
      resourceId: db._id,
      user: req.user.id,
      role: { $in: ['owner', 'edit'] },
    });
    if (!permiso) {
      return res.status(403).json({ message: 'No tienes permiso para editar entradas' });
    }
    // Encuentra la entry como subdocumento
    const entry = db.entries.id(req.params.entryId);
    if (!entry) {
      return res.status(404).json({ message: 'Entry no encontrada' });
    }
    entry.data = data;
    await db.save();
    return res.json(entry);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error actualizando entrada' });
  }
});

// DELETE /api/databases/:id/entries/:entryId
router.delete('/:id/entries/:entryId', async (req, res) => {
  try {
    const db = await Database.findById(req.params.id);
    if (!db) {
      return res.status(404).json({ message: 'Database no encontrada' });
    }
    const permiso = await Permission.findOne({
      resourceType: 'database',
      resourceId: db._id,
      user: req.user.id,
      role: { $in: ['owner', 'edit'] },
    });
    if (!permiso) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar entradas' });
    }
    // En lugar de entry.remove(), filtramos el array manualmente:
    const entryIndex = db.entries.findIndex((e) => e._id.toString() === req.params.entryId);
    if (entryIndex === -1) {
      return res.status(404).json({ message: 'Entry no encontrada' });
    }
    // quitamos esa entry
    db.entries.splice(entryIndex, 1);
    await db.save();
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error borrando entrada' });
  }
});

module.exports = router;

