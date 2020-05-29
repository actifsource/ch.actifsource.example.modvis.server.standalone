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
angular.module('App.Service.ModulService', [])
 
    /************************************************************************************************************
    * The $diagram service provides functions, like pull a SVG for a given diagram.
    * @constructor
    ************************************************************************************************************/
    .factory('modulService', ['modulContext', '$rootScope', 'statefullComponentService', 'requestHandler', 'fileHandler', 'utility', 'assert', '$errorHandler', '$settings', '$api', '$q', '$timeout', 
                               function (modulContext, $rootScope, statefullComponentService, requestHandler, fileHandler, utility, assert, $errorHandler, $settings, $api, $q, $timeout) {  
    	
    	if (modVisService.modulService) {
            return modVisService.modulService;
        }
    	modVisService.modulService = {};
    	
    	/**
    	 *  Contains all binded Modul contexts = {modulId: ,currentMode: ,recordContext:};
    	 *  
    	 *  	modulId = [5];
    	 * 		currentMode: LIVE, RECORD		
    	 * 		recordContext = {availableRecordFiles:, currentRecordFileIndex: requestedFileType:, loadFileInProgress:, elementStates:, snapshotSeq:, currentElementIndex:}
    	 * 		
    	 */
    	var fService = {contexts: [], crcContext: []};
    	
    	/**
    	 * @private synchronizeFunction
    	 * Synchronize function to handle async events.
    	 */
    	function synchronizeFunction(syncfunction) {
    		$rootScope.$applyAsync(syncfunction);
    	}
       
    	/**********************************
    	 * play, pause, previous, next
    	 *********************************/
    	
    	/**
    	 * @public play
    	 * Resubscribes for snapshot and reset record variables.
    	 * 
    	 * @param modulId
    	 */
    	modVisService.modulService.play = function(modulId) {
    		synchronizeFunction(function () {
    			
    			var context = findModulContext(modulId);
    			modulContext.clearRecordContext(context);
    			statefullComponentService.resetStatefullComponentData(context.modulId);
	    		context.currentMode = modulContext.Enum.MODE.LIVE;
	    		requestHandler.setMode(context.modulId, context.currentMode);
    		});
    	};
    	
    	/**
    	 * @public pause
    	 * Unsubscribe for snapshot, requests record for current diagram.
    	 * 
    	 * @param modulId
    	 */
    	modVisService.modulService.pause = function(modulId) {
    		synchronizeFunction(function () {
    			
    			var context = findModulContext(modulId);
    			context.currentMode = modulContext.Enum.MODE.RECORD;
	    		requestHandler.setMode(context.modulId, context.currentMode);
	    		requestHandler.getAvailableRecordFile(modulId);
    		});
    	};
    	
    	/**
    	 * @public fastPrevious
    	 * If record is present steps one back in record samples.
    	 * record = {availableRecordFiles:, currentRecordFileIndex: requestedFileType:, elementStates:, currentElementIndex:}
    	 * 
    	 * @param modulId
    	 */
    	modVisService.modulService.fastPrevious = function(modulId) {
    		synchronizeFunction(function () {
    			
    			var context = findModulContext(modulId);
	    		if (!modulContext.isPreviousEnabled(context)) return;
	    		var previousIndex = modulContext.getPreviousElementIndex(context, $settings.recordControlFastStepCount)
	    		if (previousIndex != null) {
	    			modulContext.setCurrentElementIndex(context, previousIndex);
	    			updateRecordSnapshot(context);
	    			return;
	    		}
	    		if (modulContext.getPreviousFileIndex(context) != null) {
	    			modulContext.requestPreviousFile(context);
	    		}
    		});
    	};
    	
    	/**
    	 * @public previous
    	 * If record is present steps one back in record samples.
    	 * record = {availableRecordFiles:, currentRecordFileIndex: requestedFileType:, elementStates:, currentElementIndex:}
    	 * 
    	 * @param modulId
    	 */
    	modVisService.modulService.previous = function(modulId) {
    		synchronizeFunction(function () {
    			
    			var context = findModulContext(modulId);
	    		if (!modulContext.isPreviousEnabled(context)) return;
	    		var previousIndex = modulContext.getPreviousElementIndex(context, 1)
	    		if (previousIndex != null) {
	    			modulContext.setCurrentElementIndex(context, previousIndex);
	    			updateRecordSnapshot(context);
	    			return;
	    		}
	    		if (modulContext.getPreviousFileIndex(context) != null) {
	    			modulContext.requestPreviousFile(context);
	    		}
    		});
    	};
    	
    	/**
    	 * @public next
    	 * If record is present steps one forth in record samples.
    	 * record = {availableRecordFiles:, currentRecordFileIndex: requestedFileType:, elementStates:, currentElementIndex:}
    	 * 
    	 * @param modulId
    	 */
    	modVisService.modulService.next = function(modulId) {
    		synchronizeFunction(function () {
    			
    			var context = findModulContext(modulId);
	    		if (!modulContext.isNextEnabled(context)) return;
	    		var nextIndex = modulContext.getNextElementIndex(context, 1)
	    		if (nextIndex != null) {
	    			modulContext.setCurrentElementIndex(context, nextIndex);
	    			updateRecordSnapshot(context);
	    			return;
	    		}
	    		if (modulContext.getNextFileIndex(context) != null) {
	    			modulContext.requestNextFile(context);
	    		}
    		});
    	};
    	
    	/**
    	 * @public fastNext
    	 * If record is present steps one forth in record samples.
    	 * record = {availableRecordFiles:, currentRecordFileIndex: requestedFileType:, elementStates:, currentElementIndex:}
    	 * 
    	 * @param modulId
    	 */
    	modVisService.modulService.fastNext = function(modulId) {
    		synchronizeFunction(function () {
    			
    			var context = findModulContext(modulId);
	    		if (!modulContext.isNextEnabled(context)) return;
	    		var nextIndex = modulContext.getNextElementIndex(context, $settings.recordControlFastStepCount)
	    		if (nextIndex != null) {
	    			modulContext.setCurrentElementIndex(context, nextIndex);
	    			updateRecordSnapshot(context);
	    			return;
	    		}
	    		if (modulContext.getNextFileIndex(context) != null) {
	    			modulContext.requestNextFile(context);
	    		}
    		});
    	};
    	
    	/**
    	 * @public nextTime
    	 * If record is present steps one forth in record samples.
    	 * record = {availableRecordFiles:, currentRecordFileIndex: requestedFileType:, elementStates:, currentElementIndex:}
    	 * 
    	 * @param modulId
    	 * @param timeStamp
    	 */
    	modVisService.modulService.nextTime = function(modulId, timeStamp) {
    		synchronizeFunction(function () {
    			
    			var context = findModulContext(modulId);
	    		if (modulContext.isPlayEnabled(context)) return;
	    		
	    		var nextIndex = modulContext.getRecordElementStateIndexByTimeStamp(context, timeStamp)
	    		if (nextIndex != null) {
	    			modulContext.setCurrentElementIndex(context, nextIndex);
	    			updateRecordSnapshot(context);
	    		}
    		});
    	};
    	
    	/**
    	 * @public getEnableState
    	 * Returs the state of the control.
    	 * 
    	 * @param modulId
    	 * @return promise
    	 */
    	modVisService.modulService.getEnableState = function(modulId) {
    		var deferred = $q.defer();
    		synchronizeFunction(function () {
    			
    			var context = findModulContext(modulId);
    			var timeSliderRange = modulContext.getTimeSliderRangeValues(context);
    			var enableState = {isPlayEnabled: modulContext.isPlayEnabled(context), isPreviousEnabled: modulContext.isPreviousEnabled(context), isNextEnabled: modulContext.isNextEnabled(context), timeSliderRangeMin: timeSliderRange.min, timeSliderRangeMax: timeSliderRange.max, currentRecordFile:  modulContext.getCurrentRecordFileName(context)};
    			deferred.resolve(enableState);
    		});
    		return deferred.promise;
    	};
    	
    	/*****************************
    	 * CRC Mode Context
    	 ****************************/
    	
    	/**
    	 * @public checkModulCRC
    	 * 
    	 * @param modulId
    	 * @returns true if the crc is valide.
    	 */
    	modVisService.modulService.checkModulLiveCRC = function(modulId) {
    		if (!$settings.enableLiveCRC && !$settings.enableRecordCRC) return true;
    		
    		var crcContext = findCRCContextsOrNull(modulId);
    		if (crcContext != null) {
    			return validateLiveCRC(crcContext);
    		}
    		if (!$api.isServerAvailable()) return false;
    		
    		synchronizeFunction(function () {
    			var crcContext = findCRCContextsOrNull(modulId);
    			if (crcContext != null) return;
    			crcContext = createCRCContext(modulId);
    			
    			fileHandler.getExpectedModulCRC(modulId).then(function (crcValue) {
    				synchronizeFunction(function () {
    					assert.consoleLog_Service("'ModulService' Expectet CRC value: "+crcValue+" 'Modul:' "+modulId);
    					crcContext.expectCrc = crcValue;
    				});
	    		});
    		
    			if ($settings.enableLiveCRC) {
    				requestHandler.getCrcValue(modulId);	
    			}
    		});
    		return false;
    	}
    	
    	/**
    	 * @private validateCrcContext
    	 * 
    	 * @param crcContext {modulId: modulId, expectCrc: null, targetCrc: null};
    	 * @return boolean is valide
    	 */
    	function validateLiveCRC(crcContext) {
    		if (crcContext.expectCrc == null) return false;
    		if (!$settings.enableLiveCRC) return true; 
    		if (crcContext.targetCrc == null) return false;
    		if (utility.equals(crcContext.expectCrc, crcContext.targetCrc)) return true;
    		assert.throwReconnectMessage("'ModulService' CRC validation error. Expected CRC "+ crcContext.expectCrc+" Current CRC: "+crcContext.targetCrc+" Modul: "+crcContext.modulId);
    		return false;
    	}
    	
    	/**
    	 * @private checkModulRecordCRC
    	 * 
    	 * @param modulId
    	 * @param crc
    	 * @returns true if the crc is equals
    	 */
    	function validateRecordCRC(modulId, crc) {
    		if (!$settings.enableRecordCRC) return true;
    		var crcContext = findCRCContext(modulId);
    		return utility.equals(crcContext.expectCrc, crc);
    	}
    	
    	/**
    	 * @private createContext
    	 * 
    	 * {modulId: ,currentMode: ,recordContext:, liveContext:};
    	 * 
    	 * @param modulId
    	 * @returns modul context
    	 */
    	function createCRCContext(modulId) { 
    		assert.consoleLog_Service("'ModulService' Create CRC context "+modulId);
    		var context = {modulId: modulId, expectCrc: null, targetCrc: null};
    		fService.crcContext.push(context);
    		return context;
    	}
    	
    	/**
    	 * @private findContextsByModulIdOrNull
    	 * 
    	 * @param modulId
    	 * @returns modul context
    	 */
    	function findCRCContext(modulId) {
            var context = findCRCContextsOrNull(modulId);
            assert.assertNotNull(context, "'ModulService' CRC context not supported " + modulId);
            return context;
        }
    	
    	/**
    	 * @private findModulContextsOrNull
    	 * 
    	 * @param modulId
    	 * @returns crc modul context {modulId: modulId, expectCrc: null, targetCrc: null};
    	 */
    	function findCRCContextsOrNull(modulId) {
            var context = fService.crcContext.filter(function(crcContext) {
           	 	return utility.equals(crcContext.modulId, modulId);
            });
            return context[0];
        }
    	
    	/*****************************
    	 * Mode Context
    	 ****************************/
    	
    	/**
    	 * @private createContext
    	 * 
    	 * {modulId: ,currentMode: ,recordContext:, liveContext:};
    	 * 
    	 * @param modulId
    	 * @returns modul contxt
    	 */
    	function createContext(modulId) { 
    		assert.consoleLog_Service("'ModulService' Create modul context "+modulId);
    		var context = {modulId: modulId, currentMode: modulContext.Enum.MODE.LIVE};
    		modulContext.clearRecordContext(context);
    		modulContext.clearLiveContext(context);
    		fService.contexts.push(context);
    		// Set target mode live
    		requestHandler.setMode(context.modulId, context.currentMode);
    		return context;
    	}
    	
    	/**
    	 * @private findContextsByModulIdOrNull
    	 * 
    	 * @param modulId
    	 * @returns modul context
    	 */
    	function findModulContext(modulId) {
            var context = findModulContextsOrNull(modulId);
            assert.assertNotNull(context, "'ModulService' Modul not supported " + modulId);
            return context;
        }
    	
    	/**
    	 * @private findModulContextsOrNull
    	 * 
    	 * @param modulId
    	 * @returns modul context
    	 */
    	function findModulContextsOrNull(modulId) {
            var context = fService.contexts.filter(function(context) {
           	 	return utility.equals(context.modulId, modulId);
            });
            return context[0];
        }
    	
    	/**
    	 * @private allContextModulIds
    	 */
    	function allContextModulIds() {
    		var modulIds = [];
    		angular.forEach(fService.contexts, function(context) {
    			modulIds.push(context.modulId);
			});
    		return modulIds
    	}
    	
    	/**
    	 * @private updateModulContext
    	 * 
    	 * @param skIds
    	 */
    	function updateModulContext(skIds) {
    		var modulIdsToRemove = allContextModulIds();
    		
    		angular.forEach(skIds, function(skId) {
    			var modulId = utility.filterModulIdFromId(skId);
    			utility.removeFromArray(modulIdsToRemove, modulId);
    			if (findModulContextsOrNull(modulId) != null) return;
    			createContext(modulId);
			});
    		
    		angular.forEach(modulIdsToRemove, function(modulId) {
    			var context = findModulContextsOrNull(modulId);
    			assert.assertNotNull(context);
    			if (context.currentMode == modulContext.Enum.MODE.LIVE) {
    				utility.removeFromArray(fService.contexts, context);
    				assert.consoleLog_Service("'ModulService' delete modul context "+modulId);	
    			} else {
    				assert.consoleLog_Service("'ModulService' ignore delete modul context "+modulId);	
    			}
			});
    	}
    	
    	/**
    	 * @private resetServie
    	 * Reset service
    	 */
    	function resetServie() {
    		angular.forEach(fService.contexts, function(context) {
    			modulContext.clearRecordContext(context);
    			context.currentMode = modulContext.Enum.MODE.LIVE;
	    	});
    		fService.crcContext = [];
    	}
    	
    	/*****************************
    	 * StatefullComponentService Util
    	 ****************************/
    	
    	/**
    	 * @private updateRecordListener
    	 * Update all listener if the modulService state has changed. 
    	 * 
    	 * @param context
    	 */
    	function updateSnapshotListener(context) {
    		statefullComponentService.notifyAllListenerUpdateSnapshot(context.modulId);
    	}
    	
    	/**
    	 * @private activateProgressBar
    	 * progressValue = 0 -100%
    	 * progressText 
    	 * Update all listener if the modulService state has changed. 
    	 * 
    	 * @param context
    	 * @param progressValue
    	 * @param progressText
    	 */
    	function activateProgressBar(context, progressValue, progressText) {
    		assert.consoleLog_Service("'ModulService' Activate progress bar ModulId: "+context.modulId+" ProgressValue: "+progressValue+" ProgressText: "+progressText);
    		context.updateInProgress = true;
    		var event = {id: modVisService.statefullComponentService.EVENT.PROGRESS_STATE, data: {complete: false, value: progressValue,  text: progressText}};
    		statefullComponentService.notifyAllListener(context.modulId, event);
    	}
    	
    	/**
    	 * @private deactivateProgressBarListener
    	 * @private updateProgressBarListener
    	 * Update all listener if the modulService state has changed. 
    	 * 
    	 * @param context
    	 */
    	function deactivateProgressBarListener(context) {
    		assert.consoleLog_Service("'ModulService' Deactivate progress bar ModulId: "+context.modulId);
    		context.updateInProgress = false;
    		var event = {id: modVisService.statefullComponentService.EVENT.PROGRESS_STATE, data: {complete: true, value: 100,  text: ""}};
    		statefullComponentService.notifyAllListener(context.modulId, event);
    	}
   
    	/*****************************
    	 * Update Record and patch snapshot
    	 ****************************/
    	
    	/**
    	 * @private updateRecordSnapshot
    	 * Modul contexts = {modulId: ,currentMode: ,recordContext:};
    	 * 
    	 * contexts.recordContext =  	{initContext:, loadFileInProgress:, requestedFileType:, availableRecordFiles:, currentRecordFileIndex:, 
    	 * 								elementContext:, currentElementIndex:
    	 * 								/elementStates:/, /snapshotSeq:/, }
    	 * 
    	 * contexts.recordContext.elementContext = {snapshotSeq:
    	 * 											initSnapshotComplete:, snapshotElementState:, 
    	 * 					 						initUpdateComplete:, updateElementState:}
    	 * 
    	 * snapshotPatch = {updateElementIndex:, elementContext:}
    	 * 
    	 * snapshotPatch.elementContext = {snapshotElementStates:, updateElementStates:}
    	 * 
    	 * @param context
    	 */
    	function updateRecordSnapshot(context) {
    		assert.assertTrue(modulContext.initRecordContextComplete(context), "'ModulService' Update record snapshot, init record context not complete.");
    		
    		assert.consoleLog_Service("'ModulService' Update Record Index: " + modulContext.getCurrentElementIndex(context));
    		
    		var elementContext = context.recordContext.elementContext;
    		var snapshotPatch = {updateElementIndex: modulContext.getCurrentElementIndex(context), 
    							 elementContext: {snapshotElementStates: elementContext.snapshotElementStates, updateElementStates: elementContext.updateElementStates}};
    					 			  		 			  
    		/* patch the record to the snapshot */
    		statefullComponentService.updateAndResetStatefullComponentData(context.modulId, snapshotPatch);
    		
    		/* notify listener to update buttons */
    		updateSnapshotListener(context);
    	}
    	
    	/*****************************
    	 * Request handler
    	 ****************************/
    	
    	/**
    	 * @private handleRecordUpdateResponse
    	 * 
    	 * Modul contexts = {modulId: ,currentMode: ,recordContext:, liveContext:};
    	 * 
    	 * recordContext =  {loadFileInProgress:, requestedFileType:, availableRecordFiles:, currentRecordFileIndex:, 
    	 * 					elementContext:, currentElementIndex:
    	 * 
    	 * 					/elementStates:/, /snapshotSeq:/, }
    	 * 
    	 * recordContext.elementContext = {snapshotSeq:
    	 * 					 initSnapshotComplete:, snapshotElementState:, 
    	 * 					 initUpdateComplete:, updateElementState:}
    	 * 
    	 * requestedFileType = LAST_FILE, PRIVIOUS_FILE, NEXT_FILE, UPDATE_CURRENT_FILE
    	 * 
    	 * @param context
    	 * @param jsonUpdateData
    	 */
    	function handleRecordUpdateResponse(context, jsonUpdateData) {
    		assert.assertTrue(context.currentMode == modulContext.Enum.MODE.RECORD, "'ModulService' Handle record update response, modul not in record mode.");
    		assert.assertNotNull(jsonUpdateData.recfile, "'ModulService' Handle record update response, record file not available.");
    		assert.assertNotNull(jsonUpdateData.elm, "'ModulService' Handle record update response, element are undefined.");
    		
    		var currentRecordFile = modulContext.getCurrentRecordFile(context);
    		assert.assertTrue(utility.equals(jsonUpdateData.recfile, currentRecordFile), "'ModulService' Handle record update response, current record file is different: "+currentRecordFile+" updateFile: "+jsonUpdateData.recfile+".");
    		 
    		modulContext.updateRecordElementContext(context, jsonUpdateData);
			
			/* update progress bar */
			if (jsonUpdateData.part != null && jsonUpdateData.partsize != null) {
				if (jsonUpdateData.part < jsonUpdateData.partsize) {
					var progressValue = 100/jsonUpdateData.partsize * jsonUpdateData.part;
					activateProgressBar(context, progressValue, "Load record file: "+currentRecordFile+" Part "+jsonUpdateData.part+" of "+jsonUpdateData.partsize);
					/* update record context running */
					return;
				}
				deactivateProgressBarListener(context);
			}
    		
			modulContext.initRecordElementContext(context);
			
			updateRecordSnapshot(context);
    	}
    	
    	/**
    	 * @private handleAvailableRecordFileResponse
    	 * 
    	 * @param context
    	 * @param jsonUpdateData
    	 */
    	function handleAvailableRecordFileResponse(context, jsonUpdateData) {
    		assert.assertTrue(context.currentMode == modulContext.Enum.MODE.RECORD, "'ModulService' Handle available record file response, modul not in record mode");
    		
    		var availableRecFiles = [];
    		angular.forEach(jsonUpdateData.recfiles, function(recfile) {
    			assert.consoleLog_Service("'ModulService' Available record file "+recfile.file);
    			if (!validateRecordCRC(context.modulId, recfile.crc)) {
    				var crcContext = findCRCContext(context.modulId);
    				assert.logWarning("'ModulService' File CRC "+recfile.file+" is invalide. Expected CRC "+ crcContext.expectCrc+" File CRC: "+recfile.crc);
    				return;
    			}
    			availableRecFiles.push(recfile);
    		});
    		
    		if (utility.isArrayEmpty(availableRecFiles)) {
    			modVisService.modulService.play(context.modulId);
    			assert.throwInfoMessage("No record files are available 'Modul:' "+context.modulId);
    			return;
    		}
    		
    		modulContext.clearRecordContext(context);
    		modulContext.setAvailableRecordFiles(context, availableRecFiles);
    		modulContext.requestLastFile(context);
    	}
    	
    	/**
    	 * @private updateDataLiveMode
    	 * snapshotPatch = {updateElementIndex:, elementContext:}
    	 * 
    	 * snapshotPatch.elementContext = {snapshotElementState:, updateElementState:}
    	 * 
    	 * context = {modulId: ,currentMode: ,record:};
    	 * 
    	 * @param context
    	 * @param jsonUpdateData
    	 */
    	function handleLiveUpdateResponse(context, jsonUpdateData) {
    		assert.assertTrue(context.currentMode == modulContext.Enum.MODE.LIVE, "'ModulService' Handle live update response, modul not in live mode");
    		
			if (jsonUpdateData.elm != null) {
				
				modulContext.updateLiveElementContext(context, jsonUpdateData);
				
				/* update progress bar */
				if (jsonUpdateData.part != null && jsonUpdateData.partsize != null) {
					if (jsonUpdateData.part < jsonUpdateData.partsize) {
						var progressValue = 100/jsonUpdateData.partsize * jsonUpdateData.part;
						activateProgressBar(context, progressValue, "Load live update Part "+jsonUpdateData.part+" of "+jsonUpdateData.partsize);
						/* update record context running */
						return;
					}
					deactivateProgressBarListener(context);
				}
				
				if (!utility.isArrayEmpty(context.liveContext.elementStates)) {
					var snapshotPatch = {updateElementIndex: utility.getArrayLength(context.liveContext.elementStates) - 1, 
									 elementContext: {snapshotElementStates: [], updateElementStates: context.liveContext.elementStates}};
					
					if (jsonUpdateData.reset == true) {
						statefullComponentService.updateAndResetStatefullComponentData(context.modulId, snapshotPatch);	
					} else {
						statefullComponentService.updateStatefullComponentData(context.modulId, snapshotPatch);	
					}
				}
			}
    	}
    	
    	/**
    	 * @private handleModulCrcResponse
    	 * 
    	 * @param crcContext
    	 * @param jsonUpdateData
    	 */
    	function handleModulCrcResponse(crcContext, jsonUpdateData) {
    		crcContext.targetCrc = jsonUpdateData.crc;
    	}
    	
    	/*****************************
    	 * websocketDataListener
    	 ****************************/
    	
    	/**
    	 * @private getModulIdFromResponseData
    	 * 
    	 * @param jsonResponseData
    	 * @returns modul id
    	 */
    	function getModulIdFromResponseData(jsonResponseData) {
    		var modulId = [];
    		if (jsonResponseData.modulId != null) {
    			modulId = jsonResponseData.modulId;
    		}
    		assert.assertIsArray(modulId);
    		assert.assertTrue(modulId.length == $settings.modulIdLength, "'ModulService' Modul id is invalide: "+ modulId);
    		return modulId;
    	}
    	
    	/**
    	 * @private isLiveUpdateResponse
    	 * 
    	 * @param context
    	 * @param jsonResponseData
    	 * @returns true if the json response is a update response.
    	 */
    	function isLiveUpdateResponse(context, jsonResponseData) {
    		if (context.currentMode != modulContext.Enum.MODE.LIVE) return false;
    		return !isRecordUpdateResponse(context, jsonResponseData);
    	}
    	
    	/**
    	 * @private isRecordUpdateResponse
    	 * 
    	 * @param context
    	 * @param jsonResponseData
    	 * @returns true if the json response is a reFile response.
    	 */
    	function isRecordUpdateResponse(context, jsonResponseData) {
    		return jsonResponseData.recfile != null;
    	}
    	
    	/**
    	 * @private isAvailableRecordFileResponse
    	 * 
    	 * @param context
    	 * @param jsonResponseData
    	 */
    	function isAvailableRecordFileResponse(context, jsonResponseData) {
    		return jsonResponseData.recfiles != null;
    	}
    	
    	/**
    	 * @private isAvailableRecordFileResponse
    	 * 
    	 * @param context
    	 * @param jsonResponseData
    	 */
    	function isModulCrcResponse(context, jsonResponseData) {
    		return jsonResponseData.crc != null;
    	}
    	
    	/**
    	 * @private isModulServiceRequest
    	 * 
    	 * @param jsonResponseData
    	 */
    	function isModulServiceResponse(jsonResponseData) {
    		return jsonResponseData.recfiles != null || 
    		       jsonResponseData.recfile != null ||
    		       jsonResponseData.elm != null ||
    		       jsonResponseData.crc != null;
    	}
    	
    	/**
		 * @private websocketDataListener
		 * Is called if any websocket json-data arrived.
		 * 
		 * @param jsonResponseData
		 */
    	function websocketDataListener(jsonResponseData) {
    		synchronizeFunction(function () {
    			if (!isModulServiceResponse(jsonResponseData)) return;
    			
    			var responseDataHandled = false;
    			var modulId = getModulIdFromResponseData(jsonResponseData);
    			
    			/**
    			 * Crc context
    			 */
    			/* isLiveUpdateResponse*/
    			if (isModulCrcResponse(crcContext, jsonResponseData)) {
    				var crcContext = findCRCContext(modulId);
    				assert.consoleLog_Service("'ModulService' Handle modul crc response");
    				handleModulCrcResponse(crcContext, jsonResponseData);
    				responseDataHandled = true;
    			}
    		
    			if (responseDataHandled) return;
    			
    			/**
    			 * Modul context
    			 */
    			var context = findModulContextsOrNull(modulId);
    			if (context == null) {
    				assert.logError("'ModulService' Modul not supported " + modulId);
    				return;
    			}
    			
    			/* isLiveUpdateResponse*/
    			if (isLiveUpdateResponse(context, jsonResponseData)) {
    				assert.consoleLog_Service("'ModulService' Handle live update response");
    				handleLiveUpdateResponse(context, jsonResponseData);
    				responseDataHandled = true;
    			}
    			
    			/* isRecordUpdateResponse */
    			if (isRecordUpdateResponse(context, jsonResponseData)) {
    				assert.consoleLog_Service("'ModulService' Handle record update response");
    				handleRecordUpdateResponse(context, jsonResponseData);
    				responseDataHandled = true;
    			}
    			
    			/* isAvailableRecordFileResponse */
    			if (isAvailableRecordFileResponse(context, jsonResponseData)) {
    				assert.consoleLog_Service("'ModulService' Handle available record file response");
    				handleAvailableRecordFileResponse(context, jsonResponseData);
    				responseDataHandled = true;
    			}
    			
    			if (!responseDataHandled) {
    				assert.logWarning("'ModulService' Websocket response data not handled: "+jsonResponseData);
    			}
    		});
		}
    	
    	/************
    	 * Init
    	 ************/
    	assert.consoleLog_Service("Init ModulService");
    	
    	$api.addWebsocketDataListener(websocketDataListener);
    	
    	/* retryError */
		$rootScope.$on('resetError', function(event, data) {
			synchronizeFunction(function () {
				assert.consoleLog_Service("'ModulService' Reset error.");
				
	        	/* reconnect */
	        	if (data.retryId == $errorHandler.RETRY_ID.RECONNECT) {
	        		resetServie();
	        	}
			});
		});
		
		/* retryError */
		$rootScope.$on('bindSkId', function(event, data) {
			synchronizeFunction(function () {
				assert.consoleLog_Service("'ModulService' BindSk update modul context.");
				assert.assertIsArray(data.bindedSkIds);
				updateModulContext(data.bindedSkIds);
			});
		});
		
		/* retryError */
		$rootScope.$on('unbindSkId', function(event, data) {
			synchronizeFunction(function () {
				assert.consoleLog_Service("'ModulService' UnbindSk update modul context.");
				assert.assertIsArray(data.bindedSkIds);
				updateModulContext(data.bindedSkIds);
			});
		});
		
    	return modVisService.modulService;
    	
    }]);
