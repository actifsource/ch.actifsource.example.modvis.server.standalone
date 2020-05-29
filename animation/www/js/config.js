'use strict';

/** module for specify services */
angular.module('App.Config', [])

    /** 
    * The constant $settings contains default values for the services
    *@constructor
    */
    .constant('$settings', {
    
        /* GeneralConfig */ 
    	configNumber: 1,
        browserMainTitle: 'Actifsource Animation',
    	browserPopupTitle: 'Actifsource Animation Popup',
        timeEncoding: 'UNIX_UTC_Timestamp_ms',
        browserTabIcon: 'img/actifsource_icon.png',
    	browserEmptyPageIcon : 'img/actifsource_logo.jpg',
    	
    	/* WebsocketConfig */
        websocketPort: '8080',
    	websocketPath: 'ws',
    	modulIdLength: 0,
    	
    	/* ExplorerTreeConfig */
    	showHiddenTreeNodes: true,
    	enableFilePartitioning: false,
    	
    	/* DiagramConfig */
    	enableLiveCRC: false,
        diagramEnableTimeSliderControl: true,
        diagramEnableZoomControl: true,
        diagramEnableNavigationControl: true,
    	
    	/* DiagramNavigatorConfig */
    	orderDiagramByLastModification: 'OrderByLastModification',
    	
    	/* StatefullComponentConfig */
    	statefullComponentDisposeDelay: 1000,
    	
    	/* RecordConfig */
    	enableRecordCRC: false,
    	enableShowRecordFile: true,
        recordControlFastStepCount: 10, 
        cacheElementStateSize: 1000,
    	
    	/* TraceConfig */
        logApiEnable: true,
        logControlEnable: true,
        logDirectivesEnable: true,
        logServiceEnable: true
    	
    });
/* Actifsource ID=[ffa8f784-6058-11e5-8054-39eee81289f5,532ad8c4-0307-11e6-b47b-f140d082a724,Hash] */
