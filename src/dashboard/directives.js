
(function(){
	'use strict';
    angular.module('DashboardModule')
    .directive( 'checar-altura', function() {
	    return {
	    	restrict: 'A',
	        link: function( scope, element, attrs ) {
	            scope.$watch(
			    	function () { 
			        	return {
			           		width: element.parent().width(),
			           		height: element.parent().height(),
			        	}
			   		},
			   		function () {
			   			console.log(element.parent().height());
			   		}, //listener 
					true //deep watch
				);
	        }
	    }

	})
})();