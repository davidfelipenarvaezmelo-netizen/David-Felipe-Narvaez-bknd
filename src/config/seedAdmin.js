const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Crea (o verifica) el usuario administrador por defecto.
 * Los valores se pueden cambiar con las variables de entorno:
 *   ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 */
const seedDefaultAdmin = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('[Seed] Omitido: MongoDB no está conectado');
    return null;
  }

  const username = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const email = (process.env.ADMIN_EMAIL || 'admin@rutaseguras.local').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'admin2026*';
  const name = process.env.ADMIN_NAME || 'Administrador';

  const existing = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existing) {
    let updated = false;

    if (existing.role !== 'admin') {
      existing.role = 'admin';
      updated = true;
    }

    if (!existing.isActive) {
      existing.isActive = true;
      updated = true;
    }

    // Permite rotar la contraseña del administrador desde las variables de entorno
    if (process.env.ADMIN_SYNC_PASSWORD === 'true') {
      existing.password = password;
      updated = true;
    }

    if (updated) {
      await existing.save({ validateBeforeSave: false });
      console.log(`[Seed] Usuario "${existing.username}" promovido a administrador`);
    } else {
      console.log(`[Seed] Usuario administrador "${existing.username}" verificado`);
    }

    return existing;
  }

  const admin = await User.create({
    name,
    username,
    email,
    password,
    role: 'admin',
  });

  console.log(`[Seed] Usuario administrador "${admin.username}" creado correctamente`);
  return admin;
};

module.exports = seedDefaultAdmin;
