const bcrypt = require('bcrypt');
const UserRepository = require('../../infrastructure/Repository/user.repository');

require('dotenv').config();

const userRepository = new UserRepository();

async function seedAdminUser() {
          console.log('Ping');
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env');
    return;
  }

  try {
    const existingAdmin = await userRepository.getUserByEmail(email);
    if (existingAdmin) {
      console.log('✅ Admin user already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await userRepository.createUser({
      username: 'admin',
      email,
      password: hashedPassword,
      first_name: 'Super',
      last_name: 'Admin',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    console.log(`✅ Admin user seeded successfully: ${newAdmin.email}`);
  } catch (err) {
    console.error('❌ Failed to seed admin user:', err);
  }
}

module.exports = seedAdminUser;

