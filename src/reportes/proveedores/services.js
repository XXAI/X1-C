(function(){
	'use strict';
	angular.module('ReportesProveedoresModule')
	   .factory('ReportesProveedoresDataApi', ['$http', 'URLS', function ($http, URLS) {
	       return {
	           lista: function (success, error) {
	               $http.get(URLS.BASE_API + '/reportes/proveedores').success(success).error(error)
	           },
			   ver: function (id, success, error) {
	               $http.get(URLS.BASE_API + '/reportes/proveedores/' + id).success(success).error(error)
	           },
	           exportar: function (id, success, error) {
	               $http.get(URLS.BASE_API + '/reportes/proveedores-excel/' + id).success(success).error(error)
	           }
	       };
	   }
	]);
})();