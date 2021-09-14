(function () {
    'use strict';
    angular.module('erpApp')
        .controller('AreaController', AreaController);

    AreaController.$inject = ['$rootScope', '$scope', '$state', '$http',
        'AlertService', '$translate', 'TableController', 'ComboBoxController', 'AlertModalService', 'Area', 'ErrorHandle'];

    function AreaController($rootScope, $scope, $state, $http,
                            AlertService, $translate, TableController, ComboBoxController, AlertModalService, Area, ErrorHandle) {
        var vm = this;
        $scope.ComboBox = {};

        $scope.cultivationOption = [
            '',
            $translate.instant("infrastructure.area.typeArea.growingMedia"),
            $translate.instant("infrastructure.area.typeArea.hydroponic"),
            $translate.instant("infrastructure.area.typeArea.land"),
            $translate.instant("infrastructure.area.typeArea.husbandry"),
            $translate.instant("infrastructure.area.typeArea.other")
        ];
        // khai bao cac column va kieu du lieu
        var columns = {
            'name': 'Text',
            'parentId': 'Number',
            'type': 'Number',
            'acreage': 'Number',
            'tenantId': 'Number',
            'shortName': 'Text'
        };

        var customParams = "tenantId == " + window.localStorage.getItem("farmId");
        // khai bao cau hinh cho bang
        var tableConfig = {
            tableId: "areas",               //table Id
            model: "areas",                 //model
            defaultSort: "created",          //sap xep mac dinh theo cot nao
            sortType: "desc",                //kieu sap xep
            loadFunction: Area.getPageFull,     //api load du lieu
            columns: columns,               //bao gom cac cot nao
            handleAfterReload: null,        //xu ly sau khi load du lieu
            handleAfterReloadParams: null,  //tham so cho xu ly sau khi load
            deleteCallback: null,           //delete callback
            customParams: customParams,               //dieu kien loc ban dau
            pager_id: "table_area_pager",   //phan trang
            page_id: "area_selectize_page", //phan trang
            page_number_id: "area_selectize_pageNum",   //phan trang
            page_size_option: ["5", "10", "25", "50"]   //lua chon size cua 1 page
        };

        TableController.initTable($scope, tableConfig);     //khoi tao table
        TableController.sortDefault(tableConfig.tableId);   //set gia tri sap xep mac dinh
        TableController.reloadPage(tableConfig.tableId);    //load du lieu cho table

        // ham xoa mac dinh
        $scope.defaultDelete = function () {
            TableController.defaultDelete(tableConfig.tableId, Area.deleteMany);
        }

        var cultivationCbb = {
            id: 'cultivationCbb',
            url: '',
            originParams: '',
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: $scope.TABLES['areas'],
            column: 'type',
            maxItems: 1,
            ngModel: [],
            options: [
                {id: 1, name: $translate.instant("infrastructure.area.typeArea.growingMedia")},
                {id: 2, name: $translate.instant("infrastructure.area.typeArea.hydroponic")},
                {id: 3, name: $translate.instant("infrastructure.area.typeArea.land")},
                {id: 4, name: $translate.instant("infrastructure.area.typeArea.husbandry")},
                {id: 5, name: $translate.instant("infrastructure.area.typeArea.other")},
            ],
            placeholder: $translate.instant("global.placeholder.choose")
        };
        ComboBoxController.init($scope, cultivationCbb);

        var parentCbb = {
            id: 'parentCbb',
            url: '/api/areas',
            originParams: '',
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: $scope.TABLES['areas'],
            column: 'parentId',
            maxItems: 1,
            ngModel: [],
            options: [],
            placeholder: $translate.instant("global.placeholder.choose")
        };
        ComboBoxController.init($scope, parentCbb);

        $scope.deleteOne= function (id) {
            UIkit.modal.confirm($translate.instant("infrastructure.area.deleteArea"), function () {
                Area.deleteOne(id).then(function (data) {
                    AlertService.success("success.msg.delete");
                    TableController.reloadPage(tableConfig.tableId);
                }).catch(function (error) {
                    TableController.highlightRowError(tableConfig.tableId, JSON.parse(error.data.params));
                    ErrorHandle.handleOneError(error);
                });
            }, {
                labels: {
                    'Ok': $translate.instant("global.button.ok"),
                    'Cancel': $translate.instant("global.button.cancel")
                }
            })
        }
    }
})();
