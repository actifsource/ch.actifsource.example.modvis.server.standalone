'use strict';

/**
 * Global modVis object is needed to multiplex all service requests to the
 * parent window.
 * 
 * So check if current window is a popup-window, if so use the parent window
 * modVis, otherwise instanciate a window global variable called modVis.
 */
var modVisService = (window.opener) ? window.opener.modVisService : {};

/** module for specify services */
angular.module('App.Service.StatefullComponentService', [])

    /************************************************************************************************************
    * The statefullComponentService service provides functions, like bind and unbind sks.
    * @constructor $rootScope, requestHandler, fileHandler, utility, assert, $errorHandler, $window, $settings, $filter, $api, $q, animationStrategy
    ************************************************************************************************************/
    .factory('statefullComponentService', ['$rootScope', 'requestHandler', 'fileHandler', 'utility', 'assert', '$errorHandler', '$window', '$settings', '$filter', '$api', '$q', 'animationStrategy', 
                                           function($rootScope, requestHandler, fileHandler, utility, assert, $errorHandler, $window, $settings, $filter, $api, $q, animationStrategy) {  
    	
    	if (modVisService.statefullComponentService) {
    		return modVisService.statefullComponentService;
        }
    	modVisService.statefullComponentService = {};
    	
    	/** 
    	 * this function
    	 * Contains all binded contexts = {skId: , currentSeq: , currentTime: , snapshot:, initSnapshot:, initSt:, animationStrategie:, handlers:}; 
    	 */
    	var fService = {contexts: [], handlerId: 0};
    	
    	modVisService.statefullComponentService.EVENT = {
    					SNAPSHOT_UPDATE 	: "snapshotUpdate",
    					PROGRESS_STATE  	: "progressState"
    	};
    	
    	/**
    	 * @public bindStatefullComponent
    	 * Bind statefull component.
    	 * 
    	 * @param {Object} skId
    	 * @param {Object} listener
    	 * @return {Object} handler
    	 */
    	modVisService.statefullComponentService.bindStatefullComponent = function(skId, listener) {
    		
    		var newHandlerId = fService.handlerId++;
    		var skId_ = angular.copy(skId);
    		
    		synchronizeFunction(function () {
    			assert.consoleLog_Service("'StatefullComponentService' BindStatefullComponent id: "+skId_);
    			
    			var context = findContextsBySkIdOrNull(skId_);
    			if (context == null) {
    				fService.contexts.push(createContext(skId_, listener, newHandlerId));
    				$rootScope.$broadcast('bindSkId', {bindedSkIds: allContextSkIds()});
    				assert.consoleLog_Service("'StatefullComponentService' Create context id: "+skId_);
    				return;
    			}
    			context.handlers.push([newHandlerId, listener]);
    			
    			/* notify listener used to init the new controller */
    			notifyListenerUpdateSnapshot(skId_);
            });
    		return [skId, newHandlerId];
    	};
    	
    	/**
    	 * @public unbindStatefullcomponent IO
    	 * Unbind stateful component.
    	 * 
    	 * @param {Object} callbackHandle [array of ids]
    	 */
    	modVisService.statefullComponentService.unbindStatefullComponent = function(callbackHandle) {	
    		if (callbackHandle == null) return;
    		
    		var skId = angular.copy(callbackHandle[0]);
			var handlerId = angular.copy(callbackHandle[1]);
    		
    		synchronizeFunction(function () {
    		
    			var context = findContextsBySkIdOrNull(skId);
    			if (context == null) return;
    			
    			assert.consoleLog_Service("'StatefullComponentService' UnbindStatefullComponent id: "+skId);
    			
    			angular.forEach(context.handlers, function(handler, index) {
    				if (handlerId != handler[0]) return;
    				context.handlers.splice(index, 1);
    				if (context.handlers.length != 0) return;
    				deleteContext(skId);
    			});	
            });
    	};
    	
    	/**
    	 * @public updateStatefullComponentData
    	 * Patch all element context. 
    	 * 
    	 * @param {Object} snapshotPatch
    	 */
    	modVisService.statefullComponentService.updateStatefullComponentData = function(modulId, snapshotPatch) {
    		synchronizeFunction(function () {
    			internalUpdateStatefullComponentData(modulId, snapshotPatch);
    		});
    	};
    	
    	/**
    	 * @public updateAndResetStatefullComponentData
    	 * Update reset and update contexts.
    	 * 
    	 * @param modulId
    	 * @param {Object} snapshotPatch
    	 */
    	modVisService.statefullComponentService.updateAndResetStatefullComponentData = function(modulId, snapshotPatch) {
    		synchronizeFunction(function () {
    			
    			angular.forEach(fService.contexts, function(context) {
    				if (!utility.containsModulId(context.skId, modulId)) return;
    				initSnapshot(context.skId);
    			});
    			
    			internalUpdateStatefullComponentData(modulId, snapshotPatch);
    		});
    	};
    	
    	/**
    	 * @public resetStatefullComponentData
    	 * Reset all context to init state.
    	 * 
    	 *  @param modulId
    	 */
    	modVisService.statefullComponentService.resetStatefullComponentData = function(modulId) {
    		synchronizeFunction(function () {
    			
    			angular.forEach(fService.contexts, function(context) {
    				if (!utility.containsModulId(context.skId, modulId)) return;
    				initSnapshot(context.skId);
    			});
    			
    		});
    	};
    	
    	/**
    	 * @public notifyAllListener
    	 * event = {id: (enum-> SNAPSHOT_UPDATE PROGRESS_STATE), , data:}
    	 * Notify all listener.
    	 * 
    	 * @param modulId
    	 * @param event
    	 */
    	modVisService.statefullComponentService.notifyAllListener = function(modulId, event) {
    		synchronizeFunction(function () {
    			angular.forEach(fService.contexts, function(context) {
    				if (!utility.containsModulId(context.skId, modulId)) return;
    				notifyListener(context.skId, event);
    			});
    		});
    	}
    	
    	/**
    	 * @public notifyAllListenerUpdateSnapshot
    	 * Notify all listener.
    	 * 
    	 * @param modulId
    	 */
    	modVisService.statefullComponentService.notifyAllListenerUpdateSnapshot = function(modulId) {
    		synchronizeFunction(function () {
    			angular.forEach(fService.contexts, function(context) {
    				if (!utility.containsModulId(context.skId, modulId)) return;
    				notifyListenerUpdateSnapshot(context.skId);
    			});
    		});
    	}
    	
    	/**
    	 * @private synchronizeFunction
    	 * Synchronize function to handle async events.
    	 * 
    	 * @param syncfunction
    	 */
    	function synchronizeFunction(syncfunction) {
    		$rootScope.$applyAsync(syncfunction);
    	}

    	/**
         * @private resetServie
         * Reset service.
         */
    	function resetServie() {
    		synchronizeFunction(function () {
    			fService.contexts = [];
        		fService.handlerId = 0;
    		});
        }
    	
    	/**
    	 * @public allContextSkIds
    	 */
    	function allContextSkIds() { 
    		var skIds = [];
    		angular.forEach(fService.contexts, function(context) {
    			skIds.push(context.skId);
			});
    		return skIds
    	}
    	
    	/**
    	 * @private initSnapshot
    	 * Init the snaphot.
    	 * 
    	 * @param {Object} skId
    	 */
    	function initSnapshot(skId) {
    		var context = findContextsBySkIdOrNull(skId);
    		assert.assertNotNull(context, "Context is not binded skId: "+skId);
    		assert.assertNotNull(context.initSnapshot, "Init snapshot is not available skId: "+skId);
    		angular.copy(context.initSnapshot, context.snapshot);
    	}
    	
    	/**
    	 * @private createContext
    	 * Create a new context of a statefullComponent.
    	 * 
    	 * contexts = {skId: , currentSeq: , currentTime: , snapshot:, initSnapshot:, initSt:, animationStrategie:, listeners:};
    	 * snapshot.elementState = {id: , st: , time: , seq: , guidPath:, group:};
    	 * 
    	 * @param {Object} skId
    	 * @param {Object} listener
    	 * @param newHandlerId
    	 */
    	function createContext(skId, listener, newHandlerId) {
    		
    		/* contexts = {skId: , currentSeq: , currentTime: , snapshot:, initSnapshot:, initSt:, animationStrategie:, listeners:}; */
    		var context = {initcomplete: false, skId: skId, currentSeq: 0, currentTime: 0, snapshot: [], initSnapshot: null, animationStrategie: '', handlers: [[newHandlerId, listener]]};
    			
    		fileHandler.getStatefullComponentConfig(skId).then(function (configAsJson) {
    			
    			synchronizeFunction(function () {
    				context.initSnapshot = [];
    				angular.forEach(configAsJson.map, function (mapElement) {
    					
    					var defaultSt = utility.getValueOrDefault(configAsJson.defaultSt, 0);
    					var initSt = utility.getValueOrDefault(mapElement.st, defaultSt);
    					var st = initSt;
    					var group = utility.getValueOrDefault(mapElement.group, 0);
    					var groupSt = utility.getValueOrDefault(configAsJson.groupSt, defaultSt);
    					var pathSt = utility.getValueOrDefault(mapElement.pathSt, null);
    					var initPathSt = utility.getValueOrDefault(mapElement.initPathSt, 0);
    					var toggleSt = configAsJson.toggleSt;
    						
    					var elementState = {id: mapElement.id, st: st, time: 0, seq: 0, 
    							defaultSt: defaultSt, initSt: initSt, toggleSt: toggleSt, guidPath: mapElement.guidPath, pathSt: pathSt, initPathSt: initPathSt, group: group, groupSt: groupSt};
    					
    					assert.assertNotNull(elementState.id);
    					assert.assertNotNull(elementState.st);
    					assert.assertNotNull(elementState.time);
    					assert.assertNotNull(elementState.seq);
    					assert.assertNotNull(elementState.initSt);
    					assert.assertNotNull(elementState.defaultSt);
    					assert.assertNotNull(elementState.guidPath);
    					assert.assertNotNull(elementState.group);
    					assert.assertNotNull(elementState.groupSt);
    					
    					context.initSnapshot.push(elementState);
    	    		});
    				
    				/* add Config */
    				context.animationStrategie = (configAsJson.animationStrategie) ? configAsJson.animationStrategie : "_implicitdiagramreset";
    				
    				/* init snapshot */
    				initSnapshot(context.skId);
    				
    				assert.consoleLog_Service("'StatefullComponentService' Init context complete id: "+skId);
    				
    				/* send skId request */
    				requestHandler.bind(context.skId);
    				
    				/* init is completed */
    				context.initcomplete = true;
    				
    				/* notifyListenerUpdateSnapshot */
    				notifyListenerUpdateSnapshot(context.skId);
    				
                });
    		});
    		
    		return context;
    	}
    	
    	/**
    	 * @private deleteContext
    	 * Defer dispose a context and defer a context if 
    	 * 
    	 * contexts 	= {skId: , currentSeq: , currentTime: , snapshot:, initSnapshot:, initSt:, animationStrategie:, listeners:};
    	 * elementState = {id: , st: , time: , seq: , guidPath:, group:};
    	 * 
    	 * @param {Object} skId
    	 */
    	function deleteContext(skId) {
    		setTimeout(function() {
				synchronizeFunction(function () {
					
					angular.forEach(fService.contexts, function(context, index) {
						if (!utility.equals(context.skId, skId)) return;
						if (context.handlers.length > 0) return;
						fService.contexts.splice(index, 1);
		    			requestHandler.unbind(skId);
		    			$rootScope.$broadcast('unbindSkId', {bindedSkIds: allContextSkIds()});
		    			assert.consoleLog_Service("'StatefullComponentService' Delete context id: "+skId);
					});
					
				});
			}, $settings.statefullComponentDisposeDelay);	
    	}
    	
    	/**
    	 * @private internalUpdateStatefullComponentData
    	 * 
    	 * contexts 	= {skId: , currentSeq: , currentTime: , snapshot:, initSnapshot:, initSt:, animationStrategie:, handlers:};
    	 * 
    	 * snapshotPatch = {updateElementIndex:, elementContext:, cacheOption:}
    	 * 
    	 * snapshotPatch.elementContext = {snapshotElementState:, updateElementState:}
    	 * 
    	 * @param modulId
    	 * @param snapshotPatch
    	 */
    	function internalUpdateStatefullComponentData(modulId, snapshotPatch) {
    		var updateElementState = utility.getArrayIndex(snapshotPatch.elementContext.updateElementStates, snapshotPatch.updateElementIndex); 
    		
    		angular.forEach(fService.contexts, function(context) {			
    			assert.assertTrue(context.initcomplete, "'StatefullComponentService' Init context not complete.");
    
    			if (!utility.containsModulId(context.skId, modulId)) return;
    			var strategy = animationStrategy.getAnimationStrategy(context.animationStrategie);
	    		assert.assertNotNull(strategy, "Animation strategy not found skId: "+context.skId+" Strategy: "+context.animationStrategie);
	    		
	    		context.currentSeq = updateElementState.seq;
	    		context.currentTime = updateElementState.time;
	    		
	    		/* prepareSnapshot */
	    		strategy.prepareSnapshot(context, snapshotPatch);
    		});
    		
			/* notify updated SKs*/
    		angular.forEach(fService.contexts, function(context) {
    			if (!utility.containsModulId(context.skId, modulId)) return;
    			notifyListenerUpdateSnapshot(context.skId);
    		});
    	}
    	
    	/**
    	 * @private notifyListener
    	 * 
    	 * @param skId
    	 */
    	function notifyListenerUpdateSnapshot(skId) {
    		var context = findContextsBySkIdOrNull(skId);
    		assert.assertNotNull(context);
    		var data = {currentTime: 0, currentSeq: 0, snapshot: 0};
			data.currentTime = context.currentTime;
			data.currentSeq = context.currentSeq;
			data.snapshot = angular.copy(context.snapshot);
    		var event = {id: modVisService.statefullComponentService.EVENT.SNAPSHOT_UPDATE, data: data};
    		notifyListener(skId, event);
    	}
    	
    	/**
    	 * @private notifyListener
    	 * event = {id: (enum-> SNAPSHOT_UPDATE PROGRESS_STATE), , data:}
    	 * 
    	 *  @param skId
    	 *  @param event
    	 */
    	function notifyListener(skId, event) {
    		assert.assertNotNull(event);
    		var context = findContextsBySkIdOrNull(skId);
    		assert.assertNotNull(context);
    		angular.forEach(context.handlers, function(handler) {
				var listener = handler[1];
				if (listener == null || !angular.isFunction(listener)) return;
    			listener(event);
    		});
    	}
    	
    	/** 
         * @private filterContextsBySkId
         * Returns the first elementstate with the uuid in elementstates.
         *
         * @param skId
         * @returns {Object} elementstate
         */
         function findContextsBySkIdOrNull(skId) {
             var context = fService.contexts.filter(function(context) {
            	 return utility.equals(context.skId, skId);
             });
             return context[0];
         }
    	
    	 /************
    	 * Init
    	 ************/
         assert.consoleLog_Service("Init StatefullComponentService");
         
         /* retryError */
 		 $rootScope.$on('resetError', function(event, data) {
 			synchronizeFunction(function () {
 				assert.consoleLog_Service("'StatefullComponentService' Reset error.");
 				
 	        	/* reconnect */
 	        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
 	        		resetServie();
 	        	}
 			});
 		 });
 		
    	 return modVisService.statefullComponentService;
    }]);
