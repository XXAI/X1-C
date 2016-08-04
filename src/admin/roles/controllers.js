(function(){
	'use strict';
    angular.module('RolesModule')
    .controller('RolesCtrl',['$rootScope', '$scope', 'RolesDataApi', '$mdSidenav','$location','$mdBottomSheet','Auth','Menu','UsuarioData', function($rootScope, $scope, RolesDataApi,$mdSidenav,$location,$mdBottomSheet,Auth, Menu, UsuarioData){
            
            $scope.menuSelected = $location.path();
            $scope.menu = Menu.getMenu();
            $scope.menuIsOpen = false;
            $scope.loggedUser = UsuarioData.getDatosUsuario();
            $scope.fecha_actual = new Date();
            
            $scope.cargandoLista = false;
            $scope.cargando = true;
            
            $scope.rolesInfinitos = {
              numLoaded_: 0,
              toLoad_: 0,
              roles: [],
              maxItems:1,
              // Required.
              getItemAtIndex: function(index) {
                if (index >= this.numLoaded_) {
                    if(this.numLoaded_ < this.maxItems){
                        this.fetchMoreItems_(index);
                    }
                    return null;
                }
                return this.roles[index];
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
                    parametros.pagina = ((this.roles.length)/50) + 1;
                    if($scope.textoBusqueda){
                        parametros.query = $scope.textoBusqueda;
                    }
                    RolesDataApi.lista(parametros,function (res) {
                        if($scope.rolesInfinitos.maxItems != res.totales){
                            $scope.rolesInfinitos.maxItems = res.totales;
                        }
                        for (var i = 0; i < res.data.length; i++){
                            var obj = {
                                id: res.data[i].id,
                                nombre: res.data[i].nombre
                            };
                            
                            $scope.rolesInfinitos.roles.push(obj);
                            $scope.rolesInfinitos.numLoaded_++;
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
           
            $scope.eliminar = function(id, index) {
                $scope.cargando = true; 
                RolesDataApi.eliminar(id,  function (res) {
                    $scope.cargando = false;      
                    $scope.roles.splice(index, 1);          
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
                console.log("entro aqui");              
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
        .controller('EditarRolCtrl',['$rootScope', '$scope', 'RolesDataApi', '$mdSidenav','$location','$mdBottomSheet','$routeParams','$http','Auth','Menu','URLS','UsuarioData', function($rootScope, $scope, RolesDataApi,$mdSidenav,$location,$mdBottomSheet,$routeParams,$http,Auth, Menu, URLS,UsuarioData){
            
            $scope.menuSelected = "/roles";
            $scope.menu = Menu.getMenu();
            $scope.menuIsOpen = false;
            $scope.loggedUser = UsuarioData.getDatosUsuario();

            $scope.cargando = true;
           
            RolesDataApi.ver($routeParams.id,function (res) {
                if(res.data != null){
                    $scope.rol = { id: res.data.id, nombre: res.data.nombre, permisos: res.data.permisos };
                }

                $http.get(URLS.BASE_API + '/permisos',null)
                .then(function(res){
                    $scope.cargando = false;
                    var lista = {};
                    //console.log(res.data.data);
                    for (var i = 0; i < res.data.data.length; i++){
                        var permiso = res.data.data[i];

                        if(!lista[permiso.grupo]){
                            lista[permiso.grupo] = {
                                nombre: permiso.grupo,
                                permisos: []
                            }
                        }

                        var obj = {
                            id: permiso.id,
                            clave: permiso.clave,
                            descripcion: permiso.descripcion,
                            seleccionado: false
                        };

                        // Para activar el checkbox en los elementos seleccionados
                        for( var x in $scope.rol.permisos){
                            if(obj.id == $scope.rol.permisos[x].id){
                                obj.seleccionado = true;
                            }
                        }
                        
                        lista[permiso.grupo].permisos.push(obj);
                    }
                    $scope.permisos = lista;
                });
            }, function (e) {
                $scope.cargando = false;
                console.log(e);
            });
            
            $scope.editarPermiso = function(item){
                var bandera = true;
                for( var x in $scope.rol.permisos){
                    if(item.id == $scope.rol.permisos[x].id){
                        item.seleccionado = false;
                        $scope.rol.permisos.splice(x, 1);
                        bandera = false;
                        break;
                    }
                }
                if(bandera){
                    item.seleccionado = true;
                    $scope.rol.permisos.push(item);
                }
            };

            $scope.guardar = function() {
                $scope.cargando = true; 
                RolesDataApi.editar($routeParams.id, $scope.rol, function (res) {
                    $scope.cargando = false;                   
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
            
            $scope.eliminar = function(id) {
                $scope.cargando = true; 
                RolesDataApi.eliminar(id,  function (res) {
                    $scope.cargando = false;   
                    $location.path('roles');            
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
        .controller('NuevoRolCtrl',['$rootScope', '$scope', 'RolesDataApi', '$mdSidenav','$location','$mdBottomSheet','$http','Auth','Menu','URLS','UsuarioData', function($rootScope, $scope, RolesDataApi,$mdSidenav,$location,$mdBottomSheet,$http,Auth, Menu,URLS,UsuarioData){
           
            $scope.menuSelected = "/roles";
            $scope.menu = Menu.getMenu();
            $scope.menuIsOpen = false;
            $scope.loggedUser = UsuarioData.getDatosUsuario();
            $scope.cargando = true;
            
            $http.get(URLS.BASE_API + '/permisos',null)
            .then(function(res){
                $scope.cargando = false;
                var lista = {};
                //console.log(res.data.data);
                for (var i = 0; i < res.data.data.length; i++){
                    var permiso = res.data.data[i];

                    if(!lista[permiso.grupo]){
                        lista[permiso.grupo] = {
                            nombre: permiso.grupo,
                            permisos: []
                        }
                    }

                    var obj = {
                        id: permiso.id,
                        clave: permiso.clave,
                        descripcion: permiso.descripcion,
                        seleccionado: false
                    };
                    
                    lista[permiso.grupo].permisos.push(obj);
                }
                $scope.permisos = lista;
            });

            $scope.editarPermiso = function(item){
                var bandera = true;
                for( var x in $scope.rol.permisos){
                    if(item.id == $scope.rol.permisos[x].id){
                        item.seleccionado = false;
                        $scope.rol.permisos.splice(x, 1);
                        bandera = false;
                        break;
                    }
                }
                if(bandera){
                    item.seleccionado = true;
                    $scope.rol.permisos.push(item);
                }
            };
            
            $scope.guardar = function() {
                $scope.cargando = true; 
                RolesDataApi.crear($scope.rol,function (res) {
                    $scope.cargando = false;
                    $location.path('roles');                    
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
            
            $scope.rol = {
                nombre: "",
                permisos:[]
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