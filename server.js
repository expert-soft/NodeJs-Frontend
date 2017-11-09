////////////////// Using Express /////////////

// require our dependencies
var express = require('express');
var expressLayouts= require('express-ejs-layouts');
var bodyParser = require('body-parser');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var sharedsession = require("express-socket.io-session");
var i18n = require('i18n-abide');
var db = require('./db');
var feed = require('./feed');
var CONFIG = require('./config.json');
var net = require('net');

var session = require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false });

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
    function(username, password, cb) {
        db.users.findByUsername(username, password, function(err, user) {
            if (err) { return cb(err); }
            if (!user) { return cb(null, false); }
            return cb(null, user);
        });
    }));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
     db.users.findById(id, function (err, user) {
         if (err) { return cb(err); }
         cb(null, user);
     });
});

var app = express();
var port = CONFIG.server_port;

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(i18n.abide({
    supported_languages: ['en-US', 'ru'],
    default_lang: 'en-US',
    translation_directory: 'i18n',
    locale_on_url: false
}));

// use ejs and express layouts
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(session);

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Use shared session middleware for socket.io
// setting autoSave:true
io.use(sharedsession(session, {
    autoSave:true
}));

io.use(sharedsession(session));

// router our app
var router = require('./app/routes');
app.use('/', router); // load any path

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/change_lang',
    function(requests, responses){
        requests.setLocale(requests.query.lang);
        requests.headers['accept-language'] = requests.query.lang;
        requests.lang = requests.query.lang;
        requests.locale = requests.query.lang;
        responses.locals.lang = requests.query.lang;
        responses.locals.locale = requests.query.lang;
        responses.redirect('/');
    });

// setting static files (css, img) location
app.use(express.static(__dirname+'/public'));

// start our server
//app.listen(port, function(){
//	console.log("App started on port:" + port);
//});

http.listen(port, function () {
    console.log('listening on: '+ port);
});

var client = new net.Socket();
client.connect(9998, '127.0.0.1', function() {
    console.log('Connected:');
});

client.on('close', function() {
    console.log('Connection closed');
});

client.on('error', function() {
   console.log('Connection error');
});

io.on('connection', function (socket) {
    if (socket.handshake.session.passport == undefined){
        var name = socket.id;
        console.log(name + ' connected to chat!');
    }else{
        if (socket.handshake.session.passport.user == undefined){
            var name = socket.id;
            console.log(name + ' connected to chat!');
        }else {
            var name = socket.handshake.session.passport.user;
            console.log(name + ' connected to chat!');
        }

    }


    client.on('data', function(data) {
        socket.emit("new message", data.toString());
        console.log('Received: ' + data.toString());
    });

});
