'use strict';

/**
 * Global modVis object is needed to multiplex all service requests to the
 * parent window.
 * 
 * So check if current window is a popup-window, if so use the parent window
 * modVis, otherwise instanciate a window global variable called modVis.
 */
var modVis = (window.opener) ? window.opener.modVis : {};

/** module for specify services */
angular.module('App.Api.Api', [])
    
	/*********************************************************************************************************** 
    * The $api service provides basic functionality, like pull and send.
    * @constructor assert, $rootScope, $errorHandler, $settings, $q, $websocket, $http, $timeout
    ***********************************************************************************************************/
	.factory('$api', ['assert', '$rootScope', '$errorHandler', '$settings', '$q', '$websocket', '$http', '$timeout', '$cacheFactory', '$route', '$templateCache', 
	                  function (assert, $rootScope, $errorHandler, $settings, $q, $websocket, $http, $timeout, $cacheFactory, $route, $templateCache) {
	
		/* check if the service is allready instanciated on parent window */
		if (modVis.api) {
			return modVis.api;
		}
		modVis.api = {};
	
		var fWebsocketModeEnum = {
				NORMAL : 0,
				RETRY : 1
		};
		
		/* all websocket data handlers */
		var fService = {callbacks: [], websocket: null, websocketMode: fWebsocketModeEnum.NORMAL};
		
		/**
		 * @public addWebsocketDataListener
		 * Register the websocket callback data handler.
		 * 
		 * @param {function(data)} callback
		 */
		modVis.api.addWebsocketDataListener = function(callback) {
			updateDeferred(callback).then(callback);
		};
		
		/**
		 * @public removeWebsocketDataListener
		 * Remove the callback function from the list
		 * 
		 * @param {function(data)} callback
		 */
		modVis.api.removeWebsocketDataListener = function(callback) {
			angular.forEach(fService.callbacks, function(listenerData, index) {
				if (listenerData.callback == callback) {
					callbacks.splice(index,1);
				}
			});
		};
		
		/**
		 * @public send
		 * send websocket message.
		 * 
		 * @param {String or Object} message
		 */
		modVis.api.send = function(message) {
			if (fService.websocket == null || fService.websocket.readyState != 1) {
				if (angular.isString(message)) {
					assert.throwReconnectMessage("Websocket is not open! Cant send message: "+message);
				} else {
					assert.throwReconnectMessage("Websocket is not open! Cant send message: "+JSON.stringify(message), $errorHandler.RETRY_ID.RECONNECT);
				}
				return;
			}
			if (angular.isString(message)) {
				assert.consoleLog_Api('Send message websocket: '+message);
				fService.websocket.send(message);
				return;
			}
			if (angular.isObject(message)) {
				assert.consoleLog_Api('Send message websocket: '+JSON.stringify(message));
				fService.websocket.send(JSON.stringify(message));
			}
		};
		
		/**
		 * @public pull
		 * Pull a file from the server.
		 * 
		 * @param {File location} url 
		 * @returns {Promise}
		 */
		modVis.api.pull = function(url, responseType) {
			assert.consoleLog_Api('Pull url: '+url);
			
			var deferred = $q.defer(),
	        config = {method: 'GET', url: url, responseType: responseType};   
	        
		    $http(config).success(function (data) {
		    	if (data == null) {
		    		config = {method: 'GET', url: url, responseType: null};   
		    		$http(config).then(function (data) {
		    			deferred.resolve(data);
		    		});
            		assert.throwReconnectMessage("Pull url: '"+ url +"' Pars error response type: '"+responseType+"'");
        		} else {
        			deferred.resolve(data);
        		}
	        })
	        .error(function (data, status, headers, config){
	            if (status == 404) {
	                deferred.reject();
	            } else {
	                var error = {data: data, status: status, headers: headers, config: config};
	                deferred.reject(error);
	            }
	        });
	    	return deferred.promise;
		};
		
		/**
		 * @public isServerAvailable
		 * Check if the websocket is connected.
		 * 
		 * @returns {Boolean}
		 */
		modVis.api.isServerAvailable = function() {
			if (fService.websocket == null) {
				return false;
			}
			if (fService.websocket.readyState != 1) {
				return false;
			}
			return true;
		};
		
		
		/**
		 * @private updateDeferred
		 * Update all calbacks listener.
		 * 
		 * @param callback
		 */
		function updateDeferred(callback) {
			var deferred = $q.defer();
			fService.callbacks.push({callback: callback, deferred: deferred});
			return deferred.promise;
		}
		
		/**
		 * @private retryWebsocketConnection
		 * Retry websocket connection.
		 */
		function retryWebsocketConnection() {
			if (modVis.api.isServerAvailable()) {
				fService.websocketMode = fWebsocketModeEnum.NORMAL;
				$errorHandler.retryComplete();
				return;
			}
			fService.websocketMode = fWebsocketModeEnum.RETRY;
			$errorHandler.retryContinue();
			openWebsocket();
		}
		
		/**
		 * @private openWebsocket
		 * Open websocket connection.
		 */
		function openWebsocket() {
			var option = {maxTimeout: 50, initialTimeout: 500}
			fService.websocket = $websocket('ws://'+location.hostname+':'+$settings.websocketPort+'/'+$settings.websocketPath, option);
			
			
			/**
			 * @private onMessage
			 * Handle the received message from the websocket.
			 * 
			 * @param event 
			 */
			fService.websocket.onMessage(function(event) {
				
				assert.consoleLog_Api('Receive message websocket: '+event.data);
				
				var jsonMessage;
				try {
					jsonMessage = JSON.parse(event.data);
				} catch (e) {
					assert.throwInfoMessage("Receive websocket message is not a json message! "+e);
					return;
				}
				
				if (jsonMessage.error != null) {
					angular.forEach(jsonMessage.error, function(errorMessage) {
						assert.throwMessage(errorMessage.msg, errorMessage.nr);
					});
					return;
				}
				
				notifyWebsocketListener(jsonMessage);
			});
			
			/**
			 * @private notifyWebsocketListener
			 * Notify websocket listener.
			 * 
			 * @param jsonMessage 
			 */
			function notifyWebsocketListener(jsonMessage) {
				
				angular.forEach(fService.callbacks, function(listenerData) {
					listenerData.deferred.resolve(jsonMessage);
				});
			
				var copyCallbacks = [];
				copyCallbacks = fService.callbacks;
				fService.callbacks = [];
				
				angular.forEach(copyCallbacks, function(listenerData) {
					updateDeferred(listenerData.callback).then(listenerData.callback);
				});
			}
			
			/**
			 * @private onError
			 * Handle the received error from the websocket.
			 * 
			 * @param event 
			 */
			fService.websocket.onError(function(event) {
				if (fService.websocketMode == fWebsocketModeEnum.NORMAL) {
					assert.throwInfoMessage("Websocket has error: "+event, null);
				}
			});
		
			/**
			 * @private onClose
			 * Handle the received close event from the websocket.
			 * 
			 * @param event 
			 */
			fService.websocket.onClose(function(event) {
				if (fService.websocketMode == fWebsocketModeEnum.RETRY) {
					
					$timeout(function () {
		    			retryWebsocketConnection();
		            }, 100);	
					return;
				}
				
				assert.throwReconnectMessage("Websocket is closed: "+'ws://'+location.hostname+':'+$settings.websocketPort+'/'+$settings.websocketPath);
			});
		
			/**
			 * @private onOpen
			 * Handle the received open event from the websocket.
			 * 
			 */
			fService.websocket.onOpen(function() {
				if (fService.websocketMode == fWebsocketModeEnum.RETRY) {
					$errorHandler.retryComplete();
				}
				fService.websocketMode = fWebsocketModeEnum.NORMAL;
				assert.consoleLog_Api("'WebSocket' is open "+"ws://"+location.hostname+":"+$settings.websocketPort+"/"+$settings.websocketPath);
			});
		}
		
		/************
    	 * Init
    	 ************/
		
		/* retryError */
		$rootScope.$on('resolveError', function(event, data) {
			assert.consoleLog_Api("'WebSocket' Resolve error");
			
        	/* reconnect */
        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
        		var httpCache = $cacheFactory.get('$http');  
        		if (httpCache != null) {
        			httpCache.remove('gen/');  	
        		}
        		$templateCache.removeAll();
        		$route.reload();
        		retryWebsocketConnection();
        	}
		});
		
		/* init websocket */
		openWebsocket();
		
		return modVis.api;
	}]);
    