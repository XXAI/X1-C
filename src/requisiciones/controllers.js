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
                if($scope.filtro.estatus != 'todos'){
                    filtro.estatus = $scope.filtro.estatus;
                }

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
                            fecha_importacion: new Date(res.data[i].fecha_importacion),
                            fecha_validacion: undefined,
                            total_importe: 0,
                            clues_nombre:'Clues no encontrada en el catalogo',
                            estatus: res.data[i].estatus
                        };

                        if(res.data[i].fecha_validacion){
                            obj.fecha_validacion = new Date(res.data[i].fecha_validacion);
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
            $scope.filtro.estatus = $scope.menuFiltro.estatus;

            if($scope.filtro.estatus != 'todos'){
                $scope.filtro.aplicado = true;
            }else{
                $scope.filtro.aplicado = false;
            }

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
        $scope.toggleDatosActa = true;

        $scope.cargando = true;

        RequisicionesDataApi.ver($routeParams.id,function(res){
            $scope.acta = res.data;

            if($scope.acta.fecha){
                $scope.acta.fecha = new Date(res.data.fecha+' 00:00:00');
            }

            if($scope.acta.fecha_solicitud){
                $scope.acta.fecha_solicitud = new Date(res.data.fecha_solicitud+' 00:00:00');
            }else{
                $scope.acta.fecha_solicitud = new Date();
            }

            //$scope.acta.insumos = [];
            //$scope.acta.subtotal = 0;
            //$scope.acta.total = 0;
            //$scope.acta.firma_director = res.data.requisiciones[0].firma_director;
            //$scope.acta.firma_solicita = res.data.requisiciones[0].firma_solicita;

            for(var i in $scope.acta.requisiciones){
                var requisicion = $scope.acta.requisiciones[i];
                if(requisicion.estatus){
                    requisicion.validado = true;
                    requisicion.sub_total = requisicion.sub_total_validado;
                    requisicion.gran_total = requisicion.gran_total_validado;
                    requisicion.iva = requisicion.iva_validado;
                }
                for(var j in requisicion.insumos){
                    var insumo = {};
                    
                    insumo.descripcion = requisicion.insumos[j].descripcion;
                    insumo.clave = requisicion.insumos[j].clave;
                    insumo.lote = requisicion.insumos[j].lote;
                    insumo.unidad = requisicion.insumos[j].unidad;
                    insumo.precio = requisicion.insumos[j].precio;

                    insumo.insumo_id = requisicion.insumos[j].id;
                    insumo.cantidad = requisicion.insumos[j].pivot.cantidad;
                    insumo.total = parseFloat(requisicion.insumos[j].pivot.total);
                    insumo.cantidad_aprovada = requisicion.insumos[j].pivot.cantidad_aprovada;
                    insumo.total_aprovado = parseFloat(requisicion.insumos[j].pivot.total_aprovado);
                    insumo.requisicion_id = requisicion.insumos[j].pivot.requisicion_id;

                    requisicion.insumos[j] = insumo;
                }
            }
            $scope.cargando = false;
        },function(e){
            Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:'Ocurrió un error al intentar obtener los datos.'});
            console.log(e);
        });

        $scope.cambiarValor = function(insumo){
            insumo.total_aprovado = insumo.cantidad_aprovada * insumo.precio;
            $scope.actualizarTotal($scope.selectedIndex);
        }

        $scope.guardarValidacion = function(ev){
            if($scope.validandoRequisicion != undefined){
                var confirm = $mdDialog.confirm()
                    .title('Validar requisición?')
                    .content('Las cantidades modificadas serán guardadas en la requisición.')
                    .targetEvent(ev)
                    .ok('Guardar')
                    .cancel('Cancelar');
                $mdDialog.show(confirm).then(function() {
                    $scope.cargando = true;
                    var requisicion = $scope.acta.requisiciones[$scope.selectedIndex];
                    requisicion.estatus = 1;
                    $scope.actualizarTotal($scope.selectedIndex);
                    RequisicionesDataApi.editar(requisicion.id,requisicion,function(res){
                        requisicion.validado = true;
                        $scope.validandoRequisicion = undefined;
                        $scope.cargando = false;
                    },function(e){
                        requisicion.estatus = undefined;
                        $scope.cargando = false;
                        console.log(e);
                        Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:'Ocurrión un error al intentar validar la requisicion.'});
                    });
                }, function() {});
            }
        }

        $scope.revisarRequisicion = function(){
            if($scope.validandoRequisicion == undefined){
                $scope.cargando = true;

                var requisicion = $scope.acta.requisiciones[$scope.selectedIndex];
                requisicion.estatus = undefined;

                RequisicionesDataApi.editar(requisicion.id,requisicion,function(res){
                    requisicion.estatus = res.data.estatus;
                    requisicion.validado = false;

                    requisicion.sub_total = res.data.sub_total;
                    requisicion.gran_total = res.data.gran_total;
                    requisicion.iva = res.data.iva;

                    $scope.cargando = false;
                },function(e){
                    $scope.cargando = false;
                    console.log(e);
                    Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:'Ocurrión un error al intentar validar la requisicion.'});
                });
            }
        };

        $scope.enviarSolicitud = function(ev){
            var confirm = $mdDialog.confirm()
                .title('Enviar formato de requisicion?')
                .content('El acta se enviará para realizar el pedido y ya no podrá editarse.')
                .targetEvent(ev)
                .ok('Enviar')
                .cancel('Cancelar');
            $mdDialog.show(confirm).then(function() {
                $scope.acta.estatus = 3;
                $scope.guardar();
            }, function() {});
        }

        $scope.guardar = function(){
            $scope.cargando = true;
            $scope.validacion = {};
            RequisicionesDataApi.editarActa($scope.acta.id,$scope.acta,function(res){
                Mensajero.mostrarToast({contenedor:'#modulo-contenedor',mensaje:'Datos guardados con éxito.'});
                $scope.cargando = false;
            },function(e){
                $scope.cargando = false;
                if($scope.acta.estatus == 3){
                    $scope.acta.estatus = 2;
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

        $scope.iniciarValidacion = function(){
            if(!$scope.acta.requisiciones[$scope.selectedIndex].validado){
                $scope.validandoRequisicion = $scope.selectedIndex;
                $scope.actualizarTotal($scope.selectedIndex);
            }else{
                Mensajero.mostrarToast({contenedor:'#modulo-contenedor',mensaje:'Esta requisición ya fue validada.'});
            }
        }

        $scope.cancelarValidacion = function(){
            $scope.validandoRequisicion = undefined;
            $scope.actualizarTotal($scope.selectedIndex);
        }

        $scope.actualizarTotal = function(index){
            var total = 0;
            var requisicion = $scope.acta.requisiciones[index];
            for(var i in requisicion.insumos){
                if($scope.validandoRequisicion != undefined || requisicion.validado){
                    total += requisicion.insumos[i].total_aprovado;
                }else{
                    total += requisicion.insumos[i].total;
                }
            }
            requisicion.sub_total = total;

            if(requisicion.tipo_requisicion == 3){
                requisicion.iva = total*16/100;
            }else{
                requisicion.iva = 0;
            }
            requisicion.gran_total = requisicion.iva + total;
        };

        $scope.imprimirOficio = function(){
            window.open(URLS.BASE_API +'/oficio-pdf/'+$routeParams.id);
        }

        $scope.imprimirSolicitudes = function(){
            /*$http.get(URLS.BASE_API + '/requisicion-pdf/' + $routeParams.id)
              .then(function (data) {     // data is your url
                  var file = new Blob([data], {type: 'application/pdf'});
                  var fileURL = URL.createObjectURL(file);
                  $window.open(fileURL);
              });
            */
            //RequisicionesDataApi.verPDF($routeParams.id,function(e){console.log(e)});
            window.open(URLS.BASE_API +'/solicitudes-pdf/'+$routeParams.id);
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