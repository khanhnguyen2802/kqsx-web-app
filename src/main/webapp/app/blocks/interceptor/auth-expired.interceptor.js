(function() {
    'use strict';

    angular
        .module('erpApp')
        .factory('authExpiredInterceptor', authExpiredInterceptor);

    authExpiredInterceptor.$inject = ['$rootScope', '$q', '$injector', '$localStorage', '$sessionStorage'];

    function authExpiredInterceptor($rootScope, $q, $injector, $localStorage, $sessionStorage) {
        var service = {
            responseError: responseError
        };

        return service;

        function responseError(response) {
            if (response.status === 401) {
                delete $localStorage.authenticationToken;
                delete $sessionStorage.authenticationToken;
                var Principal = $injector.get('Principal');
                if (Principal.isAuthenticated()) {
                    var Auth = $injector.get('Auth');
                    Auth.authorize(true);
                }
            }
            if(response.status === 400){
            	if(response.data === null || response.data === undefined){
            		response.data = JSON.parse($localStorage.authenticationToken); 
            	}
            }
            if(response.data.message == 'Invalid JWT signature.'){
                delete $localStorage.authenticationToken;
                delete $sessionStorage.authenticationToken;
                location.reload();
            }
            return $q.reject(response);
        }
    }
})();
