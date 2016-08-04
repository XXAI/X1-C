(function(){
	'use strict'
	
	var app = angular.module('App', 
								[
									'ngMaterial',
									'ngRoute',
									'ngStorage',
									'ngCookies',
									'ngResource',
									'ngMessages',
									'pascalprecht.translate',
									'http-auth-interceptor',
									'DashboardModule',
									'UsuariosModule',
									'RolesModule',
									'ActasModule']);
	   
	app.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider','$mdDateLocaleProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider,$mdDateLocaleProvider){
		$mdDateLocaleProvider.months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
		$mdDateLocaleProvider.shortMonths = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
		$mdDateLocaleProvider.days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
		$mdDateLocaleProvider.shortDays = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];
		// Can change week display to start on Monday.
		$mdDateLocaleProvider.firstDayOfWeek = 0;

		// Configuramos iconos
		$mdIconProvider
	      //.defaultIconSet("assets/svg/avatars.svg", 128)
	      .defaultIconSet('assets/svg/mdi.svg') //materialdesignicons set
		  
		  .icon("logo", "assets/svg/salud_id.svg", 48)
		  .icon("salud-id", "assets/svg/salud_id_white.svg", 48)
		  .icon("ssa", "assets/svg/secretaria_salud.svg", 128)
		  .icon("marca", "assets/svg/chiapas_nos_une.svg", 128)
		  .icon("escudo-chiapas-h", "assets/svg/escudo_chiapas_h.svg", 128)
		  
		  .icon("hearts-filled", "assets/svg/hearts_filled.svg", 128)
		  .icon("diabetes-filled", "assets/svg/diabetes_filled.svg", 128)
		  .icon("coronavirus-filled", "assets/svg/coronavirus_filled.svg", 128)
		  .icon("language", "assets/svg/ic_language_48px.svg", 48)
		  ;
		
		// Configuramos tema de material design
		$mdThemingProvider.theme('default')
	          	.primaryPalette('blue')
	          	.accentPalette('red');
	    $mdThemingProvider.theme('userInfoTheme')
	    		.primaryPalette('teal')
	    		.accentPalette('blue-grey')
	    		.backgroundPalette('blue-grey');
	    $mdThemingProvider.theme('dashboardTheme')
	        	.primaryPalette('deep-orange')
	        	.accentPalette('orange');
	    $mdThemingProvider.theme('altTheme')
	    		.primaryPalette('green')
	    		.accentPalette('light-green');
	    $mdThemingProvider.definePalette('greyPalette', {
            '50': 'eeeeee',
            '100': 'eeeeee',
            '200': 'eeeeee',
            '300': 'eeeeee',
            '400': 'eeeeee',
            '500': 'eeeeee',
            '600': 'eeeeee',
            '700': 'eeeeee',
            '800': 'eeeeee',
            '900': 'eeeeee',
            'A100': 'eeeeee',
            'A200': 'eeeeee',
            'A400': 'eeeeee',
            'A700': 'eeeeee',
            'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                                // on this palette should be dark or light
            'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
            '200', '300', '400', 'A100','500'],
            'contrastLightColors': undefined    // could also specify this if default was 'dark'
        });
        $mdThemingProvider.theme('grey', 'default')
				.primaryPalette('greyPalette');

			  
		// Configuramos las rutas
		
		$routeProvider.when('/',{
			templateUrl: 'src/app/views/inicio.html',
			controller: 'InicioCtrl',
		})
		.when('/que-es',{
			templateUrl: 'src/app/views/que-es.html',
			controller: 'QueEsCtrl',
		})
		.when('/signin',{
			templateUrl: 'src/app/views/signin.html',
			controller: 'SigninCtrl',
		})
		.when('/acceso-denegado',{
			templateUrl: 'src/app/views/forbidden.html',
			controller: 'SimplePageCtrl',
		})
		.when('/no-encontrado',{
			templateUrl: 'src/app/views/not-found.html',
			controller: 'SimplePageCtrl',
		})
		.when('/acerca-de',{
			templateUrl: 'src/app/views/acerca-de.html',
			controller: 'SimplePageCtrl',
		})
		.otherwise({ redirectTo: '/dashboard' });
		
		$httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
		   if(angular.isUndefined($localStorage.plataforma_app)){
			   $localStorage.plataforma_app = {}
		   }
		   return {
		       'request': function (config) {
		           config.headers = config.headers || {};
		           if ($localStorage.plataforma_app.access_token) {					   
		               config.headers.Authorization = 'Bearer ' + $localStorage.plataforma_app.access_token;
		               config.headers['X-Usuario'] = $localStorage.plataforma_app.user_email;
		           }
		           return config;
		       },
		       'responseError': function (response) {				 
		           	if (response.status === 401) {
		               	$location.path('signin');
		           	}
		           return $q.reject(response);
		       }
		   };
		}]);
		
		$translateProvider.useStaticFilesLoader({
			prefix:'src/app/i18n/',
			suffix: '.json'
		});
		
		$translateProvider.useLocalStorage();
		$translateProvider.preferredLanguage('es');
		$translateProvider.useSanitizeValueStrategy('escaped');		
	}]);
	
	app.run(['$rootScope','$location','$localStorage','$injector','authService','Menu',function($rootScope,$location, $localStorage, $injector, authService,Menu){

	
			$rootScope.$on('event:auth-loginRequired', function() {
				
				if($localStorage.plataforma_app.access_token){
					var Auth = $injector.get('Auth');
		      		
						Auth.refreshToken({ refresh_token: $localStorage.plataforma_app.refresh_token },
						   function(res){
								$localStorage.plataforma_app.access_token = res.access_token;
						  		$localStorage.plataforma_app.refresh_token = res.refresh_token;
								authService.loginConfirmed();
						   }, function (e) {                  
						       
						   		$rootScope.error = "CONNECTION_REFUSED";
								Auth.logout(function () {
						       	$location.path("/");
						   });
						       
						});
				}else{
					
					// Dejamos que pase la peticion porque ni siquiera hay un access_token
					authService.loginConfirmed();
				}
				
		    });
		
		$rootScope.$on('$routeChangeStart',function(event, next, current){
			if($localStorage.plataforma_app.access_token){
				if(typeof next.$$route !== 'undefined'){					
					var path =  next.$$route.originalPath.split('/');
					// Aquí deberiamos comprobar permisos para acciones de "subrutas"
					
					if(!Menu.existePath("/"+path[1]) && "/"+path[1] != '/acerca-de' && "/"+path[1] != '/acceso-denegado' && "/"+path[1] != '/no-encontrado' ){
						$location.path('/dashboard');
					}					
				}				
			}else{
				if(typeof next.$$route !== 'undefined'){
					if(next.$$route.originalPath != '/signin' && next.$$route.originalPath != '/que-es' && next.$$route.originalPath != '/'){
						$location.path('/');	
					}	
				}else{
					$location.path('/')
				}			
			}
		});
	}]);

})();