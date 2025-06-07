const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ Conexión exitosa a MongoDB Atlas');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error de conexión:', error);
    process.exit(1);
  });
