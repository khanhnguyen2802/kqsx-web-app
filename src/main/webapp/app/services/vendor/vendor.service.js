(function() {
    'use strict';

    angular
        .module('erpApp')
        .factory('Vendor', Vendor);

    Vendor.$inject = ['$http','HOST_GW'];

    function Vendor ($http,HOST_GW) {
        var service = {
            getAll: getAll,
            getPage: getPage,
            getOne: getOne
        };

        return service;

        function getAll() {
            return $http.get(HOST_GW + '/api/vendor/search?query=&page=0&size=10000').then(function (response) {
                return response.data;
            });
        }

        function getPage(params) {
            return $http.get(HOST_GW + '/api/vendor/search?' + params).then(function (response) {
                return response;
            });
        }

        function getOne(id) {
            return $http.get(HOST_GW + '/api/vendor/' +id).then(function (response) {
                return response.data;
            });
        }
    }
})();