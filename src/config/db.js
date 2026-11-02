const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rutas_seguras');
    console.log(`[MongoDB] Conectado exitosamente a: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] Error al conectar a la base de datos: ${error.message}`);
    console.warn('[MongoDB Aviso] Asegúrate de tener el servicio de MongoDB en ejecución o configurar MONGODB_URI en .env.');
  }
};

module.exports = connectDB;

