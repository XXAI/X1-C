(function(){
	'use strict';
	angular.module('ActasModule')
	   .factory('ActasDataApi', ['$http', 'URLS', function ($http, URLS) {
	       return {
	           lista: function (params,success, error) {
	               $http.get(URLS.BASE_API + '/actas',{params:params}).success(success).error(error)
	           },
			   ver: function (id, success, error) {
	               $http.get(URLS.BASE_API + '/actas/' + id).success(success).error(error)
	           },
			   crear: function (file, success, error) {
			   		var fd = new FormData();
			        fd.append('zipfile', file);
			        $http.post(URLS.BASE_API + '/actas', fd, {
			            transformRequest: angular.identity,
			            headers: {'Content-Type': undefined}
			        }).success(success).error(error);
	           }
	       };
	   }
	]);
})();