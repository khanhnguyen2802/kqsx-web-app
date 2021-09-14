(function() {
    'use strict';

    angular
        .module('erpApp')
        .factory('ProductCategory', ProductCategory);

    ProductCategory.$inject = ['$http', 'HOST_GW'];

    function ProductCategory ($http, HOST_GW) {
        var service = {
            search: search,
            create: create,
            update: update,
            deleteOne: deleteOne,
            deleteMany: deleteMany,
            getFullInformation: getFullInformation,
            exportProductCategory:exportProductCategory,
            findChildren: findChildren,
            getTreeById: getTreeById,
            getOne: getOne
        };

        return service;

        function search(farmId, id) {
            var idSearch = id;
            if(!id) idSearch = 0;
            return $http.get(HOST_GW + '/api/product-categories/categories?farmId=' + farmId + '&id=' + idSearch).then(function(response) {
                return response.data;
            });
        }

        function getTreeById(id) {
            return $http.get(HOST_GW + '/api/product-categories/get-tree-by-id/' + id).then(function(response) {
                return response.data;
            });
        }

        function exportProductCategory(parameter) {
            return $http.post(HOST_GW + '/api/product-categories/export',parameter).then(function(response) {
                return response.data;
            });
        }

        function create(productCategory) {
            return $http.post(HOST_GW + '/api/product-categories',productCategory).then(function(response) {
                return response.data;
            });
        }

        function update(productCategory) {
            return $http.put(HOST_GW + '/api/product-categories/' + productCategory.id, productCategory).then(function(response) {
                return response.data;
            });
        }

        function deleteOne(id) {
            return $http.delete(HOST_GW + '/api/product-categories/' + id).then(function(response) {
                return response.data;
            });
        }

        function deleteMany(ids) {
            return $http.post(HOST_GW + '/api/product-categories/batch-delete', ids).then(function(response) {
                return response.data;
            });
        }

        function findChildren(id) {
            return $http.get(HOST_GW + '/api/product-categories/get-child?id=' + id).then(function(response) {
                if(response.data.length > 0){
                    // lấy id = 1
                    var ProductCategoryIds = "(";
                    for(var i=0; i < response.data.length; i ++){
                        ProductCategoryIds +=response.data[i];
                        if(i< response.data.length - 1){
                            ProductCategoryIds +=",";
                        }
                    }
                    ProductCategoryIds +=")";
                    return ProductCategoryIds;
                }
                return response.data;
            });
        }

        function getFullInformation(id) {
            return $http.get(HOST_GW + '/api/product-categories/get-full-information/' + id).then(function(response) {
                return response.data;
            });
        }

        function getOne(id) {
            return $http.get(HOST_GW + '/api/product-categories/' + id).then(function (response) {
                return response.data;
            });
        }
    }
})();
