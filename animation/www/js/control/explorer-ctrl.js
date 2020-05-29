'use strict';

/** module for specify controllers */
angular.module('App.Control.ExplorerCtrl', [])

	/************************************************************************************************************ 
	* Defines Explorer Controller Handles the loading and control of the diagram explorer.
	* @constructor logService, modulService, valueSevice, fileHandler, requestHandler, utility, explorerTreeUtil, assert, $window, $scope, $rootScope, $api, $q, $timeout, $templateCache
	************************************************************************************************************/
	.controller('ExplorerCtrl', ['logService', 'modulService', 'testsuiteService', 'valueSevice', 'fileHandler', 'requestHandler', 'utility', 'explorerTreeUtil', 'assert', '$settings', '$window', '$scope', '$rootScope', '$api', '$q', '$timeout', '$templateCache', '$errorHandler',
	                    function (logService, modulService, testsuiteService, valueSevice, fileHandler, requestHandler, utility, explorerTreeUtil, assert, $settings, $window, $scope, $rootScope, $api, $q, $timeout, $templateCache, $errorHandler) {	

			$scope.explorerData = null;

			/* controller this */
			var fExplorerCtrl = {treeNodeCount: null, readyToWork: true};
			
			/** 
			* @public popup
			* Opens a new window with the given diagramId 
			*
			* @param {string} diagramId
			* @param {string} skId or null
			*/
			$scope.popup = function (treeNode) {
				explorerTreeUtil.openPopupByTreeNode(treeNode);
			};
			
			/**
			 * @public getHref
			 */
			$scope.hrefLink = function(treeNode) {
				return explorerTreeUtil.getHrefLinkByTreeNode(treeNode);
			};
			
			/**
			 * @public openLink
			 * open link from folder.
			 * 
			 * @param treeNode
			 */
			$scope.openLink = function(treeNode) {
				assert.assertNotNull(treeNode.link);
				
				if (treeNode.link == "openDiagram") {
					var diagram = explorerTreeUtil.findFirstExplorerTreeContainedDiagramNodes(treeNode);
					if (diagram == null) return;
					location.href ="#/"+diagram.diagramType+"/"+diagram.number;
					return;
				}
				window.open(treeNode.link);
			};
			
			/**
			 * @public getRootNodes
			 * Returns all visible childs.
			 * 
			 * @param explorerData 
			 */
			$scope.getRootNodes = function(explorerData) {
				var rootNodes = [];
				angular.forEach(explorerData, function (rootNode) {
					if (rootNode.label == null) {
						return;
					}
					if (isHiddenNodeState(rootNode)) {
						return;
					}
					if (isSuppressNodeState(rootNode)) {
						rootNodes = rootNodes.concat($scope.getChildNodes(rootNode));
						return;
					}
					rootNodes.push(rootNode);
				});
				return rootNodes;
			};
			
			/**
			 * @public getChildNodes
			 * Returns all visible childs.
			 * 
			 * @param node
			 */
			$scope.getChildNodes = function(node) {
				var children = [];
				angular.forEach(node.children, function (child) {
					if (child.label == null) {
						return;
					}
					if (isHiddenNodeState(child)) {
						return;
					}
					if (isSuppressNodeState(child)) {
						children = children.concat($scope.getChildNodes(child));
						return;
					}
					children.push(child);
				});
				return children;
			};
			
			/**
	    	 * @private isHiddenNodeState
	    	 * 
	    	 * @param node
	    	 * @return true if the node state is hidden 
	    	 */
			function isHiddenNodeState(node) {
				if ($settings.showHiddenTreeNodes && !explorerTreeUtil.isDiagramNode(node)) return false;
				return (node.st == -1);
			}
			
			/**
	    	 * @private isSuppressNodeState
	    	 * 
	    	 * @param node
	    	 * @return true if the node state is suppress 
	    	 */
			function isSuppressNodeState(node) {
				return (node.st == -2);
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
			 * @private websocketDataListener
			 * is called if any json data arrived.
			 * 
			 * @param {Object} jsonMessage
			 */
			function websocketDataListener(jsonMessage) {
				if (jsonMessage.tree == null) return;
				assert.consoleLog_Control("Update explorere tree");
				
				synchronizeFunction(function () {	
					$scope.explorerConfig = jsonMessage;
					updateExplorerTree();
				});
			}
			
	    	/**
	    	 * @private updateExplorerTree
	    	 * Update explorer tree if the config has changed
	    	 */
	    	function updateExplorerTree() {
	    		if ($scope.explorerConfig == null || $scope.explorerData == null) return;
	    		assert.assertNotNull($scope.explorerConfig.tree, "Config tree is not defined.");
	    		
	    		angular.forEach($scope.explorerConfig.tree, function (treeConfig) {
	    			var findTreeNode = explorerTreeUtil.findExplorerTreeNodeById(treeConfig.id, $scope.explorerData);
	    			assert.assertNotNull(findTreeNode, "Config tree node id not found: "+treeConfig.id);
	    			
	    			if (treeConfig.name != null) {
	    				findTreeNode.label = treeConfig.name;	
	    			}
	    			if (treeConfig.st != null) {
	    				findTreeNode.st = treeConfig.st;
	    			}
	    		});
	    	}
	
	    	/**
			 * @private dispose
			 * is called if the controller is disposed.
			 */
			function dispose() {
				$api.removeWebsocketDataListener(websocketDataListener);
				fExplorerCtrl.readyToWork = false;
			}
			
			/**
	    	 * @private init conrol
	    	 */
	    	function initCtrl() {
	    		if (!fExplorerCtrl.readyToWork) return;
	    		
	    		if ($api.isServerAvailable()) {
	    			/* Request animation configuration */
	    			requestHandler.setConfig();
	    			
	    			/* Request Data for the Diagram Explorer */
	    	    	fileHandler.getExplorerTree().then(function (data) {
	    	    		$scope.explorerData = data;
	    				
	    				/* get the config of the controller tree*/
	    				requestHandler.getExplorerTreeConfig();
	    			});
	    	    	return;
	    		}
	    		/* retry init */
	    		$timeout(function () {
	    			initCtrl();
                }, 200);
	    	}
	    	
	    	/************
	    	 * Init
	    	 ************/
	    	assert.consoleLog_Control("init ExplorerCtrl");
	    	
	    	/* add dispose function if the windows is disposed */
			window.onbeforeunload = function confirmExit() {
				dispose();
			}
			
			/* add distroy function if the controller is disposed*/
			$scope.$on('$destroy', function() {
				dispose();
			});
			
			/* errorArrived */
			$scope.$on('errorArrived', function(event, data) {
				assert.consoleLog_Control("'ExplorerCtrl' Error arrived.");
				
				/* retry reconnect */
	        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
	        		fExplorerCtrl.readyToWork = false;
	        	}
			});
			
			/* retryError */
			$scope.$on('resolveError', function(event, data) {
				assert.consoleLog_Control("'ExplorerCtrl' Resolve error.");
				fExplorerCtrl.readyToWork = true;
				
	        	/* reconnect */
	        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
	        		$templateCache.removeAll();
	        		initCtrl();
	        	}
			});
			
	    	/* Set route change css class which shows a loading-wheel */
			$rootScope.routeChangeState = "routeChanged";
		    $rootScope.$on("$routeChangeStart", function (event, next, current) {
		        $rootScope.routeChangeState = "routeChanging";
		    });
		    $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
		        $rootScope.routeChangeState = "routeChanged";
		    });
		    
		    /* add Update listener */
		    $api.addWebsocketDataListener(websocketDataListener);
		    
		    /* init control */
		    initCtrl();
		}
	]);
