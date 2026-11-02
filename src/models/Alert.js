const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título de la alerta es requerido'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'El mensaje de alerta es requerido'],
      trim: true,
    },
    level: {
      type: String,
      enum: ['Informativo', 'Precaución', 'Peligro', 'Emergencia'],
      default: 'Precaución',
    },
    radiusInMeters: {
      type: Number,
      default: 1000,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitud, latitud]
        required: true,
      },
      zoneName: {
        type: String,
        default: 'Zona General',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 2 * 60 * 60 * 1000), // 2 horas por defecto
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Alert', alertSchema);

