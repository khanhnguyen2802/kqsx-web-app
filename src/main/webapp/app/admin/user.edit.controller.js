(function(){
    'use strict';
    angular.module('erpApp')
        .controller('UserEditController',UserEditController);

    UserEditController.$inject = ['$rootScope','$scope','$state','$stateParams','User', 'Role', 'AlertService','AlertModalService', 'ErrorHandle', '$translate','FileService','$timeout', 'ComboBoxController','Farm'];
    function UserEditController($rootScope,$scope, $state, $stateParams, User, Role, AlertService,AlertModalService, ErrorHandle, $translate,FileService,$timeout, ComboBoxController,Farm) {
        $scope.ComboBox = {};
        $scope.blockModal = null;
        $scope.blockUI = function () {
            if($scope.blockModal != null)
                $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };
        $scope.forms_advanced = {
            selectize_roles: [],
            selectize_farms:[]
        };
        $scope.selectedCbb = {
            role: []
        };

        $scope.email_msg = $translate.instant('admin.messages.invalidEmail');
        $scope.required_msg = $translate.instant('admin.messages.required');
        $scope.maxLength255 = $translate.instant('global.messages.maxLength255')
        $scope.phoneMaxLength = $translate.instant('global.messages.phoneMaxLength')
        $scope.phone = $translate.instant('global.messages.phone')

        $scope.user = {};
        $scope.organizationIds = [];
        $scope.organizations = [];
        $scope.user.oldAvatar = "";
        $scope.allRoles = {};

        var statusStyle = {
            true: "uk-text-success uk-text-bold",
            false: "uk-text-danger uk-text-bold"
        };

        var roleComboBox = {
            id:'roleId',
            url:'/api/roles',
            originParams:'tenantId==0', // chỉ lấy địa điểm
            valueField:'id',
            labelField:'name',
            searchField:'name',
            table: null,
            column: null,
            maxItems:null,
            ngModel:[],
            options:[],
            placeholder: "Chọn vai trò"
        };
        ComboBoxController.init($scope, roleComboBox);

        // =========================================
        $timeout(function () {
            $scope.$watch('forms_advanced.selectize_farms', function (newVal, oldVal) {
                // k thay doi
                if(newVal === oldVal) return;

                var tenantIds = newVal;
                $scope.selectedCbb.role = [];
                roleComboBox.resetScroll = true;
                roleComboBox.options = [""];
                if(tenantIds === null || tenantIds.length < 1){
                    roleComboBox.originParams = 'tenantId==0';
                    ComboBoxController.init($scope, roleComboBox);
                } else{
                    // k phai SA thi bo qua id = 1
                    roleComboBox.originParams = "(type==1,tenantId=in=(" + tenantIds.toString() + "))";
                    ComboBoxController.init($scope, roleComboBox);
                }
            });
        }, 1000);

        User.getUserById($stateParams.userId).then(function (data) {
            $scope.user = data;
            $scope.user.oldAvatar = data.userAvatar;

            Farm.getAll().then(function (farms) {
                $scope.status = "Inactive";
                $scope.active = $scope.user.active;
                if ($scope.active) {
                    $scope.status = "Active"
                }
                $scope.activeClass = statusStyle[$scope.active];

                $scope.selectize_farm_options = farms;
                $scope.allFarms = {};
                for(var i = 0; i< farms.length; i++){
                    $scope.allFarms[farms[i].id] = farms[i];
                }

                var tenantIds = [];
                for(var j = 0; j < $scope.user.tenants.length; j++) {
                    $scope.forms_advanced.selectize_farms.push($scope.user.tenants[j].id);
                    tenantIds.push($scope.user.tenants[j].id);
                }

                for(var i = 0; i < $scope.user.roles.length; i++) {
                    $scope.forms_advanced.selectize_roles.push($scope.user.roles[i].id);
                }

                roleComboBox.originParams = "(type==1,tenantId=in=(" + tenantIds.toString() + "))";
                roleComboBox.options = [data.roles];
                ComboBoxController.init($scope, roleComboBox);
            });
        });

        $scope.btnDisable = false;
        $scope.submit = function(isClose) {
            var $form = $("#form_createuser");
            $('#form_createuser').parsley();
            if(!$scope.form_createuser.$valid) return;
            if(!ComboBoxController.checkIsValidForm($form)) return;
            if($scope.btnDisable) return;

            $scope.btnDisable = true;
            $scope.blockUI();

            // delete old avatar
            if($scope.user.oldAvatar && (!$scope.user.userAvatar || $scope.user.userAvatar === "")){
                FileService.deleteFileUpload($scope.user.oldAvatar);
            }

            // upload Avatar first
            var file = $("#user-input-form-file")[0].files[0];
            if(file){
                FileService.uploadAvatar(file, 1).then(function (data) {
                    $scope.user.userAvatar = data.data.fileName;
                    updateUser(isClose);
                }).catch(function (data) {
                    if($scope.blockModal != null) $scope.blockModal.hide();
                    ErrorHandle.handleOneError(data);
                    $scope.btnDisable = false;
                });
            } else{
                // if dont have file: update immedimately
                updateUser(isClose);
            }
        };

        function updateUser(isClose){
            $scope.user.roles = [];
            $scope.user.tenants = [];
            $scope.user.roles = $scope.selectedCbb.role;

            for(var i = 0; i < $scope.forms_advanced.selectize_farms.length; i++) {
                var farmId = $scope.forms_advanced.selectize_farms[i];
                $scope.user.tenants.push($scope.allFarms[farmId]);
            }

            User.update($scope.user).then(function(data){
                if($scope.blockModal != null) $scope.blockModal.hide();
                AlertModalService.popup("success.msg.update");
                $timeout(function () {
                    isClose?$state.go('users'):$state.go('users-detail',{userId: data.id});
                },1100);

            }).catch(function(data){
                if($scope.blockModal != null) $scope.blockModal.hide();
                ErrorHandle.handleOneError(data);
                $scope.btnDisable = false;
            })
        }

        $scope.deleteUserAvatar = function () {
            UIkit.modal.confirm($translate.instant("global.messages.deleteAvatar"), function () {
                // xóa image dã chọn trong input
                $('#user-input-form-file').val("");
                $scope.user.userAvatar = "";
                $scope.user.userAvatarBase64 = "";
            }, {
                labels: {
                    'Ok': $translate.instant("global.button.ok"),
                    'Cancel': $translate.instant("global.button.cancel")
                }
            });
        };

        $scope.CbxActivate = {
            activateService:User.activate,
            deactivateService:User.deactivate
        };

        if ( angular.element('#form_createuser').length ) {
            $scope.selectize_farm_config = {
                plugins: {
                    'remove_button': {
                        label     : ''
                    }
                },
                maxItems: null,
                valueField: 'id',
                labelField: 'name',
                searchField: 'name',
                create: false,
                render: {
                    option: function(farmData, escape) {
                        return  '<div class="option">' +
                            '<span class="title">' + escape(farmData.name) + '</span>' +
                            '</div>';
                    },
                    item: function(farmData, escape) {
                        return '<div class="item longTextShowToolTip" title="'+escape(farmData.name)+'"><a href="/#/farms/'+ escape(farmData.id) + '/detail">'  + escape(farmData.name) + '</a></div>';
                    }
                }
            };

            var $formValidate = $('#form_createuser');
            $formValidate
                .parsley({
                    'excluded': 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], .selectize-input > input'
                })
                .on('form:validated',function() {
                    $scope.$apply();
                })
                .on('field:validated',function(parsleyField) {
                    if($(parsleyField.$element).hasClass('md-input')) {
                        $scope.$apply();
                    }
                });
        }
    }

})();