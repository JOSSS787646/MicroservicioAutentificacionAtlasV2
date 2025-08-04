require('dotenv').config(); // carga variables del .env

module.exports = {
  port: process.env.PORT || 4000,
  mongodbUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtIssuer: process.env.JWT_ISSUER,
  jwtAudience: process.env.JWT_AUDIENCE,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
};

