(function(){
	'use strict';
	var rolesModule = angular.module('RolesModule', ['ngMaterial','ngRoute','ngStorage','ngCookies','ngMessages','pascalprecht.translate','http-auth-interceptor']);
	rolesModule.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){
		
		$routeProvider.when('/roles',{
			templateUrl: 'src/admin/roles/views/lista.html',
			controller: 'RolesCtrl',
		})
		.when('/roles/:id/editar',{
			templateUrl: 'src/admin/roles/views/editar.html',
			controller: 'EditarRolCtrl',
		})
		.when('/roles/nuevo',{
			templateUrl: 'src/admin/roles/views/nuevo.html',
			controller: 'NuevoRolCtrl',
		});
	}]);
})();