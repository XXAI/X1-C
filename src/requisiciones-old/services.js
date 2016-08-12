(function(){
	'use strict';
	angular.module('RequisicionesModule')
	   .factory('RequisicionesDataApi', ['$http','$window', 'URLS', function ($http, $window, URLS) {
	       return {
	           lista: function (params,success, error) {
	               $http.get(URLS.BASE_API + '/requisiciones',{params:params}).success(success).error(error)
	           },
			   ver: function (id, success, error) {
	               $http.get(URLS.BASE_API + '/requisiciones/' + id).success(success).error(error)
	           },
	           editar: function (id, data, success, error) {
	               $http.put(URLS.BASE_API + '/requisiciones/' + id, data).success(success).error(error)
	           }
	           /*,
	           verPDF: function (id,error){
	           		$http.get(URLS.BASE_API + '/requisicion-pdf/' + id).success(function(data){
	           			var file = new Blob([data], {type: 'application/pdf'});
      					var fileURL = URL.createObjectURL(file);
      					window.open(fileURL);
	           		}).error(error)
	           }*/
	       };
	   }
	]);
})();