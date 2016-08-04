(function(){
	'use strict';
	angular.module('UsuariosModule')
	   .factory('UsuariosDataApi', ['$http', 'URLS', function ($http, URLS) {
	       return {
	           lista: function (params,success, error) {
	               $http.get(URLS.BASE_API + '/usuarios',{params:params}).success(success).error(error)
	           },
	           buscar: function (query,success, error) {
	               $http.get(URLS.BASE_API + '/usuarios?query='+query).success(success).error(error)
	           },
			   ver: function (id, success, error) {
	               $http.get(URLS.BASE_API + '/usuarios/' + id).success(success).error(error)
	           },
			   crear: function (data, success, error) {
	               $http.post(URLS.BASE_API + '/usuarios', data).success(success).error(error)
	           },
			   editar: function (id, data, success, error) {
	               $http.put(URLS.BASE_API + '/usuarios/' + id, data).success(success).error(error)
	           },
			   eliminar: function (id,  success, error) {
	               $http.delete(URLS.BASE_API + '/usuarios/' + id).success(success).error(error)
	           }
	       };
	   }
	]);
})();