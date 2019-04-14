module.exports = {
    name: 'MetricsApp', service: __,
    dependencies: [ 'require(express)', 'Prometheus' ]
};

// set up metrics endpoint in the metricsApp
function __(express, Prometheus) {
    const MetricsApp = express();
    MetricsApp.use('/metrics', (req, res) => {
        res.send(Prometheus.register.metrics());
    });

    return MetricsApp;
}