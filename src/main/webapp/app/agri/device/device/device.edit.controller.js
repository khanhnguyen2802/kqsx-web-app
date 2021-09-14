(function () {
    'use strict';
    angular.module('erpApp')
        .controller('DeviceEditController', DeviceEditController);

    DeviceEditController.$inject = ['$rootScope', '$scope', '$state', '$http', '$stateParams', '$timeout', '$window', 'Vendor',
        'AlertService', '$translate', 'TableController', 'ComboBoxController', 'AlertModalService', 'Device', 'Area', 'FileService'];

    function DeviceEditController($rootScope, $scope, $state, $http, $stateParams, $timeout, $window, Vendor,
                                  AlertService, $translate, TableController, ComboBoxController, AlertModalService, Device, Area, FileService) {
        $scope.blockModal = null;
        $scope.blockUI = function () {
            if ($scope.blockModal != null) $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };

        $scope.messages = {
            required: $translate.instant("global.messages.required"),
            maxLength255: $translate.instant("global.messages.maxLength255")
        };

        $scope.farmId = $window.localStorage.getItem("farmId");
        $scope.farmName = $window.localStorage.getItem("farmName");
        $scope.ComboBox = {};
        $scope.device = {};
        $scope.editting = false;
        $scope.selectedCbb = {
            farm: [],
            area: [],
            gateway: [],
            areaMulti: []
        };
        $scope.edit = function (state) {
            $scope.editting = state
        };
        Device.getOne($stateParams.deviceId).then(function (data) {
            $scope.device = data;
            if ($scope.device.gateway) {
                gatewayComboBox.options = [$scope.device.area];
                ComboBoxController.init($scope, gatewayComboBox);
            }

            // get child area
            Area.getChildAndParent($scope.device.areaId).then(function (res) {
                var areaIds = [0];
                if (res.data) areaIds = res.data;

                var query = "query=tenantId==" + data.tenantId + ";id=in=(" + areaIds.toString() + ")&page=0&size=10000";
                Area.getPageSimple(query).then(function (response) {
                    areaComboBox.originParams = query;
                    areaComboBox.options = response.data;
                    ComboBoxController.init($scope, areaComboBox);

                    areaShortComboBox.originParams = query;
                    areaShortComboBox.options = response.data;
                    ComboBoxController.init($scope, areaShortComboBox);
                });
            });

            Vendor.getOne(data.vendorId).then(function (data) {
                vendorIdComboBox.options.push(data);
                ComboBoxController.initFull($scope, vendorIdComboBox);
            })
        });

        // ====================== INIT CBB ==========
        // area combobox
        var areaComboBox = {
            id: 'area_combobox',
            url: '',
            originParams: 'active==1;tenantId==' + $scope.farmId,
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: null,
            column: null,
            maxItems: 1,
            ngModel: [],
            options: [],
            placeholder: 'chọn khu vực',
            orderBy: 'name,asc'
        };
        ComboBoxController.init($scope, areaComboBox);

        var areaShortComboBox = {
            id: 'areaShort',
            url: '',
            originParams: 'active==1;tenantId==' + $scope.farmId,
            valueField: 'id',
            labelField: 'shortName',
            searchField: 'shortName',
            table: null,
            column: null,
            maxItems: 1,
            ngModel: [],
            options: [],
            placeholder: 'Chọn khu vực',
            orderBy: 'name,asc'
        };
        ComboBoxController.init($scope, areaShortComboBox);

        // gateway combobox
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
            placeholder: 'chọn gateway',
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

        // type combobox
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
            {id: 3, name: 'Khác'}
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
            {id: 1, name: 'Sensor Box'},
            {id: 2, name: 'Bơm'},
            {id: 3, name: 'Đèn'},
            {id: 4, name: 'Quạt'},
            {id: 5, name: 'Cắt nắng'},
            {id: 6, name: 'Camera'},
            {id: 7, name: 'Khác'},
            {id: 8, name: 'Động cơ'},
            {id: 9, name: 'Van'},
            {id: 10, name: 'Sensor'}
        ];
        // ========================= CBB FUNCTION ==========
        $scope.areaChange = function () {
            $timeout(function () {
                if ($scope.selectedCbb.area[0]) {
                    if ($scope.device.areaId) {
                        $scope.device.areaName = $scope.selectedCbb.area[0].name;
                        Area.getOne($scope.device.areaId).then(function (area) {
                            $scope.device.areaShortName = area.shortName;
                        });
                    } else {
                        $scope.device.areaName = null;
                        $scope.device.areaShortName = null;
                    }
                }
            });
        };
        $scope.areaChangeMulti = function (index) {
            if ($scope.device && $scope.device.devices.length > 0 && $scope.selectedCbb.areaMulti[0]) {
                $timeout(function () {
                    if ($scope.selectedCbb.areaMulti[0] && $scope.device.devices[index].areaId) {
                        $scope.device.devices[index].areaName = $scope.selectedCbb.areaMulti[0].name;
                        console.log($scope.device.devices[index].areaName)
                    } else {
                        $scope.device.devices[index].areaName = null;
                        console.log("cfmm")
                    }
                });
            }
        };

        $scope.gatewayChange = function () {
            $timeout(function () {
                if ($scope.device.gatewayId) {
                    $scope.device.gatewayName = $scope.selectedCbb.gateway[0].name;
                } else {
                    $scope.device.gatewayName = null;
                }
            });
        };

        // =====================================
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
                    updateDevice(isClose);
                }).catch(function (data) {
                    if ($scope.blockModal != null) $scope.blockModal.hide();
                    ErrorHandle.handleOneError(data);
                    $scope.btnDisable = false;
                });
            } else {
                // if dont have file: update immedimately
                updateDevice(isClose);
            }
        };

        function updateDevice(isClose) {
            Device.update($scope.device).then(function (data) {
                if ($scope.blockModal != null) $scope.blockModal.hide();
                AlertModalService.popup("success.msg.update");
                $timeout(function () {
                    $scope.device.avatar = "";
                    $scope.user.userAvatarBase64 = "";
                    isClose ? $state.go('devices') : $state.go('devices-detail', {deviceId: data.id});
                }, 1100);

            }).catch(function (data) {
                if ($scope.blockModal != null) $scope.blockModal.hide();
                ErrorHandle.handleOneError(data);
                $scope.btnDisable = false;
            });
        }

        // ===================================
        if (angular.element('#device_form').length) {
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
    }
})();
