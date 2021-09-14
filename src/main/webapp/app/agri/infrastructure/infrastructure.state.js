(function () {
    'use strict';
    angular.module('erpApp')
        .config(stateConfig);
    stateConfig.$inject = ['$stateProvider']

    function stateConfig($stateProvider) {

        $stateProvider
            .state('infrastructure', {
                parent: 'restricted',
                template: "<div ui-view></div>",
                abstract: true,
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('admin');
                        $translatePartialLoader.addPart('errors');
                        $translatePartialLoader.addPart('success');
                        $translatePartialLoader.addPart('global');
                        $translatePartialLoader.addPart('infrastructure');
                        return $translate.refresh();
                    }]
                }
            })
            .state('infrastructure-manager', {
                parent: 'admin',
                url: '/infrastructure-manager',
                templateUrl: 'app/agri/dashboard/infrastructure.manager.html',
                controller: 'InfrastructureManagerController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'admin.menu.stockManagement',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Material_View','Order_View','Transfer_View','Stock_View'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'app/agri/dashboard/infrastructure.manager.controller.js'
                        ]);
                    }]
                }
            })
            //stock
            .state('farms',{
                parent: 'infrastructure',
                url: '/farms',
                templateUrl: 'app/agri/infrastructure/farm/farm.home.html',
                controller: 'FarmController',
                controllerAs: 'vm',
                params: {
                    isUpdateTenant: false
                },
                data: {
                    pageTitle: 'admin.menu.farm',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Farm_View'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'app/agri/infrastructure/farm/farm.home.controller.js'
                        ]);
                    }]
                }
            })
            .state('farms-create',{
                parent: 'infrastructure',
                url: '/farms-create',
                templateUrl: 'app/agri/infrastructure/farm/farm.create.html',
                controller: 'FarmCreateController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'admin.menu.farm',
                    parentLink: 'farms',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Farm_View'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/infrastructure/farm/farm.create.controller.js'
                        ]);
                    }]
                }
            })
            .state('farms-edit',{
                parent: 'infrastructure',
                url: '/farms/{farmId}/edit',
                templateUrl: 'app/agri/infrastructure/farm/farm.edit.html',
                controller: 'FarmEditController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'admin.menu.farm',
                    parentLink: 'farms',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Farm_View'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/infrastructure/farm/farm.edit.controller.js'
                        ]);
                    }]
                }
            })
            .state('farms-detail',{
                parent: 'infrastructure',
                url: '/farms/{farmId}/detail',
                templateUrl: 'app/agri/infrastructure/farm/farm.detail.html',
                controller: 'FarmDetailController',
                controllerAs: 'vm',
                params: {
                    isUpdateTenant: false
                },
                data: {
                    pageTitle: 'admin.menu.farm',
                    parentLink: 'farms',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Farm_View'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'app/agri/infrastructure/farm/farm.detail.controller.js'
                        ]);
                    }]
                }
            })
            .state('products',{
                parent: 'infrastructure',
                url: '/products',
                templateUrl: 'app/agri/infrastructure/product/product.home.html',
                controller: 'ProductController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'admin.menu.product',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Product_View', 'Category_View'], //TODO change role,
                    sideBarMenu: 'inventory',
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'lazy_tree',
                            'lazy_parsleyjs',
                            'app/agri/infrastructure/product/product.home.controller.js'
                        ]);
                    }]
                }
            })
            .state('products-create',{
                parent: 'infrastructure',
                url: '/products-create',
                templateUrl: 'app/agri/infrastructure/product/product.create.html',
                controller: 'ProductCreateController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'admin.menu.product',
                    parentLink: 'products',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_FARM_ADMIN', 'Product_Create'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/infrastructure/product/product.create.controller.js'
                        ]);
                    }]
                }
            })
            .state('products-edit',{
                parent: 'infrastructure',
                url: '/products/{productId}/edit',
                templateUrl: 'app/agri/infrastructure/product/product.edit.html',
                controller: 'ProductEditController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'admin.menu.product',
                    parentLink: 'products',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_FARM_ADMIN', 'Product_Update'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/infrastructure/product/product.edit.controller.js'
                        ]);
                    }]
                }
            })
            .state('products-detail',{
                parent: 'infrastructure',
                url: '/products/{productId}/detail',
                templateUrl: 'app/agri/infrastructure/product/product.detail.html',
                controller: 'ProductDetailController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'admin.menu.product',
                    parentLink: 'products',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Product_View'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'app/agri/infrastructure/product/product.detail.controller.js'
                        ]);
                    }]
                }
            })
            .state('areas',{
                parent: 'infrastructure',
                url: '/areas',
                templateUrl: 'app/agri/infrastructure/area/area.home.html',
                controller: 'AreaController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'admin.menu.area',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Area_View'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'app/agri/infrastructure/area/area.home.controller.js'
                        ]);
                    }]
                }
            })
            .state('areas-create',{
                parent: 'infrastructure',
                url: '/areas-create',
                templateUrl: 'app/agri/infrastructure/area/area.create.html',
                controller: 'AreaCreateController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'admin.menu.area',
                    parentLink: 'areas',
                    authorities: ['ROLE_SYSTEM_ADMIN',,'ROLE_FARM_ADMIN', 'Area_Create'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_parsleyjs',
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'app/agri/infrastructure/area/area.create.controller.js'
                        ]);
                    }]
                }
            })
            .state('areas-edit',{
                parent: 'infrastructure',
                url: '/areas/{areaId}/edit',
                templateUrl: 'app/agri/infrastructure/area/area.edit.html',
                controller: 'AreaEditController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'admin.menu.area',
                    parentLink: 'areas',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_FARM_ADMIN', 'Area_Update'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_parsleyjs',
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'app/agri/infrastructure/area/area.edit.controller.js'
                        ]);
                    }]
                }
            })
            .state('areas-detail',{
                parent: 'infrastructure',
                url: '/areas/{areaId}/detail',
                templateUrl: 'app/agri/infrastructure/area/area.detail.html',
                controller: 'AreaDetailController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'admin.menu.area',
                    parentLink: 'areas',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_FARM_ADMIN', 'Area_View'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'app/agri/infrastructure/area/area.detail.controller.js'
                        ]);
                    }]
                }
            })
    }
})();