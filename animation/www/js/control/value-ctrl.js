'use strict';

/** module for specify controllers */
angular.module('App.Control.ValueCtrl', [])

	/************************************************************************************************************
	 * ValueCtrl
	 * @constructor valueSevice, utility, requestHandler, explorerTreeUtil, fileHandler, assert, $api, $scope, $routeParams, $window, $timeout
	 ***********************************************************************************************************/
	.controller('ValueCtrl', ['valueSevice', 'utility', 'requestHandler', 'explorerTreeUtil', 'fileHandler', 'assert', '$api', '$scope', '$routeParams', '$window', '$timeout', '$templateCache', '$errorHandler',
	                                 function (valueSevice, utility, requestHandler, explorerTreeUtil, fileHandler, assert, $api, $scope, $routeParams, $window, $timeout, $templateCache, $errorHandler) {
		
		assert.assertNotNull($routeParams.treeNodeNumber, "'ActionCtrl' Tree node number not defined.");
		
		/* Controller this */
		var fValueCtrl = {initComplete: false, treeNodeNumber: $routeParams.treeNodeNumber, readyToWork: true};
		
		$scope.values = [];
		
		/**
		 * @public updateSelection
		 * 
		 * @param event
		 * @param value
		 */
		$scope.updateSelection = function(event, value) {
			synchronizeFunction(function () {
				var checkbox = event.target;
				value.enabled = (checkbox.checked ? true : false);
				if (value.enabled) {
					bindValue(value);
				} else {
					unbindValue(value);
				}
				$scope.$eval();
			});
		};
		
		/**
		 * @private bindValue
		 * 
		 * @param value
		 */
		function bindValue(value) {
			assert.assertNull(value.serviceHandler, "'ValueCtrl' Service handler allredy binded.");
			value.serviceHandler = valueSevice.bindValue(value.id, parseInt(value.cycletime), updateListener);
			assert.consoleLog_Control("'ValueCtrl' Bind value id: "+value.id+" Cycletime: "+value.cycletime);
		}
		
		/**
		 * @private unbindValue
		 * 
		 * @param value
		 */
		function unbindValue(value) {
			assert.assertNotNull(value.serviceHandler, "'ValueCtrl' Service handler is not binded.");
			valueSevice.unbindValue(value.serviceHandler);
			value.serviceHandler = null;
			assert.consoleLog_Control("'ValueCtrl' Unbind value id: "+value.id);
		}
		
		/**
		 * @private updateListener
		 * 
		 * @param event
		 */
		function updateListener(event) {
			synchronizeFunction(function () {
				if (!fValueCtrl.initComplete) return;
				
				switch (event.id) {
	    		
	    			/* SNAPSHOT_UPDATE */
	    			case valueSevice.EVENT.VALUE_UPDATE:
	    				var data = event.data;
	    				assert.assertNotNull(data);
	    				updateValue(data.valueId, data.currentValue);
		    			break;
		    		
		    		/* DEFAULT */	
		    		default:
		    			break;
				}
				$scope.$eval();
			});
		}
		
		/**
		 * @private updateValue
		 * 
		 * @param id
		 * @param currentValue
		 */
		function updateValue(id, currentValue) {
			var value = findValueByIdOrNull(id);
			if (value == null) return;
			value.currentValue = currentValue;
		}
		
		/** 
         * @private filterContextsBySkId
         * Returns the first elementstate with the uuid in elementstates.
         *
         * @param {Array} id
         * @returns {Object} elementstate
         */
         function findValueByIdOrNull(id) {
             var value = $scope.values.filter(function(value) {
            	 return utility.equals(value.id, id);
             });
             return value[0];
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
    	 * @private init conrol
    	 */
    	function initCtrl() {
    		if (!fValueCtrl.readyToWork) return;
    		
    		if ($api.isServerAvailable()) {
    			
    			/* Request Data for the Diagram Explorer */
    	    	fileHandler.getExplorerTree().then(function (explorerData) {
    	    		var valueTreeNode = explorerTreeUtil.findTreeNodeByTreeNodeNumber(explorerData, fValueCtrl.treeNodeNumber);
    	    		assert.assertNotNull(valueTreeNode, "'ValueCtrl' Values tree node not defined.");
    	    		angular.forEach(valueTreeNode.values, function (valueNode) {
    	    			var value = {id: valueNode.id, label: valueNode.label, description: valueNode.description, cycletime: ""+valueNode.cycletime, unit: valueNode.unit, currentValue: " - ", enabled: false, serviceHandler: null};
    	    			assert.assertNotNull(value.id, "'ValueCtrl' Value definition invalide 'id'.");
    	    			assert.assertNotNull(value.label, "'ValueCtrl' Value definition invalide 'label'.");
    	    			assert.assertNotNull(value.description, "'ValueCtrl' Value definition invalide 'description'.");
    	    			assert.assertNotNull(value.cycletime, "'ValueCtrl' Value definition invalide 'cycletime'.");
    	    			assert.assertNotNull(value.unit, "'ValueCtrl' Value definition invalide 'unit'.");
    	    			$scope.values.push(value);
    	    		});
    	    		if (!$scope.$$phase) {
    	        		$scope.$digest();
    	        	}
    	    		fValueCtrl.initComplete = true;
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
			angular.forEach($scope.values, function (value) {
				if (value.serviceHandler == null) return;
				unbindValue(value);
			});
			fValueCtrl.readyToWork = false;
		}
		
		/************
    	 * Init
    	 ************/
		assert.consoleLog_Control("Init ValueCtrl");
		
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
			assert.consoleLog_Control("'ValueCtrl' Error arrived.");
			
			/* retry reconnect */
        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
        		fValueCtrl.readyToWork = false;
        	}
		});
		
		/* retryError */
		$scope.$on('resolveError', function(event, data) {
			assert.consoleLog_Control("'ValueCtrl' Resolve error.");
			fValueCtrl.readyToWork = true;
			
        	/* reconnect */
        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
        		$templateCache.removeAll();
        		initCtrl();
        	}
		});
		
		initCtrl();
	}]);
