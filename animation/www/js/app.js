'use strict';

/** 
* Inject Controllers, Services, Directives and Routes into Module App. 
*/
var App = window.App = angular.module('App',
  [
	'ngAnimate',
	'ngWebSocket',
    'ngRoute',
    'ngSanitize',
    'rzModule',
    
    'App.Config',
    'App.Api.Api',
    'App.Api.ErrorHandler',
    'App.Api.FileHandler',
    'App.Api.RequestHandler',
    
    'App.Control.DiagramCtrl',
    'App.Control.ErrorCtrl',
    'App.Control.ExplorerCtrl',
    'App.Control.ExplorerUtil',
    'App.Control.LogCtrl',
    'App.Control.ActionCtrl',
    'App.Control.ValueCtrl',
    'App.Control.BrowserCtrl',
    'App.Control.TestsuiteCtrl',
    
    'App.Service.AnimationStrategy',
    'App.Service.StatefullComponentService',
    'App.Service.ModulService',
    'App.Service.ModulContext',
    'App.Service.LogService',
    'App.Service.ValueSevice',
    'App.Service.TestsuiteService',
    
    'App.Directive.Animation',
    'App.Directive.Pannable',
    'App.Directive.Splitter',
    'App.Directive.Contextmenu',
    
    'App.Util.Utility',
    'App.Util.Routes',
    'App.Util.Assert'
    
  ]
);