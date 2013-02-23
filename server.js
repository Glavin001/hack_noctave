/* 
 * Dawson Reid
 * Feb 23, 2012
 */

/* 
 * Dawson Reid 
 * Feb 20, 2013
 */

// constants
var 
    LOGGING = true,
    DEBUGGING = true;
    
/*
* setup the logger if logging enabled
*/
var logger = undefined;
try {
    
    var nodeL = require('./node/nodeL');
    logger = new nodeL.Logger
            (
            nodeL.LOG_MEDIUM.CONSOLE,
            nodeL.LOG_TYPE.INFO,
            nodeL.LOG_LEVEL.LOW
            );            
    logger.log('Logging ...');
    
} catch (e) {
    console.log("ERROR : Could not setup logger.");
    console.log("\tREASON : " + e);
    process.exit(1);
}

logger.log('Loading modules.');
// import all need libs
var 
        http = require('http'), // http processing utility
        fs = require('fs'),
        express = require('express'),
        connect = require('connect'),
        cookie = require('cookie');

var sessionStore = {};

logger.log('Loading functions.');

function requestEnded(error) {
    logger.log('Request ended.', nodeL.LOG_TYPE.REQUEST);
}

function requestClosed(error) {
    logger.log('Request closed.', nodeL.LOG_TYPE.REQUEST);
}


// ----------------------------------------------------------------------------
// Start Server
// ----------------------------------------------------------------------------

// create and init my server
var 
    app = express(),
    server = http.createServer(app),
    memStore = new express.session.MemoryStore();

logger.log('Configuring server.');

app.configure(function(){
  
  // web server config
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public_html'));
  app.use(express.errorHandler({
    dumpExceptions: true, 
    showStack: true
  }));
  app.set('view engine', 'ejs');

  // session support
  app.use(express.cookieParser());
  app.use(express.session({
        store: memStore,
        secret: 'n0ct4v3',
        key: 'noct.sid'
    }));
    
  app.use(app.router);
});

logger.log('Starting server.');

app.get('/', function (req, res) {
    logger.log('Request started.', nodeL.LOG_TYPE.REQUEST);
    req.on('end', requestEnded);
    req.on('close', requestClosed);
    res.render('index.ejs');
});

app.get('/test', function (request, response) {
    logger.log('Request started.', nodeL.LOG_TYPE.REQUEST);
    request.on('end', requestEnded);
    request.on('close', requestClosed);
    response.sendfile('./public_html/test.html');
});

server.listen(8080);

logger.log('Server started.');

// ----------------------------------------------------------------------------
// End Server
// ----------------------------------------------------------------------------

function validateOctaveCmd(octCmd) {
    if (octCmd === undefined || octCmd === null || 
        octCmd.cmd === undefined || octCmd.cmd === null ||
        octCmd.channel === undefined || octCmd.channel === null) {
        throw 'Invalid octave command object.';
    }
}

// ----------------------------------------------------------------------------
// Start Socket
// ----------------------------------------------------------------------------

sessionStore = {};

logger.log('Setup socket.');
var EVENT = nodeL.LOG_TYPE.EVENT;

var 
    io = require('socket.io').listen(server),
    spawn = require('child_process').spawn;

io.sockets.on('connection', function (socket) {
<<<<<<< HEAD
    
    if (socket.sid === undefined || socket.sid === null) {
        socket.sid = socket.handshake.sessionID;
    }
    
=======

    socket.emit('connected', { status: 'ok' });

>>>>>>> 3789b392cfc3373d6b2669f651ed24464bd014be
    // testing method
    socket.on('test', function (data) {
        logger.log('SOCKET SID : ' + socket.sid);
        logger.log('TEST DATA  : ' + JSON.stringify(data));
    });

    // listen octave event
    socket.on('octave', function (octCmd) {
        
        logger.log('Octave event', EVENT);
        
        try {
            validateOctaveCmd(octCmd);
        } catch (err) {
            logger.log(err, EVENT);
            return ;
        }
        
        // setup session
        if (sessionStore[socket.sid] === undefined || sessionStore[socket.sid] === null) {
            
            sessionStore[socket.sid] = {};
            sessionStore[socket.sid].channel = [];
            logger.log('Setup new session.', EVENT);
        }
        
        // setup new channel
        if (sessionStore[socket.sid].channel[octCmd.channel] === undefined 
                || sessionStore[socket.sid].channel[octCmd.channel] === null) {
            
            // open our octave process
            sessionStore[socket.sid].channel[octCmd.channel] = spawn('octave');
            
            // setup stream
            sessionStore[socket.sid].channel[octCmd.channel].stdout.setEncoding('utf8');
            
            // setup output stream events events
            sessionStore[socket.sid].channel[octCmd.channel].stdout.on('end', function () {
                logger.log('Session : ' + socket.sid + '  |  Channel : ' + octCmd.channel + '  |  EVENT : octave end' , EVENT);
            });
            
            sessionStore[socket.sid].channel[octCmd.channel].stdout.on('close', function () {
                logger.log('Session : ' + socket.sid + '  |  Channel : ' + octCmd.channel + '  |  EVENT : octave close' , EVENT); 
            });
            
            sessionStore[socket.sid].channel[octCmd.channel].stdout.on('error', function () {
                 logger.log('Session : ' + socket.sid + '  |  Channel : ' + octCmd.channel + '  |  EVENT : octave error' , EVENT);
            });
            
            sessionStore[socket.sid].channel[octCmd.channel].stdout.on('data', function (message) {
                    logger.log('Octave message : ' + JSON.stringify(message), EVENT);
                    socket.emit('octave', { channel : octCmd.channel, msg : message});
            });
            
            logger.log('Setup new channel.', EVENT);    
        }
        
        // run octave input
        logger.log('Octave command : ' + octCmd.cmd, EVENT);
        sessionStore[socket.sid].channel[octCmd.channel].stdin.write(octCmd.cmd);  
    });
    
});
 
io.set('authorization', function (data, accept) {

    if (data.headers.cookie) {
        // attain the session id
        data.sessionID = connect.utils.parseSignedCookies(cookie.parse(decodeURIComponent(data.headers.cookie)),'n0ct4v3')['noct.sid'];
        return accept(null, true);
    } else {
       return accept('No cookie transmitted.', false);
    }
});

// ----------------------------------------------------------------------------
// End Socket
// ----------------------------------------------------------------------------


