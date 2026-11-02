const Alert = require('../models/Alert');

// Obtener todas las alertas activas
const getActiveAlerts = async (req, res, next) => {
  try {
    const now = new Date();
    const alerts = await Alert.find({
      isActive: true,
      expiresAt: { $gt: now },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// Crear una alerta de riesgo / emergencia en tiempo real
const createAlert = async (req, res, next) => {
  try {
    const { title, message, level, latitude, longitude, zoneName, radiusInMeters, durationMinutes } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Las coordenadas (latitud y longitud) son obligatorias para emitir una alerta',
      });
    }

    const duration = durationMinutes ? parseInt(durationMinutes, 10) : 120;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    const alert = await Alert.create({
      title,
      message,
      level: level || 'Precaución',
      radiusInMeters: radiusInMeters || 1000,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        zoneName: zoneName || 'Zona de Riesgo Detectada',
      },
      expiresAt,
    });

    // Notificar alerta urgente a través de WebSockets
    const io = req.app.get('io');
    if (io) {
      io.emit('urgent_safety_alert', alert);
    }

    res.status(201).json({
      success: true,
      message: 'Alerta de riesgo emitida a toda la red',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

// Desactivar alerta
const dismissAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada',
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('alert_dismissed', { id: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: 'Alerta desactivada',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveAlerts,
  createAlert,
  dismissAlert,
};

