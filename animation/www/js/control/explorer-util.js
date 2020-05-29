'use strict';

/** module for specify services */
angular.module('App.Control.ExplorerUtil', [])
    
	/*********************************************************************************************************** 
    * The requestHandler service provides functions, like send message (send json request) over websocket.
    * @constructor utility, assert, $api, $settings, $q
    ***********************************************************************************************************/
    .factory('explorerTreeUtil', ['utility', 'assert', '$api', '$settings', '$q', 
                                  function( utility, assert, $api, $settings, $q) {  
    	
    	var fExplorerTreeUtil = {};
    	
    	var fEnum = {};
    	
    	/* Diagram types */
    	fEnum.DIAGRAM_TYPE = {
    			DIAGRAM : 			"diagram",
    			MULTI_DIAGRAM : 	"multidiagram",
    			SIMPLE_DIAGRAM : 	"simplediagram",
    			LOG_DIAGRAM :		"logdiagram",
    			ACTION_DIAGRAM:     "actiondiagram",
    			VALUE_DIAGRAM:    	"valuediagram",
    			TESTSUITE_DIAGRAM:  "testsuitediagram"
    	};
    	
    	/***************************************************************************************
    	 * Diagram Util
    	 **************************************************************************************/
    	
    	/**
    	 * @public findExplorerTreeNode
    	 * Returns the diagramNode in the explorer tree.
    	 * 
    	 * @param {Object} id
    	 * @param {Object} skid
     	 * @returns {Object} DiagramNode or null
    	 */
    	fExplorerTreeUtil.findExplorerTreeContainedDiagramNodes = function(treeNode) {
    		var containedDiagramNodes = [];
    		
    		if (treeNode.children != null) {
    			angular.forEach(treeNode.children, function (childTreeNode) {
        			if (childTreeNode.diagramType != null) {
        				childTreeNode.isLinkDiagram = false;
        				containedDiagramNodes.push(childTreeNode);
        			}
        			containedDiagramNodes = containedDiagramNodes.concat(fExplorerTreeUtil.findExplorerTreeContainedDiagramNodes(childTreeNode))
        		});
    		}
    		if (treeNode.links != null) {
    			angular.forEach(treeNode.links, function (linkTreeNode) {
    				angular.forEach(linkTreeNode.linkdiagrams, function (linkDiagramTreeNode) {
    					linkDiagramTreeNode.isLinkDiagram = true;
		    			containedDiagramNodes.push(linkDiagramTreeNode);
    				});
    			});
    		}
    		return containedDiagramNodes;
    	};
    	
    	/**
    	 * @public findExplorerTreeNode
    	 * Returns the diagramNode in the explorer tree.
    	 * 
    	 * @param {Object} id
    	 * @param {Object} skid
     	 * @returns {Object} DiagramNode or null
    	 */
    	fExplorerTreeUtil.findFirstExplorerTreeContainedDiagramNodes = function(treeNode) {
    		var diagrams = fExplorerTreeUtil.findExplorerTreeContainedDiagramNodes(treeNode);
			if (diagrams.length > 0) {
				return diagrams[0];
			}
    		return null;
    	};
    	
    	/**
    	 * @public isDiagramNode
    	 * Returns true if the node is a diagram node.
    	 * 
    	 * @param {Object} treeNode
     	 * @returns {Object} is diagram node
    	 */
    	fExplorerTreeUtil.isDiagramNode = function(treeNode) {
    		return treeNode.diagramType != null;
    	};
    	
    	/***************************************************************************************
    	 * Id Util
    	 **************************************************************************************/
    	
    	/**
    	 * @private iterateExplorerTreeNode
    	 * 
    	 * @param id
    	 * @param treeNode
    	 * @returns findTreeNode
    	 */
    	function iterateExplorerTreeNode(id, treeNode) {
    		var findTreeNode = null;
    		
    		angular.forEach(treeNode.children, function (childTreeNode) {
    			if (findTreeNode != null) return;
    			if (utility.equals(childTreeNode.id, id)) {
    				findTreeNode = childTreeNode;
    				return;
    			}
    			findTreeNode = iterateExplorerTreeNode(id, childTreeNode);
    		});
    		return findTreeNode;
    	}
    	
    	/**
    	 * @public findExplorerTreeNodeById
    	 * 
    	 * @param id
    	 * @param explorerData
    	 * @returns findTreeNode
    	 */
    	fExplorerTreeUtil.findExplorerTreeNodeById = function(id, explorerData) {
    		var findTreeNode = null;
    		
    		angular.forEach(explorerData, function (treeNode) {
    			if (findTreeNode != null) return;
    			if (utility.equals(treeNode.id, id)) {
    				findTreeNode = treeNode;
    				return;
    			}
    			findTreeNode = iterateExplorerTreeNode(id, treeNode);
    		});
    		return findTreeNode;
    	};
    
    	/***************************************************************************************
    	 * Tree Number Util
    	 **************************************************************************************/
    	
    	/**
    	 * @private iterateTreeNodeByTreeNodeNumber
    	 * 
    	 * @param treeNode
    	 * @param treeNodeNumber
    	 * @returns findTreeNode
    	 */
    	function iterateTreeNodeByTreeNodeNumber(treeNode, treeNodeNumber) {
    		var findTreeNode = null;
    		
    		angular.forEach(treeNode.children, function (childTreeNode) {
    			if (findTreeNode != null) return;
    			if (childTreeNode.number == treeNodeNumber) {
    				findTreeNode = childTreeNode;
    				return;
    			}
    			findTreeNode = iterateTreeNodeByTreeNodeNumber(childTreeNode, treeNodeNumber);
    		});
    		
    		angular.forEach(treeNode.links, function (childTreeNode) {
    			if (findTreeNode != null) return;
    			if (childTreeNode.number == treeNodeNumber) {
    				findTreeNode = childTreeNode;
    				return;
    			}
    			findTreeNode = iterateTreeNodeByTreeNodeNumber(childTreeNode, treeNodeNumber);
    		});
    		
    		angular.forEach(treeNode.linkdiagrams, function (childTreeNode) {
    			if (findTreeNode != null) return;
    			if (childTreeNode.number == treeNodeNumber) {
    				findTreeNode = childTreeNode;
    				return;
    			}
    			findTreeNode = iterateTreeNodeByTreeNodeNumber(childTreeNode, treeNodeNumber);
    		});
    		
    		angular.forEach(treeNode.actions, function (childTreeNode) {
    			if (findTreeNode != null) return;
    			if (childTreeNode.number == treeNodeNumber) {
    				findTreeNode = childTreeNode;
    				return;
    			}
    			findTreeNode = iterateTreeNodeByTreeNodeNumber(childTreeNode, treeNodeNumber);
    		});
    		
    		angular.forEach(treeNode.values, function (childTreeNode) {
    			if (findTreeNode != null) return;
    			if (childTreeNode.number == treeNodeNumber) {
    				findTreeNode = childTreeNode;
    				return;
    			}
    			findTreeNode = iterateTreeNodeByTreeNodeNumber(childTreeNode, treeNodeNumber);
    		});
    		
    		return findTreeNode;
    	}
    	
    	/**
    	 * @public findTreeNodeByTreeNodeNumber
    	 * 
    	 * @param explorerData
    	 * @param treeNodeNumber
    	 * @returns findTreeNode
    	 */
    	fExplorerTreeUtil.findTreeNodeByTreeNodeNumber = function(explorerData, treeNodeNumber) {
    		var findTreeNode = null;
    		
    		angular.forEach(explorerData, function (treeNode) {
    			if (findTreeNode != null) return;
    			if (treeNode.number == treeNodeNumber) {
    				findTreeNode = treeNode;
    				return;
    			}
    			findTreeNode = iterateTreeNodeByTreeNodeNumber(treeNode, treeNodeNumber);
    		});
    		return findTreeNode;
    	};
    	
    	/**
    	 * @private iterateExplorerTreeParentByTreeNodeNumber
    	 * internal iterate over the explorer tree. 
    	 * 
    	 * @param treeNode
    	 * @param treeNodeNumber
    	 * @param findParentContainerNode
    	 * @returns findParentContainerNode
    	 */
    	function iterateExplorerTreeParentByTreeNodeNumber(treeNode, treeNodeNumber, parentTreeNode) {
    		var findParentContainerNode = null;
    		
    		if (treeNode.children != null) {
    			angular.forEach(treeNode.children, function (childTreeNode) {
        			if (findParentContainerNode != null) return;
        			if (childTreeNode.number == treeNodeNumber) {
        				findParentContainerNode = treeNode;
        				return;
        			}
        			findParentContainerNode = iterateExplorerTreeParentByTreeNodeNumber(childTreeNode, treeNodeNumber, treeNode);
        		});
    		} 
    		
    		if (treeNode.links != null) {
    			angular.forEach(treeNode.links, function (linkTreeNode) {
    				angular.forEach(linkTreeNode.linkdiagrams, function (linkDiagramTreeNode) {
		    			if (findParentContainerNode != null) return;
		    			if (linkDiagramTreeNode.number == treeNodeNumber) {
		    				findParentContainerNode = treeNode;
		    				return;
	    				}
    				});
    			});
    		}
    		
    		return findParentContainerNode;
    	}
    	
    	/**
    	 * @pubilc findExplorerTreeParentByTreeNodeNumber
    	 * Returns the diagramNode in the explorer tree.
    	 * 
    	 * @param explorerData
    	 * @param treeNodeNumber
     	 * @returns findParentContainerNode
    	 */
    	fExplorerTreeUtil.findExplorerTreeParentByTreeNodeNumber = function(explorerData, treeNodeNumber) {
    		var findParentContainerNode = null;
    		
    		angular.forEach(explorerData, function (treeNode) {
    			if (findParentContainerNode != null) return;
    			if (treeNode.number == treeNodeNumber) {
    				findParentContainerNode = treeNode;
    				return;
    			}
    			findParentContainerNode = iterateExplorerTreeParentByTreeNodeNumber(treeNode, treeNodeNumber, treeNode);
    		});
    		return findParentContainerNode;
    	};
    	
    	/***********************************************
    	 * Diagram Link Util
    	 **********************************************/
    	
    	/** 
		* @public openPopupByTreeNode
		* Opens a new window with the given diagramId 
		*
		* @param treeNode
		*/
    	fExplorerTreeUtil.openPopupByTreeNode = function (treeNode) {
			assert.assertNotNull(treeNode.diagramType);
			
			switch (treeNode.diagramType) {
				/* DIAGRAM */
				case fEnum.DIAGRAM_TYPE.DIAGRAM:
					var url = "popup.html#/diagram/"+treeNode.number,
							windowId = treeNode.id + treeNode.skId,
							windowConfig = "width=1000,height=600,screenX=50,screenY=50,resizable=yes";
					window.open(url, windowId, windowConfig).focus();
					break;
					
				/* MULTI_DIAGRAM */	
				case fEnum.DIAGRAM_TYPE.MULTI_DIAGRAM:
					var url = "popup.html#/diagram/"+treeNode.number,
							windowId = treeNode.id + treeNode.skId,
							windowConfig = "width=1000,height=600,screenX=50,screenY=50,resizable=yes";
					window.open(url, windowId, windowConfig).focus();
					break;
					
				/* SIMPLE_DIAGRAM */	
				case fEnum.DIAGRAM_TYPE.SIMPLE_DIAGRAM:
					var url = "popup.html#/simplediagram/"+treeNode.number,
							windowId = treeNode.number,
							windowConfig = "width=1000,height=600,screenX=50,screenY=50,resizable=yes";
					window.open(url, windowId, windowConfig).focus();
					break;
					
				/* LOG_DIAGRAM */	
				case fEnum.DIAGRAM_TYPE.LOG_DIAGRAM:
					var url = "popup.html#/logdiagram",
						windowId = "logdiagram",
						windowConfig = "width=1000,height=600,screenX=50,screenY=50,resizable=yes";
					window.open(url, windowId, windowConfig).focus();
					break;
					
					/* TESTSUITE_DIAGRAM */	
				case fEnum.DIAGRAM_TYPE.TESTSUITE_DIAGRAM:
					var url = "popup.html#/testsuitediagram",
						windowId = "testsuitediagram",
						windowConfig = "width=800,height=700,screenX=50,screenY=50,resizable=yes";
					window.open(url, windowId, windowConfig).focus();
					break;
					
				/* ACTION_DIAGRAM */	
				case fEnum.DIAGRAM_TYPE.ACTION_DIAGRAM:
					var url = "popup.html#/actiondiagram/"+treeNode.number,
						windowId = treeNode.number,
						windowConfig = "width=1000,height=600,screenX=50,screenY=50,resizable=yes";
					window.open(url, windowId, windowConfig).focus();
					break;
					
				/* VALUE_DIAGRAM */	
				case fEnum.DIAGRAM_TYPE.VALUE_DIAGRAM:
					var url = "popup.html#/valuediagram/"+treeNode.number,
						windowId = treeNode.number,
						windowConfig = "width=1000,height=600,screenX=50,screenY=50,resizable=yes";
					window.open(url, windowId, windowConfig).focus();
					break;
					
				/* default */
				default:
					assert.assertfail("'ExplorerCtrl' Href link is not suported.");
					break;
			}
		};
		
		/**
		 * @public getHrefLinkByTreeNode
		 * 
		 * @param treeNode
		 */
		fExplorerTreeUtil.getHrefLinkByTreeNode = function(treeNode) {
			assert.assertNotNull(treeNode.diagramType);
			switch (treeNode.diagramType) {
				/* DIAGRAM */
				case fEnum.DIAGRAM_TYPE.DIAGRAM:
					return "#/"+treeNode.diagramType+"/"+treeNode.number; 
					
				/* MULTI_DIAGRAM */	
				case fEnum.DIAGRAM_TYPE.MULTI_DIAGRAM:
					return "#/"+treeNode.diagramType+"/"+treeNode.number;
					
				/* SIMPLE_DIAGRAM */	
				case fEnum.DIAGRAM_TYPE.SIMPLE_DIAGRAM:
					return "#/"+treeNode.diagramType+"/"+treeNode.number;
				
				/* LOG_DIAGRAM */	
				case fEnum.DIAGRAM_TYPE.LOG_DIAGRAM:
					return "#/logdiagram";
					
				/* TESTSUITE_DIAGRAM */	
				case fEnum.DIAGRAM_TYPE.TESTSUITE_DIAGRAM:
					return "#/testsuitediagram";
					
				/* ACTION_DIAGRAM */	
				case fEnum.DIAGRAM_TYPE.ACTION_DIAGRAM:
					return "#/actiondiagram/"+treeNode.number;
					
				/* VALUE_DIAGRAM */	
				case fEnum.DIAGRAM_TYPE.VALUE_DIAGRAM:
					return "#/valuediagram/"+treeNode.number;
					
				/* default */
				default:
					assert.assertfail("'ExplorerCtrl' Href link is not suported.");
					break;
			}
		};
		
    	return fExplorerTreeUtil;
    }]);
 