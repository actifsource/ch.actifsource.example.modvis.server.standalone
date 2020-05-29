'use strict';

/** module for specify services */
angular.module('App.Util.Assert', [])
    
    /************************************************************************************************************ 
    * The $errorHandler service provides error handling functions.
    * @constructor $settings, $errorHandler, $timeout
    ***********************************************************************************************************/
    .factory('assert', ['$settings', '$errorHandler', '$timeout', 
                        function($settings, $errorHandler, $timeout) {  

        var fAssert = {};
        var fEnum = {};
        
        /********************
         * console Log
         *******************/
        
        /**
         * @public consoleLog_Api console
         * 
         * @param message
         */
        fAssert.consoleLog_Api = function (message) {
        	if (!$settings.logApiEnable) return;
        	console.log(message);
        }
         
        /**
         * @public consoleLog_Control
         * 
         * @param message
         */
        fAssert.consoleLog_Control = function (message) {
        	if (!$settings.logControlEnable) return;
        	console.log(message);
        }
        
        /**
         * @public consoleLog_Directives
         * 
         * @param message
         */
        fAssert.consoleLog_Directives = function (message) {
        	if (!$settings.logDirectivesEnable) return;
        	console.log(message);
        }
        
        /**
         * @public consoleLog_Service
         * 
         * @param message
         */
        fAssert.consoleLog_Service = function (message) {
        	if (!$settings.logServiceEnable) return;
        	console.log(message);
        }
        
        /********************
         * Log
         *******************/
        
        /**
         * @public logError
         * 
         * @param message
         */
        fAssert.logError = function (message) {
        	fAssert.consoleLog_Api("LOG ERROR: "+message);
        	$errorHandler.handleMessage(message, $errorHandler.MESSAGE_ID.ERROR);
        }
        
        /**
         * @public logWarning
         * 
         * @param message
         */
        fAssert.logWarning = function (message) {
        	fAssert.consoleLog_Api("LOG WARNING: "+message);
        	$errorHandler.handleMessage(message, $errorHandler.MESSAGE_ID.WARNING);
        }
        
        /**
         * @public logInfo
         * 
         * @param message
         */
        fAssert.logInfo = function (message) {
        	fAssert.consoleLog_Api("LOG INFO: "+message);
        	$errorHandler.handleMessage(message, $errorHandler.MESSAGE_ID.INFO);
        }
        
        /********************
         * Error
         *******************/
    	
        /**
         * @public throwMessage
         * 
         * @param errorMessage
         * @param retryId
         */
        fAssert.throwMessage = function(errorMessage, retryId) {
        	fAssert.logError("Throw message: "+errorMessage+' id:'+retryId);
    		$errorHandler.handleException(errorMessage, retryId);
    	}
        
        /**
         * @public throwInfoMessage
         * 
         * @param errorMessage
         */
        fAssert.throwInfoMessage = function(errorMessage) {
        	fAssert.logError("Throw message: "+errorMessage+' id:'+$errorHandler.RETRY_ID.INFO);
    		$errorHandler.handleException(errorMessage, $errorHandler.RETRY_ID.INFO);
    	}
        
        /**
         * @public throwResetMessage
         * 
         * @param errorMessage
         */
        fAssert.throwResetMessage = function(errorMessage) {
        	fAssert.logError("Throw message: "+errorMessage+' id:'+$errorHandler.RETRY_ID.RESET);
    		$errorHandler.handleException(errorMessage, $errorHandler.RETRY_ID.RESET);
    	}
        
        /**
         * @public throwReconnectMessage
         * 
         * @param errorMessage
         */
        fAssert.throwReconnectMessage = function(errorMessage) {
        	fAssert.logError("Throw message: "+errorMessage+' id:'+$errorHandler.RETRY_ID.RECONNECT);
    		$errorHandler.handleException(errorMessage, $errorHandler.RETRY_ID.RECONNECT);
    	}
        
        /********************
         * Assert
         *******************/
        
        /**
         * @public assertfail
         * 
         * @param message
         */
        fAssert.assertfail = function (message) {
        	fail("assertfail", message);
        }
        
        /**
         * @public assertNotNull
         * 
         * @param object
         * @param message
         */
        fAssert.assertNotNull = function (object, message) {
        	if (object != null && object != undefined) return;
        	fail("assertNotNull", message);
        }
        
        /**
         * @public assertNull
         * 
         * @param object
         * @param message
         */
        fAssert.assertNull = function (object, message) {
        	if (object == null) return;
        	fail("assertNull", message);
        }
        
        /**
         * @public assertTrue
         * 
         * @param bool
         * @param message
         */
        fAssert.assertTrue = function (bool, message) {
        	if (bool) return;
        	fail("assertTrue", message);
        }
        
        /**
         * @public assertFalse
         * 
         * @param bool
         * @param message
         */
        fAssert.assertFalse = function (bool, message) {
        	if (!bool) return;
        	fail("assertFalse", message);
        }
        
        /**
         * @public assertIsArray
         * 
         * @param object
         * @param message
         */
        fAssert.assertIsArray = function (object, message) {
        	fAssert.assertNotNull(object, message);
        	if (angular.isArray(object)) return;
        	fail("assertIsArray", message);
        }
        
        /**
         * @public assertIsArrayNotEmpty
         * 
         * @param object
         * @param message
         */
        fAssert.assertIsArrayNotEmpty = function (object, message) {
        	fAssert.assertNotNull(object, message);
        	fAssert.assertIsArray(object, message);
        	if (object.length > 0) return;
        	fail("assertIsArrayNotEmpty", message);
        }
        
        /**
         * @public assertIsObject
         * 
         * @param object
         * @param message
         */
        fAssert.assertIsObject = function (object, message) {
        	fAssert.assertNotNull(object, message);
        	if (angular.isObject(object)) return;
        	fail("assertIsObject", message);
        }
        
        
        /********************
         * Internal
         *******************/
        
        /**
         * @private stackTrace
         */
        function stackTrace() {
            var err = new Error();
            return err.stack;
        }
        
        /**
         * @private fail
         * 
         * @param functionName
         * @param message
         */
        function fail(functionName, message) {
        	fAssert.throwInfoMessage("Assert fail: "+message);
        	
        	if (message != null && message != undefined) {
        		throw "ERROR: '" + functionName + "' " + message + "\n" +stackTrace();
        	}
        	throw "ERROR: '" + functionName + "'\n" +stackTrace();
        }
        
        return fAssert;
    }]);
    