const mongoose = require('mongoose');
const { mongodbUri } = require('./config');

const conectarDB = async () => {
  try {
    await mongoose.connect(mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB', error);
    process.exit(1);
  }
};

module.exports = conectarDB;
