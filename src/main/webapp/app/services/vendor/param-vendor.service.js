(function() {
    'use strict';

    angular
        .module('erpApp')
        .factory('ParamVendor', ParamVendor);

    ParamVendor.$inject = ['$http','HOST_GW'];

    function ParamVendor ($http,HOST_GW) {
        var service = {
            getAll: getAll,
            getPage: getPage,
        };

        return service;

        function getAll() {
            return $http.get(HOST_GW + '/api/paramVendor/search?query=&page=0&size=10000').then(function (response) {
                return response.data;
            });
        }

        function getPage(params) {
            return $http.get(HOST_GW + '/api/paramVendor/search?' + params).then(function (response) {
                return response;
            });
        }
    }
})();