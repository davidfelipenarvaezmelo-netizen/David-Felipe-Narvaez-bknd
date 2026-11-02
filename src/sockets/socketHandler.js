const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Cliente conectado: ${socket.id}`);

    // Cliente puede unirse a una sala específica por ciudad/zona
    socket.on('join_zone', (zoneId) => {
      socket.join(`zone_${zoneId}`);
      console.log(`[Socket.io] Cliente ${socket.id} se unió a zone_${zoneId}`);
    });

    // Enviar alerta de pánico / SOS inmediato desde un usuario
    socket.on('send_panic_signal', (data) => {
      console.log(`[Socket.io] ALERTA SOS RECIBIDA de ${socket.id}:`, data);
      // Retransmitir a todos los clientes conectados
      io.emit('panic_alert_received', {
        id: `sos_${Date.now()}`,
        senderId: socket.id,
        timestamp: new Date(),
        location: data.location,
        message: data.message || '¡Señal SOS de usuario en peligro!',
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Cliente desconectado: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;

