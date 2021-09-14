(function () {
    'use strict';
    angular.module('erpApp')
        .config(stateConfig);
    stateConfig.$inject = ['$stateProvider']

    function stateConfig($stateProvider) {

        $stateProvider
            .state('device-module', {
                parent: 'restricted',
                template: "<div ui-view></div>",
                abstract: true,
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('admin');
                        $translatePartialLoader.addPart('errors');
                        $translatePartialLoader.addPart('success');
                        $translatePartialLoader.addPart('global');
                        $translatePartialLoader.addPart('device');
                        return $translate.refresh();
                    }]
                }
            })
            .state('device-manager', {
                parent: 'device-module',
                url: '/device-manager',
                templateUrl: 'app/dashboard/device.manager.html',
                controller: 'DeviceManagerController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'admin.menu.stockManagement',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Material_View','Device_View','Group_Device_View','Auto_Controller_View'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'app/dashboard/device.manager.controller.js'
                        ]);
                    }]
                }
            })
            //stock
            .state('devices',{
                parent: 'device-module',
                url: '/devices',
                templateUrl: 'app/agri/device/device/devices.html',
                controller: 'DevicesController',
                controllerAs: 'vm',
                params: {
                    deviceId:null
                },
                data: {
                    pageTitle: 'admin.menu.device',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Device_View'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/device/device/devices.controller.js'
                        ]);
                    }]
                }
            })
            .state('devices-detail',{
                parent:'device-module',
                url:'/devices/{deviceId:[0-9]{1,9}}/detail',
                templateUrl:'app/agri/device/device/device.detail.html',
                data: {
                    pageTitle: 'admin.menu.device',
                    parentLink: 'devices',
                    authorities:['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Device_View'],
                    sideBarMenu: 'inventory'
                },
                controller: 'DeviceDetailController',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_parsleyjs',
                            'app/agri/device/device/device.detail.controller.js'
                        ]);
                    }]
                }

            })
            .state('devices-create',{
                parent:'device-module',
                url:'/devices/create',
                templateUrl:'app/agri/device/device/device.create.html',
                data: {
                    pageTitle: 'admin.menu.device',
                    parentLink: 'devices',
                    authorities:['ROLE_SYSTEM_ADMIN','ROLE_FARM_ADMIN', 'Device_View'],
                    sideBarMenu: 'inventory'
                },
                controller: 'DeviceCreateController',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_parsleyjs',
                            'app/agri/device/device/device.create.controller.js'
                        ]);
                    }]
                }
            })
            .state('devices-edit',{
                url:'/devices/{deviceId:[0-9]{1,9}}/edit',
                templateUrl:'app/agri/device/device/device.edit.html',
                parent:'device-module',
                data: {
                    pageTitle: 'admin.menu.device',
                    parentLink: 'devices',
                    authorities:['ROLE_SYSTEM_ADMIN','ROLE_FARM_ADMIN', 'Device_View'],
                    sideBarMenu: 'inventory'
                },
                controller: 'DeviceEditController',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_parsleyjs',
                            'app/agri/device/device/device.edit.controller.js'
                        ]);
                    }]
                }
            })
            .state('group-devices',{
                parent: 'device-module',
                url: '/group-devices',
                templateUrl: 'app/agri/device/group-device/group-device.home.html',
                controller: 'GroupDeviceController',
                controllerAs: 'vm',
                params: {
                    manualControllerId : null
                },
                data: {
                    pageTitle: 'admin.menu.manualControl',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Group_Device_View'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/device/group-device/group-device.home.controller.js'
                        ]);
                    }]
                }
            })
            .state('group-device-create', {
                parent:'device-module',
                url:'/group-device-create',
                templateUrl:'app/agri/device/group-device/group-device.create.html',
                data: {
                    pageTitle: 'admin.menu.manualControl',
                    parentLink: 'group-devices',
                    authorities:['ROLE_SYSTEM_ADMIN','ROLE_FARM_ADMIN', 'Group_Device_View'],
                    sideBarMenu: 'inventory'
                },
                controller: 'GroupDeviceCreateController',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/device/group-device/group-device.create.controller.js'
                        ]);
                    }]
                }
            })
            .state('group-device-detail', {
                parent:'device-module',
                url:'/group-device/{groupDeviceId:[0-9]{1,9}}/detail',
                templateUrl:'app/agri/device/group-device/group-device.detail.html',
                data: {
                    pageTitle: 'admin.menu.manualControl',
                    parentLink: 'group-devices',
                    authorities:['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Group_Device_View'],
                    sideBarMenu: 'inventory'
                },
                controller: 'GroupDeviceDetailController',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/device/group-device/group-device.detail.controller.js'
                        ]);
                    }]
                }
            })
            .state('group-device-edit', {
                parent:'device-module',
                url:'/group-device/{groupDeviceId:[0-9]{1,9}}/edit',
                templateUrl:'app/agri/device/group-device/group-device.edit.html',
                data: {
                    pageTitle: 'admin.menu.manualControl',
                    parentLink: 'group-devices',
                    authorities:['ROLE_SYSTEM_ADMIN','ROLE_FARM_ADMIN', 'Group_Device_View'],
                    sideBarMenu: 'inventory'
                },
                controller: 'GroupDeviceEditController',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/device/group-device/group-device.edit.controller.js'
                        ]);
                    }]
                }
            })
            .state('automatic-controls',{
                parent: 'device-module',
                url: '/automatic-controls',
                templateUrl: 'app/agri/device/automatic-control/automatic-control.home.html',
                controller: 'AutomaticController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'admin.menu.autoControl',
                    authorities: ['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Auto_Controller_View'], //TODO change role,
                    sideBarMenu: 'inventory'
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/device/automatic-control/automatic-control.home.controller.js'
                        ]);
                    }]
                }
            })
            .state('automatic-control-create', {
                parent:'device-module',
                url:'/automatic-control-create',
                templateUrl:'app/agri/device/automatic-control/automatic-control.create.html',
                data: {
                    pageTitle: 'admin.menu.autoControl',
                    parentLink: 'automatic-controls',
                    authorities:['ROLE_SYSTEM_ADMIN','ROLE_FARM_ADMIN', 'Auto_Controller_Create'],
                    sideBarMenu: 'inventory'
                },
                controller: 'AutomaticCreateController',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/device/automatic-control/automatic-control.create.controller.js'
                        ]);
                    }]
                }
            })
            .state('automatic-control-detail', {
                parent:'device-module',
                url:'/automatic-control/{automaticControlId:[0-9]{1,9}}/detail',
                templateUrl:'app/agri/device/automatic-control/automatic-control.detail.html',
                data: {
                    pageTitle: 'admin.menu.autoControl',
                    parentLink: 'automatic-controls',
                    authorities:['ROLE_SYSTEM_ADMIN','ROLE_SYSTEM_USER','ROLE_FARM_ADMIN', 'Auto_Controller_View'],
                    sideBarMenu: 'inventory'
                },
                controller: 'AutomaticDetailController',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/device/automatic-control/automatic-control.detail.controller.js'
                        ]);
                    }]
                }
            })
            .state('automatic-control-edit', {
                parent:'device-module',
                url:'/automatic-control/{automaticControlId:[0-9]{1,9}}/edit',
                templateUrl:'app/agri/device/automatic-control/automatic-control.edit.html',
                data: {
                    pageTitle: 'admin.menu.autoControl',
                    parentLink: 'automatic-controls',
                    authorities:['ROLE_SYSTEM_ADMIN','ROLE_FARM_ADMIN', 'Auto_Controller_Update'],
                    sideBarMenu: 'inventory'
                },
                controller: 'AutomaticEditController',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/device/automatic-control/automatic-control.edit.controller.js'
                        ]);
                    }]
                }
            })
            .state('ninhbinh-automatic-schedule', {
                parent:'device-module',
                url:'/automatic-schedule/nbh',
                templateUrl:'app/agri/device/ninhbinh-auto-schedule/ninhbinh-AC.html',
                data: {
                    pageTitle: 'admin.menu.autoControl',
                    // parentLink: 'automatic-controls',
                    authorities:['ROLE_SYSTEM_ADMIN','ROLE_FARM_ADMIN', 'Auto_Controller_Update'],
                    sideBarMenu: 'inventory'
                },
                controller: 'ninhbinhACController',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/device/ninhbinh-auto-schedule/ninhbinh-AC.controller.js'
                        ]);
                    }]
                }
            })
            .state('ninhbinh-automatic-schedule-detail', {
                parent:'device-module',
                // url:'/automatic-control/ninhbinh/{sectorCode:^[^0-9][a-zA-Z0-9]+}/{phaseId:[0-9]{1,9}}/detail',
                url:'/automatic-schedule/nbh/{deviceId:[a-zA-Z0-9]+}&area={sectorCode:[a-zA-Z0-9]+}&phase={phaseId:[a-zA-Z0-9]+}&scheduleType={param:[a-zA-z0-9]+}',
                templateUrl:'app/agri/device/ninhbinh-auto-schedule/ninhbinh-AC-detail.html',
                data: {
                    pageTitle: 'admin.menu.autoControl',
                    parentLink: 'ninhbinh-automatic-schedule',
                    authorities:['ROLE_SYSTEM_ADMIN','ROLE_FARM_ADMIN', 'Auto_Controller_Update'],
                    sideBarMenu: 'inventory'
                },
                controller: 'ninhbinhACdetailController',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lazy_ionRangeSlider',
                            'lazy_tablesorter',
                            'lazy_KendoUI',
                            'lazy_parsleyjs',
                            'app/agri/device/ninhbinh-auto-schedule/ninhbinh-AC-detail.controller.js'
                        ]);
                    }]
                }
            })
    }
})();