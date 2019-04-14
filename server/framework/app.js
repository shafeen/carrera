// configure DI container (TODO: use chaz-js here after refactor)
const diContainer = require('./config/diContainer.js');
diContainer.initialize();
// initialize ApplicationRunners after all injectables ready
diContainer.setupApplicationRunners();
