module.exports = {
    name: 'ExpressApp', service: __,
    dependencies: [
        'require(express)', 'require(morgan)', 'require(cookie-parser)',
        'require(body-parser)', 'sessionMiddleware', 'require(path)',
        'passportPreconfigured', 'require(express-flash)', 'require(serve-favicon)',
        'GraphQLServer', 'RootRouter'
    ]
};

function __(express, logger, cookieParser, bodyParser, sessionMiddleware,
            path, passport, flash, favicon, GraphQLServer, RootRouter) {

    const ExpressApp = express();
    // view engine setup
    ExpressApp.set('views', path.join(__dirname, '..', '..', '..', 'client', 'views'));
    ExpressApp.set('view engine', 'pug');

    // uncomment after placing your favicon in /public
    //ExpressApp.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    ExpressApp.use(logger('dev'));
    ExpressApp.use(bodyParser.json());
    ExpressApp.use(bodyParser.urlencoded({ extended: false }));
    ExpressApp.use(cookieParser());
    ExpressApp.use(function denyTemplateFiles(req, res, next) {
        if (req.originalUrl.endsWith('.pug') ) {
            res.status(403).send('Restricted resource!');
        } else {
            next();
        }
    });
    ExpressApp.use(express.static(path.join(__dirname, '..', '..', '..', 'client', 'ng-client')));
    ExpressApp.use(express.static(path.join(__dirname, '..', '..', '..', 'client', 'ng-client-secure')));
    ExpressApp.use(express.static(path.join(__dirname, '..', '..', '..', 'client', 'public')));
    ExpressApp.use('/settings', express.static(path.join(__dirname, '..', '..', 'resources', 'settings')));

    // setup ExpressApp to use passportjs
    ExpressApp.use(sessionMiddleware);
    ExpressApp.use(passport.initialize());
    ExpressApp.use(passport.session());
    ExpressApp.use(flash());

    // graphql server setup (must be AFTER passport init)
    GraphQLServer.applyMiddleware({app: ExpressApp});

    // entry point for application routes
    ExpressApp.use('/', RootRouter);

    // catch 404 and forward to error handler
    ExpressApp.use(function(req, res, next) {
        let err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    ExpressApp.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

    return ExpressApp;
}