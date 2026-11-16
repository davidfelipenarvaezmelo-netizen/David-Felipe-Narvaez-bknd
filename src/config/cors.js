/**
 * Configuración centralizada de CORS.
 *
 * En producción (Render) el frontend se configura con FRONTEND_URL.
 * Se mantiene CLIENT_URL como respaldo para no romper configuraciones
 * anteriores. Se admite una lista separada por comas para permitir
 * varios orígenes (por ejemplo, producción + localhost).
 *
 * Ejemplo:
 *   FRONTEND_URL=https://rutas-seguras-xi.vercel.app,http://localhost:5173
 */

const DEFAULT_ORIGINS = ['http://localhost:5173'];

const parseOrigins = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
};

const getAllowedOrigins = () => {
  const configured = parseOrigins(process.env.FRONTEND_URL || process.env.CLIENT_URL);
  return configured.length > 0 ? configured : DEFAULT_ORIGINS;
};

const isOriginAllowed = (origin, allowedOrigins) => {
  if (!origin) return true; // Postman, health checks, server-to-server
  if (allowedOrigins.includes('*')) return true;

  const normalized = origin.replace(/\/+$/, '');
  return allowedOrigins.includes(normalized);
};

/**
 * Opciones para el middleware `cors` de Express.
 * Se pasa una función para evaluar el origen en cada petición.
 */
const corsOptions = () => {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (isOriginAllowed(origin, allowedOrigins)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Origen bloqueado: ${origin}. Permitidos: ${allowedOrigins.join(', ')}`);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  };
};

/**
 * Opciones de CORS para Socket.io (no acepta funciones en `origin`,
 * por eso se entrega el arreglo ya resuelto).
 */
const socketCorsOptions = () => {
  const allowedOrigins = getAllowedOrigins();
  const allowAll = allowedOrigins.includes('*');

  return {
    origin: allowAll ? '*' : allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: !allowAll,
  };
};

module.exports = {
  getAllowedOrigins,
  corsOptions,
  socketCorsOptions,
};
