(function() {
    'use strict';

    angular
        .module('erpApp')
        .factory('Area', Area);

    Area.$inject = ['$http','HOST_GW'];

    function Area ($http,HOST_GW) {
        return {
            current : current,
            getAll: getAll,
            create: create,
            getOne: getOne,
            getOneWithUser: getOneWithUser,
            getPage: getPage,
            getPageFull:getPageFull,
            getPageSimple: getPageSimple,
            update: update,
            deleteOne: deleteOne,
            deleteMany: deleteMany,
            activate:activate,
            deactivate:deactivate,
            searchFullInformation: searchFullInformation,
            getAreaIdsByFarmerId: getAreaIdsByFarmerId,
            getFull:getFull,
            getChild: getChild,
            getAreasOverview: getAreasOverview,
            genSector:genSector,
            getChildAndParent: getChildAndParent
        };

        function genSector(areaId){
            return $http.get(HOST_GW+'/api/areas/gen-sector/' + areaId).then(function (response) {
                return response;
            });
        }

        function current() {
            return $http.get(HOST_GW+'/api/areas/current').then(function(response) {
                return response.data;
            });
        }

        function getFull(id){
            return $http.get(HOST_GW+'/api/areas/get-full/' + id).then(function(response) {
                return response.data;
            });
        }

        function getAll() {
            return $http.get(HOST_GW+'/api/areas').then(function(response) {
                return response.data;
            });
        }

        function create(unitType) {
            return $http.post(HOST_GW+'/api/areas', unitType).then(function(response) {
                return response.data;
            });
        }

        function getPage(params) {
            return $http.get(HOST_GW+'/api/areas/search?' + params).then(function (response) {
                return response;
            });
        }

        function getPageFull(params) {
            return $http.get(HOST_GW + '/api/areas/search-full?' + params).then(function (response) {
                return response;
            });
        }

        function getPageSimple(params) {
            return $http.get(HOST_GW+'/api/areas/search-simple?' + params).then(function (response) {
                return response;
            });
        }

        function update(unitType) {
            return $http.put(HOST_GW+'/api/areas/' + unitType.id, unitType).then(function(response) {
                return response.data;
            });
        }

        function deleteOne(id) {
            return $http.delete(HOST_GW+'/api/areas/' + id).then(function(response) {
                return response.data;
            });
        }

        function deleteMany(ids) {
            return $http.post(HOST_GW+'/api/areas/batch-delete', ids).then(function(response) {
                return response.data;
            });
        }

        function activate(id) {
            return $http.get(HOST_GW+'/api/areas/activate?id=' + id).then(function(response) {
                return response.data;
            });
        }

        function deactivate(id) {
            return $http.get(HOST_GW+'/api/areas/deactivate?id=' +id).then(function(response) {
                return response.data;
            });
        }

        function getOne(id){
            return $http.get(HOST_GW+'/api/areas/' + id).then(function(response) {
                return response.data;
            });
        }

        function getOneWithUser(id) {
            return $http.get(HOST_GW+'/api/areas/getOne/' + id).then(function(response) {
                return response.data;
            });
        }

        function searchFullInformation(params) {
            return $http.get(HOST_GW+'/api/areas/search-full-information?' + params).then(function (response) {
                return response;
            });
        }

        function getAreaIdsByFarmerId(id) {
            return $http.get(HOST_GW+'/api/areas/getAreaIdsByFarmerId/' + id).then(function(response) {
                if(response.data.length > 0){
                    // lấy id = 1
                    var areaIds = "(";
                    for(var i=0; i < response.data.length; i ++){
                        areaIds +=response.data[i];
                        if(i< response.data.length - 1){
                            areaIds +=",";
                        }
                    }
                    areaIds +=")";
                    return areaIds;
                }
                return null;
            });
        }

        function getChild(parentId){
            return $http.get(HOST_GW+'/api/areas/get-child/' + parentId).then(function (response) {
                return response;
            });
        }

        function getAreasOverview(tenantId){
            return $http.get(HOST_GW+'/api/areas/overview/' + tenantId).then(function (response) {
                return response;
            });
        }

        function getChildAndParent(areaId){
            return $http.get(HOST_GW+'/api/areas/get-child-and-parent/' + areaId).then(function (response) {
                return response;
            });
        }
    }
})();
