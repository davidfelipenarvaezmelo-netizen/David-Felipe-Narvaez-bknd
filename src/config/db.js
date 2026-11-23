const mongoose = require('mongoose');

const RETRY_DELAY_MS = 5000;
const MAX_RETRY_DELAY_MS = 60000;

let retryDelay = RETRY_DELAY_MS;
let attempt = 0;

mongoose.connection.on('connected', () => {
  console.log('[MongoDB] Conexión activa');
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Conexión perdida; el driver intentará reconectarse');
});

/**
 * Conecta a MongoDB con reintentos indefinidos y backoff exponencial
 * (5 s, 10 s, 20 s... hasta 60 s).
 *
 * Importante: el servidor HTTP arranca sin esperar esta promesa, para que
 * Render no marque el despliegue como fallido mientras Atlas responde o
 * mientras se corrige la lista de IPs permitidas.
 */
const connectDB = () => {
  attempt += 1;

  return mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rutas_seguras', {
      serverSelectionTimeoutMS: 10000,
    })
    .then((conn) => {
      console.log(
        `[MongoDB] Conectado exitosamente a: ${conn.connection.host}/${conn.connection.name}`
      );
      retryDelay = RETRY_DELAY_MS;
      return conn;
    })
    .catch((error) => {
      console.error(`[MongoDB Error] Intento ${attempt}: ${error.message}`);

      const message = error.message || '';

      if (message.includes('whitelist') || message.includes('IP')) {
        console.error(
          '[MongoDB] Atlas rechazó la IP. Ve a Network Access y agrega 0.0.0.0/0 ' +
            '(plan gratuito) o la IP de salida de tu servicio en Render.'
        );
      }

      if (message.includes('authentication failed')) {
        console.error(
          '[MongoDB] Usuario o contraseña incorrectos. Revisa MONGODB_URI y codifica ' +
            'los caracteres especiales de la contraseña (@ : / ? # [ ] %).'
        );
      }

      if (message.includes('ENOTFOUND') || message.includes('querySrv')) {
        console.error(
          '[MongoDB] No se pudo resolver el host. Verifica el nombre del clúster en MONGODB_URI.'
        );
      }

      const delay = retryDelay;
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY_MS);
      console.warn(`[MongoDB] Reintentando en ${Math.round(delay / 1000)} s...`);

      return new Promise((resolve) => {
        setTimeout(() => resolve(connectDB()), delay);
      });
    });
};

module.exports = connectDB;
