require('dotenv').config();
const SystemHealthChecker = require('./src/misc/services/system-health-checker');

async function checkSystemHealth() {
  console.log('Propvet Application Startup');
  console.log('==============================');
  console.log('Running comprehensive system health check...\n');

  const healthChecker = new SystemHealthChecker();
  const results = await healthChecker.runAllChecks();
  
  if (!results.success) {
    console.log('\n STARTUP ABORTED - System health check failed');
    console.log(' Critical issues must be resolved before the application can start.');
    console.log('\n Next Steps:');
    console.log('1. Follow the setup instructions above');
    console.log('2. Run "npm run health-check" to verify fixes');
    console.log('3. Run "npm start" again when all issues are resolved');
    
    // Provide exit code based on error types
    const hasConfigErrors = results.errors.some(e => e.category === 'configuration');
    const hasDependencyErrors = results.errors.some(e => e.category === 'dependency');
    
    if (hasDependencyErrors) {
      console.log('\n💡 Quick fix: Try running "npm install" first');
      process.exit(2); // Dependency error
    } else if (hasConfigErrors) {
      console.log('\n💡 Quick fix: Check your .env file configuration');
      process.exit(3); // Configuration error
    } else {
      process.exit(1); // General error
    }
  }
  
  console.log('\n🎉 System health check passed - starting application...');
  console.log('========================================================\n');
  
  try {
    // If all checks pass, start the actual server
    require('./src/server.js');
  } catch (startupError) {
    console.error('\n💥 Application startup failed:', startupError.message);
    console.error('Stack trace:', startupError.stack);
    process.exit(4); // Startup error
  }
}

// Graceful error handling
process.on('uncaughtException', (error) => {
  console.error('\n Uncaught Exception:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(5);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(6);
});

// Only run if this file is executed directly
if (require.main === module) {
  checkSystemHealth().catch(error => {
    console.error('\n Health check crashed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(7);
  });
}

module.exports = checkSystemHealth;
