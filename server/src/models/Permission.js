// server/src/models/Permission.js
const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    resourceType: {
      type: String,
      enum: ['page', 'database'],
      required: true
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'resourceType'
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: ['owner', 'edit', 'view'],
      default: 'view'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Permission', permissionSchema);
