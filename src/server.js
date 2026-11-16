require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const seedDefaultAdmin = require('./config/seedAdmin');
const setupSocket = require('./sockets/socketHandler');
const { socketCorsOptions, getAllowedOrigins } = require('./config/cors');

const PORT = process.env.PORT || 5000;

// En producción el secreto JWT es obligatorio (no usar el valor de desarrollo)
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('[Auth] Falta la variable JWT_SECRET. El servidor no puede iniciar de forma segura.');
  process.exit(1);
}

// Crear servidor HTTP integrado con Express
const server = http.createServer(app);

// Configurar WebSockets con Socket.io
const io = new Server(server, {
  cors: socketCorsOptions(),
});

// Guardar instancia de io en la app de express para poder usarla en controladores
app.set('io', io);

// Inicializar sockets
setupSocket(io);

// Iniciar base de datos y levantar servidor
const startServer = async () => {
  await connectDB();

  // Usuario administrador por defecto (si la base está disponible)
  try {
    await seedDefaultAdmin();
  } catch (error) {
    console.error(`[Seed Error] No se pudo crear el administrador: ${error.message}`);
  }

  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Servidor de Rutas Seguras iniciado en el puerto: ${PORT}`);
    console.log(`📡 URL API: http://localhost:${PORT}/api/health`);
    console.log(`⚡ Sockets listos para alertas en tiempo real`);
    console.log(`🌐 Orígenes CORS permitidos: ${getAllowedOrigins().join(', ')}`);
    console.log(`====================================================`);
  });
};

startServer();

