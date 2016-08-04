(function(){
	'use strict';
	var usuariosModule = angular.module('UsuariosModule', ['ngMaterial','ngRoute','ngStorage','ngCookies','ngMessages','pascalprecht.translate','http-auth-interceptor']);
	usuariosModule.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){
		
		$routeProvider.when('/usuarios',{
			templateUrl: 'src/admin/usuarios/views/lista.html',
			controller: 'UsuariosCtrl',
		})
		.when('/usuarios/:id/editar',{
			templateUrl: 'src/admin/usuarios/views/editar.html',
			controller: 'EditarUsuarioCtrl',
		})
		.when('/usuarios/nuevo',{
			templateUrl: 'src/admin/usuarios/views/nuevo.html',
			controller: 'NuevoUsuarioCtrl',
		});
	}]);
})();