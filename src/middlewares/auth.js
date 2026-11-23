const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = require('../config/jwt');

/**
 * Middleware de autenticación: valida el Bearer token
 * y adjunta el usuario a `req.user`.
 */
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Se requiere iniciar sesión (token no proporcionado)',
      });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'El usuario del token ya no existe',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'La cuenta está desactivada',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'La sesión expiró, inicia sesión nuevamente',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token inválido o alterado',
    });
  }
};

/**
 * Restringe el acceso a ciertos roles.
 * Uso: router.get('/ruta', protect, requireRole('admin'), handler)
 */
const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
      });
    }

    return next();
  };

module.exports = { protect, requireRole, JWT_SECRET };
