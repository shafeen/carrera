// configure DI container (TODO: use chaz-js here after refactor)
const diContainer = require('./config/diContainer.js');
const bottle = diContainer.initialize();

// setup database connections -- Use Environment variable to control setup
const { Database } = bottle.container;
Database.initConnection();

// initialize ApplicationRunners after all injectables ready
diContainer.setupApplicationRunners();

const { ExpressApp, MetricsApp } = bottle.container;

module.exports = { app: ExpressApp, metricsApp: MetricsApp };
