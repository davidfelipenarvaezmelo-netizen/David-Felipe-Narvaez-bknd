# 🛡️ Rutas Seguras - Backend API

Servidor Node.js + Express con persistencia en MongoDB y alertas en tiempo real mediante WebSockets (Socket.io).

## 🚀 Tecnologías
- **Node.js**
- **Express.js**
- **MongoDB** con **Mongoose** (soporte para índices geoespaciales `2dsphere`)
- **Socket.io** (comunicación bidireccional en tiempo real para reportes y emergencias SOS)
- **Cors** & **Morgan**
- **Dotenv**

## 📂 Estructura del Proyecto
```
David-Felipe-Narvaez-bknd/
├── src/
│   ├── config/
│   │   └── db.js              # Conexión resiliente a MongoDB
│   ├── controllers/
│   │   ├── alertController.js # Lógica de alertas de emergencia
│   │   └── reportController.js# Lógica de reportes de zonas de riesgo
│   ├── middlewares/
│   │   └── errorHandler.js    # Manejo centralizado de excepciones
│   ├── models/
│   │   ├── Alert.js           # Esquema GeoJSON de alertas
│   │   └── Report.js          # Esquema GeoJSON de reportes
│   ├── routes/
│   │   ├── alertRoutes.js     # Endpoints /api/alerts
│   │   └── reportRoutes.js    # Endpoints /api/reports
│   ├── sockets/
│   │   └── socketHandler.js   # Eventos de WebSockets (tiempo real)
│   ├── app.js                 # Configuración de Express
│   └── server.js              # Arranque del servidor HTTP + Socket.io
├── .env.example
├── .gitignore
└── package.json
```

## ⚙️ Instalación y Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
Crea un archivo `.env` basado en `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/rutas_seguras
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

3. Iniciar el servidor:
```bash
# Modo desarrollo con nodemon
npm run dev

# Modo producción
npm start
```

## 📡 Endpoints Principales

- `GET /api/health` - Estado del servicio
- `GET /api/reports` - Listar reportes (permite filtros por cercanía `lat`, `lng`, `radiusKm`, `category`)
- `POST /api/reports` - Crear reporte de zona de riesgo (emite evento socket `new_risk_report`)
- `PATCH /api/reports/:id/confirm` - Confirmar reporte activo
- `DELETE /api/reports/:id` - Eliminar reporte
- `GET /api/alerts` - Listar alertas activas
- `POST /api/alerts` - Crear alerta de emergencia (emite evento socket `urgent_safety_alert`)
- `PATCH /api/alerts/:id/dismiss` - Desactivar alerta

## ⚡ Eventos Socket.io
- `new_risk_report`: Notificación a todos los clientes de una nueva zona de riesgo.
- `urgent_safety_alert`: Difusión masiva de alertas críticas o avisos de peligro.
- `send_panic_signal`: Recepción de señales SOS para retransmisión comunitaria (`panic_alert_received`).

## Autenticación de usuarios

Modelo `User` (colección `users`) con contraseña cifrada con bcrypt (12 rondas),
roles `user` y `admin`, estado `isActive` y fecha de último acceso.

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/auth/register | Registro: `{ name?, username, email, password }` |
| POST | /api/auth/login | Acceso: `{ identifier, password }` (usuario o correo) |
| GET | /api/auth/me | Perfil del usuario autenticado |
| GET | /api/auth/users | Listado paginado (solo rol admin) |

Las rutas protegidas esperan la cabecera:

```http
Authorization: Bearer <token>
```

El login responde con `data.user`, `data.token`, `data.tokenType` y `data.expiresIn`.

### Variables de entorno

```env
JWT_SECRET=secreto_largo_y_aleatorio
JWT_EXPIRES_IN=7d
ADMIN_NAME=Administrador
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@rutaseguras.local
ADMIN_PASSWORD=admin2026*
```

`JWT_SECRET` es obligatorio cuando `NODE_ENV=production`: si falta, el servidor no
inicia. Para generar uno:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### Administrador por defecto

Al arrancar, `seedAdmin` crea el usuario `admin` con la contraseña `admin2026*`
si no existe. Cambia `ADMIN_PASSWORD` en producción para no dejar las
credenciales por defecto.
