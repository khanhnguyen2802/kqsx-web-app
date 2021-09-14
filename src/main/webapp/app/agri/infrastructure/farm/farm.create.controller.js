(function () {
    'use strict';
    angular.module('erpApp')
        .controller('FarmCreateController', FarmCreateController);

    FarmCreateController.$inject = ['$rootScope', '$scope', '$state', '$http','$timeout',
        'AlertService', '$translate', 'TableController', 'ComboBoxController', 'AlertModalService',
        'Farm','ErrorHandle', 'Common', 'FileService', 'User','Principal', '$window'];

    function FarmCreateController($rootScope, $scope, $state, $http,$timeout,
                            AlertService, $translate, TableController, ComboBoxController, AlertModalService,
                                  Farm, ErrorHandle, Common, FileService, User, Principal, $window) {
        $scope.tenantId = $window.localStorage.getItem('farmId');
        $scope.ComboBox = {};

        $scope.messages = {
            length7:$translate.instant("global.messages.length7"),
            required: $translate.instant("global.messages.required"),
            maxLength255: $translate.instant("global.messages.maxLength255"),
            number: $translate.instant("global.messages.number_msg"),
            phoneMaxLength:$translate.instant("global.messages.phoneMaxLength"),
            maxLength20:$translate.instant("global.messages.maxLength20"),
            email:$translate.instant("global.messages.email"),
            float12_3:$translate.instant("global.messages.float12_3"),
            float12_8:$translate.instant("global.messages.float12_8"),
            phone_msg: $translate.instant("global.messages.phone"),
            greaterThanZero: $translate.instant("global.messages.greaterThanZero")
        };

        $scope.blockModal = null;
        $scope.blockUI = function () {
            if($scope.blockModal != null)
                $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };

        $scope.farm = {};
        User.getRoot().then(function (data) {
            $scope.farm.ownerName = data.fullName;
            $scope.farm.email = data.email;
            $scope.farm.phone = data.phone;
        });

        $scope.isAdmin = false;
        if(Principal.hasAnyAuthority(["ROLE_SYSTEM_ADMIN"])){
            $scope.isAdmin = true;
        }

        var userCbb = {
            id:'user',
            url:'/api/users',
            replaceUrl: '/search?query=',
            originParams:'',
            valueField:'fullName',
            labelField:'fullName',
            searchField:'fullName',
            table: null,
            column: null,
            maxItems:1,
            ngModel:[],
            options: [],
            placeholder:""
        };
        ComboBoxController.init($scope, userCbb);
        $scope.selectedCbb ={
            user:[]
        }
        $scope.selectUser = function(){
            $timeout(function () {
                if($scope.selectedCbb.user[0]){
                    var user = $scope.selectedCbb.user[0];
                    var tenant = user.tenants && user.tenants[0] ? user.tenants[0] : null;
                    $scope.farm.phone = $scope.selectedCbb.user[0].phone;
                    $scope.farm.email = $scope.selectedCbb.user[0].email;
                    $scope.farm.tenantId = tenant.tenantId; // tenantId cha o day
                } else {
                    $scope.farm.phone = null;
                    $scope.farm.email = null;
                    $scope.farm.tenantId = null;
                }
            });
        }

        var typeFarm = Common.getTypeFarm();

        var typeFarmCbb = {
            id:'typeFarmCbb',
            url:'',
            originParams:'',
            valueField:'id',
            labelField:'name',
            searchField:'name',
            table: null,
            column: null,
            maxItems:1,
            ngModel:[],
            options: typeFarm,
            placeholder:$translate.instant("global.placeholder.choose")
        };
        ComboBoxController.init($scope, typeFarmCbb);

        var typeUnitCbb = {
            id:'typeUnitCbb',
            url:'/api/uoms',
            originParams:'',
            valueField:'id',
            labelField:'name',
            searchField:'name',
            table: null,
            column: null,
            maxItems:1,
            ngModel:[],
            options: [{id: 4, name: "m2"}],
            placeholder:$translate.instant("global.placeholder.choose")
        };
        $scope.farm.sizeUomId = 4;
        ComboBoxController.init($scope, typeUnitCbb);

        /*validate create farm form*/
        if ( angular.element('#form_create_farm').length ) {

            var $formValidate = $('#form_create_farm');
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

        $scope.btnDisable = false;
        $scope.submit = function (isClose) {
            if($scope.btnDisable) return;
            $('#form_create_farm').parsley();
            var $form = $('#form_create_farm');
            if(!$scope.form_create_farm.$valid) return;
            if(!ComboBoxController.checkIsValidForm($form)) return;

            $scope.blockUI();
            $scope.btnDisable = true;

            // upload
            var file = $("#user-input-form-file")[0].files[0];
            if(file && file !== null){
                FileService.uploadAvatar(file, 1).then(function (data) {
                    $scope.farm.avatar = data.data.fileName;
                    createFarm(isClose);
                }).catch(function (err) {
                    if($scope.blockModal != null) $scope.blockModal.hide();
                    $scope.btnDisable = false;
                })
            } else {
                createFarm(isClose);
            }
        };

        function createFarm(isClose) {
            Farm.create($scope.farm).then(function(data){
                if ($scope.blockModal != null) $scope.blockModal.hide();
                AlertModalService.popup("success.msg.create");
                $timeout(function () {
                    isClose ? $state.go('farms', { isUpdateTenant: true }) : $state.go('farms-detail', { farmId: data.id, isUpdateTenant: true});
                },1100);
            }).catch(function(data){
                if ($scope.blockModal != null) $scope.blockModal.hide();
                ErrorHandle.handleOneError(data);
                $scope.btnDisable = false;
            });
        }
    }
})();
