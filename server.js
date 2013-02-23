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

app.get('/', function (request, response) {
    
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
        octCmd.lines === undefined || octCmd.lines === null ||
        octCmd.channel === undefined || octCmd.channel === null) {
        throw 'Invalid octave command object.';
    }
}

// ----------------------------------------------------------------------------
// Start Socket
// ----------------------------------------------------------------------------

sessionStore = {};

logger.log('Setup socket.');

io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    
    if (!socket.sid) {
        socket.sid = socket.handshake.sessionID;
    }
    
    // testing method
    socket.on('test', function (data) {
        logger.log('SOCKET SID : ' + socket.sid);
        logger.log('TEST DATA  : ' + JSON.stringify(data));
    });
    
    // listen octave event
    socket.on('octave', function (octCmd) {
        
        logger.log('Octave event', nodeL.LOG_TYPE.EVENT);
        
        try {
            validateOctaveCmd(octCmd);
        } catch (err) {
            logger.log(err, nodeL.LOG_TYPE.EVENT);
            return ;
        }
        
        if (sessionStore[socket.sid] === undefined || sessionStore[socket.sid] === null) {
            
            sessionStore[socket.sid] = {};
            sessionStore[socket.sid].channel = [];
            logger.log('Setup new session.', nodeL.LOG_TYPE.EVENT);
        }
        
        if (sessionStore[socket.sid].channel[octCmd] === undefined 
                || sessionStore[socket.sid].channel[octCmd] === null) {
                
            logger.log('Setup new channel.');    
        }
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


