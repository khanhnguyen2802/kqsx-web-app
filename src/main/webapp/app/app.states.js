erpApp
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {

            $locationProvider.hashPrefix('');
            $urlRouterProvider.when('/dashboard','/')
                .otherwise("/");
            $stateProvider
            // -- ERROR PAGES --
                .state("error", {
                    url: "/error",
                    templateUrl: 'app/error/error.html',
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'lazy_uikit'
                            ]);
                        }],
                        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart('errors');
                            return $translate.refresh();
                        }]

                    }
                })
                .state("error.404", {
                    url: "/404",
                    templateUrl: 'app/error/404.html',
                })
                .state("error.500", {
                    url: "/500",
                    templateUrl: 'app/error/500.html',
                })
                .state("error.403", {
                    url: "/403",
                    templateUrl: 'app/error/403.html',
                    controller: 'errorCtrl',
                    controllerAs:'vm',
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'app/error/error.controller.js'
                            ]);
                        }]
                    }
                })
                .state("changePass", {
                    url: "/changePass",
                    templateUrl: 'app/error/change_password_success.html',
                    controller: 'errorCtrl',
                    controllerAs:'vm',
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'app/error/error.controller.js'
                            ]);
                        }]
                    }
                })
            // -- LOGIN PAGE --
                .state("login", {
                    url: "/login",
                    templateUrl: 'app/account/login.html',
                    controller: 'LoginController',
                    controllerAs:'vm',
                    data: {
                        pageTitle: 'global.login'
                    },
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'lazy_uikit',
                                'lazy_parsleyjs',
                                //'lazy_iCheck',
                                'lazy_selectizeJS',
                                'app/account/login.controller.js'
                            ]);
                        }],
                        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart('global');
                            return $translate.refresh();
                        }]
                    }
                })
                // -- REGISTER PAGE --
                .state("register", {
                    url: "/register",
                    templateUrl: 'app/account/register.html',
                    controller: 'RegisterController',
                    controllerAs:'vm',
                    data: {
                        pageTitle: 'global.register'
                    },
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'lazy_uikit',
                                'lazy_parsleyjs',
                                'lazy_selectizeJS',
                                'app/account/register.controller.js'
                                // 'lazy_iCheck'
                            ]);
                        }],
                        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart('global');
                            return $translate.refresh();
                        }]
                    }
                })
            // -- RESTRICTED --
                .state("restricted", {
                    abstract: true,
                    templateUrl: 'app/layouts/restricted.html',
                    controller: 'RootController',
                    controllerAs:'vm',
                    url:"",
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'lazy_uikit',
                                'lazy_selectizeJS',
                                'lazy_switchery',
                                'lazy_prismJS',
                                'lazy_autosize',
                                'lazy_iCheck',
                                'lazy_themes',
                                'app/app.root.controller.js'
                            ]);
                        }],
                        authorize: ['Auth',
                            function (Auth) {
                                return Auth.authorize();
                            }
                        ]
                    }
                })
                .state("reset-password", {
                    url: "/reset-password",
                    templateUrl: 'app/account/reset-password.html',
                    controller: 'ResetPasswordController',
                    controllerAs:'vm',
                    data: {
                        pageTitle: 'global.login'
                    },
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'lazy_uikit',
                                'lazy_parsleyjs',
                                'lazy_iCheck',
                                'app/account/reset-password.controller.js'
                            ]);
                        }],
                        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart('global');
                            return $translate.refresh();
                        }]
                    }
                })
                .state('trace', {
                url:'/trace/{qrCodeId:[0-9]{1,4}}',
                templateUrl: 'app/agri/qrcode/trace.html',
                controller: 'TraceController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'global.vts'
                },
                params: {
                    preLotId: null,
                },
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_uikit',
                            'lazy_iCheck',
                            'app/agri/qrcode/trace.controller.js'
                        ]);
                    }],
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            // -- LOGIN USING SMETOKEN --
                .state("loginSME", {
                    url: "/public?{token}",
                    templateUrl: 'app/account/loginSME.html',
                    controller: 'LoginSMEController',
                    controllerAs:'vm',
                    data: {
                        pageTitle: 'global.login'
                    },
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'lazy_uikit',
                                'lazy_parsleyjs',
                                //'lazy_iCheck',
                                'lazy_selectizeJS',
                                'app/account/loginSME.controller.js'
                            ]);
                        }],
                        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart('global');
                            $translatePartialLoader.addPart('errors');
                            return $translate.refresh();
                        }]
                    }
                })
        }
    ]);
