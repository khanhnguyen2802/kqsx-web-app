(function(){
    'use strict';
    angular.module('erpApp')
        .controller('UserCreateController',UserCreateController);

    UserCreateController.$inject = ['$rootScope','$scope','$state','User', 'Role', 'AlertService','AlertModalService','$translate','variables','ErrorHandle', '$window','Organization','$timeout', 'ComboBoxController','Farm','FileService'];
    function UserCreateController($rootScope,$scope, $state, User, Role, AlertService, AlertModalService,$translate, variables, ErrorHandle, $window,Organization,$timeout, ComboBoxController, Farm,FileService) {
        $scope.farmName = $window.localStorage.getItem('farmName');
        $scope.farmId = $window.localStorage.getItem('farmId');
        $scope.ComboBox = {};
        $scope.blockModal = null;
        $scope.blockUI = function () {
            if($scope.blockModal != null)
                $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };
        $scope.user = {
            organizationName: $rootScope.currentUser.organizationName
        };
        $scope.forms_advanced = {
            selectize_roles: [],
            selectize_farms:[$scope.farmId]
        };
        $scope.selectedCbb = {
            role: []
        };
        $scope.active = $scope.user.active = 1;

        $("#table_user").css('min-height', $( window ).height() - 300);
        $("#table_user").css('max-height', $( window ).height() - 300);
        angular.element($window).bind('resize', function(){
            $("#table_user").css('min-height', $( window ).height() - 300);
            $("#table_user").css('max-height', $( window ).height() - 300);
        });

        $scope.email_msg = $translate.instant('admin.messages.invalidEmail');
        $scope.required_msg = $translate.instant('admin.messages.required');
        $scope.maxLength255 = $translate.instant('global.messages.maxLength255');
        $scope.phoneMaxLength = $translate.instant('global.messages.phoneMaxLength');
        $scope.phone = $translate.instant('global.messages.phone');
        $scope.confirmPassword_msg = $translate.instant('admin.messages.confirmPassword');
        $scope.passwordPattern = $translate.instant('admin.messages.passwordPattern');
        $scope.selectFarm = $translate.instant('admin.user.placeholder.selectFarm');
        $scope.selectRole = $translate.instant('admin.user.placeholder.selectRole');
        var $formValidate = $('#form_createuser');

        Farm.getAll().then(function (data) {
            $scope.selectize_farm_options = data;
            $scope.allFarms = {};
            for(var i = 0; i < $scope.selectize_farm_options.length; i ++){
                $scope.allFarms[$scope.selectize_farm_options[i].id] = $scope.selectize_farm_options[i];
            }
        });

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
            placeholder: $scope.selectRole
        };
        ComboBoxController.init($scope, roleComboBox);

        // ==========================================
        $scope.$watch('forms_advanced.selectize_farms', function () {
            var tenantIds = $scope.forms_advanced.selectize_farms;
            roleComboBox.resetScroll = true;
            roleComboBox.options = [""];
            if(!tenantIds || tenantIds.length < 1){
                roleComboBox.originParams = 'tenantId==0';
                ComboBoxController.init($scope, roleComboBox);
            } else{
                // k phai SA thi bo qua id = 1
                roleComboBox.originParams = "(type==1,tenantId=in=(" + tenantIds.toString() + "))";
                ComboBoxController.init($scope, roleComboBox);
            }
        });
        // ============================================

        // get user default
        $scope.btnDisable = false;
        $scope.submit = function(isClose) {
            var $form = $("#form_createuser");
            $('#form_createuser').parsley();
            if(!$scope.form_createuser.$valid) return;
            if(!ComboBoxController.checkIsValidForm($form)) return;
            if($scope.btnDisable) return;
            $scope.btnDisable = true;

            $scope.blockUI();
            // upload Avatar first
            var file = $("#user-input-form-file")[0].files[0];
            if(file && file != null){
            	FileService.uploadAvatar(file,1).then(function (data) {
                    $scope.user.userAvatar = data.data.fileName;
                    createUser(isClose);
                }).catch(function (data) {
                    if($scope.blockModal != null) $scope.blockModal.hide();
                    ErrorHandle.handleOneError(data);
                    $scope.btnDisable = false;
                });
            } else{
                // if dont have file: update immedimately
                createUser();
            }
        };

        function createUser(isClose){
            $scope.user.roles = [];
            $scope.user.tenants = [];
            $scope.user.organizationName = $scope.farmName;
            $scope.user.roles = $scope.selectedCbb.role;

            for(var i = 0; i < $scope.forms_advanced.selectize_farms.length; i++) {
                var farmId = $scope.forms_advanced.selectize_farms[i];
                $scope.user.tenants.push($scope.allFarms[farmId]);
            }

            User.create($scope.user).then(function(data){
                if($scope.blockModal != null) $scope.blockModal.hide();
                AlertModalService.popup("success.msg.create");
                $timeout(function () {
                    isClose ? $state.go('users'): $state.go('users-detail',{userId: data.id});
                },1100);
            }).catch(function(data){
                if($scope.blockModal != null) $scope.blockModal.hide();
                ErrorHandle.handleOneError(data);
                $scope.btnDisable = false;
            });
        }

        // create option roles
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

            $formValidate.parsley({
                'excluded': 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], .selectize-input > input'
            }).on('form:validated',function() {
                $scope.$apply();
            }).on('field:validated',function(parsleyField) {
                if($(parsleyField.$element).hasClass('md-input')) {
                    $scope.$apply();
                }
            });
        }
        
        $scope.deleteUserAvatar = function () {
            $scope.user.userAvatar = $scope.user.userAvatarBase64 = "";
            $("#user-input-form-file").val("");
        }
    }

})();