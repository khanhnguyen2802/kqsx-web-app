(function () {
    'use strict';
    angular.module('erpApp')
        .controller('DeviceDetailController', DeviceDetailController);

    DeviceDetailController.$inject = ['$rootScope', '$scope', '$state', '$http', '$stateParams', '$timeout', 'Vendor',
        'AlertService', '$translate', 'TableController', 'ComboBoxController', 'AlertModalService', 'Device', '$window', 'Area', 'HOST_DEVICE_SOCKET'];

    function DeviceDetailController($rootScope, $scope, $state, $http, $stateParams, $timeout, Vendor,
                                    AlertService, $translate, TableController, ComboBoxController, AlertModalService, Device, $window, Area, HOST_DEVICE_SOCKET) {
        $scope.farmId = $window.localStorage.getItem("farmId");
        $scope.ComboBox = {};
        $scope.blockModal = null;
        $scope.blockUI = function () {
            if ($scope.blockModal != null) $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };
        $scope.device = {};
        $scope.editting = false;
        $scope.selectedCbb = {
            farm: [],
            area: [],
            gateway: [],
            areaMulti: [],
            areaId: null
        }
        $scope.edit = function (state) {
            $scope.editting = state
        }
        $scope.reload = function () {
            Device.getOne($stateParams.deviceId).then(function (data) {
                $scope.device = data;
                if ($scope.device.type == 2) {
                    $scope.TABLES[tableConfig.tableId].customParams = "gatewayId==" + $scope.device.id;
                    TableController.reloadPage(tableConfig.tableId);
                }
                // show vendor name
                Vendor.getOne($scope.device.vendorId).then(function (data) {
                    $scope.vendor = data.name;
                })
            })
        }

        $scope.reload();

        $scope.showRefresh = true;
        $scope.refresh = function () {
            $scope.blockUI();
            $scope.showRefresh = false;
            Device.refresh($scope.device.id).then(function (data) {
                $scope.device = data;
            });
            $timeout(function () {
                $scope.showRefresh = true;
                if ($scope.blockModal != null) $scope.blockModal.hide();
            }, 2000);
        }

        $scope.categoryMap = {
            1: 'Sensor Box',
            2: 'Bơm',
            3: 'Đèn',
            4: 'Quạt',
            5: 'Cắt nắng',
            6: 'Camera',
            7: 'Khác',
            8: 'Động co',
            9: 'Van',
            10: 'Sensor'
        };

        $scope.categoryOptions = [
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

        // khai bao cac column va kieu du lieu
        var columns = {
            'id': 'Number',
            'serial': 'Text',
            'alias': 'Text',
            'code': 'Text',
            'type': 'Text',
            'tenantId': 'Number',
            'areaId': 'Number',
            'typeFarm': 'Number',
            'gw': 'Text',
            'state': 'Text',
            'gatewayId': 'Number',
            'category': 'Number'
        };
        // khai bao cau hinh cho bang
        var tableConfig = {
            tableId: "devices",               //table Id
            model: "devices",                 //model
            defaultSort: "created",          //sap xep mac dinh theo cot nao
            sortType: "desc",                //kieu sap xep
            loadFunction: Device.getPage,     //api load du lieu
            columns: columns,               //bao gom cac cot nao
            handleAfterReload: null,        //xu ly sau khi load du lieu
            handleAfterReloadParams: null,  //tham so cho xu ly sau khi load
            deleteCallback: null,           //delete callback
            customParams: "",               //dieu kien loc ban dau
            pager_id: "table_farm_pager",   //phan trang
            page_id: "farm_selectize_page", //phan trang
            page_number_id: "farm_selectize_pageNum",   //phan trang
            page_size_option: ["5", "10000", "25", "50"]   //lua chon size cua 1 page
        };
        TableController.initTable($scope, tableConfig);     //khoi tao table
        TableController.sortDefault(tableConfig.tableId);   //set gia tri sap xep mac dinh

        var farmComboBox = {
            id: 'farm_combobox',
            url: '/api/tenants',
            originParams: '',
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: $scope.TABLES['devices'],
            column: 'tenantId',
            maxItems: 1,
            ngModel: [],
            options: [],
            placeholder: 'chọn trang trại',
            orderBy: 'name,asc'
        };
        ComboBoxController.init($scope, farmComboBox);
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
            placeholder: 'Chọn khu vực',
            orderBy: 'name,asc'
        };
        ComboBoxController.init($scope, areaComboBox);

        var shortAreaComboBox = {
            id: 'shortArea',
            url: '/api/areas',
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
        ComboBoxController.init($scope, shortAreaComboBox);

        var gatewayComboBox = {
            id: 'gateway_combobox',
            url: '/api/devices',
            originParams: 'type==1',
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: $scope.TABLES['devices'],
            column: 'gatewayId',
            maxItems: 1,
            ngModel: [],
            options: [],
            placeholder: 'chọn gateway',
            orderBy: 'id,asc'
        };
        ComboBoxController.init($scope, gatewayComboBox);

        var categoryComboBox = {
            id: 'categoryCbb',
            url: '',
            originParams: '',
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: $scope.TABLES['devices'],
            column: 'category',
            maxItems: 1,
            ngModel: [],
            options: $scope.categoryOptions,
            placeholder: 'Chọn danh mục',
            orderBy: 'name,asc'
        };
        ComboBoxController.init($scope, categoryComboBox);

        $scope.onChangArea = function () {
            $timeout(function () {
                var areaId = $scope.selectedCbb.areaId ? $scope.selectedCbb.areaId : 0;
                var customParams = $scope.device.type == 2 ? "gatewayId==" + $scope.device.id : '';
                // get child area
                if (areaId) {
                    Area.getChild(areaId).then(function (res) {
                        var areaIds = res.data && res.data.length > 0 ? res.data : 0;
                        if (customParams !== '') customParams += ";";
                        customParams += 'areaId=in=(' + areaIds.toString() + ')';

                        tableConfig.customParams = customParams;
                        TableController.reloadPage(tableConfig.tableId);
                    }).catch(function (err) {
                        console.log(err);
                    });
                } else {
                    tableConfig.customParams = customParams;
                    TableController.reloadPage(tableConfig.tableId);
                }
            })
        };

        // socket
        var stompClient = null;

        $scope.connection = function connect(topic) {
            var socket = new SockJS(HOST_DEVICE_SOCKET);
            stompClient = Stomp.over(socket);
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe(topic, function (message) {
                    handlerMessage(message);
                });
            });

        }

        $scope.connection("/topic/device-" + $stateParams.deviceId);

        function handlerMessage(message) {
            $scope.reload();
        }
    }


})();
