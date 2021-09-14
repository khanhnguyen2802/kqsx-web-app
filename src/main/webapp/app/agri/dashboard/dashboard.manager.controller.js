(function(){
    'use strict';
    angular.module('erpApp')
        .controller('DashboardManagerController', DashboardManagerController);

    DashboardManagerController.$inject = ['$rootScope','$scope','$state','$stateParams', 'AlertService','$translate','variables', 'apiData', '$http', 'ErrorHandle', '$window', 'Dashboard'];
    function DashboardManagerController($rootScope,$scope, $state,$stateParams, AlertService, $translate, variables, apiData, $http, ErrorHandle, $window, Dashboard) {
        $scope.goToFarm = function () {
            $state.go("farms");
        };
        $scope.goToArea = function () {
            $state.go("areas");
        };
        $scope.goToProduct = function () {
            $state.go("products");
        };
        $scope.goToUomType = function () {
            $state.go("uomTypes");
        };
        $scope.goToUom = function () {
            $state.go("uoms");
        };
        $scope.goToProcedureLog = function () {
            $state.go("procedureLogs");
        };
        $scope.goToSeason = function () {
            $state.go("seasons");
        };
        $scope.goToCamera = function () {
            $state.go("cameras");
        };
        $scope.goToDevice = function () {
            $state.go("devices");
        };
        $scope.goToManualControl = function () {
            $state.go("group-devices");
        };
        $scope.goToAutoControl = function () {
            $state.go("automatic-controls");
        };
        $scope.goToAlarmConfig = function () {
            $state.go("alarm-config");
        };
        $scope.goToAlarmHistory = function () {
            $state.go("alarm-history");
        };
    }

})();