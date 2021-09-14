(function() {
    'use strict';

    angular
        .module('erpApp')
        .controller('LoginSMEController', LoginSMEController);

    LoginSMEController.$inject = ['$rootScope', '$state', '$timeout', 'Auth','$scope','$http','AlertService','AlertModalService','User','$translate','$window','JhiLanguageService', 'tmhDynamicLocale','HOST_GW', '$stateParams'];

    function LoginSMEController ($rootScope, $state, $timeout, Auth, $scope, $http,AlertService,AlertModalService,User,$translate,$window,JhiLanguageService, tmhDynamicLocale,HOST_GW, $stateParams) {
        var vm = this;

        vm.authenticationError = false;
        vm.credentials = {};
        vm.login = login;
        vm.password = null;
        vm.rememberMe = true;
        vm.email = null;
        vm.emailForgotPass = null;

        // $scope.blockModal = null;
        //
        // $scope.blockUI = function () {
        //     if ($scope.blockModal != null)
        //         $scope.blockModal.hide();
        //     $scope.blockModal = null;
        //     $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_large.gif\' alt=\'\'>');
        // };

        var SMEtoken = $stateParams.token;
        function login (SMEtoken) {
            $scope.logining = true;
            event.preventDefault();
            Auth.login({smeToken: SMEtoken, rememberMe: true}).then(function () {
                vm.authenticationError = false;
                User.current().then(function (user) {
                    // console.log(user);
                    $rootScope.currentUser = user;
                    if(user.domain){
                        var url =window.location.href;
                        if(!url.includes(user.domain)){
                            $scope.redirectLink = user.domain;
                            if (Auth.getPreviousState()) {
                                var previousState = Auth.getPreviousState();
                                Auth.resetPreviousState();
                                $scope.redirectLink += "/#/" + previousState.name;
                                if(previousState.params){
                                    $scope.redirectLink +="?";
                                    var index = 0;
                                    for(var param in previousState.params){
                                        $scope.redirectLink +=param +"=" +  previousState.params[param];
                                        if(index < previousState.params.length -1){
                                            $scope.redirectLink +="&";
                                        }
                                    }
                                }
                            }
                            window.location = $scope.redirectLink
                        } else {
                            if (Auth.getPreviousState()) {
                                var previousState = Auth.getPreviousState();
                                Auth.resetPreviousState();
                                $state.go(previousState.name, previousState.params);
                            } else {
                                $state.go('dashboard-manager', {from: 'login'});
                            }
                        }
                    } else {
                        if (Auth.getPreviousState()) {
                            var previousState = Auth.getPreviousState();
                            Auth.resetPreviousState();
                            $state.go(previousState.name, previousState.params);
                        } else {
                            $state.go('dashboard-manager', {from: 'login'});
                        }
                    }
                }).catch(function (error) {
                    $scope.logining = false;
                    vm.authenticationError = true;
                    $scope.messageError = error.data.message;
                    // AlertService.loginWithToken("error.login.fail");
                    AlertModalService.handleOneError("error.login.fail");
                })
                // previousState was set in the authExpiredInterceptor before being redirected to login modal.
                // since login is successful, go to stored previousState and clear previousState
            }).catch(function (error) {
                // console.log(error);
                $scope.logining = false;
                vm.authenticationError = true;
                $scope.messageError = error.data.message;
                // AlertService.loginWithToken("error.login.fail");
                AlertModalService.handleOneError("error.login.fail");
            });
        }
        login(SMEtoken);
    }
})();
