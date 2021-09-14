(function () {
    'use strict';
    angular.module('erpApp')
        .controller('FarmDetailController', FarmDetailController);

    FarmDetailController.$inject = ['$rootScope', '$scope', '$stateParams', '$http','$timeout',
        'AlertService', '$translate', 'TableController', 'ComboBoxController', 'AlertModalService', 'Farm', 'Common','ErrorHandle'];

    function FarmDetailController($rootScope, $scope, $stateParams, $http,$timeout,
                                  AlertService, $translate, TableController, ComboBoxController, AlertModalService, Farm, Common,ErrorHandle) {
        $scope.ComboBox = {};
        $scope.farm = {};

        var typeFarm = Common.getTypeFarm();

        var typeFarmCbb = {
            id:'typeFarmCbb',
            url:'',
            originParams:'',
            valueField:'id',
            labelField:'name',
            searchField:'name',
            table: null,
            column: null,
            maxItems:1,
            ngModel:[],
            options: typeFarm,
            placeholder:$translate.instant("global.placeholder.search")
        };
        ComboBoxController.init($scope, typeFarmCbb);

        var typeUnitCbb = {
            id:'typeUnitCbb',
            url:'/api/uoms',
            originParams:'',
            valueField:'id',
            labelField:'name',
            searchField:'name',
            table: null,
            column: null,
            maxItems:1,
            ngModel:[],
            options: [],
            placeholder:$translate.instant("global.placeholder.search")
        };
        ComboBoxController.init($scope, typeUnitCbb);

        // ================================
        Farm.getFull($stateParams.farmId).then(function (data) {
            $scope.farm = data;

            if(data.uomUnit){
                typeUnitCbb.options = [data.uomUnit];
                ComboBoxController.init($scope, typeUnitCbb);
            }
        }).catch(function (data) {
            ErrorHandle.handleOneError(data);
        })
    }
})();
