(function(){
	'use strict';
	angular.module('RequisicionesModule')
	   .factory('RequisicionesDataApi', ['$http','$window', 'URLS', function ($http, $window, URLS) {
	       return {
	           lista: function (params,success, error) {
	               $http.get(URLS.BASE_API + '/requisiciones',{params:params}).success(success).error(error)
	           },
			   ver: function (id, success, error) {
	               $http.get(URLS.BASE_API + '/requisiciones/' + id).success(success).error(error)
	           },
	           editar: function (id, data, success, error) {
	               $http.put(URLS.BASE_API + '/requisiciones/' + id, data).success(success).error(error)
	           },
	           sincronizar: function (id, success, error) {
	               $http.get(URLS.BASE_API + '/sincronizar-validacion/' + id).success(success).error(error)
	           },
	           editarActa: function (id, data, success, error) {
	               $http.put(URLS.BASE_API + '/actas/' + id, data).success(success).error(error)
	           }
	       };
	   }
	]);
})();