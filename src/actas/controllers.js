(function(){
	'use strict';
    angular.module('ActasModule')
    .controller('ActasCtrl',
    ['$rootScope', '$scope', 'ActasDataApi', '$mdSidenav','$location','$http','URLS','$timeout','$mdBottomSheet','Auth','Menu','UsuarioData','$mdMedia','$mdDialog','$document','Mensajero', 
    function($rootScope, $scope, ActasDataApi,$mdSidenav,$location,$http,URLS,$timeout,$mdBottomSheet,Auth, Menu, UsuarioData,$mdMedia,$mdDialog,$document,Mensajero){
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
        $scope.cargasIniciales = {catalogos:false, listaActas:false};
        $scope.parametros = {};
        $scope.cargando = true;
        $scope.cargandoLista = false;
        $scope.smallScreen = !$mdMedia('gt-sm');
        $scope.mostrarBarraImportar = false;

        //$scope.empleados = [];

        $scope.cargasIniciales.catalogos = true;
        if($scope.cargasIniciales.listaActas){
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

        $scope.actasInfinitas = {
          numLoaded_: 0,
          toLoad_: 0,
          actas: [],
          maxItems:1,
          conErrores:0,
          cluesNoEncontradas:0,
          // Required.
          getItemAtIndex: function(index) {
            if (index >= this.numLoaded_) {
                if(this.numLoaded_ < this.maxItems){
                    this.fetchMoreItems_(index);
                }
                return null;
            }
            return this.actas[index];
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
                parametros.pagina = ((this.actas.length)/50) + 1;
                if($scope.textoBuscado){
                    parametros.query = $scope.textoBuscado;
                }

                ActasDataApi.lista(parametros,function (res) {
                    if($scope.actasInfinitas.maxItems != res.totales){
                        $scope.actasInfinitas.maxItems = res.totales;
                    }
                    
                    for (var i = 0; i < res.data.length; i++){
                        var obj = {
                            id: res.data[i].id,
                            folio: res.data[i].folio,
                            fecha: new Date(res.data[i].fecha + ' 00:00:00'),
                            estatus: res.data[i].estatus
                        };
                        
                        $scope.actasInfinitas.actas.push(obj);
                        $scope.actasInfinitas.numLoaded_++;
                    }
                    $scope.cargandoLista = false;
                    $scope.cargasIniciales.listaActas = true;
                    if($scope.cargasIniciales.catalogos){
                        $scope.cargando = false;
                    }
                }, function (e, status) {
                    if(status == 403){
                        Mensajero.mostrarToast({contenedor:'#modulo-actas',titulo:'Acceso Denegado:',mensaje:'No tiene permiso para listar estos elementos.'});
                    }else{
                        Mensajero.mostrarToast({contenedor:'#modulo-actas',titulo:'Error:',mensaje:'Ocurrió un error al intentar listar los elementos.'});
                    }
                    $scope.actasInfinitas.maxItems = 0;
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
            
            $scope.actasInfinitas.numLoaded_ = 0;
            $scope.actasInfinitas.toLoad_ = 0;
            $scope.actasInfinitas.actas = [];
            $scope.actasInfinitas.maxItems = 1;
        };

        $scope.mostrarImportar = function(ev) {
            $scope.mostrarBarraImportar = true;
        };

        $scope.cancelarImportar = function(){
            $scope.estatusCargandoDatosPlantilla = '';
            $scope.informacionArchivo = null;
            $scope.mostrarBarraImportar = false;
            input.val(null);
        };

        var input = angular.element($document[0].querySelector('input#input-file-id'));
        input.bind('change', function(e) {
          $scope.$apply(function() {
            $scope.cargandoDatosPlantilla = true;
            $scope.estatusCargandoDatosPlantilla = 'Subiendo archivo...';
            var files = e.target.files;
            if (files[0]) {
              $scope.informacionArchivo = files[0];
            } else {
              $scope.informacionArchivo = null;
            }
            if($scope.informacionArchivo){
                ActasDataApi.crear($scope.informacionArchivo,function(res){
                    $scope.cargandoDatosPlantilla = false;
                    $scope.estatusCargandoDatosPlantilla = '';
                    $scope.informacionArchivo = null;
                    $scope.mostrarBarraImportar = false;

                    $scope.actasInfinitas.numLoaded_ = 0;
                    $scope.actasInfinitas.toLoad_ = 0;
                    $scope.actasInfinitas.actas = [];
                    $scope.actasInfinitas.maxItems = 1;

                    input.val(null);
                    console.log(res);
                },function(e){
                    $scope.cargandoDatosPlantilla = false;
                    if(e.error.folio){
                        $scope.estatusCargandoDatosPlantilla = 'El acta con este folio ya existe...';
                    }else{
                        $scope.estatusCargandoDatosPlantilla = 'Error al subir archivo...';
                    }
                    console.log(e);
                });
            }
            
          });
        });
        
        $scope.eliminarActa = function(acta,ev){
            var confirm = $mdDialog.confirm()
                .title('Eliminar acta?')
                .content('¿Esta seguro de eliminar esta acta?')
                .targetEvent(ev)
                .ok('Eliminar')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(function() {
                $scope.cargando = true;
                ActasDataApi.eliminar(acta.id,function (res){
                    var index = $scope.actasInfinitas.actas.indexOf(acta);
                    $scope.actasInfinitas.actas.splice(index,1);
                    $scope.actasInfinitas.numLoaded_ -= 1;
                    $scope.actasInfinitas.maxItems -= 1;
                    
                    $scope.cargando = false;
                },function (e, status){
                    if(status == 403){
                        Mensajero.mostrarToast({contenedor:'#modulo-actas',titulo:'Acceso Denegado:',mensaje:'No tiene permiso para eliminar este elemento.'});
                    }else{
                        Mensajero.mostrarToast({contenedor:'#modulo-actas',titulo:'Error:',mensaje:'Ocurrió un error al intentar eliminar el empleado.'});
                    }
                    $scope.cargando = false;
                    console.log(e);
                });
            }, function() {});
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
    .controller('VerActaCtrl',
    ['$rootScope', '$scope', 'ActasDataApi', '$mdSidenav','$location','$mdBottomSheet','$routeParams','$filter','$localStorage',
    '$http','$mdToast','Auth','Menu','URLS','UsuarioData','$mdDialog','$mdMedia','Mensajero',
    function(
    $rootScope, $scope, ActasDataApi,$mdSidenav,$location,$mdBottomSheet,$routeParams,$filter,$localStorage,
    $http,$mdToast,Auth,Menu,URLS,UsuarioData,$mdDialog,$mdMedia,Mensajero
    ){
        $scope.menuSelected = "/actas";
        $scope.menu = Menu.getMenu();
        $scope.menuIsOpen = false;
        $scope.loggedUser = UsuarioData.getDatosUsuario();
        $scope.toggleDatosActa = true;

        $scope.cargando = true;

        ActasDataApi.ver($routeParams.id,function(res){
            $scope.acta = res.data;

            if($scope.acta.fecha){
                $scope.acta.fecha = new Date(res.data.fecha);
            }

            if($scope.acta.hora_inicio){
                var horaInicio = $scope.acta.hora_inicio.split(':')
                $scope.acta.hora_inicio_date =  new Date(1970, 0, 1, horaInicio[0], horaInicio[1], 0);
            }

            if($scope.acta.hora_termino){
                var horaTermino = $scope.acta.hora_termino.split(':')
                $scope.acta.hora_termino_date =  new Date(1970, 0, 1, horaTermino[0], horaTermino[1], 0);
            }

            $scope.acta.insumos = [];
            $scope.acta.subtotal = 0;
            $scope.acta.total = 0;
            $scope.acta.firma_director = res.data.requisiciones[0].firma_director;
            $scope.acta.firma_solicita = res.data.requisiciones[0].firma_solicita;

            for(var i in $scope.acta.requisiciones){
                var requisicion = $scope.acta.requisiciones[i];
                if(requisicion.estatus){
                    requisicion.validado = true;
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

        $scope.guardarValidacion = function(){
            if($scope.validandoRequisicion != undefined){
                $scope.cargando = true;
                var requisicion = $scope.acta.requisiciones[$scope.selectedIndex];
                requisicion.estatus = 1;
                $scope.actualizarTotal($scope.selectedIndex);
                ActasDataApi.validarRequisicion(requisicion.id,requisicion,function(res){
                    requisicion.validado = true;
                    $scope.validandoRequisicion = undefined;
                    $scope.cargando = false;
                },function(e){
                    $scope.cargando = false;
                    console.log(e);
                    Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Error:',mensaje:'Ocurrión un error al intentar validar la requisicion.'});
                });
            }
        }

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
            if(parseFloat(requisicion.iva) > 0){
                //
            }else{
                requisicion.gran_total = total;
            }
        };

        $scope.verRequisicion = function(){
            $scope.cargando = true;
            var requisicion = $scope.acta.requisiciones[$scope.selectedIndex];
            $location.path('requisiciones/'+requisicion.id+'/ver');
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