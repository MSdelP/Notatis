// server/src/models/PageVersion.js

const mongoose = require('mongoose');

/**
 * Copiamos/adaptamos el mismo esquema de bloque que existe en Page.js,
 * para que cada versión guarde su propio array de bloques.
 */
const blockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['text', 'heading', 'databaseEmbed'],
      required: true
    },
    data: {
      type: Object,
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  },
  { _id: false } // Los subdocumentos no necesitan su propio _id aquí; opcional.
);

const pageVersionSchema = new mongoose.Schema(
  {
    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page',
      required: true
    },
    // Guardamos título y bloques de la página tal cual antes de actualizarla
    title: {
      type: String,
      required: true
    },
    blocks: [blockSchema],
    // createdAt se gestionará automáticamente con timestamps
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Índice para buscar rápido por page:
pageVersionSchema.index({ page: 1, createdAt: -1 });

module.exports = mongoose.model('PageVersion', pageVersionSchema);
