const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middlewares/auth');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const USERNAME_REGEX = /^[a-z0-9._-]{3,30}$/;

const signToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const buildAuthResponse = (user) => ({
  user: user.toPublicJSON(),
  token: signToken(user),
  tokenType: 'Bearer',
  expiresIn: JWT_EXPIRES_IN,
});

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body || {};

    if (
      typeof username !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Usuario, correo y contraseña son obligatorios',
      });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (!USERNAME_REGEX.test(normalizedUsername)) {
      return res.status(400).json({
        success: false,
        message:
          'El usuario debe tener entre 3 y 30 caracteres y solo letras, números, puntos, guiones o guiones bajos',
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico no es válido',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres',
      });
    }

    const existing = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          existing.username === normalizedUsername
            ? 'Ese nombre de usuario ya está registrado'
            : 'Ese correo electrónico ya está registrado',
      });
    }

    const user = await User.create({
      name: typeof name === 'string' && name.trim() ? name.trim() : normalizedUsername,
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      role: 'user',
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: buildAuthResponse(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'El usuario o el correo ya están registrados',
      });
    }
    return next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { identifier, username, email, password } = req.body || {};
    const loginId = identifier || username || email;

    if (typeof loginId !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Usuario (o correo) y contraseña son obligatorios',
      });
    }

    const normalizedId = loginId.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ username: normalizedId }, { email: normalizedId }],
    }).select('+password');

    // Mensaje genérico para no filtrar si el usuario existe
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'La cuenta está desactivada, contacta al administrador',
      });
    }

    const passwordMatches = await user.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: buildAuthResponse(user),
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user.toPublicJSON() },
  });
};

// GET /api/auth/users (solo admin)
const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      count: users.length,
      data: users.map((user) => user.toPublicJSON()),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  listUsers,
};
