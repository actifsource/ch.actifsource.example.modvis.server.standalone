'use strict';

/** module for specify controllers */
angular.module('App.Control.ActionCtrl', [])

	/************************************************************************************************************
	 * ActionCtrl
	 * @constructor utility, requestHandler, explorerTreeUtil, fileHandler, assert, $api, $scope, $routeParams, $window, $timeout
	 ***********************************************************************************************************/
	.controller('ActionCtrl', ['utility', 'requestHandler', 'explorerTreeUtil', 'fileHandler', 'assert', '$api', '$scope', '$routeParams', '$window', '$timeout', '$templateCache', '$errorHandler',
	                                 function (utility, requestHandler, explorerTreeUtil, fileHandler, assert, $api, $scope, $routeParams, $window, $timeout, $templateCache, $errorHandler) {
		
		assert.assertNotNull($routeParams.treeNodeNumber, "'ActionCtrl' Tree node number not defined.");
		
		/* Controller this */
		var fActionCtrl = {initComplete: false, treeNodeNumber: $routeParams.treeNodeNumber, readyToWork: true};
		
		$scope.actions = [];
		
		/**
		 * @public sendAction
		 * Send any action to the server.
		 * 
		 * @param action
		 */
		$scope.sendAction = function(action) {
			assert.consoleLog_Control("'ActionCtrl' Send action "+action.id);
			requestHandler.sendAction(action.id, action.value);
		};
		
		/**
    	 * @private synchronizeFunction
    	 * Synchronize function to handle async events.
    	 * 
    	 * @param {function} syncfunction
    	 */
    	function synchronizeFunction(syncfunction) {
    		$scope.$applyAsync(syncfunction);
    	}
		
    	/**
    	 * @private init conrol
    	 */
    	function initCtrl() {
    		if (!fActionCtrl.readyToWork) return;
    		
    		$scope.actions = [];
    		if ($api.isServerAvailable()) {
    			
    			/* Request Data for the Diagram Explorer */
    	    	fileHandler.getExplorerTree().then(function (explorerData) {
    	    		var actionTreeNode = explorerTreeUtil.findTreeNodeByTreeNodeNumber(explorerData, fActionCtrl.treeNodeNumber);
    	    		assert.assertNotNull(actionTreeNode, "'ActionCtrl' Action tree node not defined.");
    	    		angular.forEach(actionTreeNode.actions, function (actionNode) {
    	    			var action = {id: actionNode.id, label: actionNode.label, description: actionNode.description, button: actionNode.button, value: actionNode.value};
    	    			assert.assertNotNull(action.id);
    	    			assert.assertNotNull(action.label);
    	    			assert.assertNotNull(action.description);
    	    			assert.assertNotNull(action.button);
    	    			assert.assertNotNull(action.value);
    	    			$scope.actions.push(action);
    	    		});
    	    		if (!$scope.$$phase) {
    	        		$scope.$digest();
    	        	}
    	    		fActionCtrl.initComplete = true;
    			});
    	    	return;
    		}
    		/* retry init */
    		$timeout(function () {
    			initCtrl();
            }, 200);
    	}
    	
		/**
		 * @private dispose
		 * is called if the controller is disposed.
		 */
		function dispose() {
			fActionCtrl.readyToWork = false;
		}
		
		/************
    	 * Init
    	 ************/
		assert.consoleLog_Control("Init ActionCtrl");
		
		/* bind dispose function window.onbeforeunload */
		window.onbeforeunload = function confirmExit() {
			dispose();
		}

    	/* add listener if the controller is disposed */
		$scope.$on('$destroy', function() {
			dispose();
		});
		
		/* errorArrived */
		$scope.$on('errorArrived', function(event, data) {
			assert.consoleLog_Control("'ActionCtrl' Error arrived.");
			
			/* retry reconnect */
        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
        		fActionCtrl.readyToWork = false;
        	}
		});
		
		/* retryError */
		$scope.$on('resolveError', function(event, data) {
			assert.consoleLog_Control("'ActionCtrl' Resolve error.");
			fActionCtrl.readyToWork = true;
			
        	/* reconnect */
        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
        		$templateCache.removeAll();
        		initCtrl();
        	}
		});
		
		initCtrl();
	}]);
