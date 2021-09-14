(function () {
    'use strict';
    angular.module('erpApp')
        .controller('ProductEditController', ProductEditController);

    ProductEditController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$http',
        'AlertService', '$translate', 'TableController', 'ComboBoxController', 'AlertModalService', 'ErrorHandle', '$timeout', 'Product','FileService'];

    function ProductEditController($rootScope, $scope, $state, $stateParams, $http,
                                     AlertService, $translate, TableController, ComboBoxController, AlertModalService, ErrorHandle, $timeout, Product,FileService) {
        $scope.blockModal = null;
        $scope.blockUI = function () {
            if($scope.blockModal != null)
                $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };
        $scope.ComboBox = {};
        $scope.product={};
        $scope.product.oldAvatar = "";
        $scope.messages = {
            required: $translate.instant("global.messages.required"),
            maxLength255: $translate.instant("global.messages.maxLength255")
        };

        var categoryCbb = {
            id:'categoryCbb',
            url:'/api/product-categories',
            replaceUrl: '/search?query=',
            originParams:'',
            valueField:'id',
            labelField:'categoryName',
            searchField:'categoryName',
            table: null,
            column: null,
            maxItems:1,
            ngModel:[],
            options: [],
            placeholder:$translate.instant("global.placeholder.search")
        };
        ComboBoxController.init($scope, categoryCbb);

        var unitCbb = {
            id:'unitCbb',
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
            placeholder:$translate.instant("global.placeholder.search")
        };
        ComboBoxController.init($scope, unitCbb);

        // var farmCbb = {
        //     id:'farmCbb',
        //     url:'/api/tenants',
        //     originParams:'',
        //     valueField:'id',
        //     labelField:'name',
        //     searchField:'name',
        //     table: null,
        //     column: null,
        //     maxItems:1,
        //     ngModel:[],
        //     options: [],
        //     placeholder:$translate.instant("global.placeholder.search")
        // };
        // ComboBoxController.init($scope, farmCbb);

        var packageCbb = {
            id:'packageCbb',
            url:'/api/uoms',
            originParams:'uomTypeId==7',
            valueField:'id',
            labelField:'name',
            searchField:'name',
            table: null,
            column: null,
            maxItems:1,
            ngModel:[],
            options: [],
            placeholder:$translate.instant("global.placeholder.search")
        };
        ComboBoxController.init($scope, packageCbb);
        // ==================================
        
        $scope.assignedSeason= false;
        Product.getFull($stateParams.productId).then(function (data) {
            $scope.product = data;
            $scope.product.oldAvatar = data.avatar;
            console.log(data);

            categoryCbb.options = [data.productCategory];
            ComboBoxController.init($scope, categoryCbb);

            // farmCbb.options = [data.farm];
            // ComboBoxController.init($scope, farmCbb);
            if(data.season){
            	$scope.assignedSeason= true;
            }
            if(data.unitId){
                unitCbb.options = [data.uomUnit];
                ComboBoxController.init($scope, unitCbb);
            }

            if(data.packageId){
                packageCbb.options = [data.packageUnit];
                ComboBoxController.init($scope, packageCbb);
            }

        }).catch(function (data) {
            ErrorHandle.handleOneError(data);
        })

        // ====================================
        $scope.deleteUserAvatar = function () {
            UIkit.modal.confirm($translate.instant("global.messages.deleteAvatar"), function () {
                // xóa image dã chọn trong input
                $('#user-input-form-file').val("");
                $scope.product.avatar = "";
                $scope.user.userAvatarBase64 = "";
            }, {
                labels: {
                    'Ok': $translate.instant("global.button.ok"),
                    'Cancel': $translate.instant("global.button.cancel")
                }
            });
        };

        $scope.submit = function (isClose) {
            if($scope.btnDisable) return;
            var $form = $("#form_create_product");
            $form.parsley();
            if(!$scope.form_create_product.$valid) return;
            if(!ComboBoxController.checkIsValidForm($form)) return;
            if($scope.btnDisable) return;
            $scope.btnDisable = true;
            $scope.blockUI();
            
            // delete old avatar
            if($scope.product.oldAvatar && (!$scope.product.avatar || $scope.product.avatar == "")){
                FileService.deleteFileUpload($scope.product.oldAvatar);
            }
            
            // upload Avatar first
            var file = $("#user-input-form-file")[0].files[0];
            if(file && file !== null){
                FileService.uploadAvatar(file, 1).then(function (data) {
                    $scope.product.avatar = data.data.fileName;
                    updateProduct(isClose);
                }).catch(function (data) {
                    if($scope.blockModal != null) $scope.blockModal.hide();
                    ErrorHandle.handleOneError(data);
                    $scope.btnDisable = false;
                });
            } else{
                // if dont have file: update immedimately
            	updateProduct(isClose);
            }
            
        }
        
        function updateProduct(isClose){
        	Product.update($scope.product).then(function (data) {
                $scope.blockModal.hide();
                AlertModalService.popup("success.msg.update");
                $timeout(function () {
                    isClose?$state.go('products'):$state.go('products-detail',{productId: data.id});
                },1100);
            }).catch(function (data) {
                $scope.btnDisable = false;
                $scope.blockModal.hide();
                ErrorHandle.handleOneError(data);
            });
        }

        // ====================================
        if(angular.element('#form_create_product').length) {
            var $formValidate = $('#form_create_product');
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
    }
})();
