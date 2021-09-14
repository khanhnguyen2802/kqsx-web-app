(function () {
    'use strict';
    angular.module('erpApp')
        .controller('DeviceCreateController', DeviceCreateController);

    DeviceCreateController.$inject = ['$rootScope', '$scope', '$state', '$http', '$timeout', '$window',
        'AlertService', '$translate', 'TableController', 'ComboBoxController', 'AlertModalService', 'Device', 'ErrorHandle', 'FileService', 'Area'];

    function DeviceCreateController($rootScope, $scope, $state, $http, $timeout, $window,
                                    AlertService, $translate, TableController, ComboBoxController, AlertModalService, Device, ErrorHandle, FileService, Area) {
        $scope.farmId = $window.localStorage.getItem("farmId");
        $scope.farmName = $window.localStorage.getItem("farmName");

        $scope.blockModal = null;
        $scope.blockUI = function () {
            if ($scope.blockModal != null) $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };
        $scope.messages = {
            required: $translate.instant("global.messages.required"),
            maxLength255: $translate.instant("global.messages.maxLength255"),
            maxLength50: $translate.instant("global.messages.maxLength50")
        };

        $scope.shortName = "";
        $scope.ComboBox = {};
        $scope.device = {
            tenantId: $scope.farmId,
            farmName: $scope.farmName
        };
        $scope.selectedCbb = {
            farm: [],
            area: [],
            gateway: [],
            vendor: []
        };
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
            $timeout(function () {
                if (fromState.name === "cameras" && toState.name === "devices-create") {
                    $scope.device.type = 1;
                    $scope.device.category = 6;
                } else {
                    $scope.device.type = 2;
                }
            });
        });

        // ==================== INIT CBB ========================
        // area combobox
        var areaComboBox = {
            id: 'area_combobox',
            url: '/api/areas',
            originParams: 'active==1;tenantId==' + $scope.farmId,
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: null,
            column: null,
            maxItems: 1,
            ngModel: [],
            options: [],
            placeholder: $translate.instant("device.placeholder.selectArea"),
            orderBy: 'name,asc'
        };
        ComboBoxController.init($scope, areaComboBox);

        // type combobox
        var gatewayComboBox = {
            id: 'gateway_combobox',
            url: '/api/devices',
            originParams: 'type==1',
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: null,
            column: null,
            maxItems: 1,
            ngModel: [],
            options: [],
            orderBy: 'id,asc'
        };
        ComboBoxController.init($scope, gatewayComboBox);

        // vendor
        var vendorIdComboBox = {
            id: 'vendorId_combobox',
            url: '/api/vendor',
            originParams: null,
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: null,
            column: null,
            maxItems: 1,
            ngModel: [],
            options: [],
            orderBy: 'id,asc'
        };
        ComboBoxController.initFull($scope, vendorIdComboBox);

        $scope.selectize_type_config = {
            plugins: {
                'remove_button': {
                    label: ''
                }
            },
            maxItems: 1,
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            create: false,
        };
        $scope.selectize_type_options = [
            {id: 2, name: 'Gateway'},
            {id: 1, name: 'Device'},
            {id: 3, name: $translate.instant("device.field.other")}
        ];
        // category combobox
        $scope.selectize_category_config = {
            plugins: {
                'remove_button': {
                    label: ''
                }
            },
            maxItems: 1,
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            create: false,
        };
        $scope.selectize_category_options = [
            {id: 10, name: 'Sensor'},
            {id: 1, name: 'Sensor Box'},
            {id: 2, name: 'Bơm'},
            {id: 3, name: 'Đèn'},
            {id: 4, name: 'Quạt'},
            {id: 5, name: 'Cắt nắng'},
            {id: 6, name: 'Camera'},
            {id: 7, name: 'Khác'},
            {id: 8, name: 'Động cơ'},
            {id: 9, name: 'Van'}
        ];

        // ======================== CBB change =================
        $scope.areaChange = function () {
            $timeout(function () {
                if ($scope.device.areaId) {
                    $scope.device.areaName = $scope.selectedCbb.area[0].name;
                    Area.getOne($scope.device.areaId).then(function (area) {
                        $scope.shortName = area.shortName;
                    });
                } else {
                    $scope.device.areaName = null;
                }
            });

        };
        // gateway combobox

        $scope.gatewayChange = function () {
            $timeout(function () {
                if ($scope.device.gatewayId) {
                    $scope.device.gatewayName = $scope.selectedCbb.gateway[0].name;
                } else {
                    $scope.device.gatewayName = null;
                }
            });
        };

        $scope.onChangeType = function () {
            $timeout(function () {
                // chon device or other => default danh muc la Sensor box
                if ($scope.device.type == 1 || $scope.device.type == 3) {
                    $scope.device.category = 1;
                }
            })
        };

        // ===========================================
        $scope.deleteUserAvatar = function () {
            UIkit.modal.confirm($translate.instant("global.messages.deleteAvatar"), function () {
                // xóa image dã chọn trong input
                $('#user-input-form-file').val("");
                $scope.device.avatar = "";
                $scope.user.userAvatarBase64 = "";
            }, {
                labels: {
                    'Ok': $translate.instant("global.button.ok"),
                    'Cancel': $translate.instant("global.button.cancel")
                }
            });
        };

        $scope.btnDisable = false;
        $scope.submit = function (isClose) {
            if ($scope.btnDisable) return;
            var $form = $("#device_form");
            $('#device_form').parsley();
            if (!$scope.device_form.$valid) return;
            if (!ComboBoxController.checkIsValidForm($form)) return;
            $scope.btnDisable = true;
            $scope.blockUI();
            // upload Avatar first
            var file = $("#user-input-form-file")[0].files[0];
            if (file) {
                FileService.uploadAvatar(file, 1).then(function (data) {
                    $scope.device.avatar = data.data.fileName;
                    createDevice(isClose);
                }).catch(function (data) {
                    if ($scope.blockModal != null) $scope.blockModal.hide();
                    ErrorHandle.handleOneError(data);
                    $scope.btnDisable = false;
                });
            } else {
                // if dont have file: update immedimately
                createDevice(isClose);
            }
            // createDevice(isClose);
        };

        function createDevice(isClose) {
            Device.create($scope.device).then(function (data) {
                if ($scope.blockModal != null) $scope.blockModal.hide();
                // $scope.device = data;
                AlertModalService.popup("success.msg.create");
                $timeout(function () {
                    $scope.device.avatar = "";
                    $scope.user.userAvatarBase64 = "";
                    isClose ? $state.go('devices') : $state.go('devices-detail', {deviceId: data.id});
                }, 1100);
                if ($scope.blockModal != null) $scope.blockModal.hide();
                $scope.btnDisable = false;
            }).catch(function (data) {
                if ($scope.blockModal != null) $scope.blockModal.hide();
                ErrorHandle.handleOneError(data);
                $scope.btnDisable = false;
            });
        }

        // ======================================
        var $formValidate = $('#device_form');
        $formValidate.parsley({
            'excluded': 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], .selectize-input > input'
        }).on('form:validated', function () {
            $scope.$apply();
        }).on('field:validated', function (parsleyField) {
            if ($(parsleyField.$element).hasClass('md-input')) {
                $scope.$apply();
            }
        });
    }
})();
