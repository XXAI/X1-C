(function(){
	'use strict';
	var dashboardModule = angular.module('DashboardModule', ['ngMaterial','ngRoute','ngStorage','ngCookies','ngMessages','pascalprecht.translate','http-auth-interceptor']);
	dashboardModule.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){	
		$routeProvider.when('/dashboard',{
			templateUrl: 'src/dashboard/views/dashboard.html',
			controller: 'DashboardCtrl',
		});
	}]);
})();