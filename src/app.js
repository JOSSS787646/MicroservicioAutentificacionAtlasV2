const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swaggerConfig');
const { port } = require('./config');
const conectarDB = require('./database');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Documentación Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas
app.use('/api/auth', authRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.send('🚀 Microservicio de Autenticación funcionando');
});

// Conectar a la base de datos y levantar servidor
conectarDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ Servidor autenticación corriendo en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('❌ No se pudo iniciar el servidor debido a un error de conexión a MongoDB:', error);
  });
