'use strict';

/**
 * Global modVis object is needed to multiplex all service requests to the
 * parent window.
 * 
 * So check if current window is a popup-window, if so use the parent window
 * modVis, otherwise instanciate a window global variable called modVis.
 */
var modVis = (window.opener) ? window.opener.modVis : {};

/** module for specify services */
angular.module('App.Api.RequestHandler', [])
    
	/*********************************************************************************************************** 
    * The requestHandler service provides functions, like send message (send json request) over websocket.
    * @constructor utility, assert, $api, $settings, $q
    ***********************************************************************************************************/
    .factory('requestHandler', ['utility', 'assert', '$api', '$settings', '$q', 
                                function (utility, assert, $api, $settings, $q) {  

        // check if the service is allready instanciated on parent window
        if (modVis.requestHandler) {
            return modVis.requestHandler;
        }
        modVis.requestHandler = {};
        
        /****************************************
         * Diagram
         ***************************************/
        
        /**
    	 * @public bind
    	 * Send sk-bind request to the server.
    	 * 
    	 * @param skId
    	 */
        modVis.requestHandler.bind = function(skId) {
        	var request = {bind:[]};
        	request.bind.push({id:skId}); 
        	$api.send(request);
    	};
    	
        /**
    	 * @public unbind
    	 * Send sk-unbind request to the server.
    	 * 
    	 * @param skId
    	 */
        modVis.requestHandler.unbind = function(skId) {
        	var request = {unbind:[]};
        	request.unbind.push({id:skId}); 
        	$api.send(request);
    	};
        
        /**
    	 * @public setMode
    	 * Send current mode to the server.
    	 * 
    	 * @param  modulId 
    	 * @param {live, record} mode 
    	 */
        modVis.requestHandler.setMode = function(modulId, mode) {
        	var request = {update:[]};
        	if (utility.isArrayEmpty(modulId)) {
        		request.update.push({mode:mode}); 
        	} else {
        		request.update.push({mode:mode, modulId:modulId}); 
        	}
        	$api.send(request);
    	};
        
        /**
    	 * @public getCrcValue
    	 * Send current mode to the server.
    	 * 
    	 * @param modulId 
    	 */
        modVis.requestHandler.getCrcValue = function(modulId) {
        	var request = null;
        	if (utility.isArrayEmpty(modulId)) {
        		request = {crc: "get"};
        	} else {
        		request = {crc: "get", modulId:modulId};
        	}
        	$api.send(request);
    	};
        
        /**
    	 * @public getAvailableRecordFile
    	 * Send available record files request to the server.
    	 * The Server returns all available record files from the server.
    	 * 
    	 * @param modulId 
    	 */
        modVis.requestHandler.getAvailableRecordFile = function(modulId) {
        	var request = null;
        	if (utility.isArrayEmpty(modulId)) {
        		request = {recfiles: "get"};
        	} else {
        		request = {recfiles: "get", modulId:modulId};
        	}
        	$api.send(request);
    	};
        
        /**
    	 * @public getRecordFile
    	 * Request a specific record file from the server.
    	 * 
    	 * @param modulId 
    	 * @param file {any file from the available record file request}
    	 */
        modVis.requestHandler.getRecordFile = function(modulId, file) {
        	var request = null;
        	if (utility.isArrayEmpty(modulId)) {
        		request = {recfile: file};
        	} else {
        		request = {recfile: file, modulId:modulId};
        	}
        	$api.send(request);
    	};
        
    	/****************************************
         * Explorer Tree
         ***************************************/
    	
        /**
    	 * @public getExplorerTreeConfig
    	 * Send request to get the explorer config tree from the server.
    	 */
        modVis.requestHandler.getExplorerTreeConfig = function() {
        	var request = {tree: "get"};
        	$api.send(request);
    	};
    	
    	/**
    	 * @public setConfig
    	 * Send config request to the server.
    	 */
        modVis.requestHandler.setConfig = function() {
        	var request = {config: {selectedconfig: $settings.configNumber}};
        	$api.send(request);
    	};
    	
    	/****************************************
         * Value
         ***************************************/
    	
    	/**
    	 * @public bindValue
    	 * Send sk-bind request to the server.
    	 * 
    	 * @param skId
    	 */
        modVis.requestHandler.bindValue = function(valueId, cycletime) {
        	var request = {bindValue:[]};
        	request.bindValue.push({id:valueId, cycletime:cycletime}); 
        	$api.send(request);
    	};
    	
        /**
    	 * @public unbindValue
    	 * Send sk-unbind request to the server.
    	 * 
    	 * @param skId
    	 */
        modVis.requestHandler.unbindValue = function(valueId) {
        	var request = {unbindValue:[]};
        	request.unbindValue.push({id:valueId}); 
        	$api.send(request);
    	};
    	
    	/****************************************
         * Action
         ***************************************/
    	
        /**
    	 * @public setAction
    	 * send any action to the server.
    	 * 
    	 * @param id {Action id}
    	 * @param value {Value id}
    	 */
        modVis.requestHandler.sendAction = function(id, value) {
        	var request = {action:[]};
        	request.action.push({id:id, value:value}); 
        	$api.send(request);
    	};
    	
    	/****************************************
         * TestBench
         ***************************************/
        
    	/**
    	 * @public startTestbench
    	 * send startTestbench to the server.
    	 */
    	modVis.requestHandler.startTestbench = function() {
    		var request = {testbenchState: "start"};
        	$api.send(request);
    	};
    	
    	/**
    	 * @public resetTestbench
    	 * send resetTestbench to the server.
    	 */
    	modVis.requestHandler.resetTestbench = function() {
    		var request = {testbenchState: "reset"};
        	$api.send(request);
    	};
    	
    	/**
    	 * @public sendTestbenchEvent
    	 * send sendTestbenchEvent to the server.
    	 * 
    	 * @param id {Test Event id}
    	 * @param value {Test Event Value id}
    	 */
    	modVis.requestHandler.sendTestbenchEvent = function(id, value, index) {
    		var request = {testbenchEvent : {id:id}};
    		if (value != null && index != null) {
    			request = {testbenchEvent: {id:id, value:value, index:index}};
    		} else 
    		if (value != null) {
    			request = {testbenchEvent: {id:id, value:value}};
    		} else 
        	if (index != null) {
        		request = {testbenchEvent: {id:id, index:index}};
        	}
        	$api.send(request);
    	};
    	
    	/**
    	 * @public sendRequiredOutput
    	 * send sendRequiredOutput to the server.
    	 * 
    	 * @param id {Test Event id}
    	 * @param value {Test Event Value id}
    	 */
    	modVis.requestHandler.sendRequiredOutput = function(id, value, index) {
    		var request = {requiredOutput: {id:id}};
    		if (value != null && index != null) {
    			request = {requiredOutput: {id:id, value:value, index:index}};
    		} else 
    		if (value != null) {
    			request = {requiredOutput: {id:id, value:value}};
    		} else 
        	if (index != null) {
        		request = {requiredOutput: {id:id, index:index}};
        	}
    		$api.send(request);
    	};
    	
    	/**
    	 * @public connectTestsuite
    	 * send connectTestsuite to the server.
    	 */
    	modVis.requestHandler.connectTestsuite = function() {
    		var request = {testsuiteState: "connect"};
        	$api.send(request);
    	};
    	
    	/**
    	 * @public disconnectTestsuite
    	 * send disconnectTestsuite to the server.
    	 */
    	modVis.requestHandler.disconnectTestsuite = function() {
    		var request = {testsuiteState: "disconnect"};
        	$api.send(request);
    	};
    	
    	/**
    	 * @public connectTestsuite
    	 * send bindTestcase to the server.
    	 * 
    	 * @param testcase {Testcase name}
    	 */
    	modVis.requestHandler.bindTestcase = function(testcase) {
    		var request = {bindTestcase: testcase};
        	$api.send(request);
    	};
    	
    	/**
    	 * @public connectTestsuite
    	 * send stepTestcase to the server.
    	 */
    	modVis.requestHandler.stepTestcase = function() {
    		var request = {testcaseState: "step"};
        	$api.send(request);
    	};
    	
    	/**
    	 * @public connectTestsuite
    	 * send runTestcase to the server.
    	 */
    	modVis.requestHandler.runTestcase = function() {
    		var request = {testcaseState: "run"};
        	$api.send(request);
    	};
    	
    	/**
    	 * @public editTestcase
    	 * send editTestcase to the server.
    	 */
    	modVis.requestHandler.editTestcase = function() {
    		var request = {testcaseState: "edit"};
        	$api.send(request);
    	};
    	
        return modVis.requestHandler;
    }]);
    