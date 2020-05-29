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
angular.module('App.Service.TestsuiteService', [])
 
    /************************************************************************************************************
    * The logService service provides functions, like pull a SVG for a given diagram.
    * @constructor $rootScope, utility, assert, $errorHandler, $settings, $api, $q
    ************************************************************************************************************/
    .factory('testsuiteService', ['requestHandler', '$rootScope', 'utility', 'assert', '$errorHandler', '$settings', '$api', '$q', 
                               function (requestHandler, $rootScope, utility, assert, $errorHandler, $settings, $api, $q) {  
    	
    	if (modVisService.testsuiteService) {
            return modVisService.testsuiteService;
        }
    	modVisService.testsuiteService = {};
 
    	/* Event */
    	modVisService.testsuiteService.EVENT = {
				UPDATE_STATE : "updateState",
				UPDATE_LOG : "updateLog",
				REQUIRED_INPUT_PENDING : "requiredInputPending"
    	};
    	
    	var fService = {
    			handlers: [], 
    			handlerId: 0,
    			
    			testcase: [],
    			
    			/* log */
    			logOutputMessages: [],
    			
    			/* Testsuite is Connected */
    			testsuiteConnected: false,
    			bindedTestcase: null,
    			testcaseEditMode: true,
    			
    			/* id of the pending input */
    			requiredInputPendingId: null,
    			
    			/* wait command response */
    			isExecuting: false
    	};
    	
    	/******************************************
    	 * Bind
    	 *****************************************/
   
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
    	 * @public testsuiteService.bind
    	 * Testsuite Service.
    	 * 
    	 * @param {Object} listener
    	 * @return handler
    	 */
    	modVisService.testsuiteService.bind = function(listener) {
    		var newHandlerId = fService.handlerId++;
    		
    		synchronizeFunction(function () {
    			var handler = findHandlerIdOrNull(newHandlerId);
    			if (handler == null) {
    				handler = {handlerId: newHandlerId, listener: listener};
    				fService.handlers.push(handler);
    				if (utility.getArrayLength(fService.handlers) == 1) {
    					handleFirstBind();
    				}
    				notifyBindListener();
    				assert.consoleLog_Service("'TestsuiteService' Bind");
    				return;
    			}
    			assert.assertfail("'TestsuiteService' handler allredy exist.");
            });
    		return [newHandlerId];
    	};
    	
    	/**
    	 * @public testsuiteService.unbind
    	 * Testsuite Service.
    	 * 
    	 * @param {Object} callbackHandle
    	 */
    	modVisService.testsuiteService.unbind = function(callbackHandle) {	
    		if (callbackHandle == null) return;
    		var handlerId = angular.copy(callbackHandle[0]);
    		
    		synchronizeFunction(function () {
    			var removeHandler = findHandlerIdOrNull(handlerId);
    			if (removeHandler == null) return;
    			assert.consoleLog_Service("'TestsuiteService' Unbind");
    			angular.forEach(fService.handlers, function(handler, index) {
    				if (removeHandler.handlerId != handler.handlerId) return;
    				fService.handlers.splice(index, 1);
    			});	
            });
    	};

    	/**
    	 * @private handleFirstBind
    	 * 
    	 */
    	function handleFirstBind() {
    		requestHandler.startTestbench();
    		fService.isExecuting = true;
			notifyListenerUpdateState();
    	}
    	
    	/**
    	 * @private notifyBindListener
    	 * 
    	 */
    	function notifyBindListener() {
    		notifyListenerUpdateLog();
    		notifyListenerUpdateState();
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
    	 * @private synchronizeFunction
    	 * Synchronize function to handle async events.
    	 * 
    	 * @param syncfunction
    	 */
    	function synchronizeFunction(syncfunction) {
    		$rootScope.$applyAsync(syncfunction);
    	}
    	
    	/******************************************
    	 * Listener
    	 *****************************************/
    	
    	/**
    	 * @private notifyListenerUpdateLog
    	 */
    	function notifyListenerUpdateState() {
    		var data = {testcase: 				angular.copy(fService.testcase),
    					bindedTestcase:			fService.bindedTestcase,
    					isExecuting: 			fService.isExecuting, 
						testsuiteConnected: 	fService.testsuiteConnected, 
						testcaseEditMode: 		fService.testcaseEditMode};
    	
    		var event = {id: modVisService.testsuiteService.EVENT.UPDATE_STATE, data: data};
			notifyListener(event);
    	}
    	
    	/**
    	 * @private notifyListenerRequiredInputPending
    	 */
    	function notifyListenerRequiredInputPending() {
    		var data = {requiredInputPendingId: fService.requiredInputPendingId};
    		var event = {id: modVisService.testsuiteService.EVENT.REQUIRED_INPUT_PENDING, data: data};
			notifyListener(event);
    	}
    	
    	/**
    	 * @private notifyListenerUpdateLog
    	 */
    	function notifyListenerUpdateLog() {
    		var data = {logOutputMessages: angular.copy(fService.logOutputMessages)};
        	var event = {id: modVisService.testsuiteService.EVENT.UPDATE_LOG, data: data};
        	notifyListener(event);
    	}
    	
    	/******************************************
    	 * Log
    	 *****************************************/
    	
    	/**
		 * @public addLogOutputMessage
		*/
    	function addLogOutputMessage(message) {
    		assert.assertNotNull(message);
    		var size = utility.getArrayLength(fService.logOutputMessages);
    		fService.logOutputMessages.push({id:size, message: message});
    		notifyListenerUpdateLog();
    	}
    	
    	/**
		 * @public addLogOutputMessage
		*/
    	function clearLogOutputMessage() {
    		fService.logOutputMessages = [];
    		notifyListenerUpdateLog();
    	}
    	
    	/******************************************
    	 * TestBench interface
    	 *****************************************/
    	
    	/**
		 * @public resetTestbench
		*/
    	modVisService.testsuiteService.resetTestbench = function () {
    		synchronizeFunction(function () {
    			assert.consoleLog_Service("'TestsuiteService' resetTestbench");
    			requestHandler.resetTestbench();
    			fService.isExecuting = true;
    			fService.requiredInputPendingId = null;
    			if (fService.testsuiteConnected) {
    				fService.testcaseEditMode = false;
    			}
    			notifyListenerUpdateState();
    			notifyListenerRequiredInputPending();
			});
    	};
    	
    	/**
		 * @public sendTestbenchEvent
		*/
    	modVisService.testsuiteService.sendTestbenchEvent = function(id, value, index) {
    		synchronizeFunction(function () {
    			if (fService.requiredInputPendingId == null) {
    				assert.consoleLog_Service("'TestsuiteService' sendTestbenchEvent id: "+id);
    				requestHandler.sendTestbenchEvent(id, value, index);
    				fService.isExecuting = true;
        			notifyListenerUpdateState();
    			} else {
    				assert.consoleLog_Service("'TestsuiteService' sendRequiredOutput id: "+id);
    				requestHandler.sendRequiredOutput(id, value, index);
    				fService.requiredInputPendingId = null;
    				fService.isExecuting = true;
        			notifyListenerUpdateState();
    				notifyListenerRequiredInputPending();
    			}
			});
    	};
    	
    	/******************************************
    	 * Testsuite interface
    	 *****************************************/
    	
    	/**
		 * @public connectTestsuite
		*/
    	modVisService.testsuiteService.toggleConnectTestsuite = function () {
			synchronizeFunction(function () {
				assert.consoleLog_Service("'TestsuiteService' toggleConnectTestsuite");
				if (fService.testsuiteConnected) {
					fService.testsuiteConnected = false;
					fService.testcaseEditMode = true;
					fService.isExecuting = true;
					requestHandler.disconnectTestsuite();
				} else {
					fService.testsuiteConnected = true;
					fService.testcaseEditMode = false;
					fService.isExecuting = true;
					fService.bindedTestcase = null;
					requestHandler.connectTestsuite();
				}
				notifyListenerUpdateState();
			});
		};
		/******************************************
    	 * Testcase interface
    	 *****************************************/
		
		/**
		 * @public bindTestcase
		*/
		modVisService.testsuiteService.bindTestcase = function(testcase) {
			synchronizeFunction(function () {
				if (utility.equals(fService.bindedTestcase, testcase)) return;
				assert.consoleLog_Service("'TestsuiteService' bindTestcase: "+testcase);
				fService.testcaseEditMode = false;
				fService.isExecuting = true;
				fService.bindedTestcase = testcase;
				requestHandler.bindTestcase(fService.bindedTestcase);
				notifyListenerUpdateState();
			});
		};
		
		/**
		 * @public bindTestcase
		*/
		modVisService.testsuiteService.stepTestcase = function() {
			synchronizeFunction(function () {
				assert.consoleLog_Service("'TestsuiteService' stepTestcase");
				fService.isExecuting = true;
				requestHandler.stepTestcase();
				notifyListenerUpdateState();
			});
    	};
    	
    	/**
		 * @public runTestcase
		*/
    	modVisService.testsuiteService.runTestcase = function() {
    		synchronizeFunction(function () {
    			assert.consoleLog_Service("'TestsuiteService' runTestcase");
    			fService.isExecuting = true;
				requestHandler.runTestcase();
				notifyListenerUpdateState();
			});
    	};
    	
    	/**
		 * @public editTestcase
		*/
    	modVisService.testsuiteService.toggleEditModeTestcase = function() {
    		synchronizeFunction(function () {
    			assert.consoleLog_Service("'TestsuiteService' toggleEditModeTestcase");
    			if (fService.testcaseEditMode) {
    				fService.testcaseEditMode = false;
    				fService.isExecuting = true;
    				requestHandler.resetTestbench();
    			} else {
    				fService.testcaseEditMode = true;
    				fService.isExecuting = true;
    				requestHandler.editTestcase();	
    			}
    			notifyListenerUpdateState();
			});
    	};
		
    	/******************************************
    	 * websocket
    	 *****************************************/
    	
    	/**
    	 * @private handleTestcaseResponse
    	 * 
    	 * @param jsonUpdateData
    	 */
    	function handleTestcaseResponse(jsonResponseData) {
    		if (jsonResponseData.testcase == null) return false;
    		
    		assert.assertIsArrayNotEmpty(jsonResponseData.testcase);
    		fService.testcase = [];
			angular.forEach(jsonResponseData.testcase, function(testcaseName, index) {
				fService.testcase.push({id:index, name:testcaseName});
			});
			notifyListenerUpdateState();
			return true;
    	}
    	
    	/**
    	 * @private handleTestcaseResponse
    	 * 
    	 * @param jsonUpdateData
    	 */
    	function handleTestbenchLogResponse(jsonResponseData) {
    		if (jsonResponseData.testbenchLog == null) return false;
    		
    		angular.forEach(jsonResponseData.testbenchLog, function(log) {
    			if (log.type == "clear") {
    				clearLogOutputMessage();
    			}
    			addLogOutputMessage(log.msg);
			});
    		return true;
    	}
    	
    	/**
    	 * @private handleTestbenchStateResponse
    	 * 
    	 * @param jsonResponseData
    	 */
    	function handleTestbenchStateResponse(jsonResponseData) {
    		if (jsonResponseData.testbenchState == null) return false;
    		
    		if (jsonResponseData.testbenchState == "complete") {
    			fService.isExecuting = false;
    			notifyListenerUpdateState();
    			return true;
    		}
    		return false;
    	}
    	
    	/**
    	 * @private handleRequiredInputPending
    	 * 
    	 * @param jsonUpdateData
    	 */
    	function handleRequiredInputPending(jsonResponseData) {
    		if (jsonResponseData.requiredInput == null) return false;
    		
    		fService.requiredInputPendingId = jsonResponseData.requiredInput.id;
    		fService.isExecuting = false;
			notifyListenerUpdateState();
    		notifyListenerRequiredInputPending();
    		return true;
    	}

    	/**
    	 * @private handleTestbenchActionResponse
    	 * 
    	 * @param jsonUpdateData
    	 */
    	function handleTestbenchActionResponse(jsonResponseData) {
    		if (jsonResponseData.testbenchAction == null) return false;
    		return true;
    	}
    	
    	/**
    	 * @private isModulServiceRequest
    	 * 
    	 * @param jsonResponseData
    	 * @return true if global message response.
    	 */
    	function isTestsuiteServiceResponse(jsonResponseData) {
    		return 	jsonResponseData.testcase != null ||
    				jsonResponseData.testbenchLog != null ||
    				jsonResponseData.testcaseState != null ||
    				jsonResponseData.testbenchState != null ||
    				jsonResponseData.testbenchAction != null ||
    				jsonResponseData.requiredInput != null;
    	}
    	
    	/**
		 * @private websocketDataListener
		 * Is called if any websocket json-data arrived.
		 * 
		 * @param jsonResponseData
		 */
    	function websocketDataListener(jsonResponseData) {
    		synchronizeFunction(function () {
    			if (!isTestsuiteServiceResponse(jsonResponseData)) return;
    			
    			var responseDataHandled = false;
    			
    			/* handleTestcaseResponse */
    			if (handleTestcaseResponse(jsonResponseData)) {
    				assert.consoleLog_Service("'TestsuiteService' Handle testcase");
    				responseDataHandled = true;
    			}
    			
    			/* handleTestbenchLogResponse */
    			if (handleTestbenchLogResponse(jsonResponseData)) {
    				assert.consoleLog_Service("'TestsuiteService' Handle testbench log");
    				responseDataHandled = true;
    			}
    			
    			/* handleTestbenchStateResponse */
    			if (handleTestbenchStateResponse(jsonResponseData)) {
    				assert.consoleLog_Service("'TestsuiteService' Handle Testbench State Response");
    				responseDataHandled = true;
    			}
    			
    			/* handleRequiredInputPending */
    			if (handleRequiredInputPending(jsonResponseData)) {
    				assert.consoleLog_Service("'TestsuiteService' Handle Required Input Pending");
    				responseDataHandled = true;
    			}
    			
    			/* handleTestbenchActionResponse */
    			if (handleTestbenchActionResponse(jsonResponseData)) {
    				assert.consoleLog_Service("'TestsuiteService' Handle Testbench Action Response");
    				responseDataHandled = true;
    			}
    			
    			if (!responseDataHandled) {
    				assert.assertfail("'TestsuiteService' Response data not handled: "+jsonResponseData);
    			}
    		});
		}
    	
    	/**
    	 * @private resetServie
    	 * Reset the control.
    	 */
    	function resetServie() {
    		synchronizeFunction(function () {
    			fService.handlers = []; 
    			fService.handlerId = 0;
    			fService.testcase = [];
    			fService.logOutputMessages = [];
    			fService.isExecuting = false;
    			fService.testsuiteConnected = false;
    			fService.testcaseEditMode = true;
    			fService.requiredInputPendingId = null;
    			fService.bindedTestcase = null;
    		});
    	}

    	/************
    	 * Init
    	 ************/
    	assert.consoleLog_Service("Init TestsuiteService");
    	
    	$api.addWebsocketDataListener(websocketDataListener);
    	
    	/* retryError */
		$rootScope.$on('resetError', function(event, data) {
			synchronizeFunction(function () {
				assert.consoleLog_Service("'TestsuiteService' Reset error.");
				
	        	/* reconnect */
	        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
	        		resetServie();
	        	}
			});
		});
		
    	return modVisService.testsuiteService;
    	
    }]);
