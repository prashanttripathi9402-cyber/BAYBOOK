require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 AutoFix Server listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}).catch((err) => {
  console.error('Failed to launch server:', err.message);
});
