(function(){
	'use strict';
	angular.module('PedidosModule')
	   .factory('PedidosDataApi', ['$http', 'URLS', function ($http, URLS) {
	       return {
	           lista: function (params,success, error) {
	               $http.get(URLS.BASE_API + '/pedidos',{params:params}).success(success).error(error)
	           },
			   ver: function (id, success, error) {
	               $http.get(URLS.BASE_API + '/pedidos/' + id).success(success).error(error)
	           },
	           editar: function (id, data, success, error) {
	               $http.put(URLS.BASE_API + '/pedidos/' + id, data).success(success).error(error)
	           }
	       };
	   }
	]);
})();