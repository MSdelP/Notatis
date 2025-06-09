// server/src/models/PageVersion.js

const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['text', 'heading', 'databaseEmbed', 'mediaEmbed'], // ← se añade 'mediaEmbed'
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
      // Para mediaEmbed, esperamos: { url: 'https://...' }
    },
    order: {
      type: Number,
      required: true
    },
    // Si algún bloque anida otros bloques (por ejemplo listas),
    // podemos usar recursivamente el mismo esquema:
    blocks: [new mongoose.Schema(
      {
        type: {
          type: String,
          enum: ['text', 'heading', 'databaseEmbed', 'mediaEmbed'],
          required: true
        },
        data: {
          type: mongoose.Schema.Types.Mixed,
          required: true
        },
        order: {
          type: Number,
          required: true
        },
        blocks: [] // para evitar referencia circular infinita
      },
      { _id: false, timestamps: false }
    )]
  },
  {
    _id: false, // que los sub-bloques no lleven su propio _id
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const pageVersionSchema = new mongoose.Schema(
  {
    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page',
      required: true
    },
    // Guardamos título y bloques tal como estaban
    title: {
      type: String,
      required: true
    },
    blocks: [blockSchema]
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Índice para recuperar rápido el historial de una página
pageVersionSchema.index({ page: 1, createdAt: -1 });

module.exports = mongoose.model('PageVersion', pageVersionSchema);
