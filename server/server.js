const app = require('./app');
const mongoose = require('mongoose');

async function startServer() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error(
      'MongoDB URI is missing. Copy the project .env.example to server/.env and set MONGODB_URI to your MongoDB Atlas connection string.'
    );
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Set a private random value in server/.env.');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');

  const port = Number(process.env.PORT) || 5000;
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    console.error('HTTP server failed to start:', err.message);
    process.exitCode = 1;
  });
}

startServer().catch((err) => {
  console.error('Backend startup failed:', err.message);
  process.exitCode = 1;
});
