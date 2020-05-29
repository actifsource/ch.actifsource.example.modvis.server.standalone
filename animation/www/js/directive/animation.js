'use strict';

/** module for specify directives */
angular.module('App.Directive.Animation', [])

  /************************************************************************************************************
  * Animation Directive
  * Handles snapshot of a diagram and applies the changes to the active svg.
  ************************************************************************************************************/
  .directive('animation', ['assert', 'utility', '$animate', '$timeout',
                           function (assert, utility, $animate, $timeout) {
    return {
      restrict: 'A',
      link: function(scope, elm, attrs) {

    	var svgRootElement = null;
    	
        /******************************************************************
    	 * animate snapshot
    	 ******************************************************************/
        
        /**
         * @private findguidElement
         * 
         * @param guid
         * @returns document element state.
         */
        function findguidElement(guid) {
        	var element = null;
        	angular.forEach(elm.find('g'), function (gElement) {
        		if (element != null) return;
        		if (gElement.id == guid) {
        			element =  gElement;
        		}
        	});
        	return element;
        }
        
        /**
         * @private stateHasNotChanged
         * 
         * @param elementContext
         * @param newStateNumber
         * @returns true if the new state number is different last state.
         */
        function stateHasNotChanged(elementContext, newStateNumber) {
        	if (elementContext.runUpdate) {
        		return (elementContext.updateState == newStateNumber);
        	}
        	if (elementContext.currentState != null) {
        		return (elementContext.currentState == newStateNumber);
        	}
        	return false;
        }
        
        /**
         * @private promiseSetClass
         * 
         * @param documentElement
         * @param es
         * @param guid
         * @returns promise function.
         */
        var promiseSetClass = function(documentElement, es, guid) {
        	  return function() {
	  			  
	  			  var element = angular.element(documentElement);
	        	  var allCurrentClass = element.attr('class');
	        	  
		  		  if (documentElement.elementContext.runUpdate) {
		  			 
		  			  if (documentElement.elementContext.updateState != documentElement.elementContext.currentState) {
		  				  if (allCurrentClass !== 'appearance' + documentElement.elementContext.currentState) {
		  					assert.logError("'Directives' ["+scope.diagram.title+"] Current state and current class are different Guid: "+ guid +" Id: "+es.id +" currentClass : "+allCurrentClass+" currentState "+documentElement.elementContext.currentState+" updateState "+documentElement.elementContext.updateState);
		  				  }
		  				  
			      		  var newClass = 'appearance' + documentElement.elementContext.updateState;
			      		  var removeClass = 'appearance' + documentElement.elementContext.currentState;
			      		  
			      		  documentElement.elementContext.currentState = documentElement.elementContext.updateState;
			      		  documentElement.elementContext.currentSeqence = documentElement.elementContext.updateSeqence;
			      		  
			      		  assert.consoleLog_Directives("     'Directives' ["+scope.diagram.title+"] Promise set class 'NavigationDiagram:' "+scope.isNavigationDiagram()+" 'Guid:' "+ guid +" 'Id:' "+es.id +" 'Seq:' "+documentElement.elementContext.currentSeqence+" 'NewClass:' "+newClass+" 'RemoveClass:' "+removeClass);
			      		  $animate.setClass(element, newClass, removeClass).then(promiseSetClass(documentElement, es, guid),
			      		  function (error) {
			      			assert.throwReconnectMessage("'Animation' ["+scope.diagram.title+"] Add class 1 error: "+es.id);
		        		  });
			      		  
			      		  if (!scope.$$phase) {
			      			scope.$digest();
			      		  }
			      		  return;
		  			  }
		  			  documentElement.elementContext.runUpdate = false;
		  		  }
		  		  documentElement.elementContext.update = false;
	  		  }
        };
        
        /**
         * @private updateElementStates
         * Update element state to document
         * 
         * @param elementStates
         */
        function updateElementStates(elementStates) {
        	if (svgRootElement == null) return;
        	assert.consoleLog_Directives("'Directives' ["+scope.diagram.title+"] Start update snapshot.");
        	
        	var hasChange = false;
        	var hasChangeFromDefaultState = false;
        	var updatedElements = [];
        	
            angular.forEach(elementStates, function (es) {
            	  var foundPathElement = false;
            	  angular.forEach(es.guidPath, function (guid, index) {
            		  if (foundPathElement) return;
    	        	  var documentElement = findguidElement(guid);
    	        	  if (documentElement == null) return;
	        		  foundPathElement = true;
	        		  
	        		  var newSeqenceNumber = es.seq;
	        		  var newStateNumber = es.st;
	        		  
	        		  /**
	        		   * Update path state number. 
	        		   */
	        		  if (index > 0) {
	        			  if (newStateNumber == es.initPathSt) {
	        				  return;
	        			  }
	        			  newStateNumber = utility.getValueOrDefault(es.pathSt, es.st);
	        		  }
	        		  
	        		  /**
	        		   * Create elementContext if not exist.
	        		   */
	        		  if (documentElement.elementContext == null) {
	        			  documentElement.elementContext = {currentState: null, currentSeqence: 0, updateState: null, updateSeqence: 0, update: false, runUpdate: false};
	        		  }
	        		  
	        		  /**
	        		   * validate update index
	        		   */
	        		  if (utility.containsElement(updatedElements, guid)) {
	        			  if (index == 0) {
	        				  assert.consoleLog_Directives("          'Unnecessary Directives Update' ["+scope.diagram.title+"] 'NavigationDiagram:' "+scope.isNavigationDiagram()+" 'Guid:' "+ guid +" 'Id:' "+es.id+" 'Seq:' "+newSeqenceNumber+" 'NewStateNumber:' "+newStateNumber+" 'PathIndex:' "+index);
	        				  return;
	        			  }
	        		  }
	        		  utility.pushToArray(updatedElements, guid);
	        		  
	        		  /**
	        		   * Check currentState has change.
	        		   */
	        		  if (stateHasNotChanged(documentElement.elementContext, newStateNumber)) {
	        			  if (es.toggleSt == null) {
	        				  return;
	        			  }
	        			  if (es.defaultSt == newStateNumber) {
	        				  return;
	        			  }
	        			  if (documentElement.elementContext.currentSeqence == newSeqenceNumber) {
	        				  return;
	        			  }
	        			  newStateNumber = es.toggleSt;
	        		  }
	        		  	
	        		  /**
	        		   * Update is in progress, use promiseSetClass to set newState.
	        		   */
	        		  if (documentElement.elementContext.update) {
	        			  documentElement.elementContext.updateState = newStateNumber;
	        			  documentElement.elementContext.updateSeqence = newSeqenceNumber;
	        			  documentElement.elementContext.runUpdate = true;
	        			  assert.consoleLog_Directives("          'Pending Directives Update' ["+scope.diagram.title+"] Set class 'NavigationDiagram:' "+scope.isNavigationDiagram()+" 'Guid:' "+ guid +" 'Id:' "+es.id+" 'Seq:' "+newSeqenceNumber+" 'NewStateNumber:' "+newStateNumber+" 'PathIndex:' "+index);
	        			  return;
	        		  }
	        
	        		  if (newStateNumber != es.defaultSt) {
	        			  hasChangeFromDefaultState = true;
	        		  }
	        		  
	        		  var element = angular.element(documentElement);
	                  var newClass = 'appearance' + newStateNumber;
	        		  if (documentElement.elementContext.currentState != null) {
	        			  documentElement.elementContext.update = true;
	        			  var removeClass = 'appearance' + documentElement.elementContext.currentState;
	        			  documentElement.elementContext.currentState = newStateNumber;
	        			  documentElement.elementContext.currentSeqence = newSeqenceNumber;
	        			  
	        			  assert.consoleLog_Directives("     'Directives' ["+scope.diagram.title+"] Set class 'NavigationDiagram:' "+scope.isNavigationDiagram()+" 'Guid:' "+ guid +" 'Id:' "+es.id+" 'Seq:' "+newSeqenceNumber+" 'NewClass:' "+newClass+" 'RemoveClass:' "+removeClass+" 'PathIndex:' "+index);
			  			  $animate.setClass(element, newClass, removeClass).then(promiseSetClass(documentElement, es, guid),
			  			  function (error) {
			  				assert.throwReconnectMessage("'Animation' ["+scope.diagram.title+"] Add class 2 error: "+es.id);
		        		  });
	        		  } else {
	        			  documentElement.elementContext.update = true;
	        			  documentElement.elementContext.currentState = newStateNumber;
	        			  documentElement.elementContext.currentSeqence = newSeqenceNumber;
	        			  
	        			  assert.consoleLog_Directives("     'Directives' ["+scope.diagram.title+"] Add class 'NavigationDiagram:' "+scope.isNavigationDiagram()+" 'Guid:' "+ guid +" 'Id:' "+es.id+" 'Seq:' "+newSeqenceNumber+" 'NewClass:' "+newClass+" 'PathIndex:' "+index);
	        			  $animate.addClass(element, newClass).then(promiseSetClass(documentElement, es, guid), 
	        			  function (error) {
	     	            	 assert.throwReconnectMessage("'Animation' ["+scope.diagram.title+"] Add class 3 error: "+es.id);
	        			  });
	        		  }
	        		  hasChange = true;
            	  });
            });
            
            if (hasChange) {
            	scope.svgHasChanged(hasChangeFromDefaultState);
            }
            assert.consoleLog_Directives("'Directives' ["+scope.diagram.title+"] End update snapshot.");
        }
        
        /******************************************************************
    	 * init function
    	 ******************************************************************/
    	
    	/* if a svg is applyied to the element, initial functions run */
        scope.$watch(function() { 
          if(svgRootElement != elm.find('svg')[0]){
            svgRootElement = elm.find('svg')[0];
            updateElementStates(scope.diagram.snapshot);
          }
        });
        
        /* watch diagram snapshot */
        scope.$watch('diagram.snapshot',function () {
        	updateElementStates(scope.diagram.snapshot);
        });
      }
    };
  }]);