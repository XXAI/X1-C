(function(){
	'use strict';
	angular.module('DashboardModule')
	   	.factory('DashboardDataApi', ['$http', 'URLS', function ($http, URLS) {
	       return {
	        	cargarDatos: function (success, error) {
	            	$http.get(URLS.BASE_API + '/dashboard').success(success).error(error)
	           	}
	       };
	   	}]);
})();