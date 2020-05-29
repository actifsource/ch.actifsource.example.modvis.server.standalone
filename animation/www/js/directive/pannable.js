'use strict';

/** module for specify directives */
angular.module('App.Directive.Pannable', [])

  /************************************************************************************************************
  * Pannable Directive
  * Enables panning and zooming for the first svg inside the element the directive is applied to.
  ************************************************************************************************************/
  .directive('pannable', ['assert', function(assert) {
    return {
      restrict: 'A',
      transclude: true,
      templateUrl: 'partials/diagram-controls.html',
      
      /**
       * controller
       */
      controller: function($scope) {

        $scope.zoom = { direction: '', timestamp: 0 };
        $scope.navigateTo = { direction: '', delta: 0, timestamp: 0 };

        // function for setting up directions x,y and delta 100 or -100 to move the svg left,right, up or down
        $scope.doNavigate = function(direction, delta) {
          $scope.navigateTo = { 
            direction: direction, 
            delta: delta,
            timestamp: new Date().getTime() 
          };
        };

        // function for setting up zooming in or out the svg
        $scope.doZoom = function(direction){
          $scope.zoom = { 
            direction: direction, 
            timestamp: new Date().getTime() 
          };
        };
      },
      
      /**
       * link
       */
      link: function(scope, elm, attrs) {
        
    	var zoomScale = 0.2;
        var currentZoom = 0;
        var initZoom = 0;
        var minZoom = -15;
        var maxZoom = 3;
        var scaleOffset = 100;
        
        var svgRootElement;
        var viewport = null;
        var panStarted = false;
        var panOrigin;
        var panOriginTransformMatrix;
        
        scope.minZoomed = false;
        scope.maxZoomed = false;
        
        
        /* default event */
        var defaultEvent = { 
          preventDefault: function () {},
          layerX: 50,
          layerY: 50
        };

        // applying zooming, if it changes through the click functions
        scope.$watch('zoom',function () {
          if(scope.zoom.direction){
            
            var delta = 150;

            if (scope.zoom.direction === 'out') {
              delta = -150;
            }
            if (scope.zoom.direction === 'reset') {
              delta = (0 - currentZoom)*150; 
            }
            currentZoom = Math.round(currentZoom);
            zoom(defaultEvent, delta);
          }
        });

        // applying panning, if it changes through the click functions
        scope.$watch('navigateTo',function () {
          if (scope.navigateTo.direction) {
            var navigateTo = scope.navigateTo;
            var moveEvent = defaultEvent;

            startPanning(defaultEvent);

            if (navigateTo.direction === 'x'){
              moveEvent.layerX += navigateTo.delta;
            }
            
            if (navigateTo.direction === 'y') {
              moveEvent.layerY += navigateTo.delta;
            }
            
            if (navigateTo.direction === 'reset') {
              panOrigin = {x:0,y: -elm[0].getBoundingClientRect().y};
              moveEvent.layerX = 50;
              moveEvent.layerY = 50;
            }

            pan(moveEvent);
            stopPanning(moveEvent);
          }
        });

        // if a svg is applyied to the element, initial functions run
        scope.$watch(function() { 
          if(svgRootElement != elm.find('svg')[0]){
            svgRootElement = elm.find('svg')[0];
            svgRootElement.removeAttribute('viewBox'); // viewbox destoys the layout, so removed it ;)

            /**
            * A top g element called viewport is needed to apply all the panning and zooming.
            * To create this svg element, you have to use the namespace of svg.
            */
            viewport = document.createElementNS("http://www.w3.org/2000/svg", "g");
            viewport.setAttribute('id','viewport');
            viewport.setAttribute('transform', 'matrix(1,0,0,1,50,50)'); // apply default matrix to it
            angular.element(viewport).append(svgRootElement.childNodes);
            svgRootElement.appendChild(viewport);

            initEventHandler();
            initDefaultZoom();
          }
        });

        /**
         * init default zoom.
         */
        function initDefaultZoom() {
        	var bounds = elm[0].getBoundingClientRect();
        	var svgHeight = parseInt(svgRootElement.getAttribute("height"));
        	var svgWidth = parseInt(svgRootElement.getAttribute("width"));
        	var scale = null;
        	
        	if (bounds.height < svgHeight) {
        		scale = (bounds.height - scaleOffset) / svgHeight;
        	}
        	if (bounds.width < svgWidth) {
        		if (((bounds.width) - scaleOffset / svgWidth) < scale) {
        			scale = (bounds.width - scaleOffset) / svgWidth;
        		}
        	}
        	if (scale != null) {
        		var wheelDelta = getBaseLog(1 + zoomScale, scale) * 150;
        		zoom(defaultEvent, wheelDelta);
        		initZoom =  Math.round(currentZoom);
        	}
        }
        
        /**
        * Sets all mouse eventhandlers for panning and zooming
        *
        * @private
        */
        function initEventHandler(){

          // determine the browser, to set mousewheel eventname
          var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";

          // bind mouse events to appropriate functions
          angular.element(svgRootElement)
            .bind("mousedown", startPanning)
            .bind("mousemove", pan)
            .bind("mouseup", stopPanning)
            .bind("dblclick", toggleZoom)
            .bind(mousewheelevt, zoom);
        }

        /**
        * Returns an svg point object with x and y of the current mouse position
        *
        * @private
        * @param {MouseEvent} evt
        * @returns {SVGPoint} p
        */
        function getEventPoint(evt) {
          var p = svgRootElement.createSVGPoint(),
            evt = evt.originalEvent || evt;

          p.x = evt.layerX;
          p.y = evt.layerY;

          return p;
        }

        /**
         * Returns an svg point object with x and y of the current mouse position
         *
         * @private
         * @param {MouseEvent} evt
         * @returns {SVGPoint} p
         */
         function getScaledEventPoint(evt) {
        	 var bounds = elm[0].getBoundingClientRect();
        	 var p = getEventPoint(evt);
        	 p.y = p.y - bounds.y;
             return p;
         }
         
         
        /**
        * Applies the given matrix to the element to transform position and zooming of the svg
        *
        * @private
        * @param {Element} element
        * @param {SVGMatrix} matrix
        */
        function setTransformMatrix(element, matrix) {
          var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";

          element.setAttribute("transform", s);
        }

        /**
         * getBaseLog
         */
        function getBaseLog(x, y) {
        	return Math.log(y) / Math.log(x);
        }
        
        /**
        * Applies the given delta to the svg at the evt position
        *
        * @private
        * @param {MouseEvent} evt
        * @param {Number} wheelDelta
        */
        function zoom(evt, wheelDelta) {

          evt.preventDefault();

          // if wheelDelta is empty, look for delta information in the event
          var evtDelta = wheelDelta || (evt.detail ? evt.detail * -4 : evt.wheelDelta);
          var delta = evtDelta / 150;
          var newZoom = currentZoom + delta;

          // for de-/activated of the buttons set scope vars
          scope.minZoomed = newZoom <= minZoom;
          scope.maxZoomed = newZoom >= maxZoom;
          if(evt.type) scope.$apply();

          if (newZoom >= minZoom && newZoom <= maxZoom) {

            currentZoom = newZoom;

            var currentTransformMatrix = viewport.getCTM().inverse();
            var currentMousePos = getScaledEventPoint(evt).matrixTransform(currentTransformMatrix);
            var scale = Math.pow(1 + zoomScale, delta);

            // Compute new scale matrix in current mouse position
            // http://www.w3.org/TR/SVG/coords.html
            var k = svgRootElement
                      .createSVGMatrix()
                      .translate(currentMousePos.x, currentMousePos.y)
                      .scale(scale)
                      .translate(-currentMousePos.x, -currentMousePos.y);

            setTransformMatrix(viewport, viewport.getCTM().multiply(k));
          }
        }

        /**
        * Saves the current transform matrix when called for further use in pan(evt)-function
        * For further information on transformations visit:
        * http://msdn.microsoft.com/en-us/library/ie/hh535760(v=vs.85).aspx
        *
        * @private
        * @param {MouseEvent} evt
        */
        function startPanning(evt) {
          /* Right mouse button */
          if(evt.button == 2) { 
        	  return;
          }
        
          evt.preventDefault();
          
          /* Left mouse button */
          panStarted = true;
          panOriginTransformMatrix = viewport.getCTM().inverse();
          panOrigin = getScaledEventPoint(evt).matrixTransform(panOriginTransformMatrix);
        }

        /**
        * If startPanning(evt) was called this function sets the new position of svg to the given evt position
        *
        * @private
        * @param {MouseEvent} evt
        */
        function pan(evt) {
          evt.preventDefault();

          if(panStarted) {
            var currentMousePos = getScaledEventPoint(evt).matrixTransform(panOriginTransformMatrix);
            var newPosX = currentMousePos.x - panOrigin.x;
            var newPosY = currentMousePos.y - panOrigin.y;
            var newMatrix = panOriginTransformMatrix.inverse().translate(newPosX, newPosY);
            setTransformMatrix(viewport, newMatrix);
          }
        }

        /**
         * Stops the panning
         *
         * @private
         * @param {MouseEvent} evt
         */
         function stopPanning(evt) {
           evt.preventDefault();
           panStarted = false;
         }
         
        /**
         * toggleZoom between 100% and init zoom
         */
        function toggleZoom(evt) {
        	if (currentZoom == 0) {
        		// zoom svg
        		var delta = (initZoom - currentZoom)*150; 
            	zoom(evt, delta);
            	// move svg
            	startPanning(defaultEvent);
            	var moveEvent = defaultEvent;
            	panOrigin = {x:0,y: -elm[0].getBoundingClientRect().y};
                moveEvent.layerX = 50;
                moveEvent.layerY = 50;
                pan(moveEvent);
                stopPanning(moveEvent);
                assert.consoleLog_Directives("'Pannable' Toggle zoom: "+initZoom);
        	} else {
        		// zoom svg
        		var delta = (0 - currentZoom)*150; 
            	zoom(evt, delta);
            	assert.consoleLog_Directives("'Pannable' Toggle zoom: "+currentZoom);
        	}
        }
        
      }
    };
  }]);