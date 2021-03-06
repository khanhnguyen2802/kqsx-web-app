(function() {
    'use strict';

    angular
        .module('erpApp')
        .factory('Privilege', Privilege);

    Privilege.$inject = ['$http','HOST_GW'];

    function Privilege ($http,HOST_GW) {
        var service = {
            getAll: getAll,
            create: create,
            getPage: getPage,
            getOne: getOne,
            update: update,
            deleteOne: deleteOne,
            deleteMany: deleteMany
        };

        return service;

        function getAll() {
            return $http.get(HOST_GW + '/api/privileges/search?query=&size=999').then(function(response) {
                return response.data;
            });
        }

        function create(privilege) {
            return $http.post(HOST_GW + '/api/privileges', privilege).then(function(response) {
                return response.data;
            });
        }

        function getPage(params) {
            return $http.get(HOST_GW + '/api/privileges/search?' + params).then(function (response) {
                return response;
            });
        }

        function getOne(id) {
            return $http.get(HOST_GW + '/api/privileges/'+id).then(function(response) {
                return response.data;
            });
        }

        function update(privilege) {
            return $http.put(HOST_GW + '/api/privileges/' + privilege.id, privilege).then(function(response) {
                return response.data;
            });
        }

        function deleteOne(id) {
            return $http.delete(HOST_GW + '/api/privileges/' + id).then(function(response) {
                return response.data;
            });
        }

        function deleteMany(ids) {
            return $http.post(HOST_GW + '/api/privileges/batch-delete', ids).then(function(response) {
                return response.data;
            });
        }
    }
})();
