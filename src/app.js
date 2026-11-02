const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');

const reportRoutes = require('./routes/reportRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Ruta de comprobación de salud (Health Check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Rutas Seguras API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de la API
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

