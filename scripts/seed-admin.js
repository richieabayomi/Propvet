require('dotenv').config(); // Load env variables

const initialiseDatabase = require('../src/misc/services/database-connection').initialiseDatabase;
const seedAdminUser = require('../src/misc/config/seedAdminUser');

(async function runSeeder() {
  try {
    console.log('🌱 Connecting to database...');
    await initialiseDatabase(process.env.NODE_ENV);
    console.log('✅ Database connected.');

    await seedAdminUser(); 

    console.log('✅ Seeder finished.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder failed:', err);
    process.exit(1);
  }
})();
