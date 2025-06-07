// server/src/models/Database.js
const mongoose = require('mongoose');

// Schema para cada campo de la database
const fieldSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'number', 'date', 'select'],
    default: 'text'
  },
  options: [{ type: String }]
});

// Schema para cada entry (tarea) dentro de la database
const entrySchema = new mongoose.Schema(
  {
    data: { type: Map, of: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

// Schema principal de Database (proyecto)
const databaseSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' }, // <-- CAMPO NUEVO
    schema: [fieldSchema],
    entries: [entrySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Database', databaseSchema);
