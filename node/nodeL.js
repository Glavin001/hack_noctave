/* 
 * Author : Dawson
 * Date : Feb 18, 2013
 * File : nodeL.js
 */

//var MNLU_fs = module.require('fs'); // file reading and writing

/*
 * 
 * @type Enum
 */
exports.LOG_LEVEL = {};
exports.LOG_LEVEL.Id = 'LOG_LEVEL';
exports.LOG_LEVEL = {
    Id : exports.LOG_LEVEL.Id,
           
   LOW : {
       Id : exports.LOG_LEVEL.Id, 
       TYPE : 'LOW'
   },
   MED : {
       Id : exports.LOG_LEVEL.Id,
       TYPE : 'MEDIUM'
   },
   HIGH : {
       Id : exports.LOG_LEVEL.Id,
        TYPE : 'HIGH'
   }
};

/*
 * 
 * @type Enum
 */
exports.LOG_MEDIUM = {};
exports.LOG_MEDIUM.Id = 'LOG_MEDIUM';
exports.LOG_MEDIUM = {
    Id : exports.LOG_MEDIUM.Id,
            
    CONSOLE : {
        Id : exports.LOG_MEDIUM.Id,
        TYPE : 'CONSOLE'
    },
    FILE : {
        Id : exports.LOG_MEDIUM.Id,
        TYPE : 'FILE'
    },
    MYSQL : {
        Id : exports.LOG_MEDIUM.Id,
        TYPE : 'MYSQL'
    }
};

/*
 * 
 * @type Enum
 */
exports.LOG_TYPE = {};
exports.LOG_TYPE.Id = 'LOG_TYPE';
exports.LOG_TYPE = {
    Id : exports.LOG_TYPE.Id,
    
    INFO : {
        Id : exports.LOG_TYPE.Id, 
        TYPE : 'INFO',
        Padding : ' '
    },
    WARNING : {
        Id : exports.LOG_TYPE.Id,
        TYPE : 'WARNING',
        Padding : ' '
    },
    EXCEPTION : {
        Id : exports.LOG_TYPE.Id,
        TYPE : 'EXCEPTION',
        Padding : ' '
    },
    ERROR : {
        Id : exports.LOG_TYPE.Id,
        TYPE : 'ERROR',
        Padding : '    '
    },
    EVENT : {
        Id : exports.LOG_TYPE.Id,
        TYPE : 'EVENT',
        Padding : '      '
    },
    REQUEST : {
        Id : exports.LOG_TYPE.Id,
        TYPE : 'REQUEST',
        Padding : '    '
    }
};

/*
 * arguments : 
 * 0 - logging medium
 * 1 - default logging type
 * 2 - default logging level
 * 
 * @type Object
 */
exports.Logger = function() {

    var args = arguments;
    if (args.length > 0) {
        if (args[0].Id === exports.LOG_MEDIUM.Id)
        {
            this.logMedium = args[0];
        } else {
            throw new 'Invalid arg : 1st arg must be of type LOG_MEDIUM';
        }
    } else {
        this.logMedium = exports.LOG_MEDIUM.CONSOLE;
    }
    
    if (args.length > 1) {
        if (args[1].Id === exports.LOG_TYPE.Id) {
            this.defaultLogType = args[1];
        } else {
            throw 'Invalid arg : 2nd arg must be of type LOG_TYPE';
        }
    } else {
        this.defaultLogType = exports.LOG_TYPE.INFO;
    }
    
    if (args.length > 2) {
        if (args[2].Id === exports.LOG_LEVEL.Id) {
            this.defaultLogLevel = args[2];
        } else {
            throw 'Invalid arg : 3rd arg must be of type LOG_LEVEL';
        }
    } else {
        this.defaultLogLevel = exports.LOG_LEVEL.LOW;
    }
    
    if (args.length > 3) {
        throw 'Invalid number of arguments : ' + args.length;
    }
    
    // private methods

    String.prototype.rpad = function(padString, length) {
        var str = this;
        while (str.length < length)
            str = str + padString;
        return str;
    };

    var formatLogMessage = function(logMessage, logLevel, logType) {
        
        var label = '[ ' + logType.TYPE + ' | ' + logLevel.TYPE + ' ]';
        return (label.rpad(' ', 18) + '|' + logType.Padding + logMessage);
    };
    
    var writeLog = function(logMessage, logMedium) {
        
        if (arguments.length !== 2) {
            throw '[writeLog] Invalid number of arguments : ' + args.length;
        }
        
        if (logMedium.Id === exports.LOG_MEDIUM.Id) {
            if (logMedium.TYPE === exports.LOG_MEDIUM.CONSOLE.TYPE)
            {
                console.log(logMessage);
            }
        } else {
            throw '[writeLog] Invalid arg : 2nd arg must be of tye LOG MEDIUM.';
        }
    };
    
    this.log = function(logMessage) {
       
        var
            args = arguments,
            logLevel = this.defaultLogLevel,
            logType = this.defaultLogType;
    
        if (args.length === 2) {
            if (args[1].Id === exports.LOG_LEVEL.Id) {
                logLevel = args[1];
            } else if (args[1].Id === exports.LOG_TYPE.Id) {
                logType = args[1];
            } else {
                throw 'Invalid arg : 2nd of 2 args must be either of type LOG_LEVEL, or LOG_TYPE';
            }
        } else if (args.length === 3) {
            if (args[1].Id === exports.LOG_LEVEL.Id &&
                args[2].Id === exports.LOG_TYPE.Id) {
                logLevel = args[1];
                logType = args[2];
            } else {
                throw 'Invalid arg : 2nd and 3rd arg must be of type LOG_LEVEL and LOG_TYPE.';
            }
        } else if (args.length > 3) {
            throw 'Invalid number of arguments : ' + args.length;
        }
        
        logMessage = formatLogMessage(logMessage, logLevel, logType);
        writeLog(logMessage, this.logMedium);
    };
};




