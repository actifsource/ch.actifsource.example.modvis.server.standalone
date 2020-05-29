'use strict';

/** module for specify services */
angular.module('App.Service.AnimationStrategy', [])

	/***********************************************************************************************************
    * The animationStrategy service provides functions, like patch snapshot.
    * @constructor
    ***********************************************************************************************************/
    .factory('animationStrategy', ['utility', 'assert', '$settings', '$q', '$filter', 
                                   function (utility, assert, $settings, $q, $filter) {  

    	var fAnimationStrategy = {};
    	      
    	/** 
     	 * @public getAnimationStrategy
     	 * Returns the animation strategy object for the given diagram or a null.
     	 *
     	 * @param {String} animationStrategy
     	 * @returns {Object} strategy
     	 */
        fAnimationStrategy.getAnimationStrategy = function (animationStrategy) {
           return fAnimationStrategy.animationStrategies["_"+animationStrategy];
     	} 
        
    	/* Possible animation stratgies goes in here */
    	fAnimationStrategy.animationStrategies = {

    		
    		/*default Strategie*/	
             _default : {
            	 
            	 /**
                  * @private prepare the current Snapshot.
                  * 
                  * @param {Object} snapshotPatch = {updateElementIndex:, elementContext:, cacheOption:}
                  * 				snapshotPatch.elementContext = {snapshotElementStates:, updateElementStates:}
                  * 
                  * @param {Object} contexts = {skId: , currentSeq: , currentTime: , snapshot:, initSnapshot:, initSt:, animationStrategie:, listeners:};
                  * 
                  * @returns {Object} hasChange true or false
                  */
                 prepareSnapshot: function (context, snapshotPatch) {
                	assert.consoleLog_Service("'AnimationStrategy' Prepare snapshot 'Strategies: _default' skId: "+ context.skId);
                	 
                	updateCacheContext(context, snapshotPatch);
                	
                	var lastChangedElementState = patchSnapshotElementStatesToSnapshot(context, snapshotPatch);
            		
             		var changedElementState = patchUpdateElementStatesToSnapshot(context, snapshotPatch);
            		if (changedElementState != null) {
            			lastChangedElementState = changedElementState;
            		}
            		
            		context.cacheContext.initComplete = true;
            		
             		return lastChangedElementState != null;
                 }
             },

             /*implicitdiagramreset*/
             _implicitdiagramreset : { 
                 
            	 /**
                  * @private prepare the current Snapshot.
                  * 
                  * @param {Object} snapshotPatch = {updateElementIndex:, elementContext:, cacheOption:}
                  * 				snapshotPatch.elementContext = {snapshotElementStates:, updateElementStates:}
                  * 				snapshotPatch.cacheContext = {initComplete:, hashPatch:, }
                  * 
                  * @param {Object} contexts = {skId: , currentSeq: , currentTime: , snapshot:, initSnapshot:, initSt:, animationStrategie:, listeners:};
                  * 
                  * @returns {Object} hasChange true or false
                  */
            	 prepareSnapshot: function (context, snapshotPatch) {
            		assert.consoleLog_Service("'AnimationStrategy' Prepare snapshot 'Strategies: _implicitdiagramreset' skId: "+ context.skId);
            		
            		updateCacheContext(context, snapshotPatch);
            		
            		var lastChangedElementState = patchSnapshotElementStatesToSnapshot(context, snapshotPatch);
            		
             		var changedElementState = patchUpdateElementStatesToSnapshot(context, snapshotPatch);
            		if (changedElementState != null) {
            			lastChangedElementState = changedElementState;
            		}
            		
                	/** reset diagram if sequence not equals current sequence */
            		if (lastChangedElementState != null) {
            			angular.forEach(context.snapshot, function (es) {
            				if (es.seq == lastChangedElementState.seq) {
            					return;
            				}
            				if (es.group == lastChangedElementState.group) {
            					es.st = lastChangedElementState.defaultSt;
            					return;
            				}
            				if (es.group != lastChangedElementState.group) {
            					es.st = lastChangedElementState.groupSt;
            					return;
            				}
	         			});
            		}
            		
            		context.cacheContext.initComplete = true;
            		
            		return lastChangedElementState != null;
                 }
            }
        }

    	/**************************
    	 * Applay Patch
    	 **************************/
    	
    	/**
    	 * @private patchSnapshot
    	 * 
    	 * @param context
    	 * @param snapshotPatch
    	 * @returns {Object} changedElementStates true or false
    	 */
    	function patchSnapshotElementStatesToSnapshot(context, snapshotPatch) {
    		var lastChangedElementState = null;
    		angular.forEach(snapshotPatch.elementContext.snapshotElementStates, function(elementState) {
    			var changedElementState = updateSnapshotElementState(context, elementState);
    			if (changedElementState != null) {
    				lastChangedElementState = changedElementState;
				}
			});
    		return lastChangedElementState;
    	}
    	
    	/**
    	 * @private patchUpdate
    	 * 
    	 * @param context
    	 * @param snapshotPatch
    	 * @returns {Object} changedElementStates true or false
    	 */
    	function patchUpdateElementStatesToSnapshot(context, snapshotPatch) {
    		var cacheOffset = 0;
    		var lastChangedElementState  = null;
    		var cacheElement = findCacheElement(context, context.cacheContext.updateElementStates, snapshotPatch.updateElementIndex);
    		if (cacheElement != null) {
    			angular.copy(cacheElement.elementStates, context.snapshot);
    			lastChangedElementState = cacheElement.lastChangedElementState;
    			cacheOffset = cacheElement.elementIndex + 1;
    		}
    		
    		for (var index = cacheOffset; index < utility.getArrayLength(snapshotPatch.elementContext.updateElementStates); index++) {
    			if (index > snapshotPatch.updateElementIndex) break;
    			var elementState = snapshotPatch.elementContext.updateElementStates[index];
				var changedElementState = updateSnapshotElementState(context, elementState);
				if (changedElementState != null) {
					lastChangedElementState = changedElementState;
				}
				if (index == 0 || index % $settings.cacheElementStateSize != 0) continue;
				context.cacheContext.updateElementStates.push(crateCacheElement(context, index, lastChangedElementState));
    		}
			return lastChangedElementState;
    	}

    	/**
    	 * @private updateSnapshotElementState
    	 * 
    	 * @param context
    	 * @param elementState
    	 * @returns {Object} changedElementStates true or false
    	 */
    	function updateSnapshotElementState(context, elementState) {
    		var elementSkId = utility.filterSkIdFromElementState(elementState);
			if (!utility.equals(elementSkId, context.skId)) return null;
			
			var snapshotElementState = utility.filterElementStateById(context.snapshot, elementState.id);
			assert.assertNotNull(snapshotElementState, "ElementState is not defined in snapshot 'ElementState Id:'"+elementState.id);
			snapshotElementState.st = elementState.st;
			snapshotElementState.time = elementState.time;
			snapshotElementState.seq = elementState.seq;
			//assert.consoleLog_Service("------Update element: "+ elementState.id+" seq: "+elementState.seq+" st: "+elementState.st);
			return snapshotElementState;
    	}
    	
    	/**************************
    	 * Cache snapshot
    	 **************************/
    	/**
    	 * @private getHashSnapshotPatch
    	 * 
    	 * @param {Object} snapshotPatch = {updateElementIndex:, elementContext:, cacheOption:}
         * 				   snapshotPatch.elementContext = {snapshotElementStates:, updateElementStates:}
         * 
         * @returns hash from patch.
    	 */
    	function getHashPatch(snapshotPatch) {
    		var result = 0; 
    		result = result + utility.getArrayLength(snapshotPatch.elementContext.snapshotElementStates);
    		result = result + 31 * utility.getArrayLength(snapshotPatch.elementContext.updateElementStates);
    		if (!utility.isArrayEmpty(snapshotPatch.elementContext.snapshotElementStates)) {
    			var elementStates = utility.getArrayIndex(snapshotPatch.elementContext.snapshotElementStates, 0);
    			result = result + 7 * elementStates.seq;
			}
    		if (!utility.isArrayEmpty(snapshotPatch.elementContext.updateElementStates)) {
    			var elementStates = utility.getArrayIndex(snapshotPatch.elementContext.updateElementStates, 0);
    			result = result + 64 * elementStates.seq;
			}
    		return result;
    	}
    	
    	/**
    	 * @private getCacheContext
    	 * context.cacheContext = {initComplete:, hashPatch:, }
    	 * 
    	 *  @param context
    	 *  @param snapshotPatch
    	 */
    	function updateCacheContext(context, snapshotPatch) {
    		if (context.cacheContext == null) {
    			context.cacheContext = {initComplete: false, hashPatch: 0, updateElementStates: []};	
    		}
    		var hashPatch = getHashPatch(snapshotPatch);
    		if (context.cacheContext.hashPatch != hashPatch) {
    			context.cacheContext.initComplete = false;
    			context.cacheContext.updateElementStates = [];
    			context.cacheContext.hashPatch = hashPatch;
			}
    	}
    	
    	/**
    	 * @private findCacheElement
    	 * 
    	 * @param context
    	 * @param cacheElements
    	 * @param elementIndex
    	 * @returns cache lement.
    	 */
    	// @CheckForNull
    	function findCacheElement(context, cacheElements, elementIndex) {
    		if (!context.cacheContext.initComplete) return null;
    		var findCacheElement = null;
	    	angular.forEach(cacheElements, function(cacheElement) {
				if (cacheElement.elementIndex > elementIndex) return;
				findCacheElement = cacheElement;
			});
	    	return findCacheElement;
    	}
    	
    	/**
    	 * @private crateCacheElement
    	 * 
    	 * @param context
    	 * @param elementIndex
    	 * @param lastChangedElementState
    	 * @returns cache element.
    	 */
    	function crateCacheElement(context, elementIndex, lastChangedElementState) {
    		var cacheElement = {elementIndex: elementIndex, elementStates: angular.copy(context.snapshot), lastChangedElementState: angular.copy(lastChangedElementState)};
    		return cacheElement;
    	}
    	
        return fAnimationStrategy;
    }]);
    
