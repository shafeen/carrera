module.exports = {
    name: 'ExpressHttpInitializer', service: __,
    dependencies: [
        'ExpressApp', 'MetricsApp', 'require(debug)', 'require(http)'
    ]
};

function __(ExpressApp, MetricsApp, debug, http) {
    const debugHttp = debug('http');

    class ExpressHttpInitializer {

        /** Normalize a port into a number, string, or false. */
        static normalizePort(val) {
            let port = parseInt(val, 10);
            if (isNaN(port)) {
                // named pipe
                return val;
            }
            if (port >= 0) {
                // port number
                return port;
            }
            return false;
        }

        /** Event listener for HTTP server "error" event. */
        static onErrorGenerator(port) {
            return function onError(error) {
                if (error.syscall !== 'listen') {
                    throw error;
                }

                let bind = typeof port === 'string'
                    ? 'Pipe ' + port
                    : 'Port ' + port;

                // handle specific listen errors with friendly messages
                switch (error.code) {
                    case 'EACCES':
                        console.error(bind + ' requires elevated privileges');
                        process.exit(1);
                        break;
                    case 'EADDRINUSE':
                        console.error(bind + ' is already in use');
                        process.exit(1);
                        break;
                    default:
                        throw error;
                }
            };
        }

        /** Event listener for HTTP server "listening" event. */
        static onListeningGenerator(server) {
            return function onListening() {
                let addr = server.address();
                let bind = typeof addr === 'string'
                    ? 'pipe ' + addr
                    : 'port ' + addr.port;
                debugHttp('Listening on ' + bind);
            };
        }

        static startListening() {
            /** Get port from environment and store in Express. */
            let port = ExpressHttpInitializer.normalizePort(process.env.PORT || '3000');
            ExpressApp.set('port', port);

            let metricsPort = ExpressHttpInitializer.normalizePort(process.env.METRICS_PORT || '9000');
            MetricsApp.set('port', metricsPort);

            /** Create HTTP server. */
            let server = http.createServer(ExpressApp);
            let metricsServer = http.createServer(MetricsApp);

            /** Listen on provided port and metricsPort, on all network interfaces. */
            server.on('error', ExpressHttpInitializer.onErrorGenerator(port));
            server.on('listening', ExpressHttpInitializer.onListeningGenerator(server));

            metricsServer.on('error', ExpressHttpInitializer.onErrorGenerator(metricsPort));
            metricsServer.on('listening', ExpressHttpInitializer.onListeningGenerator(metricsServer));

            server.listen(port);
            metricsServer.listen(metricsPort);
        }
    }

    return ExpressHttpInitializer
}
