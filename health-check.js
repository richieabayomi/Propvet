#!/usr/bin/env node

require('dotenv').config();
const SystemHealthChecker = require('./src/misc/services/system-health-checker');

async function runHealthCheck() {
  console.log('🏥 Propvet System Health Check');
  console.log('=' * 40);
  console.log('Checking all dependencies and configurations...\n');

  const healthChecker = new SystemHealthChecker();
  const results = await healthChecker.runAllChecks();
  
  // Exit with appropriate code
  if (results.success) {
    console.log('\n✅ All systems operational!');
    process.exit(0);
  } else {
    console.log('\n❌ System not ready for production');
    process.exit(1);
  }
}

// Run the health check
runHealthCheck().catch(error => {
  console.error('💥 Health check crashed:', error.message);
  process.exit(1);
});
