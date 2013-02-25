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
    
    response.sendfile('./public_html/index.html');
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

// ----------------------------------------------------------------------------
// Start Socket
// ----------------------------------------------------------------------------

sessionStore = {};

logger.log('Setup socket.');
var 
    EVENT = nodeL.LOG_TYPE.EVENT,
    ERROR = nodeL.LOG_TYPE.ERROR;

var 
    io = require('socket.io').listen(server),
    spawn = require('child_process').spawn;
    
// validate the command object sent over socket
function validateOctCmdObject(octCmd) {
    
    if (octCmd === undefined || octCmd === null || 
        octCmd.cmd === undefined || octCmd.cmd === null ||
        octCmd.channel === undefined || octCmd.channel === null) {
        throw 'Invalid octave command object.';
    }
}

/*
 * 
 * @param {type} sid
 * @param {type} channel
 * @returns {undefined}
 */
function setupChannel(sid, channel) {
    
    // open our octave process
    sessionStore[sid].channel[channel] = spawn('octave');

    // config stream
    sessionStore[sid].channel[channel].stdout.setEncoding('utf8');
    sessionStore[sid].channel[channel].runCmd = true;

    // setup input stream events
    sessionStore[sid].channel[channel].stdin.on('drain', function() {
        logger.log('Session : ' + sid + '  |  Channel : ' + channel + '  |  EVENT : octave instream drain' , EVENT);
    });

    sessionStore[sid].channel[channel].stdin.on('close', function() {
        logger.log('Session : ' + sid + '  |  Channel : ' + channel + '  |  EVENT : octave instream close' , EVENT);
    });

    sessionStore[sid].channel[channel].stdin.on('pipe', function() {
        logger.log('Session : ' + sid + '  |  Channel : ' + channel + '  |  EVENT : octave instream pipe' , EVENT);
    });

    // setup output stream events events
    sessionStore[sid].channel[channel].stdout.on('end', function () {
        logger.log('Session : ' + sid + '  |  Channel : ' + channel + '  |  EVENT : octave outstream end' , EVENT);
    });

    sessionStore[sid].channel[channel].stdout.on('close', function () {
        logger.log('Session : ' + sid + '  |  Channel : ' + channel + '  |  EVENT : octave outstream close' , EVENT); 
    });

    sessionStore[sid].channel[channel].stdout.on('error', function (error) {
         logger.log('Session : ' + sid + '  |  Channel : ' + channel + '  |  EVENT : octave outstream error' , EVENT);
    });
}

io.sockets.on('connection', function (socket) {
    
    if (socket.sid === undefined || socket.sid === null) {
        socket.sid = socket.handshake.sessionID;
    }

    socket.emit('connected', { status: 'ok' });

    socket.on('test', 
        /*
         * 
         * @param {type} data
         * @returns {undefined}
         */
        function (data) {
        logger.log('SOCKET SID : ' + socket.sid);
        logger.log('TEST DATA  : ' + JSON.stringify(data));
    });

    socket.on('octave',         
        /*
         * 
         * @param {type} octCmd
         * @returns {unresolved}
         */
        function (octCmd) {
        
        logger.log('Octave event', EVENT);

        try {
            validateOctCmdObject(octCmd);
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
            
            setupChannel(socket.sid, octCmd.channel);
            
            // socket callbacks
            sessionStore[socket.sid].channel[octCmd.channel].stdin.on('error', function(error) {
                logger.log('Session : ' + socket.sid + '  |  Channel : ' + octCmd.channel + '  |  EVENT : octave instream error : ' + JSON.stringify(error) , EVENT);
                socket.emit('octave', {channel : octCmd.channel, msg : 'Octave command error. Please reset channel.'});
            });

            sessionStore[socket.sid].channel[octCmd.channel].stdout.on('data', function (message) {
                logger.log('Octave message : ' + JSON.stringify(message), EVENT);
                if (!(/GNU Octave/.test(JSON.stringify(message)))) {
                    socket.emit('octave', { channel : octCmd.channel, msg : message});
                }
            });
            
            logger.log('Setup new channel.', EVENT);    
        }
        
        // write the command to octave
        sessionStore[socket.sid].channel[octCmd.channel].stdin.write(octCmd.cmd);
    });
    
    /*
     * reset the channel
     */
    socket.on('reset', function (octInfo) {
        
        logger.log('Reset event', EVENT);
        
        if (octInfo === undefined || octInfo === null ||
            octInfo.channel === undefined || octInfo.channel === null) {
            
            logger.log('Invalid reset object.', ERROR);
            return ;
        }
        
         setupChannel(socket.sid, octInfo.channel);
            
        // socket callbacks
        sessionStore[socket.sid].channel[octInfo.channel].stdin.on('error', function() {
            logger.log('Session : ' + socket.sid + '  |  Channel : ' + octInfo.channel + '  |  EVENT : octave instream error' , EVENT);
            socket.emit('octave', {channel : octInfo.channel, msg : 'Octave command error.'});
        });

        sessionStore[socket.sid].channel[octInfo.channel].stdout.on('data', function (message) {
            logger.log('Octave message : ' + JSON.stringify(message), EVENT);
            if (!(/GNU Octave/.test(JSON.stringify(message)))) {
                socket.emit('octave', { channel : octInfo.channel, msg : message});
            }
        });
        
        logger.log('Channel has been reset.', EVENT); 
        
    });
    
    socket.on('save', function (octInfo) {
        
    });
    
    socket.on('load', function (octInfo) {
        
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


