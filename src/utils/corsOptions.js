const allowedOrigins = ['http://localhost:3000', 'https://tusitio.com'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
