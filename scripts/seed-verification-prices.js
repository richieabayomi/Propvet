const mongoose = require('mongoose');
const VerificationPrice = require('../src/domain/entities/verification/verificationPrice');
require('dotenv').config();

const seedVerificationPrices = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.DEVELOPMENT_DATABASE_URL || 'mongodb://localhost:27017/propvet';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if prices already exist
    const existingPrices = await VerificationPrice.find();
    if (existingPrices.length > 0) {
      console.log('Verification prices already exist:');
      existingPrices.forEach(price => {
        console.log(`- ${price.type}: ₦${price.price}`);
      });
      return;
    }

    // Create default verification prices
    const defaultPrices = [
      {
        type: 'NORMAL',
        price: 5000 // ₦5,000 for normal verification
      },
      {
        type: 'EXPRESS',
        price: 10000 // ₦10,000 for express verification
      }
    ];

    // Insert the prices
    await VerificationPrice.insertMany(defaultPrices);
    console.log('✅ Verification prices seeded successfully:');
    defaultPrices.forEach(price => {
      console.log(`- ${price.type}: ₦${price.price}`);
    });

  } catch (error) {
    console.error('❌ Error seeding verification prices:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeder
if (require.main === module) {
  seedVerificationPrices();
}

module.exports = seedVerificationPrices;
