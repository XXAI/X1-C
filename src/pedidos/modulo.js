(function(){
	'use strict';
	var pedidosModule = angular.module('PedidosModule', ['ngMaterial','ngRoute','ngStorage','ngCookies','ngMessages','pascalprecht.translate','http-auth-interceptor']);
	pedidosModule.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){
		$routeProvider.when('/pedidos',{
			templateUrl: 'src/pedidos/views/lista.html',
			controller: 'PedidosCtrl',
		})
		.when('/pedidos/:id/ver',{
			templateUrl: 'src/pedidos/views/ver.html',
			controller: 'VerPedidoCtrl',
		});
	}]);
})();