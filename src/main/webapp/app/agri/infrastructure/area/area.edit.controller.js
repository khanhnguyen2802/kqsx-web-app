(function () {
    'use strict';
    angular.module('erpApp')
        .controller('AreaEditController', AreaEditController);

    AreaEditController.$inject = ['$rootScope', '$scope', '$state', '$http', 'Area', '$stateParams', '$timeout',
        'AlertService', '$translate', 'TableController', 'ComboBoxController', 'AlertModalService', 'ErrorHandle'];

    function AreaEditController($rootScope, $scope, $state, $http, Area, $stateParams, $timeout,
                                AlertService, $translate, TableController, ComboBoxController, AlertModalService, ErrorHandle) {
        $scope.ComboBox = {};
        $scope.blockModal = null;
        $scope.blockUI = function () {
            if ($scope.blockModal != null)
                $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };

        $scope.area = {};
        $scope.oldData = {
            tenantId: null
        };
        $scope.messages = {
            required: $translate.instant("global.messages.required"),
            maxLength255: $translate.instant("global.messages.maxLength255"),
            number: $translate.instant("global.messages.number_msg"),
            float12_3: $translate.instant("global.messages.float12_3"),
            maxLength1000: $translate.instant("global.messages.maxLength1000")
        };

        var unitCbb = {
            id: 'unitCbb',
            url: '/api/uoms',
            originParams: '',
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: null,
            column: null,
            maxItems: 1,
            ngModel: [],
            options: [],
            placeholder: $translate.instant("global.placeholder.choose")
        };
        ComboBoxController.init($scope, unitCbb);

        var parentCbb = {
            id: 'parentCbb',
            url: '/api/areas',
            originParams: '',
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: null,
            column: null,
            maxItems: 1,
            ngModel: [],
            options: [],
            placeholder: $translate.instant("global.placeholder.choose")
        };
        ComboBoxController.init($scope, parentCbb);

        var farmCbb = {
            id: 'farmCbb',
            url: '/api/tenants',
            originParams: '',
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: null,
            column: null,
            maxItems: 1,
            ngModel: [],
            options: [],
            placeholder: $translate.instant("global.placeholder.choose")
        };
        ComboBoxController.init($scope, farmCbb);

        $scope.onChangeFarm = function () {
            if($scope.oldData.tenantId == $scope.area.tenantId) return;
            $scope.oldData.tenantId = $scope.area.tenantId;

            var tenantId = $scope.area.tenantId ? $scope.area.tenantId : 0;
            parentCbb.originParams = 'tenantId==' + tenantId;
            parentCbb.options = [""];
            parentCbb.resetScroll = true;
            ComboBoxController.init($scope, parentCbb);
        };

        var cultivationOption = [
            {id: 1, name: $translate.instant("infrastructure.area.typeArea.growingMedia")},
            {id: 2, name: $translate.instant("infrastructure.area.typeArea.hydroponic")},
            {id: 3, name: $translate.instant("infrastructure.area.typeArea.land")},
            {id: 4, name: $translate.instant("infrastructure.area.typeArea.husbandry")},
            {id: 5, name: $translate.instant("infrastructure.area.typeArea.other")}
        ];
        var cultivationCbb = {
            id: 'cultivationCbb',
            url: '',
            originParams: '',
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: null,
            column: null,
            maxItems: 1,
            ngModel: [],
            options: cultivationOption,
            placeholder: $translate.instant("global.placeholder.choose")
        };
        ComboBoxController.init($scope, cultivationCbb);

        $scope.submit = function (isClose) {
            $('#form_create_area').parsley();
            if (!$scope.form_create_area.$valid) return;
            var $form = $('#form_create_area');
            if (!ComboBoxController.checkIsValidForm($form)) return;
            $scope.area.acreage = parseFloat($scope.area.acreage);

            $scope.blockUI();
            Area.update($scope.area).then(function (data) {
                if ($scope.blockModal != null) $scope.blockModal.hide();
                AlertModalService.popup("success.msg.update");
                $timeout(function () {
                    isClose ? $state.go('areas') : $state.go('areas-detail', {areaId: data.id});
                }, 1100);
            }).catch(function (error) {
                if ($scope.blockModal != null) $scope.blockModal.hide();
                if($scope.area.parentId) {
                    error.data.errorKey = $translate.instant(error.data.errorKey, {parentAreaName: error.data.entityName});
                }
                ErrorHandle.handleOneError(error);
            })
        };

        $scope.blockUI();
        Area.getFull($stateParams.areaId).then(function (data) {
            $scope.area = data;
            $scope.oldData.tenantId = data.tenantId;

            farmCbb.options = [data.farm];
            ComboBoxController.init($scope, farmCbb);

            unitCbb.options = [data.uom];
            ComboBoxController.init($scope, unitCbb);

            parentCbb.originParams = "tenantId==" + data.tenantId + ";id!=" + $scope.area.id;
            parentCbb.options = [data.parent];
            ComboBoxController.init($scope, parentCbb);

            if ($scope.blockModal != null) $scope.blockModal.hide();
        }).catch(function (error) {
            if ($scope.blockModal != null) $scope.blockModal.hide();
        });

        // ===================================
        /*display validate form*/
        if (angular.element('#form_create_area').length) {
            var $formValidate = $('#form_create_area');
            $formValidate.parsley({
                'excluded': 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], .selectize-input > input'
            }).on('form:validated', function () {
                $scope.$apply();
            }).on('field:validated', function (parsleyField) {
                if ($(parsleyField.$element).hasClass('md-input') || $(parsleyField.$element).hasClass('combo')) {
                    $scope.$apply();
                }
            });
        }

        $scope.parentAreaChange = function() {
            if(!$scope.area.name) {
                Area.getOne($scope.area.parentId).then(function(area) {
                    $scope.area.type = area.type;
                });
            }
        }
    }
})();
