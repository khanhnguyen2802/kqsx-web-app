angular
    .module('erpApp')
    .controller('errorCtrl', [
        '$timeout',
        '$scope',
        '$window',
        '$state',
        'Auth',
        '$rootScope',
        '$translate',
        function ($timeout,$scope,$window,$state,Auth,$rootScope, $translate) {
            $scope.logout = function() {
                Auth.logout();
                $state.go('login');
            }
        }
    ])
;