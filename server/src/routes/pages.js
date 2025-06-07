// server/src/routes/pages.js

const express = require('express');
const Page = require('../models/Page');
const PageVersion = require('../models/PageVersion'); // <— Importamos el nuevo modelo
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// ========================================================
// GET /api/pages
// Listar todas las páginas del usuario autenticado
router.get('/', protect, async (req, res) => {
  try {
    const pages = await Page.find({ owner: req.user.id }).sort({ updatedAt: -1 });
    return res.json(pages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error listando páginas' });
  }
});

// ========================================================
// GET /api/pages/:id
// Detalle de una página (si es owner o si tiene permiso VIEW/EDIT)
// **Nota**: aún no chequeamos permisos distintos de owner; asumimos que el middleware authMiddleware
//        da solamente acceso al owner (si se desea, más adelante se puede ampliar al esquema de permisos).
router.get('/:id', protect, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Página no encontrada' });
    // Comprobar que quien viste sea el owner
    if (page.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para ver esta página' });
    }
    return res.json(page);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error obteniendo la página' });
  }
});

// ========================================================
// POST /api/pages
// Crear nueva página
router.post('/', protect, async (req, res) => {
  const { title, blocks } = req.body;
  try {
    const page = new Page({
      owner: req.user.id,
      title: title || 'Untitled',
      blocks: blocks || []
    });
    await page.save();
    return res.status(201).json(page);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creando la página' });
  }
});

// ========================================================
// PATCH /api/pages/:id
// Actualizar página (título y/o bloques). Antes de sobrescribir, guardamos la versión previa.
router.patch('/:id', protect, async (req, res) => {
  const { title, blocks } = req.body;

  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Página no encontrada' });
    if (page.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para editar esta página' });
    }

    // 1) Crear un PageVersion con el estado ANTERIOR
    const previousVersion = {
      page: page._id,
      title: page.title,
      blocks: page.blocks.map((blk) => ({
        type: blk.type,
        data: blk.data,
        order: blk.order
      }))
    };
    await PageVersion.create(previousVersion);

    // 2) Sobrescribimos con los nuevos valores que vienen en el body
    if (title !== undefined) page.title = title;
    if (Array.isArray(blocks)) page.blocks = blocks;

    await page.save();
    return res.json(page);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error actualizando la página' });
  }
});

// ========================================================
// DELETE /api/pages/:id
// Borrar página (solo si es owner)
router.delete('/:id', protect, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Página no encontrada' });
    if (page.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para borrar esta página' });
    }
    await page.deleteOne();
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error borrando la página' });
  }
});

module.exports = router;
