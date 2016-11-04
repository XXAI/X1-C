(function(){
	'use strict';
    
	angular.module('App').constant('MENU',[
                        { 
                            grupo: false,
                            lista: [
                                { titulo: 'Actas', key: '86BBF4AA1A948', path: '/actas', icono: 'file-document-box' },
                                { titulo: 'Requisiciones', key: '2DDA5B8933685', path: '/requisiciones', icono: 'file-check' },
                                { titulo: 'Pedidos', key:'D9B1342FA3DF3', path:'/pedidos', icono: 'file-lock'}
                            ]
                        },
                        {
                            grupo:'Reportes',
                            lista: [
                                { titulo: 'Proveedores', key: '4C915886C86CB', path: '/reportes-proveedores', icono: 'folder-account' }
                            ]
                        },
                        { 
                            grupo:'Administrador' ,
                            lista: [
                                { titulo: 'Usuarios', key: '56C1E52B98B62', path: '/usuarios', icono: 'account' },
                                { titulo: 'Roles', key: '5CA553826561D', path: '/roles', icono: 'account-settings-variant' }
                            ]
                        },
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