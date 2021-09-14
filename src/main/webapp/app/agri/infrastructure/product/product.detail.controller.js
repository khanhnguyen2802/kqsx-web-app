(function () {
    'use strict';
    angular.module('erpApp')
        .controller('ProductDetailController', ProductDetailController);

    ProductDetailController.$inject = ['$rootScope', '$scope', '$stateParams', '$http',
        'AlertService', '$translate', 'TableController', 'ComboBoxController', 'AlertModalService', 'Product'];

    function ProductDetailController($rootScope, $scope, $stateParams, $http,
                                  AlertService, $translate, TableController, ComboBoxController, AlertModalService, Product) {
        var vm = this;
        $scope.ComboBox = {};
        $scope.product = {};

        Product.getFull($stateParams.productId).then(function (data) {
            $scope.product = data;
        }).catch(function (data) {
            ErrorHandle.handleOneError(data);
        })
    }
})();
