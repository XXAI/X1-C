(function(){
	'use strict';
	angular.module('DashboardModule')
	   	.factory('DashboardDataApi', ['$http', 'URLS', function ($http, URLS) {
	       return {
	        	cargarDatos: function (success, error) {
	            	$http.get(URLS.BASE_API + '/dashboard').success(success).error(error)
	           	},
	           	configurarHabilitarCaptura: function(estatus,success,error){
	           		$http.get(URLS.BASE_API + '/habilitar-captura-acta/'+estatus).success(success).error(error)
	           	}
	       };
	   	}]);
})();