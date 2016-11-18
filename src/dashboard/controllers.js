(function(){
	'use strict';
    angular.module('DashboardModule')
    .controller('DashboardCtrl',
    ['$rootScope', '$scope', 'DashboardDataApi', '$mdSidenav','$location','$mdBottomSheet','$timeout','Auth','Menu','UsuarioData','Mensajero',
    function($rootScope, $scope, DashboardDataApi,$mdSidenav,$location,$mdBottomSheet,$timeout,Auth, Menu, UsuarioData,Mensajero){
        $scope.menuSelected = $location.path();
        $scope.menuIsOpen = false;
        $scope.menu = Menu.getMenu();
        $scope.loggedUser = UsuarioData.getDatosUsuario();
        $scope.actas = [];
        $scope.actas_por_validar = 0;
        $scope.actas_activas_otros = 0;
        $scope.actas_activas_exfarma = 0;
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

          if(res.data.actas_activas_otros == 1){
            $scope.actas_activas_otros = true;
          }else{
            $scope.actas_activas_otros = false;
          }

          if(res.data.actas_activas_exfarma == 1){
            $scope.actas_activas_exfarma = true;
          }else{
            $scope.actas_activas_exfarma = false;
          }
          
          $scope.cargando = false;
        },function(e){
            Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:'Ocurrió un error al intentar obtener los datos.'});
            $scope.cargando = false;
            console.log(e);
        });

        $scope.configurarCapturaOtros = function(){
          $scope.cargando = true;
          
          if($scope.actas_activas_otros){
            var estatus = 1;
          }else{
            var estatus = 0;
          }

          DashboardDataApi.configurarHabilitarCapturaOtros(estatus,function(res){
            var mensaje = 'Captura de Actas habilitada';
            if(!$scope.actas_activas_otros){
              mensaje = 'Captura de Actas deshabilitada';
            }
            Mensajero.mostrarToast({contenedor:'#modulo-contenedor',mensaje:mensaje});
            $scope.cargando = false;
          },function(e){
            $scope.actas_activas_otros = !$scope.actas_activas_otros;
            Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:'Ocurrió un error al intentar configurar la aplicación.'});
            $scope.cargando = false;
            console.log(e);
          });
        };

        $scope.configurarCapturaExfarma = function(){
          $scope.cargando = true;
          
          if($scope.actas_activas_exfarma){
            var estatus = 1;
          }else{
            var estatus = 0;
          }

          DashboardDataApi.configurarHabilitarCapturaExfarma(estatus,function(res){
            var mensaje = 'Captura de Actas para exfarma habilitada';
            if(!$scope.actas_activas_exfarma){
              mensaje = 'Captura de Actas para exfarma deshabilitada';
            }
            Mensajero.mostrarToast({contenedor:'#modulo-contenedor',mensaje:mensaje});
            $scope.cargando = false;
          },function(e){
            $scope.actas_activas_exfarma = !$scope.actas_activas_exfarma;
            Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:'Ocurrió un error al intentar configurar la aplicación.'});
            $scope.cargando = false;
            console.log(e);
          });
        };

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