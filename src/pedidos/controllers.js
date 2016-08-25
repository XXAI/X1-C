(function(){
	'use strict';
    angular.module('PedidosModule')
    .controller('PedidosCtrl',
    ['$rootScope', '$scope', 'PedidosDataApi', '$mdSidenav','$location','$http','URLS','$timeout','$mdBottomSheet','Auth','Menu','UsuarioData','$mdMedia','$mdDialog','$document','Mensajero', 
    function($rootScope, $scope, PedidosDataApi,$mdSidenav,$location,$http,URLS,$timeout,$mdBottomSheet,Auth, Menu, UsuarioData,$mdMedia,$mdDialog,$document,Mensajero){
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
        $scope.cargasIniciales = {catalogos:false, listaPedidos:false};
        $scope.parametros = {};
        $scope.cargando = true;
        $scope.cargandoLista = false;
        $scope.smallScreen = !$mdMedia('gt-sm');

        //$scope.empleados = [];

        $scope.cargasIniciales.catalogos = true;
        if($scope.cargasIniciales.listaPedidos){
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

        $scope.pedidosInfinitos = {
          numLoaded_: 0,
          toLoad_: 0,
          pedidos: [],
          maxItems:1,
          // Required.
          getItemAtIndex: function(index) {
            if (index >= this.numLoaded_) {
                if(this.numLoaded_ < this.maxItems){
                    this.fetchMoreItems_(index);
                }
                return null;
            }
            return this.pedidos[index];
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

                if($scope.filtro.estatus != 'todos'){
                    filtro.estatus = $scope.filtro.estatus;
                }

                var parametros = parametrosFiltro({filtro:filtro});
                parametros.pagina = ((this.pedidos.length)/50) + 1;
                if($scope.textoBuscado){
                    parametros.query = $scope.textoBuscado;
                }

                PedidosDataApi.lista(parametros,function (res) {
                    if($scope.pedidosInfinitos.maxItems != res.totales){
                        $scope.pedidosInfinitos.maxItems = res.totales;
                    }
                    
                    for (var i = 0; i < res.data.length; i++){
                        var obj = {
                            id: res.data[i].id,
                            folio: res.data[i].folio,
                            fecha_importacion: new Date(res.data[i].fecha_importacion),
                            fecha_validacion: new Date(res.data[i].fecha_validacion),
                            fecha_termino: undefined,
                            total_importe: 0,
                            clues_nombre:'Clues no encontrada en el catalogo',
                            estatus: res.data[i].estatus
                        };

                        if(res.data[i].fecha_termino){
                            obj.fecha_termino = new Date(res.data[i].fecha_termino);
                        }

                        if(res.data[i].unidad_medica){
                            obj.clues_nombre = res.data[i].unidad_medica.nombre;
                        }

                        for(var j in res.data[i].requisiciones){
                            var requisicion = res.data[i].requisiciones[j];
                            if(requisicion.estatus){
                                obj.total_importe += parseFloat(requisicion.gran_total_validado);
                            }
                        }
                        
                        $scope.pedidosInfinitos.pedidos.push(obj);
                        $scope.pedidosInfinitos.numLoaded_++;
                    }
                    $scope.cargandoLista = false;
                    $scope.cargasIniciales.listaPedidos = true;
                    if($scope.cargasIniciales.catalogos){
                        $scope.cargando = false;
                    }
                }, function (e, status) {
                    if(status == 403){
                        Mensajero.mostrarToast({contenedor:'#modulo-pedidos',titulo:'Acceso Denegado:',mensaje:'No tiene permiso para listar estos elementos.'});
                    }else{
                        Mensajero.mostrarToast({contenedor:'#modulo-pedidos',titulo:'Error:',mensaje:'Ocurrió un error al intentar listar los elementos.'});
                    }
                    $scope.pedidosInfinitos.maxItems = 0;
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
            $scope.filtro.estatus = $scope.menuFiltro.estatus;

            if($scope.filtro.estatus != 'todos'){
                $scope.filtro.aplicado = true;
            }else{
                $scope.filtro.aplicado = false;
            }

            $scope.textoBuscado = $scope.textoBusqueda;
            $mdSidenav('busqueda-filtro').close();
            
            $scope.pedidosInfinitos.numLoaded_ = 0;
            $scope.pedidosInfinitos.toLoad_ = 0;
            $scope.pedidosInfinitos.pedidos = [];
            $scope.pedidosInfinitos.maxItems = 1;
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
    .controller('VerPedidoCtrl',
    ['$rootScope', '$scope', 'PedidosDataApi', '$mdSidenav','$location','$mdBottomSheet','$routeParams','$filter','$localStorage',
    '$http','$mdToast','Auth','Menu','URLS','UsuarioData','$mdDialog','$mdMedia','$window','Mensajero',
    function(
    $rootScope, $scope, PedidosDataApi,$mdSidenav,$location,$mdBottomSheet,$routeParams,$filter,$localStorage,
    $http,$mdToast,Auth,Menu,URLS,UsuarioData,$mdDialog,$mdMedia,$window,Mensajero
    ){
        $scope.menuSelected = "/pedidos";
        $scope.menu = Menu.getMenu();
        $scope.menuIsOpen = false;
        $scope.loggedUser = UsuarioData.getDatosUsuario();
        $scope.toggleDatosActa = true;

        $scope.cargando = true;

        PedidosDataApi.ver($routeParams.id,function(res){
            $scope.acta = res.data;

            $scope.proveedores = res.proveedores;

            if($scope.acta.fecha_solicitud){
                $scope.acta.fecha_solicitud = new Date(res.data.fecha_solicitud+' 00:00:00');
            }

            if($scope.acta.fecha_pedido){
                $scope.acta.fecha_pedido = new Date(res.data.fecha_pedido+' 00:00:00');
            }else{
                $scope.acta.fecha_pedido = new Date();
            }

            if(!$scope.acta.num_oficio_pedido){
                $scope.acta.num_oficio_pedido = res.oficio;
            }

            for(var i in $scope.acta.requisiciones){
                var requisicion = $scope.acta.requisiciones[i];

                for(var j in requisicion.insumos){
                    var insumo = {};
                    
                    insumo.descripcion = requisicion.insumos[j].descripcion;
                    insumo.clave = requisicion.insumos[j].clave;
                    insumo.lote = requisicion.insumos[j].lote;
                    insumo.unidad = requisicion.insumos[j].unidad;
                    insumo.precio = requisicion.insumos[j].precio;

                    insumo.insumo_id = requisicion.insumos[j].id;
                    insumo.cantidad_aprovada = requisicion.insumos[j].pivot.cantidad_aprovada;
                    insumo.total_aprovado = parseFloat(requisicion.insumos[j].pivot.total_aprovado);
                    insumo.requisicion_id = requisicion.insumos[j].pivot.requisicion_id;
                    insumo.proveedor_id = requisicion.insumos[j].pivot.proveedor_id;

                    requisicion.insumos[j] = insumo;
                }
            }
            $scope.cargando = false;
        },function(e){
            Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:'Ocurrió un error al intentar obtener los datos.'});
            console.log(e);
        });
        
        $scope.validarPedido = function(ev){
            var confirm = $mdDialog.confirm()
                .title('Validar pedido?')
                .content('El pedido sera validado y ya no podrá editarse.')
                .targetEvent(ev)
                .ok('Validar')
                .cancel('Cancelar');
            $mdDialog.show(confirm).then(function() {
                $scope.acta.estatus = 4;
                $scope.guardar();
            }, function() {});
        };

        $scope.guardar = function(){
            $scope.cargando = true;
            $scope.validacion = {};
            PedidosDataApi.editar($scope.acta.id,$scope.acta,function(res){
                Mensajero.mostrarToast({contenedor:'#modulo-contenedor',mensaje:'Datos guardados con éxito.'});
                if(res.data.estatus == 4){
                    $scope.acta.num_oficio_pedido = res.data.num_oficio_pedido;
                }
                $scope.cargando = false;
            },function(e){
                $scope.cargando = false;
                if($scope.acta.estatus == 4){
                    $scope.acta.estatus = 3;
                }
                if(e.error_type == 'form_validation'){
                    Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:'Hay un error en los datos del formulario.'});
                    var errors = e.error;
                    for (var i in errors){
                        var error = JSON.parse('{ "' + errors[i] + '" : true }');
                        $scope.validacion[i] = error;
                    }
                }else if(e.error_type == 'data_validation'){
                    Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:e.error});
                }else{
                    Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:'Ocurrió un error al intentar guardar los datos.'});
                }
            });
        };
        
        $scope.imprimirNotificacion = function(){
            /*$http.get(URLS.BASE_API + '/requisicion-pdf/' + $routeParams.id)
              .then(function (data) {     // data is your url
                  var file = new Blob([data], {type: 'application/pdf'});
                  var fileURL = URL.createObjectURL(file);
                  $window.open(fileURL);
              });
            */
            //PedidosDataApi.verPDF($routeParams.id,function(e){console.log(e)});
            window.open(URLS.BASE_API +'/notificacion-pdf/'+$routeParams.id);
        };

        $scope.imprimirPedido = function(){
            /*$http.get(URLS.BASE_API + '/requisicion-pdf/' + $routeParams.id)
              .then(function (data) {     // data is your url
                  var file = new Blob([data], {type: 'application/pdf'});
                  var fileURL = URL.createObjectURL(file);
                  $window.open(fileURL);
              });
            */
            //PedidosDataApi.verPDF($routeParams.id,function(e){console.log(e)});
            window.open(URLS.BASE_API +'/pedidos-pdf/'+$routeParams.id);
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