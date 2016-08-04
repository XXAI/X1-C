(function(){
	'use strict';
    
	angular.module('App').constant('MENU',[
                        { 
                            grupo: false,
                            lista: [
                                { titulo: 'Tablero', key: 'DASHBOARD', path: '/dashboard', icono: 'view-dashboard' }
                            ]
                         }
                         ,
                         { 
                            grupo:'Administrador' ,
                            lista: [
                                { titulo: 'Usuarios', key: 'LISTAR_USUARIOS', path: '/usuarios', icono: 'account' },
                                { titulo: 'Roles', key: 'LISTAR_ROLES', path: '/roles', icono: 'account-settings-variant' }
                            ]
                         }
						 ,
						 {
                            grupo:'otro grupo',
                            lista: [
                                { titulo: 'Acerca de', key: 'ACERCADE', path: '/acerca-de', icono: 'info' }
                            ]
                         },
						 
						 ]);
	angular.module('App').constant('MENU_PUBLICO',[
                        { icono:'exit-to-app' , titulo:'INICIAR_SESION', path:'signin' },
               			{ icono:'information' , titulo:'QUE_ES_APP', path:'que-es' }  
						 
	]);
})();