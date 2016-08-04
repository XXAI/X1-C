(function(){
	'use strict';
    angular.module('App')
        .controller('SigninCtrl', ['$rootScope', '$scope', '$location', '$localStorage','$mdBottomSheet','$translate','$mdSidenav', 'Auth','MENU_PUBLICO','URLS', function ($rootScope, $scope, $location, $localStorage, $mdBottomSheet, $translate, $mdSidenav, Auth,  MENU_PUBLICO,URLS) {
           
            $scope.cargando = false;
            function successAuth(res) {
                $scope.cargando = false;
                $rootScope.errorSignin = null;
                $location.path("dashboard");
            }
            
            $scope.signin = function () {
                var formData = {
                    email: $scope.email,
                    password: $scope.password
                };
                $scope.cargando = true;

                Auth.signin(formData, successAuth, function(){
                    $scope.cargando = false;
                });
            };
            
            $scope.logout = function () {
                $scope.cargando = false;
                Auth.logout(function () {
                    $location.path("signin");
                });
            };
            
            $scope.access_token = $localStorage.plataforma_app.access_token;
            $scope.refresh_token = $localStorage.plataforma_app.refresh_token;
            
            $scope.urlOlvidePassword= URLS.OAUTH_CLIENTE + "/#/recuperar-password";
            $scope.urlOAuthInfo= URLS.OAUTH_CLIENTE + "/#/que-es";
            $scope.urlObtenerOAuth= URLS.OAUTH_CLIENTE + "/#/signin";
            
            $scope.menuSelected = '';
            
            $scope.ir = function(path){
                $scope.menuSelected = path;
                $location.path(path);
            };
            
            $scope.menuPublico = MENU_PUBLICO;
            
            $scope.mostrarIdiomas = function($event){                
                $mdBottomSheet.show({
                  templateUrl: 'src/app/views/idiomas.html',
                  controller: 'ListaIdiomasCtrl',
                  targetEvent: $event
                });
            };
            
            $scope.toggleMenu  = function  () {                
                $mdSidenav('left-publico').toggle();
            };
        }])
        .controller('InicioCtrl', ['$rootScope', '$scope', '$location', '$localStorage','$mdBottomSheet','$translate','$mdSidenav','Auth','MENU_PUBLICO','URLS', function ($rootScope, $scope, $location, $localStorage, $mdBottomSheet, $translate, $mdSidenav, Auth,MENU_PUBLICO,URLS) {
            
            $scope.menuSelected = '';
            
            $scope.ir = function(path){
                $scope.menuSelected = path;
                $location.path(path);
            };
            
            $scope.menuPublico = MENU_PUBLICO;
            
            $scope.mostrarIdiomas = function($event){                
                $mdBottomSheet.show({
                  templateUrl: 'src/app/views/idiomas.html',
                  controller: 'ListaIdiomasCtrl',
                  targetEvent: $event
                });
            };
            
            $scope.toggleMenu  = function  () {  
                $mdSidenav('left-publico').toggle();
            };
        }])
        .controller('QueEsCtrl', ['$rootScope', '$scope', '$location', '$localStorage','$mdBottomSheet','$translate','$mdSidenav','Auth','MENU_PUBLICO','URLS', function ($rootScope, $scope, $location, $localStorage, $mdBottomSheet, $translate, $mdSidenav, Auth,MENU_PUBLICO,URLS) {
            
            $scope.menuSelected = '';
            
            $scope.ir = function(path){
                $scope.menuSelected = path;
                $location.path(path);
            };
            
            $scope.menuPublico = MENU_PUBLICO;
            
            $scope.mostrarIdiomas = function($event){                
                $mdBottomSheet.show({
                  templateUrl: 'src/app/views/idiomas.html',
                  controller: 'ListaIdiomasCtrl',
                  targetEvent: $event
                });
            };
            
            $scope.toggleMenu  = function  () {  
                $mdSidenav('left-publico').toggle();
            };
        }])
        .controller('ListaIdiomasCtrl',['$scope','$mdBottomSheet','$translate',function($scope, $mdBottomSheet, $translate){
            
            $scope.items = [
                { codigo: 'es' },
                { codigo: 'en' },
                { codigo: 'ctu-MX' },
              ];
              $scope.idiomaSeleccionado = $translate.use();
              
              $scope.cambiarIdioma = function($index) {
                var clickedItem = $scope.items[$index];
                $translate.use(clickedItem.codigo);
                $mdBottomSheet.hide(clickedItem);
              };
        }])
        .controller('SimplePageCtrl', ['$rootScope', '$scope', '$mdSidenav','$location','$mdBottomSheet','Auth','Menu','UsuarioData', function($rootScope, $scope,$mdSidenav,$location,$mdBottomSheet,Auth, Menu, UsuarioData){
            
            $scope.menuSelected = $location.path();
            $scope.menuIsOpen = false;
            $scope.menu = Menu.getMenu();
            $scope.loggedUser = UsuarioData.getDatosUsuario();
            
            $scope.menuCerrado = !UsuarioData.obtenerEstadoMenu();
            if(!$scope.menuCerrado){
              $scope.menuIsOpen = true;
            }

            $scope.toggleMenu  = function(isSm) {
              if(!$scope.menuCerrado && !isSm){
                $mdSidenav('left').close();
                $scope.menuIsOpen = false;
                $scope.menuCerrado = true;
              }else{
                $mdSidenav('left').toggle();
                $scope.menuIsOpen = $mdSidenav('left').isOpen();
              }
              UsuarioData.guardarEstadoMenu($scope.menuIsOpen);
            };
            
            $scope.mostrarIdiomas = function($event){    
                            
                $mdBottomSheet.show({
                  templateUrl: 'src/app/views/idiomas.html',
                  controller: 'ListaIdiomasCtrl',
                  targetEvent: $event
                });
            };
            
            $scope.logout = function () {
               Auth.logout(function () {
                   $location.path("signin");
               });
            };
            
            $scope.ir = function(path){                
                $scope.menuSelected = path;
                $location.path(path);
            };
    		
    				
    	}]);
})();