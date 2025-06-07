// server/src/routes/pageVersions.js

const express = require('express');
const Page = require('../models/Page');
const PageVersion = require('../models/PageVersion');
const Permission = require('../models/Permission');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });
// mergeParams: para poder leer req.params.id (el :id de /pages/:id/versions)


// ========================================================
// Middleware auxiliar: comprobar que la página existe y que req.user es OWNER
async function checkPageOwner(req, res, next) {
  try {
    const pageId = req.params.id;
    const page = await Page.findById(pageId);
    if (!page) return res.status(404).json({ message: 'Página no encontrada' });

    // Comprobar que el user autenticado es el owner
    if (page.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado: solo el owner puede gestionar el historial' });
    }

    // Adjuntamos la página al request para reusar
    req.page = page;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno' });
  }
}


// ========================================================
// GET /api/pages/:id/versions
// Devuelve lista de versiones de esta página, ordenada de más reciente a más antigua.
router.get('/', protect, checkPageOwner, async (req, res) => {
  try {
    const pageId = req.params.id;
    const versions = await PageVersion.find({ page: pageId })
      .sort({ createdAt: -1 })
      .select('_id createdAt title');
    return res.json(versions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error listando versiones' });
  }
});

// ========================================================
// GET /api/pages/:id/versions/:versionId
// Devuelve los datos completos de esa versión (title + blocks)
router.get('/:versionId', protect, checkPageOwner, async (req, res) => {
  try {
    const { id: pageId, versionId } = req.params;
    const version = await PageVersion.findOne({ _id: versionId, page: pageId });
    if (!version) return res.status(404).json({ message: 'Versión no encontrada' });

    return res.json(version);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error obteniendo la versión' });
  }
});

// ========================================================
// POST /api/pages/:id/versions/:versionId/revert
// Revertir la página a esa versión. 
// 1) Guardar la versión actual como snapshot (antes de sobrescribir). 
// 2) Sobrescribir page.title y page.blocks con la versión pasada.
// 3) Retornar la página actualizada.
router.post('/:versionId/revert', protect, checkPageOwner, async (req, res) => {
  try {
    const { id: pageId, versionId } = req.params;
    const version = await PageVersion.findOne({ _id: versionId, page: pageId });
    if (!version) return res.status(404).json({ message: 'Versión no encontrada' });

    // 1) Guardar la versión actual en PageVersion
    const page = await Page.findById(pageId);
    const snapshot = {
      page: pageId,
      title: page.title,
      blocks: page.blocks.map((blk) => ({
        type: blk.type,
        data: blk.data,
        order: blk.order
      }))
    };
    await PageVersion.create(snapshot);

    // 2) Reemplazar la página con los datos de la versión seleccionada
    page.title = version.title;
    page.blocks = version.blocks.map((blk) => ({
      type: blk.type,
      data: blk.data,
      order: blk.order
    }));

    await page.save();
    return res.json(page);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error revirtiendo la página' });
  }
});

module.exports = router;
