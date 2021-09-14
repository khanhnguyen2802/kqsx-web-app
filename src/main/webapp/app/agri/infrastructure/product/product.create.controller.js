(function () {
    'use strict';
    angular.module('erpApp')
        .controller('ProductCreateController', ProductCreateController);

    ProductCreateController.$inject = ['$rootScope', '$scope', '$state', 'ErrorHandle',
        'AlertService', '$translate', 'TableController', 'ComboBoxController', 'AlertModalService',
        '$timeout', 'Product', '$window', 'FileService'];

    function ProductCreateController($rootScope, $scope, $state, ErrorHandle,
                                     AlertService, $translate, TableController, ComboBoxController, AlertModalService,
                                     $timeout, Product, $window, FileService) {
        var tenantId = $window.localStorage.getItem("farmId") ? $window.localStorage.getItem("farmId") : 0;
        $scope.blockModal = null;
        $scope.blockUI = function () {
            if($scope.blockModal != null)
                $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };
        $scope.ComboBox = {};
        $scope.user={};
        $scope.user.userAvatarBase64 = "";
        $scope.messages = {
            required: $translate.instant("global.messages.required"),
            maxLength255: $translate.instant("global.messages.maxLength255")
        };

        $scope.product = {
            categoryId: null,
            name: null,
            unitId: null,
            tenantId: tenantId,
            packageId: null,
            description: null,
            code: null
        };

        var categoryCbb = {
            id:'categoryCbb',
            url:'/api/product-categories',
            replaceUrl: '/search-categories-leaf-level?query=',
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
        // ===========================
        $scope.submit = function (isClose) {
            if($scope.btnDisable) return;
            var $form = $("#form_create_product");
            $form.parsley();
            if(!$scope.form_create_product.$valid) return;
            if(!ComboBoxController.checkIsValidForm($form)) return;
            if($scope.product.tenantId == null || $scope.product.tenantId == "") {
                AlertModalService.handleOneError($translate.instant('error.tenant.tenantIdIsEmpty'));
                return;
            }

            $scope.blockUI();
            $scope.btnDisable = true;

            var file = $("#user-input-form-file")[0].files[0];
            if(file && file !== null){
                FileService.uploadAvatar(file, 1).then(function (data) {
                    $scope.product.avatar = data.data.fileName;
                    createProduct(isClose);
                }).catch(function (err) {
                    if($scope.blockModal != null) $scope.blockModal.hide();
                    $scope.btnDisable = false;
                })
            } else {
                createProduct(isClose);
            }
        };

        function createProduct(isClose) {
            Product.create($scope.product).then(function (data) {
                $scope.blockModal.hide();
                AlertModalService.popup("success.msg.create");
                $timeout(function () {
                    isClose?$state.go('products'):$state.go('products-detail',{productId: data.id});
                },1100);
            }).catch(function (data) {
                $scope.btnDisable = false;
                $scope.blockModal.hide();
                ErrorHandle.handleOneError(data);
            });
        }
    }
})();
