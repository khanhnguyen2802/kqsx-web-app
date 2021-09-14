

(function () {
    'use strict';
    angular.module('erpApp').controller('GroupDeviceController', GroupDeviceController);

    GroupDeviceController.$inject = ['$rootScope', '$scope', '$state', '$translate', '$timeout', 'AlertService',
        'TableController', 'ComboBoxController', 'AlertModalService', 'ErrorHandle', 'GroupDevice', 'AutomaticControl',
        'Area', 'Device', '$window','HOST_DEVICE_SOCKET'];

    function GroupDeviceController($rootScope, $scope, $state, $translate, $timeout, AlertService,
                                   TableController, ComboBoxController, AlertModalService, ErrorHandle, GroupDevice, AutomaticControl,
                                   Area, Device, $window,HOST_DEVICE_SOCKET) {
        $scope.tenantId = $window.localStorage.getItem("farmId") ? $window.localStorage.getItem("farmId") : 0;
        $scope.ComboBox = {};
        $scope.blockModal = null;
        $scope.blockUI = function () {
            if($scope.blockModal != null) $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };

        $scope.cbbSearch = {
            areaId: null,
            tenantId: null
        };

        $scope.typeOptions = ['Thủ công','Tự động', 'Đang cập nhật'];

        // khai bao cac column va kieu du lieu
        var columns = {
            'id':'Number',
            'serial':'Text',
            'name':'Text',
            'code':'Text',
            'type':'Text',
            'tenantId':'Number',
            'areaId':'Number',
            'typeFarm':'Number',
            'gw':'Text',
            'state':'Text',
            'gatewayId':'Number',
            'groupDeviceId': 'Number',
            'devices':'Text'
        };

        // khai bao cau hinh cho bang
        var tableConfig = {
            tableId: "groupDevices",               //table Id
            model: "groupDevices",                 //model
            defaultSort:"created",          //sap xep mac dinh theo cot nao
            sortType: "desc",                //kieu sap xep
            loadFunction: GroupDevice.searchFull,     //api load du lieu
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

        $scope.init = function () {
            TableController.initTable($scope, tableConfig);     //khoi tao table
            TableController.sortDefault(tableConfig.tableId);   //set gia tri sap xep mac dinh
            TableController.reloadPage(tableConfig.tableId);    //load du lieu cho table
        }
        $scope.init();

        var areaCbb = {
            id: 'areaCbb',
            url: '/api/areas',
            originParams: 'tenantId==' + $scope.tenantId,
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            table: null,
            column: null,
            maxItems: 1,
            ngModel: [],
            options: [],
            placeholder: $translate.instant('device.placeholder.selectArea'),
            orderBy: 'name,asc'
        };
        ComboBoxController.init($scope, areaCbb);

        // ====================================
        $scope.areaChange = function(){
            $timeout(function () {
                var areaId = $scope.cbbSearch.areaId ? $scope.cbbSearch.areaId : 0;
                var tenantId = $scope.tenantId;
                var query = "tenantId==" + tenantId;

                if(!areaId){
                    tableConfig.customParams = query;
                    TableController.reloadPageAndPageable(tableConfig.tableId);
                } else{
                    // get child area
                    Area.getChild(areaId).then(function (res) {
                        $scope.areaIds = res.data;
                        if(!$scope.areaIds || $scope.areaIds.length < 1) {
                            query += ";areaId==0";
                        } else {
                            query += ";areaId=in=(" + $scope.areaIds.toString() + ")";
                        }

                        tableConfig.customParams = query;
                        TableController.reloadPageAndPageable(tableConfig.tableId);
                    }).catch(function (err) {
                        console.log(err);
                    });
                }
            })
        };

        function getSelectedRowIDs(table_id) {
            return $scope.TABLES[table_id].param_check_list;
        }

        async function used(ids, check) {
            for (let i = 0; i < ids.length; i++) {
                let query = "query=groupDeviceId==" + ids[i];
                await AutomaticControl.getPage(query).then(function (response) {
                    if (response.data.length > 0) {
                        check = true;
                    }
                })
                if (check) {
                    break;
                }
            }
            if (check) {
                if (ids.length == 1) {
                    $scope.deleteMsg = $translate.instant("error.groupDevice.groupDeviceInUsed");
                    $timeout(function () {
                        angular.element("#deleteStop").trigger("click");
                    });
                } else if (ids.length > 1) {
                    $scope.deleteMsg = $translate.instant("error.groupDevice.groupDevicesInUsed");
                    $timeout(function () {
                        angular.element("#deleteStop").trigger("click");
                    });
                }
            } else {
                TableController.defaultDelete(tableConfig.tableId, GroupDevice.deleteRecord);
            }
        }

        // ham xoa mac dinh
        $scope.defaultDelete = function () {
            var ids = getSelectedRowIDs(tableConfig.tableId);
            var checkUsed = false;
            used(ids, checkUsed);
            // console.log(checkUsed);
        };

        $scope.deleteOne = function(id){
            UIkit.modal.confirm($translate.instant("global.actionConfirm.delete"), function () {
                GroupDevice.deleteOne(id).then(function () {
                    TableController.reloadPage(tableConfig.tableId);
                }).catch(function(data){
                        ErrorHandle.handleError(data);
                    })
            }, {
                labels: {
                    'Ok': $translate.instant("global.button.delete"),
                    'Cancel': $translate.instant("global.button.cancel2")
                }
            });
        };

        $scope.controlDevice = function (outerIndex,innerIndex,code,state) {
            $scope.blockUI();
            $scope.groupDevices[outerIndex].devices[innerIndex].state = 2;
            Device.control(code,state).then(function () {
                TableController.reloadPage(tableConfig.tableId);
                if($scope.blockModal != null) $scope.blockModal.hide();
            }).catch(function (err) {
                ErrorHandle.handleOneError(err);
            });
        };

        $scope.switchMode = function (outerIndex,id,mode) {
            console.log(id)
            var msg = mode==0?$translate.instant('device.groupDevice.switchManualMode'):$translate.instant('device.groupDevice.switchAutoMode');
            UIkit.modal.confirm(msg, function () {
                $scope.blockUI();
                $scope.groupDevices[outerIndex].type = 2;
                Device.switchMode(id,mode).then(function () {
                    if($scope.blockModal != null) $scope.blockModal.hide();
                }).catch(function (err) {
                    ErrorHandle.handleOneError(err);
                });
            }, {
                labels: {
                    'Ok': $translate.instant("global.button.ok"),
                    'Cancel': $translate.instant("global.button.cancel")
                }
            });
        };

        // $scope.getStatusGroup = function (devices) {
        //     var status = 'Tắt';
        //     if(!devices || devices.length < 1) return status;
        //     var totalExpected = devices.length;
        //     var countOn = 0;
        //     var countOff = 0;
        //     for(var i = 0; i < devices.length; i++){
        //         if(devices[i].state) countOn += 1;
        //         else countOff += 1;
        //     }
        //
        //     // nếu tất cả on thì là bật, ngược lại là tắt
        //     if(countOn === totalExpected) status = 'Bật';
        //     else if(countOff === totalExpected) status = 'Tắt';
        //     else status = 'Đang cập nhật';
        //
        //     return status;
        // }

        // ====================WEB SOCKET========================
        var stompClient = null;
        $scope.connection = function connect() {
            var socket = new SockJS(HOST_DEVICE_SOCKET);
            stompClient = Stomp.over(socket);
            stompClient.connect({}, function(frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe('/topic/device-status-' +  $scope.tenantId, function(message) {
                    handlerMessage(message);
                });
            });
        }

        $scope.connection();

        function handlerMessage(message) {
            $timeout(function () {
                TableController.reloadPage(tableConfig.tableId);
            });

        }
    }
})();
