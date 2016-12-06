(function(){
	'use strict';
    angular.module('UsuariosModule')
    .controller('UsuariosCtrl',
    ['$rootScope', '$scope', 'UsuariosDataApi', '$mdSidenav','$location','$mdBottomSheet','$mdDialog', '$mdToast','Auth','Menu','UsuarioData', 
    function($rootScope, $scope, UsuariosDataApi,$mdSidenav,$location,$mdBottomSheet, $mdDialog, $mdToast,Auth, Menu, UsuarioData)
    {
        $scope.menuSelected = $location.path();
        $scope.menu = Menu.getMenu();
        $scope.menuIsOpen = false;
        $scope.loggedUser = UsuarioData.getDatosUsuario();
        $scope.mostrarBarraBusqueda = false;

        $scope.cargandoLista = false;
        $scope.cargando = true;
        
        $scope.usuariosInfinitos = {
          numLoaded_: 0,
          toLoad_: 0,
          usuarios: [],
          maxItems:1,
          // Required.
          getItemAtIndex: function(index) {
            if (index >= this.numLoaded_) {
                if(this.numLoaded_ < this.maxItems){
                    this.fetchMoreItems_(index);
                }
                return null;
            }
            return this.usuarios[index];
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
                $scope.cargando = true;
                var parametros = {};
                parametros.pagina = ((this.usuarios.length)/50) + 1;
                if($scope.textoBusqueda){
                    parametros.query = $scope.textoBusqueda;
                }
                UsuariosDataApi.lista(parametros,function (res) {
                    if($scope.usuariosInfinitos.maxItems != res.totales){
                        $scope.usuariosInfinitos.maxItems = res.totales;
                    }
                    for (var i = 0; i < res.data.length; i++){
                        var obj = {
                            id: res.data[i].id,
                            email: res.data[i].email
                        };
                        
                        $scope.usuariosInfinitos.usuarios.push(obj);
                        $scope.usuariosInfinitos.numLoaded_++;
                    }
                    $scope.cargandoLista = false;
                    $scope.cargando = false;
                }, function (e) {
                    $scope.cargandoLista = false;
                    $scope.cargando = false;
                });
            }
          }
        };

        $scope.eliminar = function($event, id, index) {
            var confirm = $mdDialog.confirm()
                  .title('¿Eliminar usuario?')
                  .content('El usuario ya no podra accesar a este sistema.')
                  .ariaLabel('Eliminar Usuario')
                  .targetEvent($event)
                  .ok('Eliminar')
                  .cancel('Cancelar');
            $mdDialog.show(confirm).then(function() {
                $scope.cargando = true; 
                UsuariosDataApi.eliminar(id,  function (res) {
                    $scope.cargando = false;      
                    $scope.usuarios.splice(index, 1);          
                }, function (e, status) {
                    if(status == 403){
                        $mdToast.show(
                          $mdToast.simple()
                            .content('No tiene permitido realizar esta acción')
                            .hideDelay(3000)
                        );
                    }
                    $scope.cargando = false;
                });
            }, function() {});
            
        };
        
        $scope.resetearLista = function(){
            $scope.mostrarBarraBusqueda = false;
            $scope.textoBusqueda = '';
            $scope.usuariosInfinitos.numLoaded_ = 0;
            $scope.usuariosInfinitos.toLoad_ = 0;
            $scope.usuariosInfinitos.usuarios = [];
            $scope.usuariosInfinitos.maxItems = 1;
        }

        $scope.prepararBusqueda = function(){
            $scope.mostrarBarraBusqueda = true;
        }

        $scope.realizarBusqueda = function(){
            $scope.usuariosInfinitos.numLoaded_ = 0;
            $scope.usuariosInfinitos.toLoad_ = 0;
            $scope.usuariosInfinitos.usuarios = [];
            $scope.usuariosInfinitos.maxItems = 1;
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
    .controller('EditarUsuarioCtrl',
    ['$rootScope', '$scope', 'UsuariosDataApi', '$mdSidenav','$location','$mdBottomSheet','$routeParams','$http','$mdToast','Auth','Menu','URLS','UsuarioData','$mdDialog','$controller','Mensajero',
    function($rootScope, $scope, UsuariosDataApi,$mdSidenav,$location,$mdBottomSheet,$routeParams,$http,$mdToast,Auth,Menu,URLS,UsuarioData,$mdDialog,$controller,Mensajero)
    {
            
        $scope.menuSelected = "/usuarios";
        $scope.menu = Menu.getMenu();
        $scope.menuIsOpen = false;
        $scope.loggedUser = UsuarioData.getDatosUsuario();
        $scope.seleccionoClues = false;

        $scope.cargando = true;
        
        UsuariosDataApi.ver($routeParams.id,function (res) {
            if(res.data != null){
                $scope.usuario = { 
                    id: res.data.id, 
                    email: res.data.email, 
                    roles: res.data.roles,
                    tipos_clues: []
                };
                $scope.tipos_clues = res.catalogos.tipos_clues;
                if(res.data.tipos_clues){
                    var tipos = res.data.tipos_clues.split(',');
                    for(var i in tipos){
                        var tipo = tipos[i];
                        for(var j in $scope.tipos_clues){
                            if(tipo == $scope.tipos_clues[j].id){
                                $scope.usuario.tipos_clues.push($scope.tipos_clues[j]);
                                break;
                            }
                        }
                    }
                }
            }
            $scope.cargando = false;
        }, function (e) {
            $scope.cargando = false;
            //$location.path('acceso-denegado');
            console.log(e);
        });

        $scope.toggleTipoClues = function(tipo,seleccionados){
            var idx = seleccionados.indexOf(tipo);
            if (idx > -1) seleccionados.splice(idx, 1);
            else seleccionados.push(tipo);
        };
        $scope.existsTipoClues = function (tipo, seleccionados) {
            return seleccionados.indexOf(tipo) > -1;
        };
        
        $scope.guardar = function() {
            $scope.cargando = true;
            UsuariosDataApi.editar($routeParams.id, $scope.usuario, function (res) {
                Mensajero.mostrarToast({contenedor:'#modulo-contenedor',mensaje:'Datos guardados con éxito.'});
                $scope.cargando = false;                   
            }, function (e,status) {
                $scope.cargando = false;
                if(status != 403){
                    $scope.validacion = {}; 
                    var errors = e.error;
                    for (var i in errors){
                        var error = JSON.parse('{ "' + errors[i] + '" : true }');
                        $scope.validacion[i] = error;
                    }
                }else{
                    Mensajero.mostrarToast({contenedor:'#modulo-contenedor',titulo:'Acceso Denegado:',mensaje:'No tiene permitido realizar esta acción.'});
                }
            });
        };

        $scope.cargarPermisos = function(event){
            var ctrl = angular.element(event.currentTarget).controller('mdChips');
            if(ctrl !== undefined){
                var selectedChip = ctrl.items[ctrl.selectedChip];
            }
            if(selectedChip){
                var lista = {};
                //console.log(res.data.data);
                for (var i = 0; i < selectedChip.permisos.length; i++){
                    var permiso = selectedChip.permisos[i];

                    if(!lista[permiso.grupo]){
                        lista[permiso.grupo] = {
                            nombre: permiso.grupo,
                            permisos: []
                        }
                    }

                    var obj = {
                        id: permiso.id,
                        clave: permiso.clave,
                        descripcion: permiso.descripcion
                    };
                    
                    lista[permiso.grupo].permisos.push(obj);
                }
                $scope.permisos = lista;
            }else{
                $scope.permisos = {};
            }
        };

        // Roles
        $scope.selectedItem = null;
        $scope.searchText = null;
        $scope.roles = [];
        
        $scope.querySearch = function querySearch (query) {
            return $http.get(URLS.BASE_API + '/roles',{ params:{
                        query: query
                    }}).then(function(res){
                       
                        var lista = [];
                       
                        for (var i = 0; i < res.data.data.length; i++){
                            
                            var obj = {
                                id: res.data.data[i].id,
                                nombre: res.data.data[i].nombre,
                                permisos: res.data.data[i].permisos
                            };
                            
                            // Ocultemos los resultados que ya están seleccionados
                            // para evitar repetid
                            var bandera = true;
                            for( var x in $scope.usuario.roles){
                                if(obj.id == $scope.usuario.roles[x].id){
                                    bandera = false;
                                }
                            }
                            if(bandera){
                                lista.push(obj);
                            }
                        }
                        $scope.roles = lista;
                        return $scope.roles;                            
                    });
        };

        $scope.eliminar = function(id) {
            $scope.cargando = true; 
            UsuariosDataApi.eliminar(id,  function (res) {
                $scope.cargando = false;   
                $location.path('usuarios');            
            }, function (e) {
                $scope.cargando = false;
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
    .controller('NuevoUsuarioCtrl',
    ['$rootScope', '$scope', 'UsuariosDataApi', '$mdSidenav','$location','$mdBottomSheet','$http','Auth',
    'Menu','URLS','UsuarioData','$mdDialog', 
    function($rootScope, $scope, UsuariosDataApi,$mdSidenav,$location,$mdBottomSheet,$http,Auth,
    Menu,URLS,UsuarioData,$mdDialog)
    {
           
        $scope.menuSelected = "/usuarios";
        $scope.menu = Menu.getMenu();
        $scope.menuIsOpen = false;
        $scope.loggedUser = UsuarioData.getDatosUsuario();
        $scope.seleccionoClues = false;
        $scope.cargando = true;
        
        UsuariosDataApi.catalogos(function(res){
            $scope.tipos_clues = res.data.tipos_clues;
            $scope.cargando = false;
        }, function(e){
            $scope.cargando = false;
            console.log(e);
        });

        $scope.toggleTipoClues = function(tipo,seleccionados){
            var idx = seleccionados.indexOf(tipo);
            if (idx > -1) seleccionados.splice(idx, 1);
            else seleccionados.push(tipo);
        };

        $scope.existsTipoClues = function (tipo, seleccionados) {
            return seleccionados.indexOf(tipo) > -1;
        };
        
        $scope.guardar = function() {
            $scope.cargando = true; 
            UsuariosDataApi.crear($scope.usuario,function (res) {
                $scope.cargando = false;
                $location.path('usuarios');                    
            }, function (e) {
                $scope.cargando = false;
                $scope.validacion = {}; 
                var errors = e.error;

                for (var i in errors){
                    var error = JSON.parse('{ "' + errors[i] + '" : true }');
                    $scope.validacion[i] = error;
                }
            });

        };

        $scope.cargarPermisos = function(event){
            var ctrl = angular.element(event.currentTarget).controller('mdChips');
            if(ctrl !== undefined){
                var selectedChip = ctrl.items[ctrl.selectedChip];
            }
            if(selectedChip){
                var lista = {};
                //console.log(res.data.data);
                for (var i = 0; i < selectedChip.permisos.length; i++){
                    var permiso = selectedChip.permisos[i];

                    if(!lista[permiso.grupo]){
                        lista[permiso.grupo] = {
                            nombre: permiso.grupo,
                            permisos: []
                        }
                    }

                    var obj = {
                        id: permiso.id,
                        clave: permiso.clave,
                        descripcion: permiso.descripcion
                    };
                    
                    lista[permiso.grupo].permisos.push(obj);
                }
                $scope.permisos = lista;
            }else{
                $scope.permisos = {};
            }
        }
        
        $scope.usuario = {
            email: "",
            roles:[],
            tipos_clues: []
        };

        // Roles
        $scope.selectedItem = null;
        $scope.searchText = null;
        $scope.roles = [];
       
        $scope.querySearch = function querySearch (query) {
            return $http.get(URLS.BASE_API + '/roles',{ params:{
                        query: query
                    }}).then(function(res){
                       
                        var lista = [];
                       
                        for (var i = 0; i < res.data.data.length; i++){
                            
                            var obj = {
                                id: res.data.data[i].id,
                                nombre: res.data.data[i].nombre,
                                permisos: res.data.data[i].permisos
                            };
                            
                            // Ocultemos los resultados que ya están seleccionados
                            // para evitar repetid
                            var bandera = true;
                            for( var x in $scope.usuario.roles){
                                if(obj.id == $scope.usuario.roles[x].id){
                                    bandera = false;
                                }
                            }
                            if(bandera){
                                lista.push(obj);
                            }
                        }
                        $scope.roles = lista;
                        return $scope.roles;                            
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