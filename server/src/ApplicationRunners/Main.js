module.exports = {
    name: "Main", service: __,
    dependencies: ['ApplicationRunner', 'logger', 'resource(settings/settings.json)']
};

function __(ApplicationRunner, logger, settings) {

    class Main extends ApplicationRunner {
        order() {return 0;}

        run() {
            logger.warn(`Setting up app with ApplicationRunner class '${this.constructor.name}'`);
        }

    }

    return Main;
}