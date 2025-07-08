const { app } = require('../../server');


let connection;

const initializeWebServer = (customMiddleware) => {
  return new Promise((resolve, reject) => {
    try {
      //add middlewares
      if (customMiddleware) {
        app.use(customMiddleware);
      }



      //start server
      const webServerPort = process.env.PORT ? process.env.PORT : null;
      connection = app.listen(webServerPort, () => {
        console.log(`Web server started on port ${webServerPort}`);
        resolve(connection.address());
      });

    } catch (error) {
      console.error('Error while initialising the web server \n', error)
      process.exit()
    }
  });
};

const stopWebServer = () => {
  return new Promise((resolve, reject) => {
    if (connection && connection.close) {
      connection.close(() => {
        resolve();
      });
    }
  });
};

process.on('uncaughtException', (error) => {
    //TODO:
    //send email and log
});

process.on('unhandledRejection', (reason) => {
      //TODO:
    //send email and log
});

module.exports.initializeWebServer = initializeWebServer;
module.exports.stopWebServer = stopWebServer;