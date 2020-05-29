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
angular.module('App.Service.ValueSevice', [])

    /************************************************************************************************************
    * The valueSevice service provides functions, like bind and unbind sks.
    * @constructor $rootScope, requestHandler, fileHandler, utility, assert, $errorHandler, $window, $settings, $filter, $api, $q, animationStrategy
    ************************************************************************************************************/
    .factory('valueSevice', ['$rootScope', 'requestHandler', 'fileHandler', 'utility', 'assert', '$errorHandler', '$window', '$settings', '$filter', '$api', '$q', 'animationStrategy', 
                                           function($rootScope, requestHandler, fileHandler, utility, assert, $errorHandler, $window, $settings, $filter, $api, $q, animationStrategy) {  
    	
    	if (modVisService.valueService) {
    		return modVisService.valueService;
        }
    	modVisService.valueService = {};
    	
    	/** 
    	 * this function
    	 * Contains all binded contexts = {valueId: , currentSeq: , currentTime: , snapshot:, initSnapshot:, initSt:, animationStrategie:, handlers:}; 
    	 */
    	var fService = {contexts: [], handlerId: 0};
    	
    	modVisService.valueService.EVENT = {
    					VALUE_UPDATE : "snapshotUpdate"
    	};
 
    	/**
    	 * @public bindStatefullComponent
    	 * Bind value component.
    	 * 
    	 * @param {Object} valueId
    	 * @param {Object} cycletime
    	 * @param {Object} listener
    	 * @return {Object} handler
    	 */
    	modVisService.valueService.bindValue = function(valueId, cycletime, listener) {
    		
    		var newHandlerId = fService.handlerId++;
    		var valueId_ = angular.copy(valueId);
    		var cycletime_ = angular.copy(cycletime);
    		
    		synchronizeFunction(function () {
    			assert.consoleLog_Service("'ValueSevice' Bind value 'id': "+valueId_);
    			
    			var context = findContextsByValueIdOrNull(valueId_);
    			if (context == null) {
    				fService.contexts.push(createContext(valueId_, cycletime_, listener, newHandlerId));
    				assert.consoleLog_Service("'ValueSevice' Create context 'id': "+valueId_);
    				return;
    			}
    			context.handlers.push([newHandlerId, listener]);
    			
    			/* notify listener used to init the new controller */
    			notifyListenerUpdateValue(valueId_);
            });
    		return [valueId, newHandlerId];
    	};
    	
    	/**
    	 * @public unbindValue
    	 * Unbind value component.
    	 * 
    	 * @param callbackHandle
    	 */
    	modVisService.valueService.unbindValue = function(callbackHandle) {	
    		if (callbackHandle == null) return;
    		
    		var valueId = angular.copy(callbackHandle[0]);
			var handlerId = angular.copy(callbackHandle[1]);
    		
    		synchronizeFunction(function () {
    		
    			var context = findContextsByValueIdOrNull(valueId);
    			if (context == null) return;
    			
    			assert.consoleLog_Service("'ValueSevice' Unbind value 'id': "+valueId);
    			
    			angular.forEach(context.handlers, function(handler, index) {
    				if (handlerId != handler[0]) return;
    				context.handlers.splice(index, 1);
    				if (context.handlers.length != 0) return;
    				deleteContext(valueId);
    			});	
            });
    	};
    	
    	/**
    	 * @private synchronizeFunction
    	 * Synchronize function to handle async events.
    	 * 
    	 * @param syncfunction
    	 */
    	function synchronizeFunction(syncfunction) {
    		$rootScope.$applyAsync(syncfunction);
    	}
    	
    	/**
    	 * @private notifyListener
    	 * 
    	 * @param valueId
    	 */
    	function notifyListenerUpdateValue(valueId) {
    		var context = findContextsByValueIdOrNull(valueId);
    		assert.assertNotNull(context);
    		var data = {valueId: valueId, currentValue: context.currentValue, currentState: context.currentState};
    		var event = {id: modVisService.valueService.EVENT.VALUE_UPDATE, data: data};
    		notifyListener(valueId, event);
    	}
    	
    	/**
    	 * @private notifyListener
    	 * event = {id: (enum-> SNAPSHOT_UPDATE PROGRESS_STATE), , data:}
    	 * 
    	 * @param valueId
    	 * @param event
    	 */
    	function notifyListener(valueId, event) {
    		assert.assertNotNull(event);
    		var context = findContextsByValueIdOrNull(valueId);
    		assert.assertNotNull(context);
    		angular.forEach(context.handlers, function(handler) {
				var listener = handler[1];
				if (listener == null || !angular.isFunction(listener)) return;
    			listener(event);
    		});
    	}
    	
    	/** 
         * @private filterContextsBySkId
         * Returns the first elementstate with the uuid in elementstates.
         *
         * @param valueId
         * @returns {Object} context
         */
         function findContextsByValueIdOrNull(valueId) {
             var context = fService.contexts.filter(function(context) {
            	 return utility.equals(context.valueId, valueId);
             });
             return context[0];
         }
    	
         /**
     	 * @private createContext
     	 * Create a new context of a statefullComponent.
     	 * 
     	 * contexts = {skId: , currentSeq: , currentTime: , snapshot:, initSnapshot:, initSt:, animationStrategie:, listeners:};
     	 * snapshot.elementState = {id: , st: , time: , seq: , guidPath:, group:};
     	 * 
     	 * @param {Object} skId
     	 * @param {Object} listener
     	 */
     	function createContext(valueId, cycletime, listener, newHandlerId) {
     		var context = {initcomplete: false, valueId: valueId, cycletime: cycletime, currentValue: "", currentState: 0, handlers: [[newHandlerId, listener]]};
     		
     		/* init is completed */
			context.initcomplete = true;
			
     		/* send skId request */
			requestHandler.bindValue(context.valueId, context.cycletime);
			
			return context;
     	}
     	
     	/**
    	 * @private deleteContext
    	 * Defer dispose a context and defer a context if 
    	 * 
    	 * contexts 	= {skId: , currentSeq: , currentTime: , snapshot:, initSnapshot:, initSt:, animationStrategie:, listeners:};
    	 * elementState = {id: , st: , time: , seq: , guidPath:, group:};
    	 * 
    	 * @param valueId
    	 */
    	function deleteContext(valueId) {
    		setTimeout(function() {
				synchronizeFunction(function () {
					
					angular.forEach(fService.contexts, function(context, index) {
						if (!utility.equals(context.valueId, valueId)) return;
						if (context.handlers.length > 0) return;
						fService.contexts.splice(index, 1);
		    			requestHandler.unbindValue(valueId);
		    			assert.consoleLog_Service("'ValueSevice' Delete context 'id': "+valueId);
					});
					
				});
			}, 500);
    	}
     	
    	/**
    	 * @private resetServie
    	 * Reset the control.
    	 */
    	function resetServie() {
    		synchronizeFunction(function () {
    			fService.contexts = [];
        		fService.handlerId = 0;
    		});
    	}
    	
    	/**
    	 * @private handleValueUpdateResponse
    	 * 
    	 * @param context
    	 * @param jsonValue
    	 */
    	function handleValueUpdateResponse(context, jsonValue) {
    		assert.assertNotNull(jsonValue.value, "'ValueSevice' Value not defined.");
    		assert.assertNotNull(jsonValue.st, "'ValueSevice' State not defined.");
    		context.currentValue = jsonValue.value;
    		context.currentState = jsonValue.st;
    		notifyListenerUpdateValue(context.valueId);
    	}
    	
    	/**
    	 * @private isValueResponse
    	 * 
    	 * @param jsonResponseData
    	 */
    	function isValueResponse(jsonResponseData) {
    		return jsonResponseData.value != null;
    	}
    	
    	/**
		 * @private websocketDataListener
		 * Is called if any websocket json-data arrived.
		 * 
		 * @param jsonResponseData
		 */
    	function websocketDataListener(jsonResponseData) {
    		synchronizeFunction(function () {
    			
    			/* ValueResponse */
    			if (isValueResponse(jsonResponseData)) {
    				angular.forEach(jsonResponseData.value, function(jsonValue) {
    					assert.assertNotNull(jsonValue.id, "'ValueSevice' Id not defined.");
    					var context = findContextsByValueIdOrNull(jsonValue.id);
    					if (context == null) {
    						assert.assertfail("WARNING Value context not suported " + jsonValue.id);
    						return;
    					}
    					handleValueUpdateResponse(context, jsonValue);
    				});
    				
    			}
    		});
    	}
    	
    	/************
    	* Init
    	************/
        assert.consoleLog_Service("Init ValueService");
         
        $api.addWebsocketDataListener(websocketDataListener);
        
        /* retryError */
		$rootScope.$on('resetError', function(event, data) {
			synchronizeFunction(function () {
				assert.consoleLog_Service("'ValueSevice' Reset error.");
				
	        	/* reconnect */
	        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
	        		resetServie();
	        	}
			});
		});
		
    	return modVisService.valueService;
    }]);
