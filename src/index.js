require('dotenv').config();
const { initialiseDatabase } = require('./misc/services/database-connection');
const { initializeWebServer } = require('./misc/services/server-api');

async function startApp() {
  try {
    console.log('Environment:', process.env.NODE_ENV);
    console.log('DB URL:', process.env.DEVELOPMENT_DATABASE_URL);
    console.log('Port:', process.env.PORT);

    console.log('Starting app...');

    await initialiseDatabase(process.env.NODE_ENV);
    console.log('✅ Database initialized successfully');

    await initializeWebServer();
    console.log('✅ Web server started successfully');

    console.log('🚀 The app has started successfully');
  } catch (error) {
    console.error('❌ App error occurred during startup:', error);
    process.exit(1);
  }
}

startApp();
