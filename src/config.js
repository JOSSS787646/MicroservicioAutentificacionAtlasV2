require('dotenv').config(); // carga variables del .env

module.exports = {
  port: process.env.PORT || 4000,
  mongodbUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
};
