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
                            icono:'file-check',
                            folio: res.data[i].folio,
                            fecha_importacion: new Date(res.data[i].fecha_importacion),
                            fecha_validacion: new Date(res.data[i].fecha_validacion),
                            fecha_termino: undefined,
                            total_importe: 0,
                            clues_nombre:'Clues no encontrada en el catalogo',
                            estatus: res.data[i].estatus,
                            estatus_sincronizacion: res.data[i].estatus_sincronizacion,
                            estilo:{}
                        };

                        if(obj.estatus > 3 && obj.estatus_sincronizacion < 3){
                            obj.icono = 'sync-alert';
                        }else if(obj.estatus > 3){
                            obj.icono = 'file-lock';
                        }else{
                            obj.estilo = {
                                'color': 'black',
                                'font-weight': 'bold'
                            }
                            var hoy = new Date();
                            var fecha = obj.fecha_importacion;
                            var dias = Math.floor((hoy - fecha) / (1000 * 3600 * 24));
                            
                            if(dias > 4){
                                obj.estilo.color = 'darkred';
                            }
                        }

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
    ['$rootScope', '$scope', 'PedidosDataApi', '$mdSidenav','$location','$mdBottomSheet','$routeParams','$filter','$localStorage','$timeout',
    '$http','$mdToast','Auth','Menu','URLS','UsuarioData','$mdDialog','$mdMedia','$window','Mensajero','ImprimirPedido',
    function(
    $rootScope, $scope, PedidosDataApi,$mdSidenav,$location,$mdBottomSheet,$routeParams,$filter,$localStorage,$timeout,
    $http,$mdToast,Auth,Menu,URLS,UsuarioData,$mdDialog,$mdMedia,$window,Mensajero,ImprimirPedido
    ){
        $scope.menuSelected = "/pedidos";
        $scope.menu = Menu.getMenu();
        $scope.menuIsOpen = false;
        $scope.loggedUser = UsuarioData.getDatosUsuario();
        $scope.toggleDatosActa = true;
        $scope.aplicar_proveedor = {};

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

                if(requisicion.tipo_requisicion == 1){
                    requisicion.tipo_descripcion = 'Causes';
                }else if(requisicion.tipo_requisicion == 2){
                    requisicion.tipo_descripcion = 'No Causes';
                }else if(requisicion.tipo_requisicion == 3){
                    requisicion.tipo_descripcion = 'Materiales de Curación';
                }else if(requisicion.tipo_requisicion == 4){
                    requisicion.tipo_descripcion = 'Controlados';
                }else if(requisicion.tipo_requisicion == 5){
                    requisicion.tipo_descripcion = 'Surfactante Causes';
                }else if(requisicion.tipo_requisicion == 6){
                    requisicion.tipo_descripcion = 'Surfactante No Causes';
                }

                for(var j in requisicion.insumos){
                    var insumo = {};
                    
                    insumo.descripcion = requisicion.insumos[j].descripcion;
                    insumo.clave = requisicion.insumos[j].clave;
                    insumo.lote = requisicion.insumos[j].lote;
                    insumo.unidad = requisicion.insumos[j].unidad;
                    insumo.precio = requisicion.insumos[j].precio;

                    insumo.insumo_id = requisicion.insumos[j].id;
                    insumo.cantidad_validada = requisicion.insumos[j].pivot.cantidad_validada;
                    insumo.total_validado = parseFloat(requisicion.insumos[j].pivot.total_validado);
                    insumo.requisicion_id = requisicion.insumos[j].pivot.requisicion_id;

                    if(!requisicion.insumos[j].pivot.proveedor_id && (requisicion.tipo_requisicion == 5 || requisicion.tipo_requisicion == 6)){
                        insumo.proveedor_id = 8;
                    }else{
                        insumo.proveedor_id = requisicion.insumos[j].pivot.proveedor_id;
                    }

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
                    $scope.acta.estatus_sincronizacion = res.data.estatus_sincronizacion;
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

        $scope.aplicarAInsumos = function(){
            var insumos = $scope.acta.requisiciones[$scope.selectedIndex].insumos;
            var proveedor_seleccionado = $scope.aplicar_proveedor;
            
            for(var i in insumos){
                insumos[i].proveedor_id = proveedor_seleccionado.id;
            }
        };

        $scope.generarExcel = function(){
            window.open(URLS.BASE_API +'/pedidos-excel/'+$routeParams.id);
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

        $scope.imprimirPedido = function(ev){
            /*$http.get(URLS.BASE_API + '/requisicion-pdf/' + $routeParams.id)
              .then(function (data) {     // data is your url
                  var file = new Blob([data], {type: 'application/pdf'});
                  var fileURL = URL.createObjectURL(file);
                  $window.open(fileURL);
              });
            */
            //PedidosDataApi.verPDF($routeParams.id,function(e){console.log(e)});
            //window.open(URLS.BASE_API +'/pedidos-pdf/'+$routeParams.id);
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
            var locals = {
                acta_id: $scope.acta.id
            };
            $mdDialog.show({
                controller: function($scope, $mdDialog, acta_id) {
                    $scope.acta_id = acta_id;
                    $scope.cargando = true;
                    $scope.proveedores = {};
                    $scope.descargandoPedido = false;

                    PedidosDataApi.cargarPedidos(acta_id,function(res){
                        
                        for(var i in res.data.pedidos){
                            for(var j in res.data.pedidos[i]){
                                if(!$scope.proveedores[i]){
                                    $scope.proveedores[i] = {nombre:res.data.pedidos[i][j].proveedor,pedidos:[]};
                                }
                                $scope.proveedores[i].pedidos.push(res.data.pedidos[i][j]);
                            }
                        }

                        $scope.configuracion = res.data.configuracion;
                        $scope.empresa = res.data.empresa;
                        $scope.estatus = res.data.estatus
                        $scope.oficio_area_medica = res.data.oficio_area_medica;
                        $scope.folio = res.data.folio;

                        $scope.cargando = false;
                    },function(error){
                        $scope.cargando = false;
                    });

                    $scope.descargarPedido = function(pedido){
                        $scope.descargandoPedido = true;
                        pedido.cargando = true;
                        
                        ImprimirPedido.imprimir(pedido, $scope.empresa, $scope.configuracion, $scope.estatus, $scope.oficio_area_medica,$scope.folio)
                        .then(function(res){
                            $scope.descargandoPedido = false;
                            pedido.cargando = false
                        },function(err){
                            console.log('error');
                            Mensajero.mostrarToast({contenedor:'#modulo-dialogo',titulo:'Error:',mensaje:err});
                            $scope.descargandoPedido = false;
                            pedido.cargando = false
                        });
                    }

                    $scope.cancel = function() {
                        $scope.cargando = false;
                        $mdDialog.cancel();
                    };

                    $scope.answer = function(cerrar) {
                        $mdDialog.hide({yes:true});
                    };
                },
                templateUrl: 'src/pedidos/views/formatos-pedido.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                escapeToClose:true,
                fullscreen: useFullScreen,
                locals:locals
            })
            .then(function(res) {
                //$scope.actualizarTotal($scope.selectedIndex);
            }, function() {
                //console.log('cancelado');
            });
        };

        $scope.sincronizar = function(){
            $scope.cargando = true;
            PedidosDataApi.sincronizar($scope.acta.id,function(res){
                Mensajero.mostrarToast({contenedor:'#modulo-contenedor',mensaje:'Datos sincronizados con éxito.'});
                $scope.acta.estatus_sincronizacion = res.data.estatus_sincronizacion;
                $scope.cargando = false;
            },function(e){
                $scope.cargando = false;
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