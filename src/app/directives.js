(function(){
	'use strict';

	angular.module('App').directive('ngPermiso',function($localStorage,filterFilter,$parse){
    return {
      link: function(scope, element, attrs){
        var model = $parse(attrs.ngPermiso);
        scope.$watch(model, function(value) {
          var resultados = filterFilter($localStorage.plataforma_app.permisos,value);
          if(resultados[0] != value){
            element.addClass('ng-hide');
          }
        });
      }
    };
  });
  
	angular.module('App').directive('focusMe', function($timeout, $parse) {
  return {
      //scope: true,   // optionally create a child scope
      link: function(scope, element, attrs) {
        var model = $parse(attrs.focusMe);
        scope.$watch(model, function(value) {
          //console.log('value=',value);
          if(value === true) { 
            $timeout(function() {
              element[0].focus(); 
            });
          }
        });
        // to address @blesh's comment, set attribute value to 'false'
        // on blur event:
        //Se comento por que generaba un error, esto despues de actualizar el Angular Material a 1.0.4
        /*element.bind('blur', function() {
          //console.log('blur');
          scope.$apply(model.assign(scope, false));
        });*/
      }
    };
  });
})(window.angular);