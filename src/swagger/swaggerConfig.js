const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Microservicio de Autenticación',
    version: '1.0.0',
    description: 'API para login, registro y recuperación de contraseña',
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Servidor local',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['src/controllers/*.js'], // Archivos donde documentarás los endpoints
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
