module.exports = {
    name: "Main", service: __,
    dependencies: [
        'ApplicationRunner', 'logger', 'Database',
        'ExpressHttpInitializer', 'resource(settings/settings.json)'
    ]
};

function __(ApplicationRunner, logger, Database, ExpressHttpInitializer, settings) {

    class Main extends ApplicationRunner {
        order() {return 0;}

        run() {
            logger.warn(`Kicking off app with ApplicationRunner class '${this.constructor.name}'`);

            // setup database connections -- Use Environment variable to control setup
            Database.initConnection();

            // kick off the main express apps
            ExpressHttpInitializer.startListening();
        }

    }

    return Main;
}