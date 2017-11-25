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
var host = CONFIG.EaaS_host;
var port = CONFIG.server_port;
var tcp_port = CONFIG.EaaS_tcp_port;
var pool_host = CONFIG.EaaS_pool_host;
var pool_tcp_port = CONFIG.EaaS_pool_tcp_port;

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
        requests.setLocale(i18n.languageFrom(requests.query.lang));
        responses.render('pages/index', { user: requests.user });
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

client.connect(tcp_port, host, function() {
    console.log('Connected on EaaS host:' + host + " port:" + tcp_port);
});

client.on('close', function() {
    console.log('Connection closed');
});

client.on('error', function(err) {
    console.log('Connection error:' + err);
});

client.on('end', () => {
    console.log('disconnected from server');
});

var pool_client = new net.Socket();

pool_client.connect(pool_tcp_port, pool_host, function() {
    pool_client.setNoDelay(true);
    console.log('Connected on Pool host:' + pool_host + " port:" + pool_tcp_port);
});

pool_client.on('close', function() {
    console.log('Connection closed');
});

pool_client.on('error', function(err) {
    console.log('Connection error:' + err);
});

client.on('end', () => {
    console.log('disconnected from server');
});

var clients = [];

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

    clients.push(socket);

    socket.on('disconnect', function() {
        console.log('Got disconnect!');
        var i = clients.indexOf(socket);
        clients.splice(i, 1);
    });

});

client.on('data', function(data) {
    for (var i=0;i<clients.length;i++) {
        clients[i].emit("new message", data.toString());
        console.log('EaaS Received: ' + data.toString());
    }
});

pool_client.on('data', function(data) {
    try {
        data.toString().split("\n").forEach(function(entry) {
            if (entry.length > 1){
                for (var i=0;i<clients.length;i++) {
                    var obj = JSON.parse(entry);
                    if (clients[i].handshake.session.passport == undefined){
                        if (obj.command == "pool-hashrate"){
                            clients[i].emit("new message", entry);
                            console.log('Pool Received main: ' + entry);
                        } else {
                            if (obj.command == "pool-currency"){
                                clients[i].emit("new message", entry);
                                console.log('Pool Received main: ' + entry);
                            } else {
                                if (obj.command == "pool-block-found"){
                                    clients[i].emit("new message", entry);
                                    console.log('Pool Received main: ' + entry);
                                } else {
                                    if (obj.command == "pool-currency-drop") {
                                        clients[i].emit("new message", entry);
                                        console.log('Pool Received main: ' + entry);
                                    }
                                }
                            }
                        }
                    }else{
                        if (clients[i].handshake.session.passport.user == undefined){
                            if (obj.command == "pool-hashrate") {
                                clients[i].emit("new message", entry);
                                console.log('Pool Received main: ' + entry);
                            } else {
                                if (obj.command == "pool-currency"){
                                    clients[i.id].emit("new message", entry);
                                    console.log('Pool Received main: ' + entry);
                                } else {
                                    if (obj.command == "pool-block-found"){
                                        clients[i].emit("new message", entry);
                                        console.log('Pool Received main: ' + entry);
                                    } else {
                                        if (obj.command == "pool-currency-drop") {
                                            clients[i].emit("new message", entry);
                                            console.log('Pool Received main: ' + entry);
                                        }
                                    }
                                }
                            }
                        }else {
                            var name = clients[i].handshake.session.passport.user;
                            if (obj.command == "pool-hashrate") {
                                clients[i].emit("new message", entry);
                                console.log('Pool Received private: ' + entry);
                            } else {
                                if (obj.command == "pool-user-hashrate"){
                                    if (obj.user == name){
                                        clients[i].emit("new message", entry);
                                        console.log('Pool Received private: ' + entry);
                                    }
                                } else {
                                    if (obj.command == "pool-currency"){
                                        clients[i].emit("new message", entry);
                                        console.log('Pool Received private: ' + entry);
                                    } else {
                                        if (obj.command == "pool-block-found"){
                                            clients[i].emit("new message", entry);
                                            console.log('Pool Received private: ' + entry);
                                        } else {
                                            if (obj.command == "pool-currency-drop") {
                                                clients[i].emit("new message", entry);
                                                console.log('Pool Received main: ' + entry);
                                            } else {
                                                if (obj.command == "pool-user-drop") {
                                                    if (obj.user == name){
                                                        clients[i].emit("new message", entry);
                                                        console.log('Pool Received private: ' + entry);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            }
      });
    } catch (e) {
        console.log('json parse error:' + e.message)
    }

});







