(function(){
	'use strict';
    angular.module('DashboardModule')
    .controller('DashboardCtrl',
    ['$rootScope', '$scope', 'DashboardDataApi', '$mdSidenav','$location','$mdBottomSheet','$timeout','Auth','Menu','UsuarioData',
    function($rootScope, $scope, DashboardDataApi,$mdSidenav,$location,$mdBottomSheet,$timeout,Auth, Menu, UsuarioData){
        $scope.menuSelected = $location.path();
        $scope.menuIsOpen = false;
        $scope.menu = Menu.getMenu();
        $scope.loggedUser = UsuarioData.getDatosUsuario();
        $scope.actas = [];
        $scope.actas_por_validar = 0;
        $scope.cargando = true;

        DashboardDataApi.cargarDatos(function(res){
          for(var i in res.data.actas){
            res.data.actas[i].fecha_importacion = new Date(res.data.actas[i].fecha_importacion);

            var hoy = new Date();
            var fecha = res.data.actas[i].fecha_importacion;
            var dias = Math.floor((hoy - fecha) / (1000 * 3600 * 24));

            res.data.actas[i].conteo_dias = dias;
          }
          $scope.actas = res.data.actas;
          $scope.actas_por_validar = res.data.actas_sin_validar;
          $scope.cargando = false;
        },function(e){
            Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:'Ocurrió un error al intentar obtener los datos.'});
            $scope.cargando = false;
            console.log(e);
        });

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