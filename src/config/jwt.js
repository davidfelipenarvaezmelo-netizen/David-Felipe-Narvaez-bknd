const crypto = require('crypto');

/**
 * Secreto único para firmar y verificar JWT.
 *
 * Si JWT_SECRET no está definido, se genera uno temporal en memoria para que
 * el servicio pueda desplegarse y funcionar. Desventaja: al reiniciar el
 * proceso (o cuando Render duerme la instancia) las sesiones emitidas dejan
 * de ser válidas. En producción conviene definir JWT_SECRET.
 */
let secret = process.env.JWT_SECRET;

if (!secret) {
  secret = crypto.randomBytes(48).toString('base64url');
  console.warn(
    '[Auth] JWT_SECRET no está configurado. Se generó un secreto temporal: ' +
      'las sesiones se cerrarán cuando el servicio se reinicie. ' +
      'Agrega JWT_SECRET en las variables de entorno para sesiones persistentes.'
  );
} else {
  console.log(`[Auth] JWT_SECRET configurado (${secret.length} caracteres)`);
}

module.exports = secret;
