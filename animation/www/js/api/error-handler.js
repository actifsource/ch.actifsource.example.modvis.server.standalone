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
angular.module('App.Api.ErrorHandler', [])
    
    /************************************************************************************************************ 
    * The $errorHandler service provides error handling functions.
    * @constructor $settings, $timeout
    ***********************************************************************************************************/
    .factory('$errorHandler', ['$settings', '$timeout',
                               function ($settings, $timeout) {  

        // check if the service is allready instanciated on parent window
        if (modVis.errorHandler) {
            return modVis.errorHandler;
        }
        modVis.errorHandler = {};

        var fService = {subscribers: [], currentRetryId: null};
        
        /* Error state message */
        fService.errorStateMessages = {
            unknown: 'Unknown error. Maybe no server connection.',
            900: 'To many diagrams are open, please close one diagrem.'
        };
        
        /* Error retry id */
        modVis.errorHandler.RETRY_ID = {
        	INFO: 0,
        	RESET: 1,
        	RECONNECT: 2
        };
        
        /* Message type */
        modVis.errorHandler.MESSAGE_ID = {
        	ERROR: 0,
        	WARNING: 1,
        	INFO: 2
        };
        
        /** 
         * @public handle
         * Publishes the error and notify all subscribers function 'messageHandler'.
         *
         * @param {Object} error
         * @param {Function} retryFn
         */
         modVis.errorHandler.handleMessage = function (message, messageId) {
             if (messageId == null) {
            	 messageId = modVis.errorHandler.MESSAGE_ID.INFO;
             }
             
             angular.forEach(fService.subscribers, function (subscriberHandle, index) {
                 if (subscriberHandle[1] && subscriberHandle[1].closed) {
                 	fService.subscribers.splice(index, 1);
                 } else {
                     subscriberHandle[5](message, messageId);
                 }
             });
        };
         
        /** 
        * @public handle
        * Publishes the error and retry function to all subscribers.
        *
        * @param {Object} error
        * @param {Function} retryFn
        */
        modVis.errorHandler.handleException = function (error, retryId) {
            if (retryId == null) {
            	retryId = modVis.errorHandler.RETRY_ID.INFO;
            }
            
        	var msg = getErrorMessage(error);
        	
            angular.forEach(fService.subscribers, function (subscriberHandle, index) {
                if (subscriberHandle[1] && subscriberHandle[1].closed) {
                	fService.subscribers.splice(index, 1);
                } else {
                    subscriberHandle[0](msg, retryId);
                }
            });
        };

        /**
         * @public retryFn
         * Retry function start.
         * 
         * @param retryId
         */
        modVis.errorHandler.retryFn = function (retryId) {
        	
        	/* info error */
        	if (retryId == modVis.errorHandler.RETRY_ID.INFO) {
        		notifyHandleRetryStart(retryId);
        		
        		$timeout(function () {
        			notifyHandleRetryEnd();
        		}, 500);
        	}
        	
        	/* reset browser */
        	if (retryId == modVis.errorHandler.RETRY_ID.RESET) {
        		angular.forEach(fService.subscribers, function (subscriberHandle, index) {
                    if (subscriberHandle[0] && subscriberHandle[1].closed) {
                    	fService.subscribers.splice(index, 1);
                    } else {
                        subscriberHandle[1].location.reload();
                    }
                });
        	}
        	
        	/* reconnect */
        	if (retryId == modVis.errorHandler.RETRY_ID.RECONNECT) {
        		notifyHandleRetryStart(retryId);
        	}
        	
        };
        
        /**
         *  @public retryComplete
         *  Retry function complete.
         */
        modVis.errorHandler.retryComplete = function() {
        	if (fService.currentRetryId == modVis.errorHandler.RETRY_ID.RECONNECT) {
        		notifyHandleRetryEnd();
        	}
		};
        
        /**
         *  @public retryComplete
         *  Retry function continue.
         */
        modVis.errorHandler.retryContinue = function() {
        	if (fService.currentRetryId == modVis.errorHandler.RETRY_ID.RECONNECT) {
        		notifyHandleRetryContinue();
        	}
		};
        
        /** 
        * @public subscribe
        * Subscribe for error handling.
        *
        * @param {Function} callback
        * @param {Window} activeWindow
        */
        modVis.errorHandler.subscribe = function (errorArrived, activeWindow, retryStart, retryContinue, retryEnd, messageHandler) {
        	fService.subscribers.push([errorArrived, activeWindow, retryStart, retryContinue, retryEnd, messageHandler]);
        };

        /**
         * @private notifyHandleRetryStart
         * Notify listener retry start.
         */
        function notifyHandleRetryStart(retryId) {
        	fService.currentRetryId = retryId;
        	
        	angular.forEach(fService.subscribers, function (subscriberHandle, index) {
                if (subscriberHandle[2] && subscriberHandle[1].closed) {
                	fService.subscribers.splice(index, 1);
                } else {
                    subscriberHandle[2](retryId);
                }
            });
        }
        
        /**
         * @private notifyHandleRetryContinue
         * Notify listener retry continue.
         */
        function notifyHandleRetryContinue() {
        	angular.forEach(fService.subscribers, function (subscriberHandle, index) {
                if (subscriberHandle[3] && subscriberHandle[1].closed) {
                	fService.subscribers.splice(index, 1);
                } else {
                    subscriberHandle[3]();
                }
            });
        }
        
        /**
         * @private notifyHandleRetryEnd
         * Notify listener retry end.
         */
        function notifyHandleRetryEnd() {
        	fService.currentRetryId = null;
        	
        	angular.forEach(fService.subscribers, function (subscriberHandle, index) {
                if (subscriberHandle[4] && subscriberHandle[1].closed) {
                	fService.subscribers.splice(index, 1);
                } else {
                    subscriberHandle[4]();
                }
            });
        }
        
        /**
         * @private getErrorMessage
         * Returns the error message as string.
         * 
         * @param {Object} error
         * @return error message
         */
        function getErrorMessage(error) {
        	if (angular.isString(error)) {
        		return error;
			} 
        	if (angular.isObject(error)) {
				if(error.status && fService.errorStateMessages[error.status]){
                    return $settings.errorMessages[error.status];
                }
			}
        	return $settings.errorMessages.unknown;
        }
        
        return modVis.errorHandler;
    }]);
    