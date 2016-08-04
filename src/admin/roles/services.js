(function(){
	'use strict';
	angular.module('RolesModule')
	   .factory('RolesDataApi', ['$http', 'URLS', function ($http, URLS) {
	       return {
	           lista: function (params,success, error) {
	               $http.get(URLS.BASE_API + '/roles',{params:params}).success(success).error(error)
	           },
			   ver: function (id, success, error) {
	               $http.get(URLS.BASE_API + '/roles/' + id).success(success).error(error)
	           },
			   crear: function (data, success, error) {
	               $http.post(URLS.BASE_API + '/roles', data).success(success).error(error)
	           },
			   editar: function (id, data, success, error) {
	               $http.put(URLS.BASE_API + '/roles/' + id, data).success(success).error(error)
	           },
			   eliminar: function (id,  success, error) {
	               $http.delete(URLS.BASE_API + '/roles/' + id).success(success).error(error)
	           }
	       };
	   }
	   ]);
})();