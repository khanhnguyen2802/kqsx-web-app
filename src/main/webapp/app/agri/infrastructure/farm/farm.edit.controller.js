(function () {
    'use strict';
    angular.module('erpApp')
        .controller('FarmEditController', FarmEditController);

    FarmEditController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$http',
        'AlertService', '$translate', 'TableController', 'ComboBoxController', 'AlertModalService', 'ErrorHandle', '$timeout', 'Farm', 'Common', 'FileService'];

    function FarmEditController($rootScope, $scope, $state, $stateParams, $http,
                      AlertService, $translate, TableController, ComboBoxController, AlertModalService, ErrorHandle, $timeout, Farm, Common, FileService) {
        $scope.ComboBox = {};
        $scope.farm = {};

        $scope.blockModal = null;
        $scope.blockUI = function () {
            if($scope.blockModal != null)
                $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };

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
            options: [],
            placeholder:$translate.instant("global.placeholder.choose")
        };
        ComboBoxController.init($scope, typeUnitCbb);

        // ================================
        Farm.getFull($stateParams.farmId).then(function (data) {
            $scope.farm = data;

            if(data.uomUnit){
                typeUnitCbb.options = [data.uomUnit];
                ComboBoxController.init($scope, typeUnitCbb);
            }
        }).catch(function (data) {
            ErrorHandle.handleOneError(data);
        })
        // =======================
        $scope.submit = function (isClose) {
            if($scope.btnDisable) return;
            $('#form_create_farm').parsley();
            var $form = $('#form_create_farm');
            if(!$scope.form_create_farm.$valid) return;
            if(!ComboBoxController.checkIsValidForm($form)) return;

            $scope.blockUI();
            $scope.btnDisable = true;

            var file = $("#user-input-form-file")[0].files[0];
            if(file && file !== null){
                FileService.uploadAvatar(file, 1).then(function (data) {
                    $scope.farm.avatar = data.data.fileName;
                    updateFarm(isClose);
                }).catch(function (err) {
                    if($scope.blockModal != null) $scope.blockModal.hide();
                    $scope.btnDisable = false;
                })
            } else {
                updateFarm(isClose);
            }
        };

        function updateFarm(isClose) {
            Farm.update($scope.farm).then(function(data){
                if ($scope.blockModal != null) $scope.blockModal.hide();
                AlertModalService.popup("success.msg.update");
                $timeout(function () {
                    isClose ? $state.go('farms', { isUpdateTenant: true}) : $state.go('farms-detail', { farmId: data.id, isUpdateTenant: true });
                },1100);
            }).catch(function(data){
                if ($scope.blockModal != null) $scope.blockModal.hide();
                ErrorHandle.handleOneError(data);
                $scope.btnDisable = false;
            });
        }
        // ======================================

        /*validate edit farm form*/
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

        $scope.deleteUserAvatar = function () {
            UIkit.modal.confirm($translate.instant("global.messages.deleteAvatar"), function () {
                // xóa image dã chọn trong input
                $('#user-input-form-file').val("");
                $scope.farm.avatar = "";
                $scope.user.userAvatarBase64 = "";
            }, {
                labels: {
                    'Ok': $translate.instant("global.button.ok"),
                    'Cancel': $translate.instant("global.button.cancel")
                }
            });
        };
    }
})();
