'use strict';

/** module for specify directives */
angular.module('App.Directive.Contextmenu', [])

  /************************************************************************************************************
  * Animation Directive
  * Handles snapshot of a diagram and applies the changes to the active svg.
  ************************************************************************************************************/
  .directive('contextmenu', ['assert', '$animate', '$timeout',
                           function (assert, $animate, $timeout) {
    return {
      restrict: 'A',
      link: function(scope, elm, attrs) {

    	var svgRootElement = null;
    	
    	/******************************************************************
    	 * contextMenu
    	 ******************************************************************/
    	
        /**
         * @private contextMenu
         * 
         * @param that
         * @param newContext
         * @param linkdiagrams
         */
        function contextMenu(that, newContext, linkdiagrams) {
			d3.event.preventDefault();
			d3.select('#context-menu').remove();
			
			var context = d3.select("body").append("ul").attr("id", "context-menu").attr("class", "menu");
			angular.forEach(linkdiagrams, function (linkdiagram) {
				
				if (scope.hasParentWindow()) {
					context.append("li").attr("class", "circle").attr("id", "action-circle-1").append("a").attr("href", "#/diagram/"+linkdiagram.number).attr("id", "diagram_"+linkdiagram.id)
						.text(function(d) { return linkdiagram.label;});
				} else {
					context.append("li").attr("class", "circle").attr("id", "action-circle-1").append("a").attr("href", "#/"+linkdiagram.diagramType+"/"+linkdiagram.number).attr("id", "diagram_"+linkdiagram.id)
					.text(function(d) { return linkdiagram.label;});
				}
			});
			
			d3.select('#context-menu')
				 .style('position', 'absolute')
				 .style('left', d3.event.pageX  + "px")
				 .style('top', d3.event.pageY  + "px")
				 .style('display', 'inline-block')
				 .on('mouseleave', function() {
				    	d3.select('#context-menu').style('display', 'none');
				    	context = null;
				  });
			var open = d3.select('#context-menu').attr('class', 'menu ' + "circle");
		}  
        
        /**
         * @private updateLinkDiagrams
         * 
         * @param linkdiagrams
         */
        function updateLinkDiagrams(linkdiagrams) {
        	if (svgRootElement == null) return;
        	
        	angular.forEach(linkdiagrams, function (diagram) {
        		var svg = d3.select("#"+diagram.linkId);
        		if(svg == null) throw "link diagram guid not found in svg diagram guid_"+diagram.linkId; 
        		
				svg.on("contextmenu", function(data, index) {
					 contextMenu(this, 'svg', diagram.linkdiagrams, data, index);
					 d3.event.preventDefault();
				});
        	});
        }
    	 
        /******************************************************************
    	 * init function
    	 ******************************************************************/
    	
    	/* if a svg is applyied to the element, initial functions run */
        scope.$watch(function() { 
          if(svgRootElement != elm.find('svg')[0]){
            svgRootElement = elm.find('svg')[0];
            
            updateLinkDiagrams(scope.diagram.linkDiagrams);
          }
        });
        
        /* watch diagram link diagram */
    	scope.$watch('diagram.linkDiagrams', function() {
    		updateLinkDiagrams(scope.diagram.linkDiagrams);
    	});
    	
      }
    };
  }]);