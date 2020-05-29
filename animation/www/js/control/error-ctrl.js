'use strict';

/** module for specify controllers */
angular.module('App.Control.ErrorCtrl', [])


	/*********************************************************************************************************** 
	 * Defines Error Controller Handles the appearance of the error box.
	 * @constructor assert, $errorHandler, $scope, $rootScope, $timeout, $location
	 ***********************************************************************************************************/
	.controller('ErrorCtrl', [ 'assert', '$errorHandler', '$scope', '$rootScope', '$timeout', '$location',
	                           function (assert, $errorHandler, $scope, $rootScope, $timeout, $location) {
		
			$scope.hasError = false;
			$scope.hasRetryStarted = false;
			$scope.retryCont = 0;
			$scope.linkMsg = '';
			$scope.errorMsg = '';
		
			var closeMsg 		= 'Errormessage close';
			var	retryMsg 		= 'Reset browser';
			var	retryMsg 		= 'Start autopolling';
			var	retryStartMsg 	= 'Autopolling active';
			
			/**
			 * @private getErrorArrivedLinkMessage
			 * Call back function error-handler
			 * 
			 * @param retryId
			 */
			function getErrorArrivedLinkMessage(retryId) {
				/* info error */
	        	if (retryId == $errorHandler.RETRY_ID.INFO) {
	        		return closeMsg;
	        	}
	        	
	        	/* reset browser */
	        	if (retryId == $errorHandler.RETRY_ID.RESET) {
	        		return retryMsg;
	        	}
	        	
	        	/* reconnect */
	        	if (retryId == $errorHandler.RETRY_ID.RECONNECT) {
	        		return retryMsg;
	        	}
	        	return retryMsg;
			}
			
			/**
			 * @private getRetryStartLinkMessage
			 * Call back function error-handler
			 * 
			 * @param retryId
			 */
			function getRetryStartLinkMessage(retryId) {
				/* info error */
	        	if (retryId == $errorHandler.RETRY_ID.INFO) {
	        		return closeMsg;
	        	}
	        	
	        	/* reset browser */
	        	if (retryId == $errorHandler.RETRY_ID.RESET) {
	        		return retryMsg;
	        	}
	        	
	        	/* reconnect */
	        	if (retryId == $errorHandler.RETRY_ID.RECONNECT) {
	        		return retryStartMsg;
	        	}
	        	return retryMsg;
			}
			
			/**
			 * @private errorArrived
			 * Call back function error-handler
			 * 
			 * @param retryId
			 */
			function errorArrived(error, retryId) {
				assert.consoleLog_Control("'ErrorCtrl' Error arrived: "+error+" id:"+retryId);
				
				/* error arrived */
				$rootScope.$broadcast('errorArrived', { retryId: retryId });
				
				$timeout(function () {
					if ($scope.hasError) return;
					$scope.hasError = true;	
					
					$scope.linkMsg = getErrorArrivedLinkMessage(retryId);
					$scope.errorMsg = error;
					
					$scope.retryFn = function () {
						$errorHandler.retryFn(retryId);
					}
					
		        	if (!$scope.$$phase) {
		        		$scope.$digest();
		        	}
				}, 100);
			}
			
			/**
			 * @private retryError
			 * Call back function error-handler
			 * 
			 * @param retryId
			 */
			function retryStart(retryId) {
				assert.consoleLog_Control("'ErrorCtrl' Retry start");
				
				$scope.hasRetryStarted = true;
				$scope.retryCont = 0;
				$scope.linkMsg = getRetryStartLinkMessage(retryId);
				
				$rootScope.routeChangeState = "routeChanging";
				
				/* reset error */
				$rootScope.$broadcast('resetError', { retryId: retryId });
				
				$timeout(function () {
					/* resolve error */
					$rootScope.$broadcast('resolveError', { retryId: retryId });
				}, 100);
				
				if (!$rootScope.$$phase) {
					$rootScope.$digest();
				}
				
				if (!$scope.$$phase) {
					$scope.$digest();
				}
			}
			
			/**
			 * @private retryContinue
			 * Call back function error-handler
			 * 
			 * @param retryId
			 */
			function retryContinue() {
				$scope.retryCont++;
				
				if (!$scope.$$phase) {
					$scope.$digest();
				}
			}
			
			/**
			 * @private retryEnd
			 * Call back function error-handler
			 * 
			 * @param retryId
			 */
			function retryEnd() {
				assert.consoleLog_Control("'ErrorCtrl' Retry end");
				close();
				$rootScope.routeChangeState = "routeChanged";
				
				if (!$rootScope.$$phase) {
					$rootScope.$digest();
				}
			}
			
			/** 
			* @private close
			* Closes the error box
			*/
			function close() {
				$scope.hasError = false;
				$scope.hasRetryStarted = false;
				$scope.retryCont = 0;
			}
			
			/**
			 * messageHandler
			 */
			function messageHandler(message, messageId) {}
			
			/* subscribe for potential errors and opens the error box on error occurence */
			$errorHandler.subscribe(errorArrived, window, retryStart, retryContinue, retryEnd, messageHandler);

			/* listen for route changes and closes the error box on changes. */
		    $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
				if($scope.hasError) close();
		    });
		    
			$scope.close = close;
		}
	]);
