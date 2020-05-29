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
angular.module('App.Api.FileHandler', [])
    
	/***********************************************************************************************************
    * The fileHandler service provides functions, like pull files from the server.
    * @constructor $rootScope, assert, $api, $q, $settings, utility, $timeout
    ***********************************************************************************************************/
    .factory('fileHandler', ['$rootScope', 'assert', '$api', '$q', '$settings', 'utility', '$timeout', 
                             function($rootScope, assert, $api, $q, $settings, utility, $timeout) {  

        /* check if the service is allready instanciated on parent window */
        if (modVis.fileHandler) {
            return modVis.fileHandler;
        }
        modVis.fileHandler = {};
        
        /* this from the fileHandler */
        var fService = {explorerTree: null, explorerTreeRenumberCount: 0, explorerTreePartUpdateCount: 0, statefullComponentConfigNoPartitioning: null};
        
        /** 
        * @public getSVG
        * Pulls the SVG for the given diagramId.
        *
        * @param {String} diagramId
        * @returns {Promise}
        */
        modVis.fileHandler.getSVG = function (diagramId) {
        	assert.consoleLog_Api("'FileHandler' getSVG "+diagramId);
        	
            var deferred = $q.defer();
            $api.pull("gen/" + diagramId + ".svg", "xml").then(function (data) {
                deferred.resolve(data); 
            
            }, function (error) {
            	assert.throwReconnectMessage("SVG-File missing: " + diagramId + ".svg");
            
            });
            return deferred.promise;
        }
        
        /** 
         * @public getStatefullComponentConfig
         * Pulls the statefullComponent config for the given skId.
         *
         * @param skId
         * @returns {Promise}
         */
         modVis.fileHandler.getStatefullComponentConfig = function (skId) {
        	 assert.consoleLog_Api("'FileHandler' getStatefullComponentConfig "+skId);
        	 
        	 var deferred = $q.defer();
        	 if ($settings.enableFilePartitioning) {
        		 getStatefullComponentConfigPartitioning(skId, deferred);
        	 } else {
        		 getStatefullComponentConfigNoPartitioning(skId, deferred);
        	 }
        	 return deferred.promise;
        }
        
        /** 
        * @public getExpectedModulCRC
        * Pulls expected modul crc from modul.
        *
        * @param modulId
        * @returns {Promise}
        */
        modVis.fileHandler.getExpectedModulCRC = function (modulId) {
        	 assert.consoleLog_Api("'FileHandler' getExpectedModulCRC " + "["+utility.skIdAsString(modulId,",")+"]");
         	 
        	 var deferred = $q.defer();
        	 if ($settings.enableFilePartitioning) {
        		 getExpectedModulCRCPartitioning(modulId, deferred);
         	 } else {
         		getExpectedModulCRCNoPartitioning(modulId, deferred);
         	 }
         	 return deferred.promise;
        }
         
        /** 
        * @public getExplorerTree
        * Pulls the explorer tree.
        *
        * @returns {Promise}
        */
        modVis.fileHandler.getExplorerTree = function () {
       	   assert.consoleLog_Api("'FileHandler' getExplorerTree");
           	
           var deferred = $q.defer();
           if (fService.explorerTree == null) {
        	   
           	   $api.pull("gen/explorer-data.json", "json").then(function (data) {
           		   	
           		   /*File Partitioning*/
           		   if ($settings.enableFilePartitioning) {
           			   if (fService.explorerTree == null && fService.explorerTreePartUpdateCount == 0) {
	           		   		addExplorerPartition(data);
	           		   }
           			   syncForExplorerPartitionComplete(deferred);
           		   } else {
           			   fService.explorerTree = data;
           			   renumberTreeNodes(fService.explorerTree);
           			   deferred.resolve(fService.explorerTree);
           		   }
           		   
               }, function (error) {
               	assert.throwReconnectMessage("ExplorerTree missing: gen/explorer-data.json");
               });
           } else {
               deferred.resolve(fService.explorerTree);
           }
           return deferred.promise;
        }
          
        
        /** 
         * @public getTestsuite
         * Pulls the test suite.
         *
         * @returns {Promise}
         */
         modVis.fileHandler.getTestsuite = function () {
        	assert.consoleLog_Api("'FileHandler' getTestsuite");
            	
        	var deferred = $q.defer();
            $api.pull("gen/testsuite.json", "json").then(function (data) {
                deferred.resolve(data); 
            
            }, function (error) {
            	assert.throwReconnectMessage("Testsuite missing: gen/testsuite.json");
            
            });
            return deferred.promise;
         }
        
        /***********************************************
         * Internal Statefull config 
         ***********************************************/
        
        /** 
        * @private getStatefullComponentConfigPartitioning
        * 
        * @param skId
        * @param deferred
        */
        function getStatefullComponentConfigPartitioning(skId, deferred) {
         	 var url = "gen/mapping_"+utility.skIdAsString(skId, '_')+".json";
             $api.pull(url, "json").then(function (data) {
            	
                 deferred.resolve(data);
             }, function (error) {
            	 assert.throwReconnectMessage("Statefull component config missing: "+url);
             });
        }
        
        /** 
         * @private getStatefullComponentConfigNoPartitioning
         * 
         * @param skId
         * @param deferred
         */
         function getStatefullComponentConfigNoPartitioning(skId, deferred) {
        	 if (fService.statefullComponentConfig == null) {
	             var url = "gen/mapping.json";
	             $api.pull(url, "json").then(function (data) {
	            	 fService.statefullComponentConfigNoPartitioning = data;
	            	 var mapping = fService.statefullComponentConfigNoPartitioning["mapping_" + utility.skIdAsString(skId, '_')];
	            	 if(mapping == null) {
	            		 assert.throwReconnectMessage("Statefull component mapping missing: "+skId);
	            	 }
	            	 
	                 deferred.resolve(mapping);
	             }, function (error) {
	            	 assert.throwReconnectMessage("Statefull component config missing: "+url);
	             });
             } else {
            	 var mapping = fService.statefullComponentConfigNoPartitioning["mapping_" + utility.skIdAsString(skId, '_')];
	        	 if(mapping == null) {
	        		 assert.throwReconnectMessage("Statefull component mapping missing: "+skId);
	        	 }
	             deferred.resolve(mapping);
             }
        }
         
        /***********************************************
         * Internal ModulCRC 
         ***********************************************/
        
        /** 
         * @private getExpectedModulCRCPartitioning
         * Pulls expected modul crc from modul.
         *
         * @param skId
         * @param skId
         */
         function getExpectedModulCRCPartitioning(modulId, deferred) {
               var url = "gen/modul_"+utility.skIdAsString(modulId, '_')+".json";
               $api.pull(url, "json").then(function (data) {
              	
             	  var modul_crc = data.modul_crc;
             	  if(modul_crc == null) {
             		  assert.throwReconnectMessage("Modul CRC missing. 'Modul:' ["+utility.skIdAsString(modulId,",")+"]");
             	  }
                   deferred.resolve(modul_crc);
               }, function (error) {
             	  assert.throwReconnectMessage("Modul config missing: "+url);
               });
         }
        
         /** 
          * @private getExpectedModulCRC
          * Pulls expected modul crc from modul.
          *
          * @param skId
          * @param deferred
          */
          function getExpectedModulCRCNoPartitioning(modulId, deferred) {
	      	  var url = "gen/modul.json";
	          $api.pull(url, "json").then(function (data) {
           	
	        	  var modul = data["modul_"+utility.skIdAsString(modulId, '_')];
	              if (modul == null) {
	            	 assert.throwReconnectMessage("Modul config missing: "+modulId);
	              }
	          	  var modul_crc = modul.modul_crc;
	          	  if(modul_crc == null) {
	          		  assert.throwReconnectMessage("Modul CRC missing. 'Modul:' ["+utility.skIdAsString(modulId,",")+"]");
	          	  }
	              deferred.resolve(modul_crc);
	              
	            }, function (error) {
	          	  assert.throwReconnectMessage("Modul CRC config missing: "+url);
	          });
	          return deferred.promise;
          }
         
        /***********************************************
         * Internal Partitioning tree 
         ***********************************************/
        
        /**
         * @private waitForCompletionExplorerPartition
         * Wait for completion explorer tree.
         * 
         * @param data
         */
        function waitForCompletionExplorerPartition(data) {
        	if (fService.explorerTreePartUpdateCount == 0) {
        		renumberTreeNodes(data);
        		fService.explorerTree = data;
        		return;
        	}
        	/* retry init */
    		$timeout(function () {
    			waitForCompletionExplorerPartition(data);
            }, 200);
        }
        
        
        /**
         * @private syncForExplorerPartitionComplete
         * Wait for completion explorer tree.
         * 
         * @param deferred
         */
        function syncForExplorerPartitionComplete(deferred) {
        	if (fService.explorerTree != null) {
        		deferred.resolve(fService.explorerTree);
        		return;
        	}
        	/* retry init */
    		$timeout(function () {
    			syncForExplorerPartitionComplete(deferred);
            }, 200);
        }
        
        /**
        * @private initIterateExplorerData
        * iterate and renumber the treeNode number.
        * 
        * @param treeNode
        */
        function iterateExplorerPartition(treeNode) {
    		angular.forEach(treeNode.children, function (childTreeNode) {
    			if(childTreeNode.include_partFile!= null) {
    				var childPartitionTreeNode = childTreeNode;
    				fService.explorerTreePartUpdateCount++;
    				
        			$api.pull("gen/"+childPartitionTreeNode.include_partFile, "json").then(function (data) {
        				angular.forEach(data, function (partitionTreeNode) {
        					treeNode.children.push(partitionTreeNode);
        				});
        				fService.explorerTreePartUpdateCount--;
                   }, function (error) {
                	   assert.logWarning("Explorer tree part missing '"+treeNode.label+"' File: gen/"+childPartitionTreeNode.include_partFile);
                	   treeNode.st = childPartitionTreeNode.unavailable_st;
                	   fService.explorerTreePartUpdateCount--;
                   });
        		}
    			iterateExplorerPartition(childTreeNode);
    		});
        }
        	
        /**
         * @private initIterateExplorerData
         * iterate and renumber the treeNode number.
         * 
         * @param explorerData
         */
        function addExplorerPartition(explorerData) {
        	fService.explorerTreePartUpdateCount = 0;
        	angular.forEach(explorerData, function (treeNode) {
        		iterateExplorerPartition(treeNode);
        	});
        	waitForCompletionExplorerPartition(explorerData);
        }
          
        /***********************************************
         * Internal Renumber tree 
         ***********************************************/
        
        /**
     	* @private initIterateExplorerData
     	* iterate and renumber the treeNode number.
     	* 
     	* @param treeNode
     	*/
     	function iterateRenumberTreeNode(treeNode) {
     		treeNode.number = fService.explorerTreeRenumberCount;
     		fService.explorerTreeRenumberCount++;
 			
     		/* children */
     		angular.forEach(treeNode.children, function (childTreeNode) {
     			iterateRenumberTreeNode(childTreeNode);
     		});
     		/* actions */
     		angular.forEach(treeNode.actions, function (childTreeNode) {
     			iterateRenumberTreeNode(childTreeNode);
     		});
     		/* values */
     		angular.forEach(treeNode.values, function (childTreeNode) {
     			iterateRenumberTreeNode(childTreeNode);
     		});
     		/* links */
     		angular.forEach(treeNode.links, function (childTreeNode) {
     			iterateRenumberTreeNode(childTreeNode);
     		});
     		/* linkdiagrams */
     		angular.forEach(treeNode.linkdiagrams, function (childTreeNode) {
     			iterateRenumberTreeNode(childTreeNode);
     		});
     	}
     	
     	/**
     	 * @private initExplorerData
     	 * iterate and renumber the treeNode number.
     	 * 
     	 * @param explorerData
     	 */
     	function renumberTreeNodes(explorerData) {
     		fService.explorerTreeRenumberCount = 0;
     		
     		/* initExplorerData */
     		angular.forEach(explorerData, function (treeNode) {
     			iterateRenumberTreeNode(treeNode);
     		});
     	}
         
     	/************
    	 * Init
    	 ************/
     	
        /* retryError */
 		$rootScope.$on('resetError', function(event, data) {
 			fService.explorerTree = null;
 			fService.statefullComponentConfigNoPartitioning = null;
 			fService.explorerTreePartUpdateCount = 0;
 			fService.explorerTreeRenumberCount = 0;
 		});
 		
        return modVis.fileHandler;
    }]);
    