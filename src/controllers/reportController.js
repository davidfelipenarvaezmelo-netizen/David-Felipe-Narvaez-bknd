const Report = require('../models/Report');

// Obtener todos los reportes (o filtrar por cercanía si se pasan coordenadas)
const getReports = async (req, res, next) => {
  try {
    const { lat, lng, radiusKm, category, status } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: 'Falso' };
    }

    // Si se envían coordenadas, búsqueda geoespacial
    if (lat && lng) {
      const radiusInMeters = (parseFloat(radiusKm) || 5) * 1000;
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      };
    }

    const reports = await Report.find(query).sort({ createdAt: -1 }).limit(100);

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un reporte por ID
const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo reporte de zona de riesgo
const createReport = async (req, res, next) => {
  try {
    const { title, description, category, severity, latitude, longitude, address, reportedBy } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Las coordenadas (latitud y longitud) son obligatorias',
      });
    }

    const newReport = await Report.create({
      title,
      description,
      category,
      severity,
      reportedBy: reportedBy || 'Usuario Anónimo',
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address: address || 'Ubicación reportada',
      },
    });

    // Notificar a todos los usuarios conectados en tiempo real vía Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('new_risk_report', newReport);
    }

    res.status(201).json({
      success: true,
      message: 'Reporte registrado y emitido en tiempo real',
      data: newReport,
    });
  } catch (error) {
    next(error);
  }
};

// Confirmar reporte existente (un usuario verifica que el riesgo sigue activo)
const confirmReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { $inc: { confirmationsCount: 1 } },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado',
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('report_confirmed', report);
    }

    res.status(200).json({
      success: true,
      message: 'Confirmación registrada con éxito',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un reporte
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado',
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('report_deleted', { id: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: 'Reporte eliminado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
  getReportById,
  createReport,
  confirmReport,
  deleteReport,
};

