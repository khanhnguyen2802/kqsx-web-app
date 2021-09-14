(function () {
    'use strict';
    angular.module('erpApp')
        .controller('AreaDetailController', AreaDetailController);

    AreaDetailController.$inject = ['$rootScope', '$scope', '$state', '$http','$stateParams', '$timeout',
        'AlertService', '$translate', 'TableController', 'ComboBoxController', 'AlertModalService', 'Area', 'Common'];

    function AreaDetailController($rootScope, $scope, $state, $http,$stateParams, $timeout,
                                  AlertService, $translate, TableController, ComboBoxController, AlertModalService, Area, Common) {
        $scope.ComboBox = {};
        $scope.blockModal = null;
        $scope.blockUI = function () {
            if ($scope.blockModal != null)
                $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };

        $scope.tab = 1;
        $scope.clickTab = function (i) {
            $scope.tab = i;
        };

        $scope.area = {};

        $scope.cultivationOption = [
            '',
            $translate.instant("infrastructure.area.typeArea.growingMedia"),
            $translate.instant("infrastructure.area.typeArea.hydroponic"),
            $translate.instant("infrastructure.area.typeArea.land"),
            $translate.instant("infrastructure.area.typeArea.husbandry"),
            $translate.instant("infrastructure.area.typeArea.other")
        ];

        // ========= CBB ===============

        //======================DEVICE=======================

        // khai bao cac column va kieu du lieu
        var columns = {
            'id': 'Number',
            'name': 'Text'
        };

        // khai bao cau hinh cho bang
        var tableDeviceConfig = {
            tableId: "devices",               //table Id
            model: "devices",                 //model
            defaultSort: "created",          //sap xep mac dinh theo cot nao
            sortType: "desc",                //kieu sap xep
            loadFunction: Area.getPage,     //api load du lieu
            columns: columns,               //bao gom cac cot nao
            handleAfterReload: null,        //xu ly sau khi load du lieu
            handleAfterReloadParams: null,  //tham so cho xu ly sau khi load
            deleteCallback: null,           //delete callback
            customParams: "",               //dieu kien loc ban dau
            pager_id: "table_device_pager",   //phan trang
            page_id: "device_selectize_page", //phan trang
            page_number_id: "device_selectize_pageNum",   //phan trang
            page_size_option: ["5", "10", "25", "50"]   //lua chon size cua 1 page
        };

        TableController.initTable($scope, tableDeviceConfig);     //khoi tao table
        TableController.sortDefault(tableDeviceConfig.tableId);   //set gia tri sap xep mac dinh
        // TableController.reloadPage(tableDeviceConfig.tableId);    //load du lieu cho table

        //====================PRODUCT===========================
        // khai bao cac column va kieu du lieu
        var columnsProduct = {
            'id': 'Number',
            'name': 'Text',
            'method': 'Text',
            'type': 'Text',
            'phase': 'Text',
            'characteristic': 'Text'
        };

        // khai bao cau hinh cho bang
        var tableProductConfig = {
            tableId: "products",               //table Id
            model: "products",                 //model
            defaultSort: "created",          //sap xep mac dinh theo cot nao
            sortType: "desc",                //kieu sap xep
            loadFunction: Area.getPage,     //api load du lieu
            columns: columnsProduct,               //bao gom cac cot nao
            handleAfterReload: null,        //xu ly sau khi load du lieu
            handleAfterReloadParams: null,  //tham so cho xu ly sau khi load
            deleteCallback: null,           //delete callback
            customParams: "",               //dieu kien loc ban dau
            pager_id: "table_device_pager",   //phan trang
            page_id: "device_selectize_page", //phan trang
            page_number_id: "device_selectize_pageNum",   //phan trang
            page_size_option: ["5", "10", "25", "50"]   //lua chon size cua 1 page
        };

        TableController.initTable($scope, tableProductConfig);     //khoi tao table
        TableController.sortDefault(tableProductConfig.tableId);   //set gia tri sap xep mac dinh
        // TableController.reloadPage(tableProductConfig.tableId);    //load du lieu cho table

        // ==========================================
        $scope.blockUI();
        Area.getFull($stateParams.areaId).then(function (data) {
            $scope.area = data;
            if ($scope.blockModal != null) $scope.blockModal.hide();
            $scope.area.subName = Common.truncateString($scope.area.name, 40);
            $scope.topic = '/topic/device-telemetry-' + $scope.area.alias;
            $scope.connection();
        }).catch(function (error) {
            if ($scope.blockModal != null) $scope.blockModal.hide();
        });

        //========================SOCKET===================
        var stompClient = null;
        $scope.connection = function connect() {
            var socket = new SockJS(HOST_DEVICE_SOCKET);
            stompClient = Stomp.over(socket);
            stompClient.connect({}, function(frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe($scope.topic, function(message) {
                    handlerMessage(message);
                });
            });
        }

        function handlerMessage(message) {
            Area.getFull($stateParams.areaId).then(function (data) {
                $scope.area = data;
                if ($scope.blockModal != null) $scope.blockModal.hide();
                $scope.area.subName = Common.truncateString($scope.area.name, 40);
            }).catch(function (error) {
                if ($scope.blockModal != null) $scope.blockModal.hide();
            });

        }
    }
})();
