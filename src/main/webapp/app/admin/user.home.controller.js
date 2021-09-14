(function(){
    'use strict';
    angular.module('erpApp')
        .controller('UserHomeController',UserHomeController);

    UserHomeController.$inject = ['$rootScope','$scope','$state','$stateParams','$http','$timeout','apiData','User', 'AlertService','$translate','variables','ErrorHandle', '$window','TableController','ComboBoxController'];
    function UserHomeController($rootScope,$scope, $state,$stateParams,$http,$timeout,apiData, User, AlertService,$translate, variables, ErrorHandle, $window,TableController,ComboBoxController) {
        $scope.tenantId = $window.localStorage.getItem('farmId');
        var loadFunction = User.getPage;
        $scope.blockModal = null;
        $scope.blockUI = function () {
            if($scope.blockModal != null)
                $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };

        // function searchByOrganization(params) {
        //     return $http.get($scope.query + params).then(function (response) {
        //         return response;
        //     });
        // }
        // if(angular.isDefined($stateParams.organizationId) && $stateParams.organizationId != null){
        //     $scope.organizationId = $stateParams.organizationId;
        //     $scope.organizationName = $stateParams.organizationName;
        //     $scope.query  = '/api/users/search-by-organization?organizationId='+ $stateParams.organizationId +'&';
        //     loadFunction = searchByOrganization;
        // }


        $scope.ComboBox = {};
        // khai bao cac column va kieu du lieu
        var columns = {
            'id':'Number',
            'email':'Text',
            'fullName':'Text',
            'created':'DateTime',
            'createdBy':'Text',
            'updated':'DateTime',
            'updatedBy':'Text',
            'active':'Number'
        };

        // khai bao cau hinh cho bang
        var tableConfig = {
            tableId: "users",               //table Id
            model: "users",                 //model
            defaultSort:"created",          //sap xep mac dinh theo cot nao
            sortType: "desc",                //kieu sap xep
            loadFunction: loadFunction,     //api load du lieu
            columns: columns,               //bao gom cac cot nao
            handleAfterReload: null,        //xu ly sau khi load du lieu
            handleAfterReloadParams: null,  //tham so cho xu ly sau khi load
            deleteCallback: null,           //delete callback
            customParams: "",               //dieu kien loc ban dau
            pager_id: "table_user_pager",   //phan trang
            page_id: "user_selectize_page", //phan trang
            page_number_id: "user_selectize_pageNum",   //phan trang
            page_size_option: ["5", "10", "25", "50"]   //lua chon size cua 1 page
        }

        TableController.initTable($scope, tableConfig);     //khoi tao table
        TableController.sortDefault(tableConfig.tableId);   //set gia tri sap xep mac dinh
        TableController.reloadPage(tableConfig.tableId);    //load du lieu cho table

        // filter user by tenant
        // var tenantId = $scope.tenantId ? $scope.tenantId : 0;
        // User.getUserInTenant(tenantId).then(function (data) {
        //     tableConfig.customParams = !data || data.length < 1 ? "id==0" : "id=in=(" + data.toString() + ")";
        //     TableController.reloadPage(tableConfig.tableId);
        // });

        // ham xoa mac dinh
        $scope.defaultDelete = async function () {
            TableController.defaultDelete(tableConfig.tableId,User.deleteMany);
        };
        // $scope.defaultDelete = async function () {
        //     var ids = TableController.getSelectedRowIDs(tableConfig.tableId);
        //     let isExistsActiveUser = await checkExistsActiveUserBeforeDelete(ids);
        //     if(isExistsActiveUser){
        //         AlertService.error($translate.instant("error.userAndPermission.deleteActiveUser"));
        //         $scope.$apply();
        //     } else{
        //         TableController.defaultDelete(tableConfig.tableId,User.deleteMany);
        //     }
        // };

        // active mac dinh
        $scope.activate = function () {
            TableController.defaultActive(tableConfig.tableId,User.active);
        }

        //deactivate mac dinh
        $scope.deactivate = function () {
            TableController.defaultDeactive(tableConfig.tableId,User.deactivate);
        }

        $scope.deleteOne = function (id){
            UIkit.modal.confirm($translate.instant("global.actionConfirm.delete"), function () {
                $scope.blockUI();
                User.deleteOne(id).then(function () {
                    if($scope.blockModal != null) $scope.blockModal.hide();
                    AlertService.success("success.msg.delete");

                    TableController.reloadPage(tableConfig.tableId);
                }).catch(function (data) {
                    if($scope.blockModal != null) $scope.blockModal.hide();
                    ErrorHandle.handleOneError(data);
                });
            }, {
                labels: {
                    'Ok': $translate.instant("global.button.ok"),
                    'Cancel': $translate.instant("global.button.cancel")
                }
            });
        };

        $scope.handleActive = function(id,email,active){
            $scope.activeUserId = id;
            $scope.activeUser = active;
            $scope.userEmail = email;
            if(active==1){
                $scope.activeMsg = $translate.instant("admin.user.inactiveUser");
            } else {
                $scope.activeMsg = $translate.instant("admin.user.activeUser");
            }
            $timeout(function () {
                angular.element("#activeBtn").trigger("click");
            });
        }

        $scope.activeOne = function(){
            var ids = [];
            ids.push($scope.activeUserId);
            if($scope.activeUser == 1){
                User.deactivate(ids).then(function () {
                    AlertService.success("success.msg.update");
                    TableController.reloadPage(tableConfig.tableId);
                }).catch(function(data){
                    ErrorHandle.handleError(data);
                });
            } else {
                User.activate(ids).then(function () {
                    AlertService.success("success.msg.update");
                    TableController.reloadPage(tableConfig.tableId);
                }).catch(function(data){
                    ErrorHandle.handleError(data);
                });
            }
        }
        $scope.ComboBox = {};

        var emailComboBox = {
            id:'users-email',
            url:'/api/users',
            originParams:'',
            valueField:'email',
            labelField:'email',
            searchField:'email',
            table:$scope.TABLES['users'],
            column:'email',
            maxItems:1,
            ngModel:[],
            options:[],
            placeholder:$translate.instant("global.placeholder.search")
        }

        ComboBoxController.init($scope,emailComboBox);

        async function checkExistsActiveUserBeforeDelete(ids) {
            var isActive = false;
            let query = "query=id=in=(" + ids + ")&page=0&size=10000";
            var data = await User.getPage(query);
            if(!data.data || data.data.length < 1) return false;

            var users = data.data;
            for(var i = 0; i < users.length; i++){
                if(users[i].active) {
                    isActive = true;
                    break;
                }
            }

            return  isActive;
        }
    }

})();