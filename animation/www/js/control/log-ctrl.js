'use strict';

/** module for specify controllers */
angular.module('App.Control.LogCtrl', [])

	/************************************************************************************************************
	 * LogCtrl
	 * @constructor logService, utility, explorerTreeUtil, fileHandler, assert, $scope, $routeParams
	 ***********************************************************************************************************/
	.controller('LogCtrl', ['logService', 'utility', 'explorerTreeUtil', 'fileHandler', 'assert', '$scope', '$routeParams', 
	                                 function (logService, utility, explorerTreeUtil, fileHandler, assert, $scope, $routeParams) {
		
		
		/* Controller this */
		var fLogCtrl = {initComplete: false, callbackHandle: null};
		
		$scope.log = {
			logMessages: []
		};
		
		/**
		 * @public getChildNodes
		 * Returns all visible childs.
		 * 
		 * @param {treenode} 
		 */
		$scope.getLogMessages = function() {
			return logMessages;
		}
		
		/**
		 * @public getChildNodes
		 * Returns all visible childs.
		 * 
		 * @param {treenode} 
		 */
		$scope.getLogMessagesColor = function(log) {
			return logService.getStateColor(log.st);
		}
		
		/**
    	 * @private synchronizeFunction
    	 * Synchronize function to handle async events.
    	 * 
    	 * @param syncfunction 
    	 */
    	function synchronizeFunction(syncfunction) {
    		$scope.$applyAsync(syncfunction);
    	}
		
    	/**
		 * @private updateListener
		 * Update listener is called if the snapshot state has changed
		 * event = {id: (enum-> SNAPSHOT_UPDATE PROGRESS_STATE), , data:}
		 * @param context = {skId: , currentSeq: , currentTime: , snapshot:, initSnapshot:, initSt:, animationStrategie:, listeners:}; 
		 */
		function updateListener(event) {
			synchronizeFunction(function () {
				if (!fLogCtrl.initComplete) return;
				
				switch (event.id) {
					/* SNAPSHOT_UPDATE */
	    			case logService.EVENT.UPDATE_LOG:
	    				var data = event.data;
	    				$scope.log.logMessages = [];
	    				for (var index = utility.getArrayLength(data.logMessages) - 1; index >= 0; index--) {
	    					var logMessage = utility.getArrayIndex(data.logMessages, index);
	    					$scope.log.logMessages.push({st: logMessage.st, stType: logMessage.stType, msg: logMessage.msg, time: utility.getEncodedTime(logMessage.time)});
	    				}
	    				break;
					
					/* DEFAULT */	
		    		default:
		    			break;
				}
				$scope.$eval();
			});
		}
		
		/**
		 * @private dispose
		 * is called if the controller is disposed.
		 */
		function dispose() {
			if (fLogCtrl.callbackHandle != null) {
				logService.unbind(fLogCtrl.callbackHandle);
				fLogCtrl.callbackHandle = null;
				fLogCtrl.initComplete = false;
			}
		}
		
		/************
    	 * Init
    	 ************/
		assert.consoleLog_Control("Init LogCtrl");
		
		/* bind dispose function window.onbeforeunload */
		window.onbeforeunload = function confirmExit() {
			dispose();
		}

    	/* add listener if the controller is disposed */
		$scope.$on('$destroy', function() {
			dispose();
		});
		
		fLogCtrl.callbackHandle = logService.bind(updateListener);
		fLogCtrl.initComplete = true;
	}]);
