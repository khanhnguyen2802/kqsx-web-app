(function(){
    'use strict';
    angular.module('erpApp')
        .controller('UserProfileEditController',UserProfileEditController);

    UserProfileEditController.$inject = ['$rootScope','$scope','$state','$stateParams','User', 'Role', 'AlertService', 'ErrorHandle', '$translate','Farm','$timeout', 'ComboBoxController', 'FileService'];
    function UserProfileEditController($rootScope,$scope, $state, $stateParams, User, Role, AlertService, ErrorHandle, $translate,Farm,$timeout, ComboBoxController, FileService) {
        $scope.blockModal = null;
        $scope.blockUI = function () {
            if($scope.blockModal != null)
                $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };
        $scope.user = {};
        $scope.user.oldAvatar = "";
        $scope.allRoles = {};

        var statusStyle = {
            true: "uk-text-success uk-text-bold",
            false: "uk-text-danger uk-text-bold"
        }

        User.current().then(function (data) {
            $scope.user = data;
            $scope.user.oldAvatar = data.userAvatar;
            $scope.user.createdDate = getDateString($scope.user.created);
            $scope.user.updatedDate = getDateString($scope.user.updated);

            $scope.selectize_roles_options = $scope.user.roles;

            for(var j = 0; j < $scope.user.roles.length; j++) {
                $scope.forms_advanced.selectize_roles.push($scope.user.roles[j].id);
            }
            for(var j = 0; j < $scope.user.tenants.length; j++) {
                $scope.forms_advanced.selectize_farms.push($scope.user.tenants[j].id);
            }

            Role.getAll().then(function (data) {
                $scope.selectize_roles_options = data;
                $scope.allRoles = {};
                for(var i=0; i< data.length; i++){
                    $scope.allRoles[data[i].id] = data[i];
                }
            });

            Farm.getAll().then(function (data) {
                $scope.selectize_farm_options = data;
                $scope.allFarms = {};
                for(var i=0; i< data.length; i++){
                    $scope.allFarms[data[i].id] = data[i];
                }
            });

            $scope.status = "Inactive";
            $scope.active = $scope.user.active;
            if ($scope.active) {
                $scope.status = "Active"
            }
            $scope.activeClass = statusStyle[$scope.active]

        });

        $scope.clickActiveLock = false;
        $scope.clickActive = function () {
            if(!$scope.clickActiveLock) {
                $scope.clickActiveLock = true;
                $scope.status = statusTitle[$scope.active];
            } else {
                // continue click, need change
                $scope.changeActive();
            }
        }

        $scope.changeActive = function () {
            $scope.active = !$scope.active;
            $scope.user.active = !$scope.user.active;
            if ($scope.active) {
                $scope.status = "Active"
            } else {
                $scope.status = "Inactive"
            }
            $scope.activeClass = statusStyle[$scope.active]
        }

        var statusTitle = {
            true: "Active",
            false: "Inactive"
        }

        function getDateString(unix_timestamp) {
            var date = new Date(unix_timestamp);
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            if(day < 10)
                day = "0" + day;
            if(month < 10)
                month = "0" + month;
            return day + "/" + month + "/" + year;
        }

        $scope.deleteUser = function () {
            UIkit.modal.confirm($translate.instant($scope.actionConfirm.delete), function () {
                User.deleteOne($scope.user.id).then(function(data){
                    $state.go('users');
                }).catch(function(data){
                    //AlertService.error('admin.messages.errorDeleteUser');
                    ErrorHandle.handleError(data)
                })
            }, {
                labels: {
                    'Ok': $translate.instant("global.button.ok"),
                    'Cancel': $translate.instant("global.button.cancel")
                }
            });
        }

        $scope.btnDisable = false;
        $scope.submit = function() {
            $('#form_createuser').parsley();
            var $form = $('#form_createuser');
            if(!$scope.form_createuser.$valid) return;
            if(!ComboBoxController.checkIsValidForm($form)) return;
            if($scope.btnDisable) return;
            $scope.btnDisable = true;

            $scope.blockUI();
            // delete old avatar
            if($scope.user.oldAvatar && (!$scope.user.userAvatar || $scope.user.userAvatar == "")){
                FileService.deleteFileUpload($scope.user.oldAvatar);
            }

            // upload Avatar first
            var file = $("#user-input-form-file")[0].files[0];
            if(file){
                FileService.uploadAvatar(file, 1).then(function (data) {
                    $scope.user.userAvatar = data.data.fileName;
                    updateUser();
                }).catch(function (data) {
                    console.log(data);
                    ErrorHandle.handleError(data);
                    $scope.btnDisable = false;
                });
            } else{
                // if dont have file: update immedimately
                updateUser();
            }
        };

        function updateUser(){
            // $scope.user.roles = [];
            // for(var i = 0; i < $scope.forms_advanced.selectize_roles.length; i++) {
            //     var role_id = $scope.forms_advanced.selectize_roles[i];
            //     $scope.user.roles.push($scope.allRoles[role_id]);
            // }
            // for(var i = 0; i < $scope.forms_advanced.selectize_farms.length; i++) {
            //     var farmId = $scope.forms_advanced.selectize_farms[i];
            //     $scope.user.tenants.push($scope.allFarms[farmId]);
            // }
            User.update($scope.user).then(function(data){
                if($scope.blockModal != null) $scope.blockModal.hide();
                AlertService.success("success.msg.update");
                $timeout(function () {
                    $state.go('user-profile',{userId: $scope.user.id });
                },1000);
            })
            .catch(function(data){
                if($scope.blockModal != null) $scope.blockModal.hide();
                AlertService.error('admin.messages.errorUpdateUser');
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
        }

        if ( angular.element('#form_createuser').length ) {
            $scope.email_msg = $translate.instant('admin.messages.invalidEmail');
            $scope.required_msg = $translate.instant('admin.messages.required');
            $scope.phone = $translate.instant('global.messages.phone');
            $scope.email_msg = $translate.instant('admin.messages.invalidEmail');
            $scope.maxLength255 = $translate.instant('global.messages.maxLength255');
            $scope.phoneMaxLength = $translate.instant('global.messages.phoneMaxLength');
            $scope.phone = $translate.instant('global.messages.phone');

            $scope.forms_advanced = {
                selectize_roles: [],
                selectize_farms: []
            };
            $scope.selectize_roles_options = [];
            $scope.selectize_roles_config = {
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
                    option: function(roles_data, escape) {
                        return  '<div class="option">' +
                            '<span class="title">' + escape(roles_data.name) + '</span>' +
                            '</div>';
                    },
                    item: function(roles_data, escape) {
                        return '<div class="item longTextShowToolTip" title="'+escape(roles_data.name)+'"><a href="/#/roles/'+ escape(roles_data.id) + '/detail">'  + escape(roles_data.name) + '</a></div>';
                    }
                }
            };
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