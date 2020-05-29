'use strict';

/** module for specify services */
angular.module('App.Util.Utility', [])
    
	/*********************************************************************************************************** 
	 * The $errorHandler service provides error handling functions.
	 * @constructor $settings, $errorHandler, assert, $filter
	 **********************************************************************************************************/
	 .factory('utility', ['$settings', '$errorHandler', 'assert', '$filter', 
	                      function($settings, $errorHandler, assert, $filter) {  
	 	
	    var fUtility = {};
	    
	    /* this from the fileHandler */
        var fService = {timeEncodingStrategies: null, months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']};
        
        /*******************************
	     * Time Util
	     *******************************/
	    
        /* Timestamp encoding Strategies. */
	    fService.timeEncodingStrategies = {

	    	 /**************************************
	    	 * SimpleTimestamp
	    	 **************************************/	
	        _SimpleTimestamp : {
	        	encodedTime: function (timestamp) {
	        		return timestamp;
	            }
	    		,	
	    		encodedDisplayTime: function (timestamp) {
		    		return timestamp;
		        }
	    		,
		     	currentTime: function () {
		        	return new Date().getTime()
		        }
	        },

	        /**************************************
	    	 * _UNIX_UTC_Timestamp_ms
	    	 **************************************/
	        _UNIX_UTC_Timestamp_ms : { 
	            encodedTime: function (timestamp) {
	            	var utcTime = encodedUTCTime(timestamp);
	       			return utcTime.date + ' ' + utcTime.month + ' ' + utcTime.year + ' ' + utcTime.hour + ':' + utcTime.min + ':' + utcTime.sec +' '+ utcTime.ms;
	            }
	        	,
	        	encodedDisplayTime: function (timestamp) {
	        		var utcTime = encodedUTCTime(timestamp);
	       			return utcTime.hour + ':' + utcTime.min + ':' + utcTime.sec;
	            }
	        	,
		        currentTime: function () {
	            	return new Date().getTime()
	            }
	         },
	        	
	        /**************************************
		    * UNIX_UTC_Timestamp_s
		    **************************************/
	        _UNIX_UTC_Timestamp_s : { 
	            encodedTime: function (timestamp) {
	            	var utcTime = encodedUTCTime(timestamp);
	       			return utcTime.date + ' ' + utcTime.month + ' ' + utcTime.year + ' ' + utcTime.hour + ':' + utcTime.min + ':' + utcTime.sec;
	            }
	         	,
	         	encodedDisplayTime: function (timestamp) {
	         		var utcTime = encodedUTCTime(timestamp);
	       			return utcTime.hour + ':' + utcTime.min + ':' + utcTime.sec;
	            }
	         	,
	         	currentTime: function () {
	            	return new Date().getTime()
	            }
	         },
	         
	         /**************************************
		     * UNIX_Timestamp_ms
		     **************************************/
	         _UNIX_Timestamp_ms : { 
	        	 encodedTime: function (timestamp) {
	        		var time = encodedTime(timestamp);
	       			return time.date + ' ' + time.month + ' ' + time.year + ' ' + time.hour + ':' + time.min + ':' + time.sec +' '+ time.ms;
	             }
	        	 ,
	        	 encodedDisplayTime: function (timestamp) {
	        		var time = encodedTime(timestamp);
	       			return time.hour + ':' + time.min + ':' + time.sec;
	             } 
	        	 ,
		         currentTime: function () {
	            	return new Date().getTime()
	             }
	         },
		         
		     /**************************************
			 * UNIX_Timestamp_s
			 **************************************/
	        _UNIX_Timestamp_s : { 
	        	encodedTime: function (timestamp) {
	        		var time = encodedTime(timestamp);
	       			return time.date + ' ' + time.month + ' ' + time.year + ' ' + time.hour + ':' + time.min + ':' + time.sec;
	            }
	         	,
	         	encodedDisplayTime: function (timestamp) {
	         		var time = encodedTime(timestamp);
	       			return time.hour + ':' + time.min + ':' + time.sec;
	            }
	         	,
	         	currentTime: function () {
	            	return new Date().getTime()
	            }
	        }
	    };
	    
	    /**
	     * @private encodedUTCTime
	     * 
	     * @param timestamp
	     * @returns utcTime
	     */
	    function encodedUTCTime(timestamp) {
	    	var a = new Date(timestamp);
   			var year = a.getUTCFullYear();
   			var month = fService.months[a.getUTCMonth()];
   			var date = a.getUTCDate();
   			var hour = fUtility.expandValueToDigits(a.getUTCHours(), 2);
   			var min = fUtility.expandValueToDigits(a.getUTCMinutes(), 2);
   			var sec = fUtility.expandValueToDigits(a.getUTCSeconds(), 2);
   			var ms = fUtility.expandValueToDigits(a.getUTCMilliseconds(), 3);
   			var utcTime = {year: year, month: month, date: date, hour: hour, min: min, sec: sec, ms: ms};
   			return utcTime;
	    }
	    
	    /**
	     * @private encodedTime
	     * 
	     * @param timestamp
	     * @returns time
	     */
	    function encodedTime(timestamp) {
	    	var a = new Date(timestamp);
   			var year = a.getFullYear();
   			var month = fService.months[a.getMonth()];
   			var date = a.getDate();
   			var hour = fUtility.expandValueToDigits(a.getHours(), 2);
   			var min = fUtility.expandValueToDigits(a.getMinutes(), 2);
   			var sec = fUtility.expandValueToDigits(a.getSeconds(), 2);
   			var ms = fUtility.expandValueToDigits(a.getMilliseconds(), 3);
   			var time = {year: year, month: month, date: date, hour: hour, min: min, sec: sec, ms: ms};
   			return time;
	    }
	    
	    
	    /** 
	     * @public getEncodedTime
	     * Encode the timestamp.
	     *
	     * @param {String} timestamp
	     * @return the encoded time stamp
	     */
	    fUtility.getEncodedTime = function(/*@CheckForNull*/ timestamp) {
	    	if (timestamp == null) return " - ";
	    	var strategies = fService.timeEncodingStrategies["_"+$settings.timeEncoding];
	    	assert.assertNotNull(strategies, "Timestamp encoding strategy is missing: "+$settings.timeEncoding);
	      	return strategies.encodedTime(timestamp);
	    }
	    
	    
	    /** 
	     * @public getEncodedTime
	     * Encode the timestamp.
	     *
	     * @param {String} timestamp
	     * @return the encoded time stamp
	     */
	    fUtility.getEncodedDisplayTime = function(/*@CheckForNull*/ timestamp) {
	    	if (timestamp == null) return " - ";
	    	var strategies = fService.timeEncodingStrategies["_"+$settings.timeEncoding];
	    	assert.assertNotNull(strategies, "Timestamp encoding strategy is missing: "+$settings.timeEncoding);
	      	return strategies.encodedDisplayTime(timestamp);
	    }
	    
	    /** 
	     * @public getCurrentEncodedTime
	     * Encode the timestamp.
	     *
	     * @param {String} timestamp
	     * @return the encoded time stamp
	     */
	    fUtility.getCurrentEncodedTime = function() {
	    	var strategies = fService.timeEncodingStrategies["_"+$settings.timeEncoding];
	    	assert.assertNotNull(strategies, "Timestamp encoding strategy is missing: "+$settings.timeEncoding);
	      	return strategies.currentTime();
	    }
	   
	    /**
	     * @public expandDigits
	     * Expand the value to places
	     * 
	     * @param value
	     * @param place
	     * @returns valueString
	     */
	    fUtility.expandValueToDigits = function(value, place) {
	    	var valueString = ""+value;
	    	var length = valueString.length;
	    	if (length >= place) {
	    		return valueString;
	    	}
	    	for (var index = length; index < place; index++) {
	    		valueString = "0"+valueString;
	    	}
	    	return valueString;
	    }
	    
	    /*******************************
	     * SkId Util
	     *******************************/
	    
	    /** 
	     * @public skIdAsString
	     * Format the skId.
	     *
	     * @param {Array} skId
	     * @param {String} delimiter
	     * @return the formated skId.
	     */
	    fUtility.skIdAsString = function(skId, delimiter) {
	     	var stringBuffer = '';
	     	var first = true;
	     	angular.forEach(skId, function(subId, index) {
	     		if (first) {
	     			stringBuffer = stringBuffer + subId;
	     		} else {
	     			stringBuffer = stringBuffer + delimiter +subId;
	     		}
	     		first = false;
	     	});
	     	return stringBuffer;
	    };

	    /** 
	      * @public filterElementStateById
	      * Returns the first elementstate with the id in the list of elementstates.
	      *
	      * @param {Array} elementStates
	      * @param {String} uuid
	      * @returns {Object} elementstate
	      */
	    fUtility.filterElementStateById = function(elementStates, id) {
	         var elementState = elementStates.filter(function(elementState) {
	        	  return fUtility.equals(elementState.id, id);
	         });
	         return elementState[0];
	    }
	 	
	 	/**
	 	* @public filterSkIdFromElementState
	 	* Returns the skId from the element state.
	 	* 
	 	* @param {Object} elementStates
	 	* @returns {Array} skId
	 	*/
	    fUtility.filterSkIdFromElementState = function(elementState) {
	    	assert.assertTrue(elementState.id.length > 1, "ElementState id length is invalide");
	    	return elementState.id.slice(0, elementState.id.length-1);
	 	};
	    
	    /**
    	 * @public crateElementState
    	 * 
    	 * @param jsonElement
    	 * @param defaultSeq
    	 * @param defaultTime
    	 * @returns elementState
    	 */
	 	fUtility.crateElementStateFromJsonElement = function(jsonElement, defaultSeq, defaultTime) {
	 		var seq = fUtility.getValueOrDefault(jsonElement.seq, defaultSeq);
	 		var time = fUtility.getValueOrDefault(jsonElement.time, defaultTime);
	 		time = fUtility.getValueOrDefault(time, 0);
			var elementState = {id: jsonElement.id, st: jsonElement.st, time: time, seq: seq};
			assert.assertNotNull(elementState.id, "Element 'id' is missing.");
			assert.assertNotNull(elementState.st, "Element: ["+elementState.id+"] 'st' is missing.");
			assert.assertNotNull(elementState.time, "Element: ["+elementState.id+"] 'time' is missing.");
			assert.assertNotNull(elementState.seq, "Element: ["+elementState.id+"] 'seq' is missing.");
    		return elementState;
    	};
    	
	    /*******************************
	     * Modul Util
	     *******************************/
	    
	    /**
	     * @public filterModulIdFromSkId
	     * 
	     * @param {Array} Id = skId, elementid
	     * @returns {Array} modulId
	     */
    	fUtility.filterModulIdFromId = function(id) {
	    	var modulId = [];
	    	assert.assertTrue(id.length >= $settings.modulIdLength, "Modul id length is invalide");
	    	angular.forEach(id, function(subId, index) {
	    		if ($settings.modulIdLength > index) {
	    			modulId.push(subId);
	    		}
	    	});
	    	return modulId;
	    };
	    
	    /**
	     * @public containsModulId
	     * 
	     * @param {Array} Id = skId, elementid
	     * @param modulId
	     * @returns {Array} modulId
	     */
	    fUtility.containsModulId = function(id, modulId) {
	    	return fUtility.equals(modulId, fUtility.filterModulIdFromId(id));
	    };
	    
	    /*******************************
	     * Util
	     *******************************/
	   
	    /**
	      * @public getValueOrDefault
	      * Check if the value is null and return defaultvalue
	      * 
	      * @param {Object} defaultValue
	      * 
	      * @returns value or defaultValue
	      */
	    fUtility.getValueOrDefault = function(value, defaultValue) {
	    	if (value != null && value != undefined) return value;
	    	return defaultValue;
	 	};
	    
	     /**
	      * @public equals
	      * Check if the objects are equals
	      * 
	      * @param {Array or Object} a1
	      * @param {Array or Object} a2
	      * 
	      * @returns true or false
	      */
	    fUtility.equals = function(a1, a2) {
	        if (a1 == a2) return true;
	        return JSON.stringify(a1) == JSON.stringify(a2);
	 	};
	     
	 	/**
	      * @public isArray
	      * Check if the parameter is a array
	      * 
	      * @param {Array or Object} a1
	      * 
	      * @returns true or false
	      */
	    fUtility.isArray = function(a1) {
	    	assert.assertNotNull(a1);
	    	return angular.isArray(a1);
	 	};
	 	
	 	/**
	      * @public isObject
	      * Check if the parameter is a object
	      * 
	      * @param {Array or Object} a1
	      * 
	      * @returns true or false
	      */
	    fUtility.isObject = function(object) {
	    	assert.assertNotNull(object);
	    	return angular.isObject(object);
	 	};
	 	
	 	/**
	      * @public isValue
	      * Check if the parameter is a value
	      * 
	      * @param {Array or Object} object
	      * 
	      * @returns true or false
	      */
	    fUtility.isValue = function(object) {
	    	assert.assertNotNull(object);
	    	if (angular.isArray(object)) return false;
	    	if (angular.isObject(object)) return false;
	    	return true;
	 	};
	 	
	    /**
	     * @public isArrayEmpty
	     * 
	     * @param {Array} a1
	     * @returns true if empty
	     */
	 	fUtility.isArrayEmpty = function(a1) {
	    	assert.assertIsArray(a1);
	        return a1.length == 0;
	 	};
	    
	    /**
	     * @public getArrayLength
	     * 
	     * @param {Array} a1
	     * @returns array length
	     */
	 	fUtility.getArrayLength = function(a1) {
	    	assert.assertIsArray(a1);
	        return a1.length;
	 	};
	    
	    /**
	     * @public getArrayIndex
	     * 
	     * @param {Array} a1
	     * @param index
	     * @returns array element.
	     */
	 	fUtility.getArrayIndex = function(a1, index) {
	    	assert.assertTrue(index >= 0 && index < fUtility.getArrayLength(a1), "Array index invalide. Index: "+index+" Length: "+fUtility.getArrayLength(a1));
	    	return a1[index];
	 	};
	    
	 	/**
	     * @public getLastArrayIndex
	     * 
	     * @param {Array} a1
	     * @returns last array index.
	     */
	 	fUtility.getLastArrayIndex = function(a1) {
	 		var index = fUtility.getArrayLength(a1) - 1
	 		return fUtility.getArrayIndex(a1, index);
	 	};
	 	
	 	/**
	     * @public getFirstArrayIndex
	     * 
	     * @param {Array} a1
	     * @returns first array index.
	     */
	 	fUtility.getFirstArrayIndex = function(a1) {
	 		return fUtility.getArrayIndex(a1, 0);
	 	};
	 	
	 	/**
	     * @public pushToArray
	     * 
	     * @param {Array} a1
	     * @returns first array index.
	     */
	 	fUtility.pushToArray = function(a1, object) {
	 		assert.assertIsArray(a1);
	 		a1.push(object);
	 	};
	 	
	 	/**
	     * @public popFromArray
	     * 
	     * @param {Array} a1
	     * @returns first array index.
	     */
	 	fUtility.popFromArray = function(a1) {
	 		assert.assertIsArray(a1);
	 		if (fUtility.isArrayEmpty(a1)) return null;
	 		var length = fUtility.getArrayLength(a1);
	 		var element = fUtility.getArrayIndex(a1, length-1);
	 		a1.splice(length-1, 1);
	 		return element;
	 	};
	 	
	 	/**
	     * @public arrayCopy
	     * 
	     * @param {Array} a1
	     * @returns array copy.
	     */
	 	fUtility.arrayCopy = function(a1) {
	 		assert.assertIsArray(a1);
	 		return angular.copy(a1);
	 	};
	 	
	 	/**
	     * @public copy
	     * 
	     * @param object
	     * @returns object copy.
	     */
	 	fUtility.copy = function(o1) {
	 		assert.assertNotNull(o1);
	 		return angular.copy(o1);
	 	};
	 	
	    /**
	     * @public removeFromArray
	     * 
	     * @param {Array} a1
	     * @param object
	     * @returns true if the element is removed from the array.
	     */
	 	fUtility.removeFromArray = function(a1, object) {
	    	assert.assertIsArray(a1);
	    	var findElement = false;
    		angular.forEach(a1, function(element, index) {
    			if (findElement) return;
				if (!fUtility.equals(element, object)) return;
				a1.splice(index, 1);
				findElement = true;
			});
    		return findElement;
    	};
	    
    	/**
	     * @public containsElement
	     * 
	     * @param {Array} a1
	     * 		  Object
	     * @returns true it the objectis inside the array.
	     */
	 	fUtility.containsElement = function(a1, object) {
	 		assert.assertIsArray(a1);
	 		var findElement = false;
    		angular.forEach(a1, function(element) {
    			if (findElement) return;
				if (!fUtility.equals(element, object)) return;
				findElement = true;
			});
    		return findElement;
	 	};
	 	
    	/**
	     * @public asUniqueList
	     * 
	     * @param {Array} a1
	     * @returns as unique element list.
	     */
	 	fUtility.asUniqueList = function(a1) {
	 		assert.assertIsArray(a1);
	 		var uniqueList = [];
	 		angular.forEach(a1, function(element) {
	 			if (fUtility.containsElement(uniqueList, element)) return;
	 			uniqueList.push(element);
			});
	 		return uniqueList;
	 	};
	 	
	 	
	 	/*******************************
	     * Id
	     *******************************/
	   
	 	/**
	     * @public containsElementId
	     * 
	     * @param {Array} a1
	     * 		  Object
	     * @returns true it the objectis inside the array.
	     */
	 	fUtility.containsElementId = function(a1, object) {
	 		assert.assertIsArray(a1);
	 		var findElement = false;
    		angular.forEach(a1, function(element) {
    			if (findElement) return;
    			if (element.id == null || object.id == null) return;
				if (!fUtility.equals(element.id, object.id)) return;
				findElement = true;
			});
    		return findElement;
	 	};
	 	
	 	/**
	     * @public asUniqueElementIdList
	     * 
	     * @param {Array} a1
	     * @returns as unique element list.
	     */
	 	fUtility.asUniqueElementIdList = function(a1) {
	 		assert.assertIsArray(a1);
	 		var uniqueElementIdList = [];
	 		angular.forEach(a1, function(element) {
	 			if (element.id != null && fUtility.containsElementId(uniqueElementIdList, element)) return;
	 			uniqueElementIdList.push(element);
			});
	 		return uniqueElementIdList;
	 	};
	 	
	 	/**
	     * @public isGuid
	     * 
	     * @param {String} value
	     * @returns as unique element list.
	     */
	 	fUtility.isGuid = function(value) {
	 		assert.assertNotNull(value);
	 		if (!fUtility.isValue(value)) return false;
		 	return value.match("guid_(.{32})");
	 	}
	 	
	    return fUtility;
	 	
	 }]);
 