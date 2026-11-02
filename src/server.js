require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const setupSocket = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

// Crear servidor HTTP integrado con Express
const server = http.createServer(app);

// Configurar WebSockets con Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Guardar instancia de io en la app de express para poder usarla en controladores
app.set('io', io);

// Inicializar sockets
setupSocket(io);

// Iniciar base de datos y levantar servidor
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Servidor de Rutas Seguras iniciado en el puerto: ${PORT}`);
    console.log(`📡 URL API: http://localhost:${PORT}/api/health`);
    console.log(`⚡ Sockets listos para alertas en tiempo real`);
    console.log(`====================================================`);
  });
};

startServer();

