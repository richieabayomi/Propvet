const { Database } = require('./database');
const ApiResponse = require('./api-response');

function getConfig(env) {
  return env === 'test' ? process.env.TEST_DATABASE_URL
    : env === 'development' ? process.env.DEVELOPMENT_DATABASE_URL
    : env === 'staging' ? process.env.STAGING_DATABASE_URL
    : process.env.PRODUCTION_DATABASE_URL;
}

async function init(env) {
  if (!Database.connection.readyState) {
    const config = getConfig(env);
    try {
      await Database.connect(config, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('DB connection up... using %s database connection...', process.env.NODE_ENV);
    } catch (err) {
      console.error('Error connecting to database:', err);
      throw err;
    }
  }

  return Database;
}

async function middleware(res, next) {
  try {
    await init(process.env.NODE_ENV);
    next();
  } catch (error) {
    console.error('Database error in middleware:', error);
    return ApiResponse.error(res, error);
  }
}

async function openDatabaseConnection(environment) {
  try {
    const conn = await init(environment);
    return conn;
  } catch (error) {
    console.error('Error initiating database:', error);
    throw error;
  }
}

function closeDatabaseConnection() {
  if (Database && Database.connection && Database.connection.readyState === 1) {
    Database.connection
      .close()
      .catch((e) => console.error('Error while closing database connection\n', e));
  }
}

function dropDatabase() {
  if (Database && Database.connection) {
    Database.connection
      .dropDatabase()
      .catch((e) => console.error('Error while dropping the database\n', e));
  }
}

function dropCollection(collectionName) {
  if (Database && Database.connection) {
    Database.connection
      .dropCollection(collectionName)
      .catch((e) => console.error(`Error while dropping database collection for ${collectionName}\n`, e));
  }
}

function createCollection(collectionName) {
  if (Database && Database.connection) {
    Database.connection
      .createCollection(collectionName)
      .catch((e) => console.error(`Error while creating database collection for ${collectionName}\n`, e));
  }
}

function deleteAllCollectionRecords(dbContext) {
  if (dbContext && dbContext instanceof Database.Model && dbContext.deleteMany) {
    dbContext.deleteMany({})
      .then()
      .catch(e => console.error('Error while deleting all records from collection\n', e));
  }
}

module.exports = {
  initialiseDatabase: init,
  databaseMiddleware: middleware,
  openDatabaseConnection,
  closeDatabaseConnection,
  dropDatabase,
  createCollection,
  dropCollection,
  deleteAllCollectionRecords,
};
