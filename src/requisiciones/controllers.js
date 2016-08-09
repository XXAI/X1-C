(function(){
	'use strict';
    angular.module('RequisicionesModule')
    .controller('RequisicionesCtrl',
    ['$rootScope', '$scope', 'RequisicionesDataApi', '$mdSidenav','$location','$http','URLS','$timeout','$mdBottomSheet','Auth','Menu','UsuarioData','$mdMedia','$mdDialog','$document','Mensajero', 
    function($rootScope, $scope, RequisicionesDataApi,$mdSidenav,$location,$http,URLS,$timeout,$mdBottomSheet,Auth, Menu, UsuarioData,$mdMedia,$mdDialog,$document,Mensajero){
        $scope.menuSelected = $location.path();
        $scope.menu = Menu.getMenu();
        $scope.menuIsOpen = false;
        $scope.loggedUser = UsuarioData.getDatosUsuario();

        $scope.filtro = {aplicado:false};
        $scope.menuFiltro = {estatus:'todos'};
        $scope.textoBuscado = '';

        $scope.permisoAgregar = 'B646BDDC8ADB8';
        $scope.permisoEliminar = '47DC5FB9FD13F';

        $scope.datosDelUsuario = {};
        $scope.cargasIniciales = {catalogos:false, listaRequisiciones:false};
        $scope.parametros = {};
        $scope.cargando = true;
        $scope.cargandoLista = false;
        $scope.smallScreen = !$mdMedia('gt-sm');

        //$scope.empleados = [];

        $scope.cargasIniciales.catalogos = true;
        if($scope.cargasIniciales.listaRequisiciones){
            $scope.cargando = false;
        }
        
        function parametrosFiltro(filtro){
            var parametros = {};

            for(var i in filtro){
                var elemento = filtro[i];
                if(typeof elemento === 'object'){
                    for(var j in elemento){
                        parametros[i+'['+j+']'] = elemento[j];
                    }
                }else{
                    parametros[i] = filtro[i];
                }
            }
            return parametros;
        };

        $scope.requisicionesInfinitas = {
          numLoaded_: 0,
          toLoad_: 0,
          requisiciones: [],
          maxItems:1,
          // Required.
          getItemAtIndex: function(index) {
            if (index >= this.numLoaded_) {
                if(this.numLoaded_ < this.maxItems){
                    this.fetchMoreItems_(index);
                }
                return null;
            }
            return this.requisiciones[index];
          },
          // Required.
          // For infinite scroll behavior, we always return a slightly higher
          // number than the previously loaded items.
          getLength: function() {
            if(this.numLoaded_ < this.maxItems){
                return this.numLoaded_ + 1;
            }else{
                return this.numLoaded_;
            }
          },
          fetchMoreItems_: function(index) {
            if(!$scope.cargandoLista){
                $scope.cargandoLista = true;
                
                var filtro = {};

                var parametros = parametrosFiltro({filtro:filtro});
                parametros.pagina = ((this.requisiciones.length)/50) + 1;
                if($scope.textoBuscado){
                    parametros.query = $scope.textoBuscado;
                }

                RequisicionesDataApi.lista(parametros,function (res) {
                    if($scope.requisicionesInfinitas.maxItems != res.totales){
                        $scope.requisicionesInfinitas.maxItems = res.totales;
                    }
                    
                    for (var i = 0; i < res.data.length; i++){
                        var obj = {
                            id: res.data[i].id,
                            folio: res.data[i].folio,
                            numero: res.data[i].numero,
                            pedido: res.data[i].pedido,
                            clues: res.data[i].clues,
                            tipo_requisicion: res.data[i].tipo_requisicion,
                            empresa: res.data[i].empresa_clave,
                            clues_nombre: res.data[i].clues_nombre,
                            estatus: res.data[i].estatus
                        };
                        
                        $scope.requisicionesInfinitas.requisiciones.push(obj);
                        $scope.requisicionesInfinitas.numLoaded_++;
                    }
                    $scope.cargandoLista = false;
                    $scope.cargasIniciales.listaRequisiciones = true;
                    if($scope.cargasIniciales.catalogos){
                        $scope.cargando = false;
                    }
                }, function (e, status) {
                    if(status == 403){
                        Mensajero.mostrarToast({contenedor:'#modulo-requisiciones',titulo:'Acceso Denegado:',mensaje:'No tiene permiso para listar estos elementos.'});
                    }else{
                        Mensajero.mostrarToast({contenedor:'#modulo-requisiciones',titulo:'Error:',mensaje:'Ocurrió un error al intentar listar los elementos.'});
                    }
                    $scope.requisicionesInfinitas.maxItems = 0;
                    $scope.cargandoLista = false;
                    $scope.cargando = false;
                    console.log(e);
                });
            }
          }
        };
        
        $scope.prepararBusqueda = function(){
            $mdSidenav('busqueda-filtro').open();
        }

        $scope.cancelarBusqueda = function(){
            $mdSidenav('busqueda-filtro').close();
        };

        $scope.quitarFiltro = function(){
            $scope.textoBuscado = '';
            $scope.textoBusqueda = '';
            $scope.menuFiltro = {estatus:'todos'};
            $scope.realizarBusqueda();
        };

        $scope.realizarBusqueda = function(){
            $scope.textoBuscado = $scope.textoBusqueda;
            $mdSidenav('busqueda-filtro').close();
            
            $scope.requisicionesInfinitas.numLoaded_ = 0;
            $scope.requisicionesInfinitas.toLoad_ = 0;
            $scope.requisicionesInfinitas.requisiciones = [];
            $scope.requisicionesInfinitas.maxItems = 1;
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
    }])
    .controller('VerRequisicionCtrl',
    ['$rootScope', '$scope', 'RequisicionesDataApi', '$mdSidenav','$location','$mdBottomSheet','$routeParams','$filter','$localStorage',
    '$http','$mdToast','Auth','Menu','URLS','UsuarioData','$mdDialog','$mdMedia','$window','Mensajero',
    function(
    $rootScope, $scope, RequisicionesDataApi,$mdSidenav,$location,$mdBottomSheet,$routeParams,$filter,$localStorage,
    $http,$mdToast,Auth,Menu,URLS,UsuarioData,$mdDialog,$mdMedia,$window,Mensajero
    ){
        $scope.menuSelected = "/requisiciones";
        $scope.menu = Menu.getMenu();
        $scope.menuIsOpen = false;
        $scope.loggedUser = UsuarioData.getDatosUsuario();
        $scope.toggleDatosRequisicion = true;

        $scope.cargando = true;

        RequisicionesDataApi.ver($routeParams.id,function(res){
            $scope.requisicion = res.data;

            for(var j in $scope.requisicion.insumos){
                var insumo_serv = $scope.requisicion.insumos[j];
                var insumo = {};
                
                insumo.descripcion = insumo_serv.descripcion;
                insumo.clave = insumo_serv.clave;
                insumo.lote = insumo_serv.lote;
                insumo.unidad = insumo_serv.unidad;
                insumo.precio = insumo_serv['precio_'+$scope.requisicion.empresa_clave];

                insumo.insumo_id = insumo_serv.id;
                insumo.cantidad = insumo_serv.pivot.cantidad_aprovada;
                insumo.total = parseFloat(insumo_serv.pivot.total_aprovado);
                insumo.requisicion_id = insumo_serv.pivot.requisicion_id;

                $scope.requisicion.insumos[j] = insumo;
            }
            $scope.cargando = false;
        },function(e){
            Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:'Ocurrió un error al intentar obtener los datos.'});
            console.log(e);
        });

        $scope.revisarRequisicion = function(){
            $scope.requisicion.estatus = undefined;
            $scope.cargando = true;
            RequisicionesDataApi.editar($scope.requisicion.id,$scope.requisicion,function(res){
                $scope.cargando = false;
                $location.path('actas/'+$scope.requisicion.acta_id+'/ver');
            },function(e){
                $scope.cargando = false;
                console.log(e);
                Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:'Ocurrión un error al intentar validar la requisicion.'});
            });
        };

        $scope.aprobarRequisicion = function(){
            $scope.requisicion.estatus = 2;
            $scope.cargando = true;
            RequisicionesDataApi.editar($scope.requisicion.id,$scope.requisicion,function(res){
                $scope.cargando = false;
            },function(e){
                $scope.requisicion.estatus = 1;
                $scope.cargando = false;
                console.log(e);
                Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:'Ocurrión un error al intentar aprobar la requisicion.'});
            });
        };

        $scope.imprimir = function(){
            /*$http.get(URLS.BASE_API + '/requisicion-pdf/' + $routeParams.id)
              .then(function (data) {     // data is your url
                  var file = new Blob([data], {type: 'application/pdf'});
                  var fileURL = URL.createObjectURL(file);
                  $window.open(fileURL);
              });
            */
            //RequisicionesDataApi.verPDF($routeParams.id,function(e){console.log(e)});
            window.open(URLS.BASE_API +'/requisicion-pdf/'+$routeParams.id);
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