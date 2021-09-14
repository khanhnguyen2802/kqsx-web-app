(function() {
    'use strict';

    angular
        .module('erpApp')
        .factory('Product', Product);

    Product.$inject = ['$http', 'HOST_GW'];

    function Product ($http, HOST_GW) {
        var service = {
            getAll: getAll,
            create: create,
            getPage: getPage,
            getOne: getOne,
            getFull: getFull,
            getPageFull: getPageFull,
            update: update,
            deleteOne: deleteOne,
            deleteMany: deleteMany,
            uploadAvatar:uploadAvatar,
            getPageFullInformation:getPageFullInformation,
            searchBySeason: searchBySeason,
            simpleGet: simpleGet
        };

        return service;

        function getAll() {
            return $http.get(HOST_GW + '/api/products/search?query=&size=1000').then(function(response) {
                return response.data;
            });
        }

        function create(role) {
            return $http.post(HOST_GW + '/api/products', role).then(function(response) {
                return response.data;
            });
        }

        function getPage(params) {
            return $http.get(HOST_GW + '/api/products/search?' + params).then(function (response) {
                return response;
            });
        }

        function getPageFull(params) {
        	console.log(params);
            return $http.get(HOST_GW + '/api/products/search-full?' + params).then(function (response) {
                return response;
            });
        }

        function getPageFullInformation(params) {
            return $http.get(HOST_GW + '/api/products/search-full-information?' + params).then(function (response) {
                return response;
            });
        }

        function getOne(id) {
            return $http.get(HOST_GW + '/api/products/'+id).then(function(response) {
                return response.data;
            });
        }

        function getFull(id) {
            return $http.get(HOST_GW + '/api/products/get-full/'+id).then(function(response) {
                return response.data;
            });
        }

        function update(role) {
            return $http.put(HOST_GW + '/api/products/' + role.id, role).then(function(response) {
                return response.data;
            });
        }

        function deleteOne(id) {
            return $http.delete(HOST_GW + '/api/products/' + id).then(function(response) {
                return response.data;
            });
        }

        function deleteMany(ids) {
            return $http.post(HOST_GW + '/api/products/batch-delete', ids).then(function(response) {
                return response.data;
            });
        }

        function uploadAvatar(file, model) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('model', model);
            return $http.post(HOST_GW + '/api/upload/', fd,{
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function(response) {
                return response;
            });
        }

        function searchBySeason(id, params){
            return $http.get(HOST_GW + '/api/products/search-by-season?seasonId=' + id + params).then(function (response) {
                return response;
            });
        }

        function simpleGet(id) {
            return $http.get(HOST_GW + '/api/products/simple-get/'+id).then(function(response) {
                return response.data;
            });
        }
    }
})();
