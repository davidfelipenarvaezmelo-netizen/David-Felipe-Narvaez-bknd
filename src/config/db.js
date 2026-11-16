const mongoose = require('mongoose');

const connectDB = async () => {
  const uri =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rutaseguras';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(
      `[MongoDB] Conectado exitosamente a: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (error) {
    console.error(`[MongoDB Error] No se pudo conectar: ${error.message}`);

    if (process.env.NODE_ENV === 'production') {
      console.error('[MongoDB Error] En producción el servidor se detiene para reintentar.');
      process.exit(1);
    }

    console.warn(
      '[MongoDB Aviso] Revisa MONGODB_URI y que el clúster de Atlas permita la IP del servidor.'
    );
  }
};

module.exports = connectDB;

