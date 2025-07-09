const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swaggerConfig'); // Asegúrate de tener este archivo

const { port } = require('./config');
const conectarDB = require('./database');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
//app.use(cors());
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
