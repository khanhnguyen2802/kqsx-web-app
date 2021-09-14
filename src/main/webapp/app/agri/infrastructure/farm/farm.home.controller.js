(function () {
    'use strict';
    angular.module('erpApp')
        .controller('FarmController', FarmController);

    FarmController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$http','$timeout', 'AlertService', '$translate',
        'TableController', 'ComboBoxController', 'AlertModalService', 'ErrorHandle', 'Farm', 'Area', 'Product', 'Common'];

    function FarmController($rootScope, $scope, $state, $stateParams, $http,$timeout, AlertService, $translate, TableController,
                            ComboBoxController, AlertModalService, ErrorHandle, Farm, Area, Product, Common) {
        $scope.ComboBox = {};

        // khai bao cac column va kieu du lieu
        var columns = {
            'id':'Number',
            'email':'Text',
            'name':'Text',
            'code':'Text',
            'owner':'Text',
            'phone':'Text',
            'acreage':'Number',
            'productionType':'Number',
            'address':'Text',
            'created':'DateTime',
            'createdBy':'Text',
            'updated':'DateTime',
            'updatedBy':'Text',
            'active':'Number',
            'size':'Number'
        };

        // khai bao cau hinh cho bang
        var tableConfig = {
            tableId: "farms",               //table Id
            model: "farms",                 //model
            defaultSort:"created",          //sap xep mac dinh theo cot nao
            sortType: "desc",                //kieu sap xep
            loadFunction: Farm.getPage,     //api load du lieu
            columns: columns,               //bao gom cac cot nao
            handleAfterReload: null,        //xu ly sau khi load du lieu
            handleAfterReloadParams: null,  //tham so cho xu ly sau khi load
            deleteCallback: null,           //delete callback
            customParams: "type==2",               //dieu kien loc ban dau
            pager_id: "table_farm_pager",   //phan trang
            page_id: "farm_selectize_page", //phan trang
            page_number_id: "farm_selectize_pageNum",   //phan trang
            page_size_option: ["5", "10", "25", "50"]   //lua chon size cua 1 page
        };

        TableController.initTable($scope, tableConfig);     //khoi tao table
        TableController.sortDefault(tableConfig.tableId);   //set gia tri sap xep mac dinh
        TableController.reloadPage(tableConfig.tableId);    //load du lieu cho table

        // ham xoa mac dinh
        $scope.defaultDelete = function () {
            var ids = TableController.getSelectedRowIDs(tableConfig.tableId);
            checkConstraint(ids).then(function (isDelete) {
                if(isDelete) {
                    TableController.defaultDelete(tableConfig.tableId, Farm.deleteMany);
                }
            });
        }
        
        $scope.deleteOne = function (id) {
            UIkit.modal.confirm($translate.instant("infrastructure.farm.deleteFarm"), function () {
                checkConstraint([id], true).then(function (isDelete) {
                    if(isDelete) {
                        Farm.deleteOne(id).then(function (data) {
                            AlertService.success("success.msg.delete");
                            TableController.reloadPage(tableConfig.tableId);
                        }).catch(function (err) {
                            ErrorHandle.handleOneError(err);
                        });
                    }
                });
            }, {
                labels: {
                    'Ok': $translate.instant("global.button.ok"),
                    'Cancel': $translate.instant("global.button.cancel")
                }
            })
        };

        $scope.typeFarm = Common.getTypeFarm();

        async function checkConstraint(ids) {
            var canDelete = true;
            var errorIds = [];
            for(let id of ids) {
                let query = "query=tenantId==" + id + "&page=0&size=1";
                let areas = await Area.getPageFull(query);

                if(areas.data.length) {
                    errorIds.push(id);
                    canDelete = false;
                } else {
                    let products = await Product.getPageFull(query);
                    if(products.data.length) {
                        errorIds.push(id);
                        canDelete = false;
                    } else {
                        canDelete = canDelete ? true : false;
                    }
                }
            }

            if(canDelete) {
                return true;
            } else {
                AlertModalService.handleOneError($translate.instant("error.farm.usedFarm"));
                TableController.highlightRowError(tableConfig.tableId, errorIds);
                return false;
            }
        }
    }
})();
