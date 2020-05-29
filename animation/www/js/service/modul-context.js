'use strict';


/** module for specify services */
angular.module('App.Service.ModulContext', [])
 
    /************************************************************************************************************
    * The $diagram service provides functions, like pull a SVG for a given diagram.
    * @constructor
    ************************************************************************************************************/
    .factory('modulContext', ['requestHandler', 'utility', '$settings', '$errorHandler', 'assert', '$filter', 
                                 function (requestHandler, utility, $settings, $errorHandler, assert, $filter) {
    	
    	var fRecordContextHandler = {Enum: {}};
    	
    	/**
    	 *  Contains all binded Modul contexts = {modulId: ,currentMode: ,recordContext:};
    	 *  
    	 *  	modulId = [5];
    	 * 		currentMode: LIVE, RECORD		
    	 * 		recordContext = {availableRecordFiles:, currentRecordFileIndex: requestedFileType:, elementStates:, snapshotSeq:, currentElementIndex:}
    	 * 		
    	 */
    	var fService = {};
    	
    	fRecordContextHandler.Enum.MODE = {
    			LIVE : 					"live",
    			RECORD : 				"record"
    	};
    	
    	fRecordContextHandler.Enum.REQUESTED_FILE = {
    			UPDATE_CURRENT_FILE: 	"updateCurrentFile",
    			NEXT_FILE: 				"nextFile",
    			PRIVIOUS_FILE: 			"priviousFile",
    			LAST_FILE: 				"lastFile"
    	};
    	
    	
    	/**********************************
    	 * access record context
    	 *********************************/
    	
    	/**
    	 * @public scaleCurrentElementIndex
    	 * scale the current element index to the range of the record element state.
    	 * 
    	 * @param context
    	 */
    	fRecordContextHandler.scaleCurrentElementIndex= function(context) {
    		if (context.recordContext.currentElementIndex > getRecordElementStateLength(context) - 1) {
    			context.recordContext.currentElementIndex = getRecordElementStateLength(context) - 1;
    		}
    		if (context.recordContext.currentElementIndex < 0) {
    			context.recordContext.currentElementIndex = 0;
    		}
    	}
    	
    	/**
    	 * @public setCurrentElementIndex
    	 * Set the current element index.
    	 * 
    	 * @param context
    	 * @param index
    	 */
    	fRecordContextHandler.setCurrentElementIndex = function(context, index) {
    		assert.assertTrue(initRecordFileComplete(context), "'ModulContext' Init record file not complete.");
    		assert.assertTrue(index >= 0 && index < getRecordElementStateLength(context), "'ModulContext' Invalide current element index: " + index + " recordElementStateLength: " + getRecordElementStateLength(context));
    		context.recordContext.currentElementIndex = index;
    	};
    	
    	/**
    	 * @public getCurrentElementIndex
    	 * 
    	 * @param context
    	 * @returns the current index
    	 */
    	fRecordContextHandler.getCurrentElementIndex = function(context) {
    		assert.assertTrue(initRecordFileComplete(context), "'ModulContext' Init record file not complete.");
    		var index = context.recordContext.currentElementIndex;
    		assert.assertTrue(index >= 0 && index < getRecordElementStateLength(context), "'ModulContext' Invalide current element index: " + index + " recordElementStateLength: " + getRecordElementStateLength(context));
    		return index;
    	};
    	
    	/**
    	 * @public setAvailableRecordFiles
    	 * 
    	 * @param context
    	 * @param recfiles
    	 */
    	fRecordContextHandler.setAvailableRecordFiles = function(context, recfiles) {
    		assert.assertIsArrayNotEmpty(recfiles, "'ModulContext' Record files are empty.");
    		context.recordContext.availableRecordFiles = recfiles;
    	};
    	
    	/**
    	 * @public setRequestedFileType
    	 * 
    	 * @param context
    	 * @param fileType
    	 */
    	fRecordContextHandler.setRequestedFileType = function(context, fileType) {
    		context.recordContext.requestedFileType = fileType;
    	};
    	
    	/**********************************
    	 *  is
    	 *********************************/
    	
    	/**
    	 * @public isPlayEnabled
    	 * 
    	 * @param context
    	 * @returns true if play enabled.
    	 */
    	fRecordContextHandler.isPlayEnabled = function(context) {
    		if (context.currentMode == fRecordContextHandler.Enum.MODE.LIVE) return true;
    		return false;
    	};
    	
    	/**
    	 * @public isPreviousEnabled 
    	 * record = {availableRecordFiles:, currentRecordFileIndex: requestedFileType:, elementStates:, currentElementIndex:}
    	 * 
    	 * @param context
    	 * @returns {Boolean}
    	 */
    	fRecordContextHandler.isPreviousEnabled = function(context) {
    		if (!fRecordContextHandler.initRecordContextComplete(context)) return false;
    		if (fRecordContextHandler.getPreviousElementIndex(context, 1) != null) return true;    		
    		if (fRecordContextHandler.getPreviousFileIndex(context) != null) return true;
    		return false;
    	};
    	
    	/**
    	 * @public isNextEnabled
    	 * 
    	 * @param context
    	 * @returns {Boolean}
    	 */
    	fRecordContextHandler.isNextEnabled = function(context) {
    		if (!fRecordContextHandler.initRecordContextComplete(context)) return false;
    		if (fRecordContextHandler.getNextElementIndex(context, 1) != null) return true;
    		if (fRecordContextHandler.getNextFileIndex(context) != null) return true;
    		return false;
    	};
    	
    	/*****************************
    	 * Record Mode (File index) 
    	 ****************************/
    	
    	/**
    	 * @public requestNextFile
    	 * record = {availableRecordFiles:, currentRecordFileIndex: requestedFileType:, elementStates:, currentElementIndex:, }
    	 * 
    	 * @param context
    	 */
    	fRecordContextHandler.requestNextFile = function(context) {
    		assert.assertTrue(initRecordFileComplete(context), "'ModulContext' Init record file not complete.");
    		var fileIndex = fRecordContextHandler.getNextFileIndex(context);
    		assert.assertNotNull(fileIndex);
    		context.recordContext.currentRecordFileIndex = fileIndex;
    		var file = fRecordContextHandler.getCurrentRecordFile(context);
    		context.recordContext.requestedFileType = fRecordContextHandler.Enum.REQUESTED_FILE.NEXT_FILE;
    		requestHandler.getRecordFile(context.modulId, file);
    	};
    
    	/**
    	 * @public requestPreviousFile
    	 * 
    	 * @param context
    	 */
    	fRecordContextHandler.requestPreviousFile = function(context) {
    		assert.assertTrue(initRecordFileComplete(context), "'ModulContext' Init record file not complete.");
    		var fileIndex = fRecordContextHandler.getPreviousFileIndex(context);
    		assert.assertNotNull(fileIndex);
    		context.recordContext.currentRecordFileIndex = fileIndex;
    		var file = fRecordContextHandler.getCurrentRecordFile(context);
    		context.recordContext.requestedFileType = fRecordContextHandler.Enum.REQUESTED_FILE.PRIVIOUS_FILE;
    		requestHandler.getRecordFile(context.modulId, file);
    	};
    	
    	/**
    	 * @public requestLastFile
    	 * record = {availableRecordFiles:, currentRecordFileIndex: requestedFileType:, elementStates:, currentElementIndex:, }
    	 * 
    	 * @param context
    	 */
    	fRecordContextHandler.requestLastFile = function(context) {
    		assert.assertTrue(initRecordFileComplete(context), "'ModulContext' Init record file not complete.");
    		var fileIndex = getLastFileIndex(context);
    		assert.assertNotNull(fileIndex);
    		context.recordContext.currentRecordFileIndex = fileIndex;
    		var file = fRecordContextHandler.getCurrentRecordFile(context);
    		context.recordContext.requestedFileType = fRecordContextHandler.Enum.REQUESTED_FILE.LAST_FILE;
    		requestHandler.getRecordFile(context.modulId, file);
    	};
    	
    	/**
    	 * @public getPreviousFileIndex
    	 * 
    	 * @param context
    	 * @returns privious file index
    	 */
    	//@CheckforNull
    	fRecordContextHandler.getPreviousFileIndex = function(context) {
    		assert.assertTrue(initRecordFileComplete(context), "'ModulContext' Init record file not complete.");
    		if (context.recordContext.currentRecordFileIndex - 1 < 0) return null;
    		return context.recordContext.currentRecordFileIndex - 1;
    	};
    	
    	/**
    	 * @public getNextFileIndex
    	 * 
    	 * @param context
    	 * @returns next file index
    	 */
    	//@CheckforNull
    	fRecordContextHandler.getNextFileIndex = function(context) {
    		assert.assertTrue(initRecordFileComplete(context), "'ModulContext' Init record file not complete.");
    		if (context.recordContext.currentRecordFileIndex + 1 >= utility.getArrayLength(context.recordContext.availableRecordFiles)) return null;
    		return context.recordContext.currentRecordFileIndex + 1;
    	};
    	
    	/**
    	 * @private getLastFileIndex
    	 * record = {availableRecordFiles:, currentRecordFileIndex: requestedFileType:, elementStates:, currentElementIndex:, }
    	 * 
    	 * @param context
    	 * @returns last file index
    	 */
    	function getLastFileIndex(context) {
    		assert.assertTrue(initRecordFileComplete(context), "'ModulContext' Init record file not complete.");
    		return context.recordContext.availableRecordFiles.length - 1;
    	};
    	
    	/**
    	 * @public getCurrentRecordFile
    	 * 
    	 * @param context
    	 * @returns current file index
    	 */
    	fRecordContextHandler.getCurrentRecordFile = function(context) {
    		assert.assertTrue(initRecordFileComplete(context), "'ModulContext' Init record file not complete.");
    		assert.assertTrue(context.recordContext.currentRecordFileIndex < utility.getArrayLength(context.recordContext.availableRecordFiles));
    		return context.recordContext.availableRecordFiles[context.recordContext.currentRecordFileIndex].file;
    	};
    	
    	/**
    	 * @public isCurrentRecordFileRootfile
    	 * 
    	 * @param context
    	 * @returns true if the record file is a root record file.
    	 */
    	fRecordContextHandler.isCurrentRecordFileRootfile = function(context) {
    		assert.assertTrue(initRecordFileComplete(context), "'ModulContext' Init record file not complete.");
    		assert.assertTrue(context.recordContext.currentRecordFileIndex < utility.getArrayLength(context.recordContext.availableRecordFiles));
    		return context.recordContext.availableRecordFiles[context.recordContext.currentRecordFileIndex].rootfile;
    	};
    	
    	/**
    	 * @public getCurrentRecordFileName
    	 * 
    	 * @param context
    	 * @returns current file as string or available error message.
    	 */
    	fRecordContextHandler.getCurrentRecordFileName = function(context) {
    		if (!initRecordFileComplete(context)) return "No file available";
    		if (context.recordContext.currentRecordFileIndex >= utility.getArrayLength(context.recordContext.availableRecordFiles)) return "No file available"; 
    		return fRecordContextHandler.getCurrentRecordFile(context);
    	};
    	
    	/*****************************
    	 * Record Mode (Element Index) 
    	 ****************************/
    	
    	/**
    	 * @public getNextElementIndex
    	 * 
    	 * @param context
    	 * @param stepCount
    	 * @returns next element index
    	 */
    	//@CheckforNull
    	fRecordContextHandler.getNextElementIndex = function(context, /*@CheckForNull*/ stepCount) {
    		assert.assertTrue(fRecordContextHandler.initRecordContextComplete(context), "'ModulContext' Init record context not complete.");
    		var nextElementIndex = null;
    		if (stepCount == null) {
    			nextElementIndex = fRecordContextHandler.getLastRecordElementStateIndex(context);
    			return nextElementIndex;
    		}
    		
    		var stepIndex = 0;
    		var currentSeq = getRecordElementStateByIndex(context, fRecordContextHandler.getCurrentElementIndex(context)).seq;
    		for (var index = fRecordContextHandler.getCurrentElementIndex(context); index < getRecordElementStateLength(context); index++) {
    			var elementState = getRecordElementStateByIndex(context, index);
    			if (elementState.seq == currentSeq) continue;
    			nextElementIndex = index;
    			currentSeq = elementState.seq;
    			stepIndex++;
    			if(stepIndex < stepCount) continue;
    			break;
    		}
    		
    		if (nextElementIndex == null) return null;
    		
    		for (var index = nextElementIndex + 1; index < getRecordElementStateLength(context); index++) {
    			var elementState = getRecordElementStateByIndex(context, index);
    			if (elementState.seq == currentSeq) {
    				nextElementIndex = index;
    				continue;
    			}
    			break;
    		}
    		return nextElementIndex;
    	};
    	
    	/**
    	 * @public getPreviousElementIndex
    	 * 
    	 * record = {availableRecordFiles:, currentRecordFileIndex: requestedFileType:, elementStates:, currentElementIndex:, }
    	 * 
    	 * @param context
    	 * @param stepCount
    	 * @returns previous element index
    	 */
    	//@CheckforNull
    	fRecordContextHandler.getPreviousElementIndex = function(context, /*@CheckForNull*/ stepCount) {
    		assert.assertTrue(fRecordContextHandler.initRecordContextComplete(context), "'ModulContext' Init record context not complete.");
    		var previousElementIndex = null;
    		if (stepCount == null) {
    			previousElementIndex = fRecordContextHandler.getfirstRecordElementStateIndex(context);
    			return previousElementIndex;
    		}
    		
    		var stepIndex = 0;
    		var currentSeq = getRecordElementStateByIndex(context, fRecordContextHandler.getCurrentElementIndex(context)).seq;
    		for (var index = fRecordContextHandler.getCurrentElementIndex(context); index >= 0; index--) {
    			var elementState = getRecordElementStateByIndex(context, index);
    			if (elementState.seq == currentSeq) continue;
    			previousElementIndex = index;
    			currentSeq = elementState.seq;
    			stepIndex++;
    			if (stepIndex < stepCount) continue;
    			return index;
    		}
    		return previousElementIndex;
    	};
    
    	/**
    	 * @public getRecordElementStateIndexByTimeStamp
    	 * returns the index.
    	 * 
    	 * @param context
    	 * @param timeStamp
    	 * @returns element index
    	 */
    	fRecordContextHandler.getRecordElementStateIndexByTimeStamp = function(context, timeStamp) {
    		assert.assertTrue(fRecordContextHandler.initRecordContextComplete(context), "'ModulContext' Init record context not complete.");
    		assert.assertTrue(timeStamp >= 0, "'ModulContext' timestamp is invalide: " + timeStamp);
    		
    		var timeDelta = 0;
    		var lastIndex = null;
    		for (var index = 0; index < utility.getArrayLength(context.recordContext.elementContext.updateElementStates); index++) {
    			var currentElementState = context.recordContext.elementContext.updateElementStates[index];
    			
    			if (currentElementState.time < timeStamp) {
    				timeDelta = timeStamp - currentElementState.time;
    				lastIndex = index;
    				continue;
    			}
    			if (lastIndex == null) {
    				return fRecordContextHandler.getfirstRecordElementStateIndex(context);
    			}
    			if (timeDelta > (timeStamp - currentElementState.time)) {
    				return findNextIndex(context, index);
    			}
    			return findPriviouseIndex(context, lastIndex);
    		}
    		return fRecordContextHandler.getLastRecordElementStateIndex(context);
    	};
    	
    	/**
    	 * @private findNextIndex
    	 * 
    	 * @param context
    	 * @param currentIndex
    	 * @returns element index
    	 */
    	function findNextIndex(context, currentIndex) {
    		assert.assertTrue(fRecordContextHandler.initRecordContextComplete(context), "'ModulContext' Init record context not complete.");
    		assert.assertTrue(currentIndex >= 0 && currentIndex < getRecordElementStateLength(context), "'ModulContext' Invalide current element index: "+currentIndex);
    		
    		var returnIndex = currentIndex;
	    	var currentSeq = getRecordElementStateByIndex(context, currentIndex).seq;
			for (var index = currentIndex; index < getRecordElementStateLength(context); index++) {
				var elementState = getRecordElementStateByIndex(context, index);
				if (elementState.seq != currentSeq) break;
				returnIndex = index;
			}
			return returnIndex;
    	}
    	
    	/**
    	 * @private findPriviouseIndex
    	 * 
    	 * @param context
    	 * @param currentIndex
    	 * @returns element index
    	 */
    	function findPriviouseIndex(context, currentIndex) {
    		assert.assertTrue(fRecordContextHandler.initRecordContextComplete(context), "'ModulContext' Init record context not complete.");
    		assert.assertTrue(currentIndex >= 0 && currentIndex < getRecordElementStateLength(context), "'ModulContext' Invalide current element index: "+currentIndex);
    		
    		var returnIndex = currentIndex;
			var currentSeq = getRecordElementStateByIndex(context, currentIndex).seq;
			for (var index = currentIndex; index >= 0; index--) {
				var elementState = getRecordElementStateByIndex(context, index);
				if (elementState.seq != currentSeq) break;
				returnIndex = index;
			}
			return returnIndex;
    	}
    	
    	/**
    	 * @private getLastElementIndex
    	 * returns the last index after the record elements.
    	 * 
    	 * @param context
    	 * @param index
    	 * @returns element state
    	 */
    	function getRecordElementStateByIndex(context, index) {
    		assert.assertTrue(fRecordContextHandler.initRecordContextComplete(context), "'ModulContext' Init record context not complete.");
    		assert.assertTrue(index >= 0 && index < getRecordElementStateLength(context), "'ModulContext' Invalide index: " + index + " recordElementStateLength: " + getRecordElementStateLength(context));
    		return context.recordContext.elementContext.updateElementStates[index];
    	}
    	
    	/**
    	 * @private getLastElementIndex
    	 * returns the last index after the record elements.
    	 * 
    	 * @param context
    	 * @returns element state length
    	 */
    	function getRecordElementStateLength(context) {
    		assert.assertTrue(fRecordContextHandler.initRecordContextComplete(context), "'ModulContext' Init record context not complete.");
    		var length = utility.getArrayLength(context.recordContext.elementContext.updateElementStates);
    		assert.assertTrue(length > 0);
    		return length;
    	}
    	
    	/**
    	 * @private getLastElementIndex
    	 * returns the last index after the record elements.
    	 * 
    	 * @param context
    	 * @returns last element index
    	 */
    	fRecordContextHandler.getLastRecordElementStateIndex = function(context) {
    		assert.assertTrue(fRecordContextHandler.initRecordContextComplete(context), "'ModulContext' Init record context not complete.");
    		var lastIndex = getRecordElementStateLength(context) - 1;
    		assert.assertTrue(lastIndex >= 0);
    		return lastIndex;
    	};
    	
    	/**
    	 * @private getfirstRecordElementStateIndex
    	 * returns the last index after the record elements.
    	 * 
    	 * @param context
    	 * @returns first element index
    	 */
    	fRecordContextHandler.getfirstRecordElementStateIndex = function(context) {
    		assert.assertTrue(fRecordContextHandler.initRecordContextComplete(context), "'ModulContext' Init record context not complete.");
    		return findNextIndex(context, 0);
    	};
    	
    	/*****************************
    	 * Record Mode
    	 ****************************/
    	
    	/**
    	 * @public clearRecordContext
    	 * Clear all record data.
    	 * record = {availableRecordFiles:, currentRecordFileIndex:, requestedFileType:, elementStates:, currentElementIndex:, elementContext:}
    	 * 
    	 * @param context
    	 */
    	fRecordContextHandler.clearRecordContext = function(context) {
    		context.recordContext = {availableRecordFiles: null, currentRecordFileIndex: 0, requestedFileType: fRecordContextHandler.Enum.REQUESTED_FILE.UPDATE_CURRENT_FILE, currentElementIndex: 0, elementContext: {}};
    		clearRecordElementContext(context);
    	};
    
    	/**
    	 * @private clearRecordElementContext
    	 * 
    	 * @param context
    	 */
    	function clearRecordElementContext(context) {
    		context.recordContext.elementContext = {snapshotSeq: null, initSnapshotComplete: false, snapshotElementStates: [], initUpdateComplete: false, updateElementStates: []};
    	}
    	
    	/**
    	 * @public initRecordContextComplete
    	 * 
    	 * @param context
    	 */
    	fRecordContextHandler.initRecordContextComplete = function(context) {
    		return initRecordFileComplete(context) && initElementContextComplete(context);
    	};
    	
    	/**
    	 * @private initRecordContextComplete
    	 * 
    	 * @param context
    	 * @returns true if the init record context is complete
    	 */
    	function initRecordFileComplete(context) {
    		return 	context.currentMode == fRecordContextHandler.Enum.MODE.RECORD &&
    				context.recordContext.availableRecordFiles != null &&
		    		context.recordContext.requestedFileType != null &&
		    		context.recordContext.currentRecordFileIndex != null;
    	}
    	
    	/**
    	 * @private elementContextAvailable
    	 * 
    	 * @param context
    	 * @returns true if the init element context is complete
    	 */
    	function initElementContextComplete(context) {
    		return 	context.currentMode == fRecordContextHandler.Enum.MODE.RECORD &&
		    		context.recordContext.elementContext.initSnapshotComplete &&
		    		context.recordContext.elementContext.initUpdateComplete;
    	}
    	
    	/**
    	 * @public updateRecordElementContext
    	 * 
    	 * Modul contexts = {modulId: ,currentMode: ,recordContext:};
    	 * 
    	 * recordContext =  {initContext:, requestedFileType:, availableRecordFiles:, currentRecordFileIndex:, 
    	 * 					elementContext:, currentElementIndex:
    	 * 					/elementStates:/, /snapshotSeq:/, }
    	 * 
    	 * elementContext = {snapshotSeq:
    	 * 					 initSnapshotComplete:, snapshotElementState:, 
    	 * 					 initUpdateComplete:, updateElementState:}
    	 * 
    	 * requestedFileType = LAST_FILE, PRIVIOUS_FILE, NEXT_FILE, UPDATE_CURRENT_FILE
    	 * 
    	 * @param context
    	 * @param jsonUpdateData
    	 * 
    	 */
    	fRecordContextHandler.updateRecordElementContext = function(context, jsonUpdateData) {
    		
    		/* Reset element context */
    		if (!context.updateInProgress) {
    			assert.assertIsArrayNotEmpty(jsonUpdateData.elm, "'ModulContext' First part, no element are defined.");
    			
    			clearRecordElementContext(context);
    			context.recordContext.elementContext.snapshotSeq = jsonUpdateData.elm[0].seq;	
    		}
    		
    		assert.assertNotNull(context.recordContext.elementContext.snapshotSeq);
			
			/* add element states */
    		if (!utility.isArrayEmpty(jsonUpdateData.elm)) {
				angular.forEach(jsonUpdateData.elm, function(jsonElement) {
					var elementState = utility.crateElementStateFromJsonElement(jsonElement, jsonUpdateData.seq, jsonUpdateData.time);
					assert.assertTrue(utility.containsModulId(elementState.id, context.modulId), "'ModulContext' Element state is not handled 'ElementState Id':"+elementState.id+" 'ModulId':"+context.modulId);
					
					/* update snapshot */
					if (!context.recordContext.elementContext.initSnapshotComplete && elementState.seq == context.recordContext.elementContext.snapshotSeq) {
						context.recordContext.elementContext.snapshotElementStates.push(elementState);
						if (fRecordContextHandler.isCurrentRecordFileRootfile(context)) {
							context.recordContext.elementContext.updateElementStates.push(elementState);
						}
						return;
					}
					
					context.recordContext.elementContext.initSnapshotComplete = true;
					context.recordContext.elementContext.updateElementStates.push(elementState);
				});
    		}
			
			if (context.recordContext.elementContext.initSnapshotComplete) {
				context.recordContext.elementContext.initUpdateComplete = true;
    		}
    	};
    	
    	/**
    	 * @public initRecordElementContext
    	 * 
    	 * @param context
    	 */
    	fRecordContextHandler.initRecordElementContext = function(context) {
    		assert.assertTrue(!utility.isArrayEmpty(context.recordContext.elementContext.snapshotElementStates), "'ModulContext' Init record element context impossible, no snapshot elements are available.");
    		
    		/* update updateElementStates if init snapshot not complete */
    		if (!context.recordContext.elementContext.initSnapshotComplete) {
    			context.recordContext.elementContext.updateElementStates.push(utility.getLastArrayIndex(context.recordContext.elementContext.snapshotElementStates));
    			context.recordContext.elementContext.initSnapshotComplete = true;
    			context.recordContext.elementContext.initUpdateComplete = true;
    		}
    		fRecordContextHandler.scaleCurrentElementIndex(context);
    		
    		assert.assertTrue(fRecordContextHandler.initRecordContextComplete(context), "'ModulContext' Handle record update response, init record context not complete.");
			
			// LAST_FILE
			if (context.recordContext.requestedFileType == fRecordContextHandler.Enum.REQUESTED_FILE.LAST_FILE) {
				fRecordContextHandler.setCurrentElementIndex(context, fRecordContextHandler.getLastRecordElementStateIndex(context));
				fRecordContextHandler.setRequestedFileType(context, fRecordContextHandler.Enum.REQUESTED_FILE.UPDATE_CURRENT_FILE);
			} else
				
			// PRIVIOUS_FILE
			if (context.recordContext.requestedFileType == fRecordContextHandler.Enum.REQUESTED_FILE.PRIVIOUS_FILE) {
				fRecordContextHandler.setCurrentElementIndex(context, fRecordContextHandler.getLastRecordElementStateIndex(context));
				fRecordContextHandler.setRequestedFileType(context, fRecordContextHandler.Enum.REQUESTED_FILE.UPDATE_CURRENT_FILE);
			} else
				
			// NEXT_FILE	 
			if (context.recordContext.requestedFileType == fRecordContextHandler.Enum.REQUESTED_FILE.NEXT_FILE) {
				fRecordContextHandler.setCurrentElementIndex(context, fRecordContextHandler.getfirstRecordElementStateIndex(context));
				fRecordContextHandler.setRequestedFileType(context, fRecordContextHandler.Enum.REQUESTED_FILE.UPDATE_CURRENT_FILE);
			} else 
				
			// UPDATE_CURRENT_FILE	
			if (context.recordContext.requestedFileType == fRecordContextHandler.Enum.REQUESTED_FILE.UPDATE_CURRENT_FILE) {
				if (fRecordContextHandler.getCurrentElementIndex(context) > getRecordElementStateLength(context) - 1) {
					fRecordContextHandler.setCurrentElementIndex(context, getRecordElementStateLength(context) - 1);
				}
			}
    	};
    	
    	/**
    	 * @public getTimeSliderRangeValues
    	 * 
    	 * @param context
    	 * @returns Time slider rage.
    	 */
    	fRecordContextHandler.getTimeSliderRangeValues = function(context) {
    		var min = 0;
    		var max = 0;
    		if (!fRecordContextHandler.initRecordContextComplete(context)) {
    			return {min: min, max: max};
    		} 
			if(!utility.isArrayEmpty(context.recordContext.elementContext.updateElementStates)) {
    			var elementState = utility.getFirstArrayIndex(context.recordContext.elementContext.updateElementStates);
    			min = elementState.time;
    			elementState = utility.getLastArrayIndex(context.recordContext.elementContext.updateElementStates);
    			max = elementState.time;
    		}
			return {min: min, max: max};
    	};
    	
    	/*****************************
    	 * Live Mode
    	 ****************************/
    	
    	/**
    	 * @private clearRecordContext
    	 * Clear all record data.
    	 * record = {availableRecordFiles:, currentRecordFileIndex:, requestedFileType:, elementStates:, currentElementIndex:, elementContext:}
    	 */
    	fRecordContextHandler.clearLiveContext = function(context) {
    		context.liveContext = {elementStates: []};
    	};
    	
    	/**
    	 * updateLiveElementContext
    	 */
    	fRecordContextHandler.updateLiveElementContext = function(context, jsonUpdateData) {
    		/* Reset element context */
    		if (!context.updateInProgress) {
    			fRecordContextHandler.clearLiveContext(context);
    		}
    		
    		/* add element states */
			angular.forEach(jsonUpdateData.elm, function(jsonElement) {
				var elementState = utility.crateElementStateFromJsonElement(jsonElement, jsonUpdateData.seq, jsonUpdateData.time);
				assert.assertTrue(utility.containsModulId(elementState.id, context.modulId), "'ModulContext' Element state is not handled 'ElementState Id':"+elementState.id+" 'ModulId':"+context.modulId);
				context.liveContext.elementStates.push(elementState);
			});
    	};
    	
    	return fRecordContextHandler;
    	
    }]);
