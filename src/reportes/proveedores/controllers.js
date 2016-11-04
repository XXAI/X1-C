(function(){
	'use strict';
    angular.module('ReportesProveedoresModule')
    .controller('ReportesProveedoresCtrl',
    ['$rootScope', '$scope', 'ReportesProveedoresDataApi', '$mdSidenav','$location','$http','URLS','$timeout','$mdBottomSheet','Auth','Menu','UsuarioData','$mdMedia','$mdDialog','$document','Mensajero', 
    function($rootScope, $scope, ReportesProveedoresDataApi,$mdSidenav,$location,$http,URLS,$timeout,$mdBottomSheet,Auth, Menu, UsuarioData,$mdMedia,$mdDialog,$document,Mensajero){
        $scope.menuSelected = $location.path();
        $scope.menu = Menu.getMenu();
        $scope.menuIsOpen = false;
        $scope.loggedUser = UsuarioData.getDatosUsuario();

        $scope.filtro = {aplicado:false};
        $scope.menuFiltro = {estatus:'todos'};
        $scope.textoBuscado = '';

        //$scope.permisoRecibir = '721A42C7F4693';
        
        $scope.datosDelUsuario = {};
        $scope.cargasIniciales = {catalogos:false, listaProveedores:false};
        $scope.parametros = {};
        $scope.cargando = true;
        $scope.smallScreen = !$mdMedia('gt-sm');
        $scope.proveedores_con_filtro = [];
        $scope.proveedores = [];

        //$scope.empleados = [];
        $scope.colores = {
            1:'#FFCC00',
            2:'#FF9900',
            3:'#FF0000'
        };

        $scope.cargasIniciales.catalogos = true;

        if($scope.cargasIniciales.listaProveedores){
            $scope.cargando = false;
        }
        
        $scope.cargandoLista = true;

        ReportesProveedoresDataApi.lista(function (res) {
            for (var i = 0; i < res.data.length; i++){
                if(!res.data[i].total_lotes_recibidos){
                    res.data[i].total_lotes_recibidos = 0;
                }

                if(!res.data[i].total_claves_recibidas){
                    res.data[i].total_claves_recibidas = 0;
                }

                res.data[i].porcentaje_lotes = (res.data[i].total_lotes_recibidos*100)/res.data[i].total_lotes;
                res.data[i].porcentaje_claves = (res.data[i].total_claves_recibidas*100)/res.data[i].total_claves;

                if(res.data[i].porcentaje_lotes < 20){
                    res.data[i].atencion_lotes = $scope.colores[3];
                }else if(res.data[i].porcentaje_lotes < 30){
                    res.data[i].atencion_lotes = $scope.colores[2];
                }else if(res.data[i].porcentaje_lotes < 50){
                    res.data[i].atencion_lotes = $scope.colores[1];
                }else{
                    res.data[i].atencion_lotes = '#81d601';
                }

                if(res.data[i].porcentaje_claves < 20){
                    res.data[i].atencion_claves = $scope.colores[3];
                }else if(res.data[i].porcentaje_claves < 30){
                    res.data[i].atencion_claves = $scope.colores[2];
                }else if(res.data[i].porcentaje_claves < 50){
                    res.data[i].atencion_claves = $scope.colores[1];
                }else{
                    res.data[i].atencion_claves = '#81d601';
                }
            }

            $scope.cargandoLista = false;
            $scope.cargasIniciales.listaProveedores = true;
            if($scope.cargasIniciales.catalogos){
                $scope.cargando = false;
            }
            $scope.proveedores = res.data;
            $scope.proveedores_con_filtro = res.data;
        }, function (e, status) {
            if(status == 403){
                Mensajero.mostrarToast({contenedor:'#modulo-proveedores',titulo:'Acceso Denegado:',mensaje:'No tiene permiso para listar estos elementos.'});
            }else{
                Mensajero.mostrarToast({contenedor:'#modulo-proveedores',titulo:'Error:',mensaje:'Ocurrió un error al intentar listar los elementos.'});
            }
            $scope.cargandoLista = false;
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
    }])
    .controller('VerReporteProveedorCtrl',
    ['$rootScope', '$scope', 'ReportesProveedoresDataApi', '$mdSidenav','$location','$mdBottomSheet','$routeParams','$filter','$localStorage',
    '$http','$mdToast','Auth','Menu','URLS','UsuarioData','$mdDialog','$mdMedia','$window','Mensajero','ImprimirSolicitud',
    function(
    $rootScope, $scope, ReportesProveedoresDataApi,$mdSidenav,$location,$mdBottomSheet,$routeParams,$filter,$localStorage,
    $http,$mdToast,Auth,Menu,URLS,UsuarioData,$mdDialog,$mdMedia,$window,Mensajero,ImprimirSolicitud
    ){
        $scope.menuSelected = "/reportes-proveedores";
        $scope.menu = Menu.getMenu();
        $scope.menuIsOpen = false;
        $scope.loggedUser = UsuarioData.getDatosUsuario();
        $scope.toggleDatosActa = true;
        $scope.insumos_por_clues = {};
        $scope.cargando = true;
        $scope.nombres_clues = {};
        $scope.cargandoLista = false;
        $scope.proveedor = {};
        $scope.unidades = [];
        $scope.unidades_con_filtro = [];

        $scope.colores = {
            1:'#FFCC00',
            2:'#FF9900',
            3:'#FF0000'
        };

        $scope.cargasIniciales = {catalogos:false, listaUnidades:false};
        $scope.cargasIniciales.catalogos = true;

        if($scope.cargasIniciales.listaUnidades){
            $scope.cargando = false;
        }

        ReportesProveedoresDataApi.ver($routeParams.id,function (res) {
            
            for (var i = 0; i < res.data.clues.length; i++){
                if(!res.data.clues[i].total_lotes_recibidos){
                    res.data.clues[i].total_lotes_recibidos = 0;
                }

                if(!res.data.clues[i].total_claves_recibidas){
                    res.data.clues[i].total_claves_recibidas = 0;
                }

                res.data.clues[i].porcentaje_lotes = (res.data.clues[i].total_lotes_recibidos*100)/res.data.clues[i].total_lotes;
                res.data.clues[i].porcentaje_claves = (res.data.clues[i].total_claves_recibidas*100)/res.data.clues[i].total_claves;

                if(res.data.clues[i].porcentaje_lotes < 20){
                    res.data.clues[i].atencion_lotes = $scope.colores[3];
                }else if(res.data.clues[i].porcentaje_lotes < 30){
                    res.data.clues[i].atencion_lotes = $scope.colores[2];
                }else if(res.data.clues[i].porcentaje_lotes < 50){
                    res.data.clues[i].atencion_lotes = $scope.colores[1];
                }else{
                    res.data.clues[i].atencion_lotes = '#81d601';
                }

                if(res.data.clues[i].porcentaje_claves < 20){
                    res.data.clues[i].atencion_claves = $scope.colores[3];
                }else if(res.data.clues[i].porcentaje_claves < 30){
                    res.data.clues[i].atencion_claves = $scope.colores[2];
                }else if(res.data.clues[i].porcentaje_claves < 50){
                    res.data.clues[i].atencion_claves = $scope.colores[1];
                }else{
                    res.data.clues[i].atencion_claves = '#81d601';
                }
            }

            $scope.cargandoLista = false;
            $scope.cargasIniciales.listaUnidades = true;
            if($scope.cargasIniciales.catalogos){
                $scope.cargando = false;
            }
            $scope.proveedor = res.data.proveedor;
            $scope.unidades = res.data.clues;
            $scope.unidades_con_filtro = res.data.clues;
        }, function (e, status) {
            if(status == 403){
                Mensajero.mostrarToast({contenedor:'#modulo-proveedores-clues',titulo:'Acceso Denegado:',mensaje:'No tiene permiso para listar estos elementos.'});
            }else{
                Mensajero.mostrarToast({contenedor:'#modulo-proveedores-clues',titulo:'Error:',mensaje:'Ocurrió un error al intentar listar los elementos.'});
            }
            $scope.cargandoLista = false;
            $scope.cargando = false;
            console.log(e);
        });

        $scope.exportar = function(){
            window.open(URLS.BASE_API +'/exportar-csv/'+$routeParams.id);
        }
        
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
              templateUrl: './src/app/views/idiomas.html',
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
    }])
;
})();