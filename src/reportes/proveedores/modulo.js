(function(){
	'use strict';
	var reportesProveedoresModule = angular.module('ReportesProveedoresModule', ['ngMaterial','ngRoute','ngStorage','ngCookies','ngMessages','pascalprecht.translate','http-auth-interceptor']);
	reportesProveedoresModule.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){
		$routeProvider.when('/reportes-proveedores',{
			templateUrl: 'src/reportes/proveedores/views/lista.html',
			controller: 'ReportesProveedoresCtrl',
		})
		.when('/reportes-proveedores/:id/ver',{
			templateUrl: 'src/reportes/proveedores/views/proveedor-detalle-clues.html',
			controller: 'VerReporteProveedorCtrl',
		});
	}]);
})();