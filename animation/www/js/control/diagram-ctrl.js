'use strict';

/** module for specify controllers */
angular.module('App.Control.DiagramCtrl', [])

	/************************************************************************************************************
	 * SimpleDiagramCtrl
	 * @constructor utility, explorerTreeUtil, fileHandler, assert, $scope, $api, $settings, $routeParams, $sce, $timeout
	 ***********************************************************************************************************/
	.controller('SimpleDiagramCtrl', ['utility', 'explorerTreeUtil', 'fileHandler', 'assert', '$scope', '$api', '$settings', '$routeParams', '$sce', '$timeout', '$templateCache', '$errorHandler',
	                                 function (utility, explorerTreeUtil, fileHandler, assert, $scope, $api, $settings, $routeParams, $sce, $timeout, $templateCache, $errorHandler) {
		/** create $scope.template * */
		var fSimpleDiagramCtrl = {initComplete: false, explorerData: null, readyToWork: true};
		
		$scope.diagram = {
				treeNodeNumber: $routeParams.treeNodeNumber,
				id: null,
				title: '',
				svg: '',
				linkDiagrams: ''
		};
		
		$scope.enableZoomControl = $settings.diagramEnableZoomControl;
		$scope.enableNavigationControl = $settings.diagramEnableNavigationControl;
		$scope.enableShowRecordFile = $settings.enableShowRecordFile;
		
		/**
		 * @public to_trusted
		 * Check html code as trust.
		 * 
		 * @param html_code
		 * @return trust html code.
		 */
		$scope.to_trusted = function(html_code) {
		    return $sce.trustAsHtml(html_code);
		};
		
		/**
		 * @public hasParentWindow
		 * 
		 * @return true if the window has a opener window.
		 */
		$scope.hasParentWindow = function() {
			return (window.opener != null);
		};
		
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
		 * @private init control
		 */
		function initCtrl() {
			if (!fSimpleDiagramCtrl.readyToWork) return;
			
			assert.assertNotNull($scope.diagram.treeNodeNumber, "Simple diagram tree number not defined.");	
			if ($api.isServerAvailable()) {

				/* Send request to get explorer tree */
		    	fileHandler.getExplorerTree().then(function (data) {
		    		fSimpleDiagramCtrl.explorerData = data;
		    		assert.assertNotNull(fSimpleDiagramCtrl.explorerData, "Simple diagram explorer tree not definde.");
		    		
					var simplediagramNode = explorerTreeUtil.findTreeNodeByTreeNodeNumber(fSimpleDiagramCtrl.explorerData, $scope.diagram.treeNodeNumber);
					
					assert.assertNotNull(simplediagramNode, "Simple diagram not found in the controller tree.");
					assert.assertNotNull(simplediagramNode.id, "Simple diagram id not defined in the diagram controller.");
					$scope.diagram.id = simplediagramNode.id;
					
					$scope.diagram.title = simplediagramNode.extendedLabel;
					if (simplediagramNode.links != null) {
						$scope.diagram.linkDiagrams = simplediagramNode.links;
					}
					
					/* Returns the current svg grafic */
			    	fileHandler.getSVG($scope.diagram.id).then(function (data) {
						synchronizeFunction(function () {
							$scope.diagram.svg = data;
							fSimpleDiagramCtrl.initComplete = true;
			            });
					});
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
			fSimpleDiagramCtrl.readyToWork = false;
		}
		
		/************
    	 * Init
    	 ************/
		assert.consoleLog_Control("Init SimpleDiagramCtrl");
		
		/**
    	 * init the controller and overrite the id and skId
    	 */
		$scope.initWithTreeNumber = function (treeNodeNumber) {
			$scope.diagram.treeNodeNumber = treeNodeNumber;
			initCtrl();
		};
		
		/* bind dispose function window.onbeforeunload */
		window.onbeforeunload = function confirmExit() {
			dispose();
		};

    	/* add listener if the controller is disposed */
		$scope.$on('$destroy', function() {
			dispose();
		});

		/* errorArrived */
		$scope.$on('errorArrived', function(event, data) {
			assert.consoleLog_Control("'SimpleDiagramCtrl' Error arrived.");
			
			/* retry reconnect */
        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
        		fSimpleDiagramCtrl.readyToWork = false;
        	}
		});
		
		/* retryError */
		$scope.$on('resolveError', function(event, data) {
			assert.consoleLog_Control("'SimpleDiagramCtrl' Resolve error.");
			fSimpleDiagramCtrl.readyToWork = true;
			
			/* reconnect */
        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
        		$templateCache.removeAll();
        		initCtrl();
        	}
		});
		
		initCtrl();
		
	}])
	
	/************************************************************************************************************
	 * MultiDiagramCtrl
	 * @constructor utility, explorerTreeUtil, fileHandler, assert, $api, $scope, $routeParams, $timeout
	 ***********************************************************************************************************/
	.controller('MultiDiagramCtrl', ['utility', 'explorerTreeUtil', 'fileHandler', 'assert', '$settings', '$api', '$scope', '$rootScope', '$routeParams', '$timeout', '$errorHandler',
	                                 function (utility, explorerTreeUtil, fileHandler, assert, $settings, $api, $scope, $rootScope, $routeParams, $timeout, $errorHandler) {
		/** create $scope.template * */
		var fMultiDiagramCtrl = {initComplete: false, explorerData: null, lastModifiedContainedDiagramId: null, readyToWork: true};
		
		$scope.template = {
				"mainDiagram" : "partials/diagram.html"
		}
		
		$scope.multiDiagram = {
				treeNodeNumber: $routeParams.treeNodeNumber,
				skId: null,
				id: null,
				containedDiagramNodes: []
		};
		
		/**
		 * @public getNavigationDiagramSelected
		 * Returns true if the current node is the main node. 
		 * 
		 * @param node
		 * @return true if the navigation diagram is selected
		 */
		$scope.getNavigationDiagramSelected = function(node) {
			assert.assertTrue(fMultiDiagramCtrl.initComplete, "Init multi diagram not complete.");
			return utility.equals(node.id, $scope.multiDiagram.id) && utility.equals(node.skId, $scope.multiDiagram.skId);
		};
		
    	/**
    	 * @public popup
    	 * Open the popup diagram window.
    	 *  
    	 * @param treeNode
    	 */
    	$scope.popup = function (treeNode) {
			explorerTreeUtil.openPopupByTreeNode(treeNode);
		};
		
		/**
		 * @public getHref
		 * 
		 * @param treeNode
		 * @return href link as string.
		 */
		$scope.hrefLink = function(treeNode) {
			return explorerTreeUtil.getHrefLinkByTreeNode(treeNode);
		};
		
		/**
		 * @public updateDiagramOrderByLastModification
		 * Update diagram order by last modification.
		 * 
		 * @param id last modified diagram id
		 */
		$scope.updateDiagramOrderByLastModification = function(id) {
			if (!utility.equals('OrderByLastModification', $settings.orderDiagramByLastModification)) return;
			sortContainedDiagramOrder(id);
		};
		
		/**
		 * @public updateContainedDiagramOrder
		 * Update diagram order.
		 * 
		 * @param id
		 */
		function sortContainedDiagramOrder(id) {
			synchronizeFunction(function () {
				assert.assertTrue(fMultiDiagramCtrl.initComplete, "Init multi diagram not complete.");
				
				if (utility.equals(id, fMultiDiagramCtrl.lastModifiedContainedDiagramId)) return;
				fMultiDiagramCtrl.lastModifiedContainedDiagramId = id;
				
				angular.forEach($scope.multiDiagram.containedDiagramNodes, function (diagramNode, index) {
					if (!diagramNode.isLinkDiagram) return;
					if (utility.equals(id, diagramNode.id)) {
						diagramNode.sortNumber = 1;
					} else {
						diagramNode.sortNumber = index + 2;
					}
				});
				
				setLastGlobalModifiedContainedDiagramId(id);
				assert.consoleLog_Control("'MultiDiagramCtrl' Update contained diagramOrder 'DiagramId': "+id);
			});
		}
		
		/**
		 * @public initContainedDiagramOrder
		 * Update diagram order.
		 * 
		 */
		function containsDiagramNodeId(id) {
			var foundDiagramId = false;
			angular.forEach($scope.multiDiagram.containedDiagramNodes, function (diagramNode) {
				if (foundDiagramId) return;
				if (!diagramNode.isLinkDiagram) return;
				if (!utility.equals(id, diagramNode.id)) return;
				foundDiagramId = true;
			});
			return foundDiagramId;
		}
		
		/**
		 * @public initContainedDiagramOrder
		 * Update diagram order.
		 * 
		 */
		function initContainedDiagramOrder() {
			angular.forEach($scope.multiDiagram.containedDiagramNodes, function (diagramNode, index) {
				if (diagramNode.isLinkDiagram) {
					diagramNode.sortNumber = index + 1;
				} else {
					diagramNode.sortNumber = 0;
				}
			});
			
			var id = getLastGlobalModifiedContainedDiagramId();
			if (id != null && containsDiagramNodeId(id)) {
				$scope.updateDiagramOrderByLastModification(id);
			}
		}
		
		/**
		 * @public setLastGlobalModifiedContainedDiagramId
		 * 
		 * @param diagram order id
		 */
		function setLastGlobalModifiedContainedDiagramId(id) {
			$rootScope.globalLastModifiedContainedDiagramId = id;
		}
		
		/**
		 * @public getLastGlobalModifiedContainedDiagramId
		 * 
		 * @param diagram order id
		 */
		function getLastGlobalModifiedContainedDiagramId() {
			return $rootScope.globalLastModifiedContainedDiagramId;
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
		 * @private init control
		 */
		function initCtrl() {
			if (!fMultiDiagramCtrl.readyToWork) return;
			
			assert.assertNotNull($scope.multiDiagram.treeNodeNumber, "Multi diagram tree number not defined.");
			if ($api.isServerAvailable()) {
				
				/* Send request to get explorer tree */
		    	fileHandler.getExplorerTree().then(function (data) {
		    		
		    		
		    		fMultiDiagramCtrl.explorerData = data;
		    		assert.assertNotNull(fMultiDiagramCtrl.explorerData, "Multi diagram explorer tree not definde.");
		    		
		    		var multiDiagramNode = explorerTreeUtil.findTreeNodeByTreeNodeNumber(fMultiDiagramCtrl.explorerData, $scope.multiDiagram.treeNodeNumber);
		    		assert.assertNotNull(multiDiagramNode, "'MultiDiagramNode' not found in the controller tree 'Tree number:' "+$scope.multiDiagram.treeNodeNumber);
		    		
		    		$scope.multiDiagram.id = multiDiagramNode.id;
					$scope.multiDiagram.skId = multiDiagramNode.skId;
					assert.assertNotNull($scope.multiDiagram.skId, "SkId not defined in the diagram controller");
					assert.assertNotNull($scope.multiDiagram.id, "Diagram id not defined in the diagram controller");
					
					var containerNode = explorerTreeUtil.findTreeNodeByTreeNodeNumber(fMultiDiagramCtrl.explorerData, $scope.multiDiagram.treeNodeNumber);
					assert.assertNotNull(containerNode, "TreeNode not found in the controller tree");
					if (containerNode.children == null && containerNode.links == null) {
						containerNode = explorerTreeUtil.findExplorerTreeParentByTreeNodeNumber(fMultiDiagramCtrl.explorerData, $scope.multiDiagram.treeNodeNumber);
						assert.assertNotNull(containerNode, "Parent containerNode not found in the controller tree");
		    		}
					
					var multiDiagramNodes = explorerTreeUtil.findExplorerTreeContainedDiagramNodes(containerNode);
					multiDiagramNodes.push(containerNode);
					$scope.multiDiagram.containedDiagramNodes = utility.asUniqueElementIdList(multiDiagramNodes);
					fMultiDiagramCtrl.initComplete = true;
					
					initContainedDiagramOrder();
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
			fMultiDiagramCtrl.readyToWork = true;
		}
		
    	/************
    	 * Init
    	 ************/
		assert.consoleLog_Control("Init MultiDiagramCtrl");
		
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
			assert.consoleLog_Control("'MultiDiagramCtrl' Error arrived.");
			
			/* retry reconnect */
        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
        		fMultiDiagramCtrl.readyToWork = false;
        	}
		});
		
		/* retryError */
		$scope.$on('resolveError', function(event, data) {
			assert.consoleLog_Control("'MultiDiagramCtrl' Resolve error.");
			fMultiDiagramCtrl.readyToWork = true;
			
			/* reconnect */
        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
        		initCtrl();
        	}
		});
		
		initCtrl();
		
	}])
		
	/************************************************************************************************************
	 * Defines Diagram Controller Handles the loading and control of a diagram.
	 * @constructor statefullComponentService, modulService, utility, explorerTreeUtil, fileHandler, assert, $settings, $errorHandler, $window, $routeParams, $scope, $rootScope, $api, $sce, $q, $timeout, $templateCache
	************************************************************************************************************/
	.controller('DiagramCtrl', ['statefullComponentService', 'modulService', 'utility', 'explorerTreeUtil', 'fileHandler', 'assert', '$settings', '$errorHandler', '$window', '$routeParams', '$scope', '$rootScope', '$api', '$sce', '$q', '$timeout', '$templateCache',
	                            function (statefullComponentService, modulService, utility, explorerTreeUtil, fileHandler, assert, $settings, $errorHandler, $window, $routeParams, $scope, $rootScope, $api, $sce, $q, $timeout, $templateCache) {
		
		/* Controller this */
		/**
		 * Controller this
		 * @initComplete : true it the init is complete.
		 * @callbackHandle: handler to unbind statefull component
		 * @readyToWork: true it the control is ready to start work.
		 */
		var fDiagramCtrl = {initComplete: false, callbackHandle: null, readyToWork: true};
		
		/* diagram = {skId:, id:, title:, svg:, linkDiagrams:, snapshot:, currentTime:, currentSeq:}*/
		$scope.diagram = {
			treeNodeNumber: utility.getValueOrDefault($routeParams.treeNodeNumber, null),
			initWithTreeNodeNumber: false,
			skId: null,
			id: null,
			title: '',
			label: '',
			svg: '',	
			linkDiagrams: '',
			snapshot: '',
			currentTime: 0,
			currentSeq: 0
		};
		
		$scope.playEnabled = false;
		$scope.pausedEnabled = false;
		$scope.previousEnabled = false;
		$scope.nextEnabled = false;
		$scope.currentRecordFile = "No file available",
		
		$scope.enableZoomControl = $settings.diagramEnableZoomControl;
		$scope.enableNavigationControl = $settings.diagramEnableNavigationControl;
		$scope.enableTimeSliderControl = $settings.diagramEnableTimeSliderControl;
		$scope.enableShowRecordFile = $settings.enableShowRecordFile;
		
		$scope.timeSlider = {value:0, min:0, max:0};
		$scope.timeSliderOptions = crateTimeSliderOption();
		
		
		/**
		 * @public play
		 * Resubscribes for snapshot and reset record variables.
		 */
		$scope.play = function () {
			synchronizeFunction(function () {
				if (!fDiagramCtrl.initComplete) return;
				
				var modulId = getModulId();
				modulService.play(modulId);
			});
		};	

		/**
		 * @public pause
		* Unsubscribe for snapshot, requests record for current diagram.
		*/
		$scope.pause = function () {
			synchronizeFunction(function () {
				if (!fDiagramCtrl.initComplete) return;
				
				var modulId = getModulId();
				modulService.pause(modulId);
			});
		};	

		/**
		 * @public fastPrevious
		* If record is present steps one back in record samples.
		*/
		$scope.fastPrevious = function () {
			synchronizeFunction(function () {
				if (!fDiagramCtrl.initComplete) return;
				
				var modulId = getModulId();
				modulService.fastPrevious(modulId);
			});
		};	
		
		/**
		 * @public previous
		* If record is present steps one back in record samples.
		*/
		$scope.previous = function () {
			synchronizeFunction(function () {
				if (!fDiagramCtrl.initComplete) return;
		
				var modulId = getModulId();
				modulService.previous(modulId);
			});
		};	

		/**
		 * @public next
		* If record is present steps one forth in record samples.
		*/
		$scope.next = function () {
			synchronizeFunction(function () {
				if (!fDiagramCtrl.initComplete) return;
		
				var modulId = getModulId();
				modulService.next(modulId);
			});
		};	
		
		/**
		 * @public fastNext
		* If record is present steps one forth in record samples.
		*/
		$scope.fastNext = function () {
			synchronizeFunction(function () {
				if (!fDiagramCtrl.initComplete) return;
		
				var modulId = getModulId();
				modulService.fastNext(modulId);
			});
		};	
		
		/**
		 * @public to_trusted
		 * Check html code as trust.
		 * 
		 * @param html_code
		 * @return trust html code.
		 */
		$scope.to_trusted = function(html_code) {
		    return $sce.trustAsHtml(html_code);
		};
		
		/**
		 * @public hasParentWindow
		 * 
		 * @return true if the window has a opener window.
		 */
		$scope.hasParentWindow = function() {
			return (window.opener != null);
		};
		
		/**
		 * @public hasMultiDiagram
		 * 
		 * @return true if the diagram is a multi diagram.
		 */
		$scope.hasMultiDiagram = function() {
			return ($scope.$parent.multiDiagram != null);
		};
		
		/**
		 * @public isNavigationDiagram
		 * 
		 * @return true if the diagram is a naviagion diagram.
		 */
		$scope.isNavigationDiagram = function() {
			return ($scope.hasMultiDiagram() && $scope.diagram.initWithTreeNodeNumber);
		};
		
		/**
		 * @public hasMultiDiagram
		 */
		$scope.svgHasChanged = function(hasChangeFromDefaultState) {
			synchronizeFunction(function () {
				if (!fDiagramCtrl.initComplete) return;
				if (!hasChangeFromDefaultState) return;
				
				if($scope.$parent.updateDiagramOrderByLastModification != null) {
					$scope.$parent.updateDiagramOrderByLastModification($scope.diagram.id);
				}
			});
		};
		
		/***************
    	 * Time slider 
    	 **************/
		
		/**
		 * @private crateTimeSliderOption
		 */
		function crateTimeSliderOption() {
			return {
			      floor: $scope.timeSlider.min,
			      ceil: $scope.timeSlider.max,
			      step: 1000,
			      precision: 0,
			      id: null,
			      translate: displayTimeSlider,
			      stepsArray: null,
			      draggableRange: false,
			      draggableRangeOnly: false,
			      showSelectionBar: false,
			      showSelectionBarEnd: false,
			      hideLimitLabels: false,
			      readOnly: false,
			      disabled: false,
			      interval: 350,
			      showTicks: false,
			      showTicksValues: false,
			      ticksTooltip: null,
			      ticksValuesTooltip: null,
			      vertical: false,
			      selectionBarColor: null,
			      keyboardSupport: true,
			      scale: 1,
			      enforceRange: false,
			      onlyBindHandles: false,
			      onStart: null,
			      onChange: null,
			      onEnd: timeSliderChange
			    };
		}
		
		/**
		 * @private displayTimeSlider
		 * 
		 * @param slideTimestamp
		 * @return the display time lider as string.
		 */
		function displayTimeSlider(slideTimestamp) {
			return utility.getEncodedDisplayTime(slideTimestamp);
		}
		
		/**
		 * @private timeSliderChange
		 */
		function timeSliderChange() {
			if (!fDiagramCtrl.initComplete) return;
			
		    var modulId = getModulId();
		    var timeStamp = $scope.timeSlider.value;
		    assert.consoleLog_Control("'DiagramCtrl' Time slider change. " + timeStamp + " Sk: " + $scope.diagram.skId);
		    modulService.nextTime(modulId, timeStamp);
		}
		
		/***************
    	 * Private 
    	 **************/
		
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
    	 * @private getModulId
    	 * 
    	 * @return the modul id from the sk.
    	 */
    	function getModulId() {
    		assert.assertNotNull($scope.diagram.skId);
    		return utility.filterModulIdFromId($scope.diagram.skId);
    	}
    	
		/**
		 * @private updateRecordControl
		 * Internal update record control
		 */
		function updateRecordControl() {
			var modulId = getModulId();
			modulService.getEnableState(modulId).then(function(enableState) {
				
				synchronizeFunction(function () {
					
					/* Current record file */
					$scope.currentRecordFile = enableState.currentRecordFile;
					
					/* paused */
					if (enableState.isPlayEnabled) {
						$scope.pausedEnabled = true;
						$scope.playEnabled = false;
					} else {
						$scope.playEnabled = true;
						$scope.pausedEnabled = false;
					}
					/* Previous */
					if (enableState.isPreviousEnabled) {
						$scope.previousEnabled = true;
					} else {
						$scope.previousEnabled = false;
					}
					/* Next */
					if (enableState.isNextEnabled) {
						$scope.nextEnabled = true;
					} else {
						$scope.nextEnabled = false;
					}
					
					/* slider */
					var hasTimeSliderChange = false;
					if ($scope.timeSlider.min != enableState.timeSliderRangeMin) {
						$scope.timeSlider.min = enableState.timeSliderRangeMin;
						hasTimeSliderChange = true;
					}
					if ($scope.timeSlider.max != enableState.timeSliderRangeMax) {
						$scope.timeSlider.max = enableState.timeSliderRangeMax;
						hasTimeSliderChange = true;
					}
					if (hasTimeSliderChange) {
						$scope.timeSliderOptions = crateTimeSliderOption();
					}
				});
			});
		}
		
		/**
		 * @private updateListener
		 * Update listener is called if the snapshot state has changed
		 * event = {id: (enum-> SNAPSHOT_UPDATE PROGRESS_STATE), , data:}
		 * @param context = {skId: , currentSeq: , currentTime: , snapshot:, initSnapshot:, initSt:, animationStrategie:, listeners:}; 
		 */
		function updateListener(event) {
			synchronizeFunction(function () {
				if (!fDiagramCtrl.initComplete) return;
				
				switch (event.id) {
	    		
	    			/* SNAPSHOT_UPDATE */
	    			case modVisService.statefullComponentService.EVENT.SNAPSHOT_UPDATE:
	    				assert.consoleLog_Control("'DiagramCtrl' Event snapshot change." + $scope.diagram.skId);
	    				var data = event.data;
    					$scope.diagram.snapshot = data.snapshot;
    					$scope.diagram.currentTime = utility.getEncodedTime(data.currentTime);
    					$scope.diagram.currentSeq = angular.copy(data.currentSeq);
    					$scope.timeSlider.value = data.currentTime;
    					updateRecordControl();
		    			break;
		    			
		    		/* PROGRESS_STATE */	
	    			case modVisService.statefullComponentService.EVENT.PROGRESS_STATE:
	    				var data = event.data;
	    				if (data.complete) {
	    					assert.consoleLog_Control("'DiagramCtrl' progressBarComplete." + $scope.diagram.skId);
	    					$rootScope.progressBarEnable = false;
	    					$rootScope.progressBarValue = 100;
	    					$rootScope.progressBarText = "";
	    				} else {
    						assert.consoleLog_Control("'DiagramCtrl' progressBarActive." + $scope.diagram.skId);
    						$rootScope.progressBarEnable = true;
    						$rootScope.progressBarValue = data.value;
    						$rootScope.progressBarText = data.text;
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
			fDiagramCtrl.readyToWork = false;
			if (fDiagramCtrl.callbackHandle != null) {
				statefullComponentService.unbindStatefullComponent(fDiagramCtrl.callbackHandle);
				fDiagramCtrl.callbackHandle = null;
				fDiagramCtrl.initComplete = false;
			}
		}
		
		/**
		 * @private init control
		 */
		function initCtrl() {
			if (!fDiagramCtrl.readyToWork) return;
			
			assert.assertNotNull($scope.diagram.treeNodeNumber, "Diagram tree number not defined.");
			if ($api.isServerAvailable()) {
				
				/* Send request to get explorer tree */
		    	fileHandler.getExplorerTree().then(function (data) {
					$scope.explorerData = data;
					
					var findDiagramNode = explorerTreeUtil.findTreeNodeByTreeNodeNumber($scope.explorerData, $scope.diagram.treeNodeNumber);
					assert.assertNotNull(findDiagramNode, "Diagram not found in the controller tree 'Tree node number': " +$scope.diagram.treeNodeNumber);
					
					$scope.diagram.id = findDiagramNode.id;
					$scope.diagram.skId = findDiagramNode.skId;
					assert.assertNotNull($scope.diagram.skId, "SkId not defined in the diagram controller");
					assert.assertNotNull($scope.diagram.id, "Diagram id not defined in the diagram controller");

					if (!modulService.checkModulLiveCRC(getModulId())) {
						/* retry init */
			    		$timeout(function () {
			    			initCtrl();
			            }, 200);
						return;
					}
					
					$scope.diagram.label = findDiagramNode.label;
					$scope.diagram.title = findDiagramNode.extendedLabel;
					if (findDiagramNode.links != null) {
						$scope.diagram.linkDiagrams = findDiagramNode.links;
					}
					
					/* Returns the current svg grafic */
			    	fileHandler.getSVG($scope.diagram.id).then(function (data) {
						synchronizeFunction(function () {
							$scope.diagram.svg = data;
							if ($scope.diagram.skId != null) {
								setTimeout(function() {
									fDiagramCtrl.callbackHandle = statefullComponentService.bindStatefullComponent($scope.diagram.skId, updateListener);
									fDiagramCtrl.initComplete = true;
									assert.consoleLog_Control("'DiagramCtrl' init complete.");
								}, 500);
							}
			            });
					});
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
		assert.consoleLog_Control("Init DiagramCtrl");
		
    	/**
    	 * init the controller
    	 */
    	$scope.init = function () {
    		initCtrl();
		};
    	
    	/**
    	 * init the controller and overrite the id and skId
    	 */
		$scope.initWithTreeNumber = function (treeNodeNumber) {
			$scope.diagram.initWithTreeNodeNumber = true;
			$scope.diagram.treeNodeNumber = treeNodeNumber;
			initCtrl();
		};
    	
    	/* bind dispose function window.onbeforeunload */
		window.onbeforeunload = function confirmExit() {
			dispose();
		};

    	/* add listener if the controller is disposed */
		$scope.$on('$destroy', function() {
			dispose();
		});

		/* errorArrived */
		$scope.$on('errorArrived', function(event, data) {
			assert.consoleLog_Control("'DiagramCtrl' Error arrived.");
			
			/* retry reconnect */
        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
        		fDiagramCtrl.readyToWork = false;
        	}
		});
		
		/* resolveError */
		$scope.$on('resolveError', function(event, data) {
			assert.consoleLog_Control("'DiagramCtrl' Resolve error.");
			fDiagramCtrl.readyToWork = true;
			
			/* retry reconnect */
        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
        		$templateCache.removeAll();
        		initCtrl();
        	}
		});
		
		/* init the sk directly if the parent controller is a MultiDiagramCtrl */
		if (!$scope.hasMultiDiagram()) {
			initCtrl();
		}
	}]);
