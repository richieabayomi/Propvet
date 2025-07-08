module.exports.production = {
    env: 'production',
    database: {
        connection: process.env.PRODUCTION_DATABASE_URL,
        connOptions: {
            transactions: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
            allowDiskUse: true,
        }
    }
}

module.exports.staging = {
    env: 'staging',
    database: {
        connection: process.env.STAGING_DATABASE_URL,
        connOptions: {
            transactions: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
            //to handle above 100MB data during aggregation
            allowDiskUse: true,
        }
    }
}

module.exports.development = {
    env: 'developement',
    database: {
        connection: process.env.DEVELOPMENT_DATABASE_URL,
        connOptions: {
            transactions: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
            //to handle above 100MB data during aggregation
            allowDiskUse: true,
        }
    }
}

// export default 
module.exports.test = {
    env: 'test',
    database: {
        connection: 'mongodb://localhost:27017/finitbyte-test',
        transactions: false,
    },
};