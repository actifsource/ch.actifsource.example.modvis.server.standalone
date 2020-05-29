
/** module for specify controllers */
angular.module('App.Control.BrowserCtrl', [])

	/************************************************************************************************************
	 * BrowserCtrl
	 * @constructor '$settings', '$scope'
	 ***********************************************************************************************************/
	.controller('BrowserCtrl', ['$settings', '$scope',
	                            function ($settings, $scope) {
		
		$scope.animation = {
				main_title : $settings.browserMainTitle,
				popup_title : $settings.browserPopupTitle,
				icon_Tab :  $settings.browserTabIcon, 
				icon_EmptyPage :  $settings.browserEmptyPageIcon
		};
		
	}]);