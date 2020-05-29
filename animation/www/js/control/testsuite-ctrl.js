'use strict';

/** module for specify controllers */
angular.module('App.Control.TestsuiteCtrl', [])

	/************************************************************************************************************
	 * ActionCtrl
	 * @constructor utility, requestHandler, explorerTreeUtil, fileHandler, assert, $api, $scope, $routeParams, $window, $timeout
	 ***********************************************************************************************************/
	.controller('TestsuiteCtrl', ['testsuiteService', 'utility', 'requestHandler', 'explorerTreeUtil', 'fileHandler', 'assert', '$api', '$scope', '$routeParams', '$window', '$timeout', '$templateCache',
	                                 function (testsuiteService, utility, requestHandler, explorerTreeUtil, fileHandler, assert, $api, $scope, $routeParams, $window, $timeout, $templateCache) {
		
		
		/* Controller this */
		var fTestsuiteCtrl = {initComplete: false, testsuiteData: null, callbackHandle: null};
		
		fTestsuiteCtrl.DATA_USAGE = {
				ARRAY_INDEX : "INDEX",
				DATATYPE : "DATA"
    	};
		
		$scope.testsuite = {
				
				testsuiteConnected: false,
				testcaseEditMode: true,
				isExecuting: false,
				
				requiredInputPendingId: null,
				
				logOutputMessages: [],
		
				testcase: [],
				selectedTestcase: null,
				bindedTestcase: null,
				
				channel: [],
				selectedChannel: null,
				selectedChannelName: '',
				
				message: [],
				selectedMessage: null,
				selectedMessageName: '',
				
				data: [],
				selectedData: null,
				selectedDataName: '',
					
				inputDataValue: null
		};
		
		/****************************************
		 * Test case change
		 ****************************************/
		
		/**
    	 * @private getSelectedChannel
    	 * Update channels from testsuite data.
    	 * 
    	 * @CheckforNull
    	 */
		function getSelectedTestcaseName() {
			if (!fTestsuiteCtrl.initComplete) return null;
			if ($scope.testsuite.selectedTestcase == null) return null;
			var testcaseObject = utility.getArrayIndex($scope.testsuite.testcase, $scope.testsuite.selectedTestcase);
			return testcaseObject.name;
		}
		
		/**
		 * @public testcaseChange
		*/
		$scope.testcaseChange = function () {
			synchronizeFunction(function () {
				if (!fTestsuiteCtrl.initComplete) return;
				var testcaseName = getSelectedTestcaseName();
				if (testcaseName == null) return;
				testsuiteService.bindTestcase(testcaseName);
			});
		};	
		
		/******************************************
    	 * TestBench interface
    	 *****************************************/
		
		/**
		 * @public pause
		*/
		$scope.resetTestbench = function () {
			synchronizeFunction(function () {
				if (!fTestsuiteCtrl.initComplete) return;
				testsuiteService.resetTestbench();
			});
		};	
		
		/**
		 * @public triggerMessage
		*/
		$scope.sendTestbenchEvent = function () {
			synchronizeFunction(function () {
				if (!fTestsuiteCtrl.initComplete) return;
				var selectedMessage = getSelectedMessage();
				if (selectedMessage == null) return;
				var selectedDataValue = getSelectedMessageDataValue(fTestsuiteCtrl.DATA_USAGE.DATATYPE);
				var selectedDataIndex = getSelectedMessageDataValue(fTestsuiteCtrl.DATA_USAGE.ARRAY_INDEX);
				testsuiteService.sendTestbenchEvent(selectedMessage.id, selectedDataValue, selectedDataIndex);
			});
		};	
		
		/******************************************
    	 * Testsuite interface
    	 *****************************************/
		
		/**
		 * @public connectTestsuite
		*/
		$scope.toggleConnectTestsuite = function () {
			synchronizeFunction(function () {
				if (!fTestsuiteCtrl.initComplete) return;
				testsuiteService.toggleConnectTestsuite();
			});
		};	
		
		/******************************************
    	 * Testcase interface
    	 *****************************************/
		
		/**
		 * @public step
		*/
		$scope.step = function () {
			synchronizeFunction(function () {
				if (!fTestsuiteCtrl.initComplete) return;
				testsuiteService.stepTestcase();
			});
		};	
		
		/**
		 * @public run
		*/
		$scope.run = function () {
			synchronizeFunction(function () {
				if (!fTestsuiteCtrl.initComplete) return;
				testsuiteService.runTestcase();
			});
		};	
		
		/**
		 * @public toggleEditMode
		*/
		$scope.toggleEditMode = function () {
			synchronizeFunction(function () {
				if (!fTestsuiteCtrl.initComplete) return;
				testsuiteService.toggleEditModeTestcase();
			});
		};	
		
		/****************************************
		 * Channel
		 ****************************************/

		/**
		 * @public tableChannelChange
		*/
		$scope.tableChannelChange = function () {
			synchronizeFunction(function () {
				if (!fTestsuiteCtrl.initComplete) return;
				assert.consoleLog_Control("'TestsuiteCtrl' tableChannelChange: "+$scope.testsuite.selectedChannel);
				updateSelectedChannelName();
				updateMessageTable();
			});
		};	
		
		/**
    	 * @private getChannels
    	 */
		function getChannels() {
			if (!fTestsuiteCtrl.initComplete) return [];
			/* required input*/
			if ($scope.testsuite.requiredInputPendingId != null) {
				assert.assertIsArray(fTestsuiteCtrl.testsuiteData.requiredInput);
				return fTestsuiteCtrl.testsuiteData.requiredInput;
			}
			/* Channels */
			if (fTestsuiteCtrl.testsuiteData.eventChannel != null) {
				assert.assertIsArray(fTestsuiteCtrl.testsuiteData.eventChannel);
				return fTestsuiteCtrl.testsuiteData.eventChannel;
			}
			return [];
		}
		
		/**
    	 * @private updateChannelTable
    	 * Update channels from testsuite data.
    	 */
		function updateChannelTable() {
			var channels = getChannels();
			$scope.testsuite.channel = [];
			if (utility.isArrayEmpty(channels)) {
				$scope.testsuite.selectedChannel = null;
				updateSelectedChannelName();
				return;
			}
			
    		angular.forEach(channels, function (channel, index) {
    			$scope.testsuite.channel.push({id: index, name: channel.name, channel: channel});
    		});
    		$scope.testsuite.selectedChannel = 0;
    		updateSelectedChannelName();
    		updateMessageTable();
    		
    		if (!$scope.$$phase) {
        		$scope.$digest();
        	}
		}
		
		/**
    	 * @private updateSelectedChannelName
    	 * Update channels from testsuite data.
    	 */
		function updateSelectedChannelName() {
			var selectedChannel = getSelectedChannel();
			if (selectedChannel == null) {
				$scope.testsuite.selectedChannelName = '';
				return;
			}
			$scope.testsuite.selectedChannelName = selectedChannel.name;
		}
		
		/**
    	 * @private getSelectedChannel
    	 * Update channels from testsuite data.
    	 * 
    	 * @CheckforNull
    	 */
		function getSelectedChannel() {
			if (!fTestsuiteCtrl.initComplete) return null;
			if ($scope.testsuite.selectedChannel == null) return null;
			var channelObject = utility.getArrayIndex($scope.testsuite.channel, $scope.testsuite.selectedChannel);
			return channelObject.channel;
		}
		
		/****************************************
		 * Message
		 ****************************************/
		
		/**
		 * @public tableChannelChange
		*/
		$scope.tableMessageChange = function () {
			synchronizeFunction(function () {
				if (!fTestsuiteCtrl.initComplete) return;
				assert.consoleLog_Control("'TestsuiteCtrl' tableMessageChange: "+$scope.testsuite.selectedMessage);
				updateSelectedMessageName();
				updateDataTable();
			});
		};	
		
		/**
		 * @public getMessages
		*/
		function getMessages() {
			if (!fTestsuiteCtrl.initComplete) return [];
			var selectedChannel = getSelectedChannel();
			if (selectedChannel == null || selectedChannel.message == null) return [];
			assert.assertIsArray(selectedChannel.message);
			
			/* required input*/
			if ($scope.testsuite.requiredInputPendingId != null) {
				var messages = [];
				angular.forEach(selectedChannel.message, function (message) {
					if (!utility.equals(message.id, $scope.testsuite.requiredInputPendingId)) return;
					messages.push(message);
	    		});
				return messages;
			}
			return selectedChannel.message;
		}
		
		/**
    	 * @private updateMessageTable
    	 * Update channels from testsuite data.
    	 */
		function updateMessageTable() {
			var messages = getMessages();
			
			$scope.testsuite.message = [];
			if (utility.isArrayEmpty(messages)) {
				$scope.testsuite.selectedMessage = null;
				updateSelectedMessageName();
	    		return;
			}
			
    		angular.forEach(messages, function (message, index) {
    			$scope.testsuite.message.push({id: index, name: message.name, message: message});
    		});
    		$scope.testsuite.selectedMessage = 0;
    		updateSelectedMessageName();
    		updateDataTable();
		}
		
		/**
    	 * @private updateSelectedMessageName
    	 * Update channels from testsuite data.
    	 */
		function updateSelectedMessageName() {
			var selectedMessage = getSelectedMessage();
			if (selectedMessage == null) {
				$scope.testsuite.selectedMessageName = '';
				return;
			}
			$scope.testsuite.selectedMessageName = selectedMessage.name;
		}
		
		/**
    	 * @private getSelectedChannel
    	 * Update channels from testsuite data.
    	 * 
    	 * @CheckforNull
    	 */
		function getSelectedMessage() {
			if (!fTestsuiteCtrl.initComplete) return null;
			if ($scope.testsuite.selectedMessage == null) return null;
			var messageObject = utility.getArrayIndex($scope.testsuite.message, $scope.testsuite.selectedMessage);
			return messageObject.message;
		}
		
		/****************************************
		 * Data
		 ****************************************/
		
		$scope.inputDataValueChange = function () {
			synchronizeFunction(function () {
				if (!fTestsuiteCtrl.initComplete) return;
				var selectedData = getSelectedData();
				if (selectedData != null) {
					selectedData.value = parseFloat($scope.testsuite.inputDataValue);
					var flatType = selectedData.type;
					var prefix = selectedData.usage;
					selectedData.name = prefix+"->"+getPathAsString(flatType.path)+ " = "+selectedData.value +" : "+flatType.type;
				}
			});
		};
		
		/**
		 * @public tableChannelChange
		*/
		$scope.tableDataChange = function () {
			synchronizeFunction(function () {
				if (!fTestsuiteCtrl.initComplete) return;
				assert.consoleLog_Control("'TestsuiteCtrl' tableDataChange: "+$scope.testsuite.selectedData);
				
				var selectedData = getSelectedData();
				if (selectedData != null) {
					$scope.testsuite.inputDataValue = selectedData.value;
				}
				updateSelectedDataName();
			});
		};	
		
		/**
    	 * @private updateDataTable
    	 * Update channels from testsuite data.
    	 */
		function updateDataTable() {
			if (!fTestsuiteCtrl.initComplete) return;
			var selectedMessage = getSelectedMessage();
			if (selectedMessage == null || (selectedMessage.datatype == null && selectedMessage.arrayindex == null)) {
				$scope.testsuite.data = [];
				$scope.testsuite.selectedData = null;
				updateSelectedDataName();
	    		return;
			}
			$scope.testsuite.data = [];
			$scope.testsuite.selectedData = null;
			$scope.testsuite.inputDataValue = null;
			
			var indexOffset = 0;
			if (selectedMessage.arrayindex != null) {
				var index = 0;
				angular.forEach(selectedMessage.arrayindex, function (type, indexdomain) {
					var flatType = {path: [indexdomain], type: type};
					$scope.testsuite.data.push({id: index, name: fTestsuiteCtrl.DATA_USAGE.ARRAY_INDEX +"->"+getPathAsString(flatType.path) + " : "+type, value: null, type: flatType, usage: fTestsuiteCtrl.DATA_USAGE.ARRAY_INDEX});
					index++;
				});
				indexOffset = index;
			}
			
			if (selectedMessage.datatype != null) {
				var flatTypes = getLeafDataTypeByGuid(selectedMessage.datatype);
				if (!utility.isArrayEmpty(flatTypes)) {
					angular.forEach(flatTypes, function (flatType, index) {
						$scope.testsuite.data.push({id: indexOffset + index, name: fTestsuiteCtrl.DATA_USAGE.DATATYPE +"->"+getPathAsString(flatType.path)+" : "+flatType.type, value: null, type: flatType, usage: fTestsuiteCtrl.DATA_USAGE.DATATYPE});
					});		
				}
			}
			if (!utility.isArrayEmpty($scope.testsuite.data)) {
				$scope.testsuite.selectedData = 0;
			}
			updateSelectedDataName();
		}
		
		/**
    	 * @private updateSelectedMessageName
    	 * Update channels from testsuite data.
    	 */
		function updateSelectedDataName() {
			var selectedData = getSelectedData();
			if (selectedData == null) {
				$scope.testsuite.selectedDataName = '';
				return;
			}
			$scope.testsuite.selectedDataName = selectedData.name;
		}
		
		/**
    	 * @private getSelectedChannel
    	 * Update channels from testsuite data.
    	 * 
    	 * @CheckforNull
    	 */
		function getSelectedData() {
			if (!fTestsuiteCtrl.initComplete) return null;
			if ($scope.testsuite.selectedData == null) return null;
			var dataObject = utility.getArrayIndex($scope.testsuite.data, $scope.testsuite.selectedData);
			return dataObject;
		}
		
		/**
    	 * @private getSelectedMessageDataValue from the data
    	 * Update channels from testsuite data.
    	 * 
    	 * @CheckforNull
    	 */
		function getSelectedMessageDataValue(usage) {
			var selectedMessage = getSelectedMessage();
			if (selectedMessage == null) return null;
			if (utility.isArrayEmpty($scope.testsuite.data)) return null;
			
			var dataValue = null;
			angular.forEach($scope.testsuite.data, function (data) {
				if (data.usage != usage) return;
				if (data.value == null) return;
				
				if (utility.isArrayEmpty(data.type.path)) {
					dataValue = data.value;
					return;
				}
				
				if (dataValue == null) {
					dataValue = {};
				}
				var currentData = dataValue;
				angular.forEach(data.type.path, function (path, index) {
					if (utility.getArrayLength(data.type.path) == index + 1) {
						currentData[path] = data.value;
						return;
					}
					if (currentData[path] == null) {
						var newData = {};
						currentData[path] = newData;	
					}
					currentData = currentData[path];
				});
			});
			return dataValue;
		}
		
		
		/****************************************
		 * Data
		 ****************************************/
		
		/**
    	 * @private getPathAsString
    	 */
		function getPathAsString(path) {
			if (utility.isArrayEmpty(path)) {
				return "value";
			}
			var pathAsString = "";
			angular.forEach(path, function (p, index) {
				if (index > 0) pathAsString = pathAsString + ".";
				pathAsString = pathAsString + p;
    		});
			return pathAsString;
		}
		
		/**
    	 * @private getLeafDataTypeByGuid
    	 */
		function getLeafDataTypeByGuid(datatypeGuid) {
			if (!fTestsuiteCtrl.initComplete) return null;
			var flatTypes = [];
			var path = [];
			iterateLeafDataTypeByGuid(datatypeGuid, path, flatTypes);
			return flatTypes;
		}
		
		/**
    	 * @private iterateLeafDataTypeByGuid
    	 */
		function iterateLeafDataTypeByGuid(datatypeGuid, path, flatTypes) {
			var datatypes = fTestsuiteCtrl.testsuiteData.datatype;
			assert.assertNotNull(datatypes, "'TestsuiteCtrl' Test suite dataTypes not defined.");
			
    		angular.forEach(datatypes, function (datatype, index) {
    			if (!utility.equals(datatypeGuid, datatype.guid)) return;
    			iterateLeafDataType(datatype.value, path, flatTypes);
    		});
		}
		
		/**
    	 * @private iterateLeafDataType
    	 */
		function iterateLeafDataType(fieldOrType, path, flatTypes) {
			assert.assertNotNull(fieldOrType);
			if (utility.isValue(fieldOrType)) {
				if (utility.isGuid(fieldOrType)) {
					// guid
					iterateLeafDataTypeByGuid(fieldOrType, path, flatTypes);
				} else {
					// type 
					flatTypes.push({path: utility.arrayCopy(path), type: fieldOrType});
				}
				return;
			}
			assert.assertIsObject(fieldOrType);
			angular.forEach(fieldOrType, function (field, key) {
				utility.pushToArray(path, key);
				iterateLeafDataType(field, path, flatTypes);
				utility.popFromArray(path);
			});
		}
		
		/****************************************
		 * Internal
		 ****************************************/
		
		/**
		 * @private updateListener
		 * Update listener is called if the snapshot state has changed
		 * event = {id: (enum-> SNAPSHOT_UPDATE PROGRESS_STATE), , data:}
		 * @param context = {skId: , currentSeq: , currentTime: , snapshot:, initSnapshot:, initSt:, animationStrategie:, listeners:}; 
		 */
		function updateListener(event) {
			synchronizeFunction(function () {
				if (!fTestsuiteCtrl.initComplete) return;
				
				switch (event.id) {
					/* UPDATE_STATE */
	    			case testsuiteService.EVENT.UPDATE_STATE:
	    				// data = {isExecuting: testsuiteConnected: testcaseEditMode: requiredInputPendingId: }
	    				var data = event.data;
	    				$scope.testsuite.isExecuting = data.isExecuting;
	    				$scope.testsuite.testsuiteConnected = data.testsuiteConnected;
	    				$scope.testsuite.testcaseEditMode = data.testcaseEditMode;
	    				$scope.testsuite.testcase = data.testcase;	
	    				$scope.testsuite.bindedTestcase = data.bindedTestcase;
	    				
	    				if ($scope.testsuite.bindedTestcase == null) {
	    					$scope.testsuite.selectedTestcase = 0;
	    				} else {
		    				angular.forEach($scope.testsuite.testcase, function (testcase, index) {
		    					if (!utility.equals(testcase.name, $scope.testsuite.bindedTestcase)) return;
		    					$scope.testsuite.selectedTestcase = index;
		    				});
						}
	    				break;
					
	    			/* UPDATE_LOG */	
	    			case testsuiteService.EVENT.UPDATE_LOG:	
	    				// data = {logOutputMessages: };
	    				var data = event.data;
	    				$scope.testsuite.logOutputMessages = data.logOutputMessages;
	    				break;
	    				
	    			/* REQUIRED_INPUT_PENDING */	
	    			case testsuiteService.EVENT.REQUIRED_INPUT_PENDING:
	    				var data = event.data;	
	    				$scope.testsuite.requiredInputPendingId = data.requiredInputPendingId;
	    				updateChannelTable();
	    				break;
	    			
					/* DEFAULT */	
		    		default:
		    			break;
				}
				$scope.$eval();
			});
		}
		
		/**
    	 * @private synchronizeFunction
    	 * Synchronize function to handle async events.
    	 * 
    	 * @param {function} syncfunction
    	 */
    	function synchronizeFunction(syncfunction) {
    		$scope.$applyAsync(syncfunction);
    	}
		
    	/**
    	 * @private init conrol
    	 */
    	function initCtrl() {
    		
    		if ($api.isServerAvailable()) {
    			
    			/* Request Testsuite Data */
    	    	fileHandler.getTestsuite().then(function (testsuiteData) {
    	    		assert.assertNotNull(testsuiteData, "'TestsuiteCtrl' Test suite data not defined.");
    	    		fTestsuiteCtrl.testsuiteData = testsuiteData;
    	    		fTestsuiteCtrl.initComplete = true;
    	    		
    	    		updateChannelTable();
    	    	
    	    		fTestsuiteCtrl.callbackHandle = testsuiteService.bind(updateListener);
    	    		if (!$scope.$$phase) {
    	        		$scope.$digest();
    	        	}
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
			if (fTestsuiteCtrl.callbackHandle != null) {
				testsuiteService.unbind(fTestsuiteCtrl.callbackHandle);
				fTestsuiteCtrl.callbackHandle = null;
			}
			fTestsuiteCtrl.initComplete = false;
		}
		
		/************
    	 * Init
    	 ************/
		assert.consoleLog_Control("Init TestsuiteCtrl");
		
		/* bind dispose function window.onbeforeunload */
		window.onbeforeunload = function confirmExit() {
			dispose();
		}

    	/* add listener if the controller is disposed */
		$scope.$on('$destroy', function() {
			dispose();
		});
		
		/* retryError */
		$scope.$on('resolveError', function(event, data) {

        	/* reconnect */
        	if (data.retryId == 2) {
        		$templateCache.removeAll();
        		initCtrl();
        	}
		});
		
		initCtrl();
	}]);
