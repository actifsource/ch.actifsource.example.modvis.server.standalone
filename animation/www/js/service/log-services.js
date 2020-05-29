'use strict';

/**
 * Global modVis object is needed to multiplex all service requests to the
 * parent window.
 * 
 * So check if current window is a popup-window, if so use the parent window
 * modVis, otherwise instanciate a window global variable called modVis.
 */
var modVisService = (window.opener) ? window.opener.modVisService : {};

/** module for specify services */
angular.module('App.Service.LogService', [])
 
    /************************************************************************************************************
    * The logService service provides functions, like pull a SVG for a given diagram.
    * @constructor $rootScope, utility, assert, $errorHandler, $settings, $api, $q
    ************************************************************************************************************/
    .factory('logService', ['$rootScope', 'utility', 'assert', '$errorHandler', '$settings', '$api', '$q', 
                               function ($rootScope, utility, assert, $errorHandler, $settings, $api, $q) {  
    	
    	if (modVisService.globalService) {
            return modVisService.globalService;
        }
    	modVisService.globalService = {};
    	
    	modVisService.globalService.EVENT = {
				UPDATE_LOG : "snapshotUpdate"
    	};
    	
    	var fService = {handlers: [], handlerId: 0, logMessages:[]};
    	
    	/**
    	 * @private findHandlerIdOrNull
    	 * 
    	 * @param handlerId
    	 * @return find handler by handler id.
    	 */
    	function findHandlerIdOrNull(handlerId) {
            var context = fService.handlers.filter(function(handler) {
            	return utility.equals(handler.handlerId, handlerId);
            });
            return context[0];
        }
    	
    	/**
    	 * @public unbindStatefullcomponent IO
    	 * Unbind stateful component.
    	 * 
    	 * @param {Object} listener
    	 * @return handler
    	 */
    	modVisService.globalService.bind = function(listener) {
    		var newHandlerId = fService.handlerId++;
    		
    		modVisService.globalService.synchronizeFunction(function () {
    			var handler = findHandlerIdOrNull(newHandlerId);
    			if (handler == null) {
    				handler = {handlerId: newHandlerId, listener: listener};
    				fService.handlers.push(handler);
    				notifyBindListener();
    				assert.consoleLog_Service("'GlobalService' Bind");
    				return;
    			}
    			assert.assertfail("'GlobalService' handler allredy exist.");
            });
    		return [newHandlerId];
    	};
    	
    	/**
    	 * @public unbindStatefullcomponent IO
    	 * Unbind stateful component.
    	 * 
    	 * @param {Object} callbackHandle
    	 */
    	modVisService.globalService.unbind = function(callbackHandle) {	
    		if (callbackHandle == null) return;
    		var handlerId = angular.copy(callbackHandle[0]);
    		
    		modVisService.globalService.synchronizeFunction(function () {
    			var removeHandler = findHandlerIdOrNull(handlerId);
    			if (removeHandler == null) return;
    			assert.consoleLog_Service("'GlobalService' Unbind");
    			angular.forEach(fService.handlers, function(handler, index) {
    				if (removeHandler.handlerId != handler.handlerId) return;
    				fService.handlers.splice(index, 1);
    			});	
            });
    	};
    	
    	/**
		 * @public getChildNodes
		 * Returns all visible childs.
		 * 
		 * @param {st} 
		 * @return state color.
		 */
    	modVisService.globalService.getStateColor = function(st) {
			switch (st) {
				case $errorHandler.MESSAGE_ID.ERROR:
					return "#FF1034";
			
				case $errorHandler.MESSAGE_ID.WARNING:
					return "#FFFB10";
			
				case $errorHandler.MESSAGE_ID.INFO:
					return "#EA5800";
			
				default: 
					assert.logWarning("'LogService' Get color state not supported. 'State:' "+st);
					return "#EA5800";
			}
		}
		
    	/**
		 * @public getStateAsString
		 * Returns all visible childs.
		 * 
		 * @param {st} 
		 * @return state as string
		 */
    	modVisService.globalService.getStateAsString = function(st) {
			switch (st) {
				case $errorHandler.MESSAGE_ID.ERROR:
					return "ERROR";
			
				case $errorHandler.MESSAGE_ID.WARNING:
					return "WARNING";
			
				case $errorHandler.MESSAGE_ID.INFO:
					return "INFO";
			
				default: 
					return "Not Supported";
			}
		}
    	
    	/**
    	 * @private notifyBindListener
    	 * 
    	 */
    	function notifyBindListener() {
    		notifyListenerUpdateLog();
    	}
    	
    	/**
    	 * @private notifyListener
    	 * event = {id: (enum-> SNAPSHOT_UPDATE PROGRESS_STATE), , data:}
    	 */
    	function notifyListener(event) {
    		assert.assertNotNull(event);
    		angular.forEach(fService.handlers, function(handler) {
				var listener = handler.listener;
				if (listener == null || !angular.isFunction(listener)) return;
    			listener(event);
    		});
    	}
    	
    	/**
    	 * @private notifyListenerUpdateLog
    	 */
    	function notifyListenerUpdateLog() {
    		var data = {logMessages: angular.copy(fService.logMessages)};
        	var event = {id: modVisService.globalService.EVENT.UPDATE_LOG, data: data};
        	notifyListener(event);
    	}
    	
    	/**
    	 * @private handleLogResponse
    	 * 
    	 * @param jsonUpdateData
    	 */
    	function handleLogResponse(jsonUpdateData) {
    		/* add log message */
			angular.forEach(jsonUpdateData.log, function(jsonLog) {
				var st = utility.getValueOrDefault(jsonLog.st, $errorHandler.MESSAGE_ID.INFO);; 
				var msg = utility.getValueOrDefault(jsonLog.msg, "No Message");
				var time = utility.getValueOrDefault(jsonLog.time, 0);
				var stType = modVisService.globalService.getStateAsString(st);
				var logMessage = {st: st, stType: stType, msg: msg, time: time};
				fService.logMessages.push(logMessage);
			});
    		
    		notifyListenerUpdateLog();
    	}
    	
    	/**
    	 * @private synchronizeFunction
    	 * Synchronize function to handle async events.
    	 * 
    	 * @param syncfunction
    	 */
    	modVisService.globalService.synchronizeFunction = function(syncfunction) {
    		$rootScope.$applyAsync(syncfunction);
    	}
       
    	/**
    	 * @private isAvailableRecordFileResponse
    	 * 
    	 * @param jsonResponseData
    	 * @return true if the json message is log response.
    	 */
    	function isLogResponse(jsonResponseData) {
    		return jsonResponseData.log != null;
    	}
    	
    	/**
    	 * @private isModulServiceRequest
    	 * 
    	 * @param jsonResponseData
    	 * @return true if global message response.
    	 */
    	function isGlobalServiceResponse(jsonResponseData) {
    		return jsonResponseData.log != null;
    	}
    	
    	/**
		 * @private websocketDataListener
		 * Is called if any websocket json-data arrived.
		 * 
		 * @param jsonResponseData
		 */
    	function websocketDataListener(jsonResponseData) {
    		modVisService.globalService.synchronizeFunction(function () {
    			if (!isGlobalServiceResponse(jsonResponseData)) return;
    			
    			var responseDataHandled = false;
    			
    			/* isLiveUpdateResponse*/
    			if (isLogResponse(jsonResponseData)) {
    				assert.consoleLog_Service("'GlobalService' Handle log message");
    				handleLogResponse(jsonResponseData);
    				responseDataHandled = true;
    			}
    			
    			if (!responseDataHandled) {
    				assert.assertfail("'GlobalService' Response data not handled: "+jsonResponseData);
    			}
    		});
		}
    	
    	
    	/**
		 * @private errorArrived
		 * Call back error-control function.
		 * 
		 * @param error
		 * @param retryId
		 */
		function errorArrived(error, retryId) {}
		
		/**
		 * @private retryError
		 * Call back error-control function.
		 * 
		 * @param retryId
		 */
		function retryStart(retryId) {}
		
		/**
		 * @private retryContinue
		 * Call back error-control function.
		 * 
		 */
		function retryContinue() {}
		
		/**
		 * @private retryEnd
		 * Call back error-control function.
		 * 
		 */
		function retryEnd() {}
		
		/**
		 * @private messageHandler
		 * Call back error-control function.
		 * 
		 * @param message
		 * @param messageId
		 */
		function messageHandler(message, messageId) {
			modVisService.globalService.synchronizeFunction(function () {
				var time = utility.getCurrentEncodedTime();
				var st = utility.getValueOrDefault(messageId, $errorHandler.MESSAGE_ID.INFO);
				var msg = utility.getValueOrDefault(message, "No Message");
				var stType = modVisService.globalService.getStateAsString(st);
				var logMessage = {st: st, stType: stType, msg: msg, time: time};
				fService.logMessages.push(logMessage);
    			
				notifyListenerUpdateLog();
    		});
		}
		
    	/************
    	 * Init
    	 ************/
    	assert.consoleLog_Service("Init ModulService");
    	
    	$api.addWebsocketDataListener(websocketDataListener);
    	
    	/* subscribe for potential errors and opens the error box on error occurence */
		$errorHandler.subscribe(errorArrived, window, retryStart, retryContinue, retryEnd, messageHandler);
    	
    	/* retryError */
		$rootScope.$on('resetError', function(event, data) {
			modVisService.globalService.synchronizeFunction(function () {
				assert.consoleLog_Service("'GlobalService' Reset error.");
				
	        	/* reconnect */
	        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
	        		// TODOs
	        	}
			});
		});
		
    	return modVisService.globalService;
    	
    }]);
