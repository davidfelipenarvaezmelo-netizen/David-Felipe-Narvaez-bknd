const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del reporte es requerido'],
      trim: true,
      maxlength: [100, 'El título no puede exceder 100 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    category: {
      type: String,
      required: [true, 'La categoría es requerida'],
      enum: {
        values: [
          'Robo o Asalto',
          'Zona Oscura / Sin Iluminación',
          'Acoso Callejero',
          'Pelea o Disturbios',
          'Vía en Mal Estado / Obstáculo',
          'Sospechoso Merodeando',
          'Otro',
        ],
        message: '{VALUE} no es una categoría válida',
      },
      default: 'Zona Oscura / Sin Iluminación',
    },
    severity: {
      type: String,
      required: true,
      enum: ['Baja', 'Media', 'Alta', 'Crítica'],
      default: 'Media',
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
      address: {
        type: String,
        trim: true,
        default: 'Ubicación seleccionada en mapa',
      },
    },
    reportedBy: {
      type: String,
      default: 'Usuario Anónimo',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Activo', 'En Verificación', 'Resuelto', 'Falso'],
      default: 'Activo',
    },
    confirmationsCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Índice geoespacial 2dsphere para consultas por radio/cercanía
reportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', reportSchema);

