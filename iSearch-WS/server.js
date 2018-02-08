const express      = require('express'),
      path         = require('path'),
      bodyParser   = require('body-parser');

//import routes
//const apiRoutes      = require('./routes/api'),
//      userRoutes     = require('./routes/users'),
//      musicRoutes    = require('./routes/music'),
//      playlistRoutes = require('./routes/playlist');

const app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//prepare headers
app.use( (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    //res.set('Content-Type', 'application/json');  //Dont need it, cause API contained in this WS
    next();
});

//loading the routes
//app.use('/playlist', playlistRoutes);
//app.use('/music', musicRoutes);
//app.use('/user', userRoutes);
//app.use('/', apiRoutes);


//catch 404 and forward to error handler
//app.use( (req, res, next) => {
//    let err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});
//
//// error handler
//app.use ( (err, req, res, next) => {
//    // set locals, only providing error in development
//    res.locals.message = err.message;
//    res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//    // render the error page
//    res.status(err.status || 500);
//    res.render('error');
//});


module.exports = app;