(function() {
    'use strict';

    angular
        .module('erpApp')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$rootScope', '$state', '$timeout', 'Auth','$scope','$http','AlertService','User','$translate','$window','JhiLanguageService', 'tmhDynamicLocale','HOST_GW'];

    function LoginController ($rootScope, $state, $timeout, Auth, $scope, $http,AlertService,User,$translate,$window,JhiLanguageService, tmhDynamicLocale,HOST_GW) {
        var vm = this;

        vm.authenticationError = false;
        vm.credentials = {};
        vm.login = login;
        vm.forgotPassword = forgotPassword;
        vm.password = null;
        vm.rememberMe = true;
        vm.email = null;
        vm.emailForgotPass = null;
        
        var $formValidate = $('#form_login');
        $formValidate.parsley({
            'excluded': 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], .selectize-input > input'
        }).on('form:validated',function() {
            $scope.$apply();
        }).on('field:validated',function(parsleyField) {
            if($(parsleyField.$element).hasClass('md-input')) {
                $scope.$apply();
            }
        });
        
        var $formForgotPassValidate = $('#form_forgotPass');
        $formValidate.parsley({
            'excluded': 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], .selectize-input > input'
        }).on('form:validated',function() {
            $scope.$apply();
        }).on('field:validated',function(parsleyField) {
            if($(parsleyField.$element).hasClass('md-input')) {
                $scope.$apply();
            }
        });
        
        //language switcher
        if($window.localStorage.getItem("lang") !=null){
            $scope.langSwitcherModel = $window.localStorage.getItem("lang");
        } else {
            $scope.langSwitcherModel = 'vn';
        }
        $scope.langSwitcherOptions = [
            {id: 2, title: 'Tiếng Việt', value: 'vn'},
            {id: 1, title: 'English', value: 'gb'}

        ];

        $scope.langSwitcherConfig = {
            maxItems: 1,
            render: {
                option: function(langData, escape) {
                    return  '<div class="option">' +
                        '<i class="item-icon flag-' + escape(langData.value).toUpperCase() + '"></i>' +
                        '<span>' + escape(langData.title) + '</span>' +
                        '</div>';
                },
                item: function(langData, escape) {
                    return '<div class="item">' +
                    			'<i class="item-icon flag-' + escape(langData.value).toUpperCase() + '"></i>' +
                    			'<span> ' + escape(langData.title) + '</span>' +
                    		'</div>';
                }
            },
            valueField: 'value',
            labelField: 'title',
            searchField: 'title',
            create: false,
            onInitialize: function(selectize) {
                $('#lang_switcher').next().children('.selectize-input').find('input').attr('readonly',true);
            },
            onChange: function(value) {
                var langKey = value==='gb' ? 'en' : (value==='vn'? 'vi' : 'en');
                $translate.use(langKey);
                tmhDynamicLocale.set(langKey);
                $window.localStorage.setItem("lang",value);
            }
        };
        $scope.$watch('langSwitcherModel', function() {
            var value = $scope.langSwitcherModel;
            var langKey = value==='gb' ? 'en' : (value==='vn'? 'vi' : 'en');
            $translate.use(langKey);
            tmhDynamicLocale.set(langKey);
        });


        $timeout(function (){angular.element('#email').focus();});

        $scope.logining = false;
        function login (event) {
            $scope.logining = true;
            event.preventDefault();
            Auth.login({
                email: vm.email,
                password: vm.password,
                rememberMe: vm.rememberMe
            }).then(function () {
                vm.authenticationError = false;
                User.current().then(function (user) {
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
                })
                // previousState was set in the authExpiredInterceptor before being redirected to login modal.
                // since login is successful, go to stored previousState and clear previousState
            }).catch(function (error) {
                console.log(error);
                $scope.logining = false;
                vm.authenticationError = true;
                console.log(error.data);
                $scope.messageError = error.data.message;
            });
        }
        $scope.sendMail = false;
        $scope.failed = false;
        function forgotPassword() {
        	var params = {};
        	params.email = vm.emailForgotPass;
        	params.langKey = $scope.langSwitcherConfig==='gb' ? 'en' : 'vn';
        	User.forgotPassword(params).then(function (response) {
        		if ($scope.blockModal != null) $scope.blockModal.hide();
                AlertService.success('global.success.sendEmailForgotPass');
                $scope.checkEmail = false;
                $scope.sendMail = true;
            }).catch(function (error) {
            	if ($scope.blockModal != null) $scope.blockModal.hide();
            	AlertService.error(error.data.message);
                console.log(error.data);
                $scope.messageError = error.data.message;
                $scope.checkEmail = true;
                $scope.failed = true;
            })
        }

        $scope.emailForgotChange = function(){
            console.log("change")
            $scope.checkEmail = false;
            $scope.failed = false;
        }
        
        $scope.onCacel = function(){
            $scope.checkEmail = false;
            $scope.failed = false;
            vm.emailForgotPass = null;
        }
        
        $scope.onClose = function(){
            $scope.checkEmail = false;
            $scope.failed = false;
            vm.emailForgotPass = null;
            $scope.sendMail = false;
        }

    }
})();
