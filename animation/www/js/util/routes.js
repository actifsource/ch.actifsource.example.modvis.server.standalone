'use strict';

/** Module which specifies the allowed routes */
angular.module('App.Util.Routes', [])

	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
		.when('/', {
						templateUrl: 'partials/empty-page.html'})
		
		.when('/diagram/:treeNodeNumber', { 
						templateUrl: 'partials/diagram.html',
						controller: 'DiagramCtrl'})
						
		.when('/multidiagram/:treeNodeNumber', { 
						templateUrl: 'partials/multi-diagram.html',
						controller: 'MultiDiagramCtrl'})
						
		.when('/simplediagram/:treeNodeNumber', { 
						templateUrl: 'partials/simple-diagram.html',
						controller: 'SimpleDiagramCtrl'})
						
		.when('/actiondiagram/:treeNodeNumber', { 
						templateUrl: 'partials/action-diagram.html',
						controller: 'ActionCtrl'})
						
		.when('/valuediagram/:treeNodeNumber', { 
						templateUrl: 'partials/value-diagram.html',
						controller: 'ValueCtrl'})
		.when('/logdiagram', { 
						templateUrl: 'partials/log-diagram.html',
						controller: 'LogCtrl'})	
				
		.when('/testsuitediagram', { 
						templateUrl: 'partials/testsuite-diagram.html',
						controller: 'TestsuiteCtrl'})	
							
		.otherwise({
			redirectTo : '/'
		});
}]);