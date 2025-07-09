require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  mongodbUri: process.env.MONGO_URI,   // Aquí debe coincidir el nombre exacto de la variable
  jwtSecret: process.env.JWT_SECRET,
};
