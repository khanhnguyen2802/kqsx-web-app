

(function () {
    'use strict';
    angular.module('erpApp').controller('DevicesController', DevicesController);

    DevicesController.$inject = ['$rootScope', '$scope', '$state', '$http','$timeout',
        'AlertService', '$translate', 'TableController', 'ComboBoxController', 'AlertModalService',
        'Device', 'ErrorHandle','HOST_DEVICE_SOCKET', '$window'];

    function DevicesController($rootScope, $scope, $state, $http,$timeout,
                                  AlertService, $translate, TableController, ComboBoxController, AlertModalService,
                               Device, ErrorHandle,HOST_DEVICE_SOCKET, $window) {
        $scope.tenantId = $window.localStorage.getItem("farmId");
        $scope.ComboBox = {};

        $scope.stateFields = [
            { value: 0, title: 'Đăng ký'},
            { value: 1, title: 'Kết nối'},
            { value: 2, title: 'Mất kết nối'}
        ];

        $scope.typeFields = [
            { value: 2, title: 'Gateway'},
            { value: 1, title: 'Device'},
            { value: 3, title: 'Other'}
        ];

        // khai bao cac column va kieu du lieu
        var columns = {
            'id':'Number',
            'serial':'Text',
            'alias':'Text',
            'code':'Text',
            'type':'Number',
            'tenantId':'Number',
            'areaId':'Number',
            'typeFarm':'Number',
            'gw':'Text',
            'state':'Text',
            'gatewayId':'Number',
            'connectionState': 'Number'
        };

        // khai bao cau hinh cho bang
        var tableConfig = {
            tableId: "devices",               //table Id
            model: "devices",                 //model
            defaultSort:"created",          //sap xep mac dinh theo cot nao
            sortType: "desc",                //kieu sap xep
            loadFunction: Device.getPage,     //api load du lieu
            columns: columns,               //bao gom cac cot nao
            handleAfterReload: null,        //xu ly sau khi load du lieu
            handleAfterReloadParams: null,  //tham so cho xu ly sau khi load
            deleteCallback: null,           //delete callback
            customParams: "tenantId==" + $scope.tenantId,               //dieu kien loc ban dau
            pager_id: "table_device_pager",   //phan trang
            page_id: "device_selectize_page", //phan trang
            page_number_id: "device_selectize_pageNum",   //phan trang
            page_size_option: ["5", "10", "25", "50"]   //lua chon size cua 1 page
        };

        TableController.initTable($scope, tableConfig);     //khoi tao table
        TableController.sortDefault(tableConfig.tableId);   //set gia tri sap xep mac dinh
        TableController.reloadPage(tableConfig.tableId);    //load du lieu cho table

        var areaComboBox = {
            id: 'area_combobox',
            url: '/api/areas',
            originParams: 'tenantId==' + $scope.tenantId,
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: $scope.TABLES['devices'],
            column: 'areaId',
            maxItems: 1,
            ngModel: [],
            options: [],
            placeholder: $translate.instant('device.placeholder.selectArea'),
            orderBy: 'name,asc'
        }
        ComboBoxController.init($scope, areaComboBox);
        var gatewayComboBox = {
            id: 'gateway_combobox',
            url: '/api/devices',
            originParams: 'type==2' +  ';tenantId==' + $scope.tenantId,
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: $scope.TABLES['devices'],
            column: 'gatewayId',
            maxItems: 1,
            ngModel: [],
            options: [],
            placeholder: $translate.instant('device.placeholder.selectGateway'),
            orderBy: 'id,asc'
        }
        ComboBoxController.init($scope, gatewayComboBox);
        // ham xoa mac dinh
        $scope.defaultDelete = function () {
            TableController.defaultDelete(tableConfig.tableId,Device.deleteRecord);
        }

        $scope.deleteOne = function(id){
            UIkit.modal.confirm($translate.instant("global.actionConfirm.delete"), function () {
                Device.deleteOne(id).then(function () {
                    AlertModalService.popup("success.msg.delete");
                    TableController.reloadPage(tableConfig.tableId);
                }).catch(function(err){
                    ErrorHandle.handleOneError(err);
                })
            }, {
                labels: {
                    'Ok': $translate.instant("global.button.delete"),
                    'Cancel': $translate.instant("global.button.cancel")
                }
            });

        }

        var stompClient = null;

        $scope.connection = function connect() {
            var socket = new SockJS(HOST_DEVICE_SOCKET);
            stompClient = Stomp.over(socket);
            stompClient.connect({}, function(frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe('/topic/public', function(message) {
                    handlerMessage(message);
                });
            });

        }

        function handlerMessage(message) {
            $timeout(function () {
                $scope.testMessage = message.body;
            });

        }
    }
})();
