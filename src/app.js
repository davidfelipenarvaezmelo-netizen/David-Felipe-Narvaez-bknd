const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const errorHandler = require('./middlewares/errorHandler');
const { corsOptions } = require('./config/cors');

const reportRoutes = require('./routes/reportRoutes');
const alertRoutes = require('./routes/alertRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Ocultar la firma del servidor
app.disable('x-powered-by');

// Middlewares
app.use(cors(corsOptions()));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

// Liveness: responde 200 aunque la base de datos esté caída (para Render)
app.get('/api/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Readiness: comprueba también el estado de MongoDB
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDatabaseUp = dbState === 1;

  res.status(isDatabaseUp ? 200 : 503).json({
    status: isDatabaseUp ? 'online' : 'degraded',
    app: 'Rutas Seguras API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: DB_STATES[dbState] || 'unknown',
      name: mongoose.connection.name || null,
    },
    auth: {
      jwtSecretConfigured: Boolean(process.env.JWT_SECRET),
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);

// Manejo de rutas inexistentes (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
  });
});

// Middleware centralizado de errores
app.use(errorHandler);

module.exports = app;
