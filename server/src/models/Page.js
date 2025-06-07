// server/src/models/Page.js

const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['text', 'heading', 'databaseEmbed', 'mediaEmbed'], // <-- Se añade 'mediaEmbed'
      required: true
    },
    data: {
      type: Object,
      required: true
      // Para mediaEmbed, esperamos algo como: { url: 'https://...' }
    },
    order: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const pageSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      default: 'Untitled'
    },
    blocks: [blockSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Page', pageSchema);
