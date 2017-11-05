////////////////// Using Express /////////////

// require our dependencies
var express = require('express');
var expressLayouts= require('express-ejs-layouts');
var bodyParser = require('body-parser');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');

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
var port = 8080;

// use ejs and express layouts
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// router our app
var router = require('./app/routes');
app.use('/', router); // load any path

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

// setting static files (css, img) location

app.use(express.static(__dirname+'/public'));
// start our server
app.listen(port, function(){
	console.log("App started on port:" + port);
});
