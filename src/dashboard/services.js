(function(){
	'use strict';
	angular.module('DashboardModule')
	   	.factory('DashboardDataApi', ['$http', 'URLS', function ($http, URLS) {
	       return {
	        	cargarDatos: function (params,success, error) {
	            	$http.get(URLS.BASE_API + '/dashboard',{params:params}).success(success).error(error)
	           	}
	       };
	   	}]);
})();