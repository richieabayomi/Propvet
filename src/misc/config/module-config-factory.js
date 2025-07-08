module.exports.userModuleConfigFactory = (env) => ({
    jwt: {
      secretKey: env.JWT_SECRET_KEY,
      expiry: Number(env.USER_MODULE_JWT_EXPIRES_IN_MINUTES),
    },
    securityTokens: {
      schedulerToken: env.SCHEDULER_SECURITY_TOKEN,
    },
    queues: {
      messageBroker: env.ASYNC_MESSAGE_BROKER_QUEUE,
    },
  });