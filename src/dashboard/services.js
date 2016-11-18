(function(){
	'use strict';
	angular.module('DashboardModule')
	   	.factory('DashboardDataApi', ['$http', 'URLS', function ($http, URLS) {
	       return {
	        	cargarDatos: function (success, error) {
	            	$http.get(URLS.BASE_API + '/dashboard').success(success).error(error)
	           	},
	           	configurarHabilitarCapturaOtros: function(estatus,success,error){
	           		$http.get(URLS.BASE_API + '/habilitar-captura-acta/'+estatus+'?tipo=otros').success(success).error(error)
	           	},
	           	configurarHabilitarCapturaExfarma: function(estatus,success,error){
	           		$http.get(URLS.BASE_API + '/habilitar-captura-acta/'+estatus+'?tipo=exfarma').success(success).error(error)
	           	}
	       };
	   	}]);
})();