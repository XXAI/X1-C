(function(){
	'use strict';
    
	angular.module('App').constant('MENU',[
                        { 
                            grupo: false,
                            lista: [
                                { titulo: 'Actas', key: '86BBF4AA1A948', path: '/actas', icono: 'file-document-box' }
                            ]
                         }
                         ,
                         { 
                            grupo:'Administrador' ,
                            lista: [
                                { titulo: 'Usuarios', key: '56C1E52B98B62', path: '/usuarios', icono: 'account' },
                                { titulo: 'Roles', key: '5CA553826561D', path: '/roles', icono: 'account-settings-variant' }
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