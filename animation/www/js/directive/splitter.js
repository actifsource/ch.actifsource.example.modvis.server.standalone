
 /************************************************************************************************************
  * Animation Directive
  * 
  ************************************************************************************************************/
angular.module('App.Directive.Splitter', [])

  .directive('bgSplitter', ['$window', '$timeout',
                            function($window, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
    	splitterId: '@',
        orientation: '@'
      },   
      
      template: '<div class="split-panes {{orientation}}" ng-transclude></div>',
      controller: ['$scope', '$rootScope', function ($scope, $rootScope) {
        $scope.panes = [];
        
        this.addPane = function(pane){
          if ($scope.panes.length > 1) 
            throw 'splitters can only have two panes';
          $scope.panes.push(pane);
          return $scope.panes.length;
        };
      }],
      
      
      link: function(scope, element, attrs) {
    	var rootScope = scope.$root;
    	if (rootScope.panePosition == null) {
        	rootScope.panePosition = [];
        }
    	
    	var drag = false;
        var handler = angular.element('<div class="split-handler"></div>');
        var pane1 = scope.panes[0];
        var pane2 = scope.panes[1];
        var pane1Min = pane1.minSize || 0;
        var pane2Min = pane2.minSize || 0;
        var pane1Max = pane1.maxSize || 5000;
        var pane2Max = pane2.maxSize || 5000;
        
        var pane1InitSizeLeft = pane1.initSizeLeft || null;
        var pane1InitSizeRight = pane1.initSizeRight || null;
        var pane2InitSizeLeft = pane2.initSizeLeft || null;
        var pane2InitSizeRight = pane2.initSizeRight || null;

        var pane1UpdateListenerLeft = pane1.updateListenerLeft || null;
        var pane1UpdateListenerRight = pane1.updateListenerRight || null;
        var pane2UpdateListenerLeft = pane2.updateListenerLeft || null;
        var pane2UpdateListenerRight = pane2.updateListenerRight || null;
        
        var pane1ChangeListenerLeft = pane1.changeListenerLeft || null;
        var pane1ChangeListenerRight = pane1.changeListenerRight || null;
        var pane2ChangeListenerLeft = pane2.changeListenerLeft || null;
        var pane2ChangeListenerRight = pane2.changeListenerRight || null;
        pane1.elem.after(handler);

        /**
	     * Init pane
	     */
        var bounds = element[0].getBoundingClientRect();
        pos = null;
        if (pane1InitSizeLeft != null) {
        	pos = bounds.left + pane1InitSizeLeft;
        }
        if (pane2InitSizeLeft != null) {
        	pos = bounds.left + pane2InitSizeLeft;
        }
        if (pane1InitSizeRight != null) {
        	pos = bounds.right - pane1InitSizeRight;
        }
        if (pane2InitSizeRight != null) {
        	pos = bounds.right - pane2InitSizeRight;
        }
        
       // pos = rootScope.panePosition;
        if (rootScope.panePosition[scope.splitterId] != null) {
        	pos = rootScope.panePosition[scope.splitterId];
        }
        
        if (pos != null) {
        	scope.panePosition = pos;
        	handler.css('left', pos + 'px');
        	pane1.elem.css('width', pos + 'px');
        	pane2.elem.css('left', pos + 'px'); 
        }
        
        /**
	     * Add mousemove Listener
	     */
        element.bind('mousemove', function (ev) {
          if (!drag) return;
          
          var bounds = element[0].getBoundingClientRect();
          var pos = 0;
          var width = bounds.right - bounds.left;
          pos = ev.clientX - bounds.left;

          // Pane 1
          if (pos < pane1Min) {
        	  pos = pane1Min;
          }
          if (pos > pane1Max) {
        	  pos = pane1Max;
          }
            
          // Pane 2
          if (width - pos < pane2Min) {
        	  pos = width - pane2Min;
          }
          if (width - pos > pane2Max) {
        	  pos = width - pane2Max;
          }
          
          scope.panePosition = pos; 
          handler.css('left', pos + 'px');
          pane1.elem.css('width', pos + 'px');
          pane2.elem.css('left', pos + 'px');
          rootScope.panePosition[scope.splitterId] = pos;
          
          rootScope.$apply(function () {
        	  if (pane1UpdateListenerLeft || pane1UpdateListenerRight || pane2UpdateListenerLeft || pane2UpdateListenerRight) {
        		  if (rootScope.toggleLayoutChanged) {
        			  rootScope.toggleLayoutChanged = false;
        		  } else {
        			  rootScope.toggleLayoutChanged = true;
        		  }
        	  }
          });
          
        });
    
        /**
	     * Add $watch Listener
	     */
        rootScope.$watch('toggleLayoutChanged', function() {
        	var bounds = element[0].getBoundingClientRect();
            pos = null;
            
            if (pane1ChangeListenerLeft) {
            	
            }
            if (pane1ChangeListenerRight) {
            	
            }
            if (pane2ChangeListenerLeft) {
            	
            }
            if (pane2ChangeListenerRight) {
            	if (pane2Min > bounds.right - (scope.panePosition + bounds.left)) {
            		pos = bounds.right - (bounds.left + pane2Min);
            	}
            	if (bounds.width - scope.panePosition > pane2Max) {
            		pos = bounds.width - pane2Max;
                }
            }
            if (pos != null) {
	           	handler.css('left', pos + 'px');
	           	pane1.elem.css('width', pos + 'px');
	           	pane2.elem.css('left', pos + 'px');
	            rootScope.panePosition[scope.splitterId] = pos;
	        }
    	},
        function() {});
        
	    /**
	     * Add Listener Windows resize
	     */
	     $window.addEventListener('resize', onWindowResize);
	     function onWindowResize() {
	     	$timeout(function () {
		    	 rootScope.$apply(function () {
			       	  if (pane1UpdateListenerLeft || pane1UpdateListenerRight || pane2UpdateListenerLeft || pane2UpdateListenerRight) {
			       		  if (rootScope.toggleLayoutChanged) {
			       			  rootScope.toggleLayoutChanged = false;
			       		  } else {
			       			  rootScope.toggleLayoutChanged = true;
			       		  }
			       	  }
			     });
	    	 });
	     };
         
         
        handler.bind('mousedown', function (ev) { 
          ev.preventDefault();
          drag = true; 
        });
    
        angular.element(document).bind('mouseup', function (ev) {
          drag = false;
        });
        
      }
    };
  }])
  
  /************************************************************************************************************
  * Animation Directive
  * 
  ************************************************************************************************************/
  .directive('bgPane', function () {
    return {
      restrict: 'E',
      require: '^bgSplitter',
      replace: true,
      transclude: true,
      scope: {
        minSize: '=',
        maxSize: '=',
        initSizeLeft: '=',
        initSizeRight: '=',
        updateListenerLeft: '=',
        updateListenerRight: '=',
        changeListenerLeft: '=',
        changeListenerRight: '='
      },
      
      template: '<div class="split-pane{{index}}" ng-transclude></div>',
      link: function(scope, element, attrs, bgSplitterCtrl) {
        scope.elem = element;
        scope.index = bgSplitterCtrl.addPane(scope);
      }
    };
  });
