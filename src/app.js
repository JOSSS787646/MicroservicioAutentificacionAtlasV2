const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swaggerConfig');
require('dotenv').config();
const { port } = require('./config');
const conectarDB = require('./database');
const authRoutes = require('./routes/authRoutes');

const app = express();

// ✅ Middleware para permitir CORS desde cualquier origen
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Conectar a MongoDB
conectarDB();

// Rutas
app.use('/api/auth', authRoutes);

// Swagger Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ruta base
app.get('/', (req, res) => {
  res.send('Microservicio de Autenticación funcionando 🚀');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`✅ Servidor autenticación corriendo en http://localhost:${port}`);
});
