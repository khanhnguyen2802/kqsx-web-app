angular
    .module('erpApp')
    .controller('main_sidebarCtrl', [
        '$timeout',
        '$scope',
        '$rootScope',
        '$translate', 'JhiLanguageService', 'tmhDynamicLocale','$window',
        function ($timeout,$scope,$rootScope,$translate, JhiLanguageService, tmhDynamicLocale, $window) {
            $scope.$on('onLastRepeat', function (scope, element, attrs) {
                $timeout(function() {
                    if(!$rootScope.miniSidebarActive) {
                        // $('#sidebar_main').find('.current_section > a').trigger('click');
                        // activate current section
                        var sideBar = $('#sidebar_main');
                        var currentSection = sideBar.find('.current_section > a');
                        if(currentSection.length === 0){
                            currentSection = sideBar.find('li.act_item').closest('li.submenu_trigger').find("> a");
                            currentSection.parent().addClass('current_section');
                        }
                        currentSection.trigger('click');
                    } else {
                        // add tooltips to mini sidebar
                        var tooltip_elem = $('#sidebar_main').find('.menu_tooltip');
                        tooltip_elem.each(function() {
                            var $this = $(this);

                            $this.attr('title',$this.find('.menu_title').text());
                            UIkit.tooltip($this, {
                                pos: 'right'
                            });
                        });
                    }
                })
            });

            // language switcher
            if($window.localStorage.getItem("lang") !=null){
                $scope.langSwitcherModel = $window.localStorage.getItem("lang")
            } else {
                $scope.langSwitcherModel = 'gb';
                // $window.localStorage.setItem("lang", "vi");
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
                        return '<div class="item"><i class="item-icon flag-' + escape(langData.value).toUpperCase() + '"></i></div>';
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
                    $window.localStorage.setItem("lang", value);
                }
            };
            $scope.$watch('langSwitcherModel', function() {
                var value = $scope.langSwitcherModel;
                var langKey = value==='gb' ? 'en' : (value==='vn'? 'vi' : 'en');
                $translate.use(langKey);
                tmhDynamicLocale.set(langKey);
            });

            // menu entries
            var menu = {
                'inventory': [
                    {
                        id: 0,
                        title: 'admin.menu.dashboard',
                        icon: '&#xE871;',
                        link:'dashboard',
                        privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN,Home_Page_View",
                    },
                    {
                        id: 6,
                        title: 'admin.menu.camera',
                        icon: 'videocam',
                        link: 'cameras',
                        privilege: "ROLE_SYSTEM_ADMIN, ROLE_SYSTEM_USER, ROLE_FARM_ADMIN, Camera_View"
                    },
                    {
                        id: 1,
                        title: 'admin.menu.farm_mgt',
                        icon: 'home',
                        privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Farm_View, Product_View, Category_View, Area_View",
                        submenu:[
                            {
                                id: 2,
                                title: 'admin.menu.farm',
                                link:'farms',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Farm_View"
                            },
                            {
                                id: 3,
                                title: 'admin.menu.area',
                                link:'areas',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Area_View"
                            },
                            {
                                id: 4,
                                title: 'admin.menu.product',
                                link:'products',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Product_View, Category_View"
                            }
                        ]
                    },
                    {
                        id: 5,
                        title: 'admin.menu.manufacturing',
                        icon: 'local_florist',
                        privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Procedure_Log_View, Season_View",
                        submenu:[
                            {
                                id: 6,
                                title: 'admin.menu.season',
                                link:'seasons',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Season_View"
                            },
                            {
                                id: 7,
                                title: 'admin.menu.procedureLog',
                                link:'procedureLogs',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Procedure_Log_View"
                            },
                            // {
                            //      id: 8,
                            //     title: 'admin.menu.process',
                            //     link:'procedures',
                            //     privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, ProcedureLog_View"
                            // },
                        ]
                    },
                    {
                        id: 8,
                        title: 'admin.menu.deviceControl',
                        icon: 'settings_input_component',
                        privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN,Device_View,Group_Device_View,Auto_Controller_View",
                        submenu:[
                            {
                                id: 9,
                                title: 'admin.menu.device',
                                link:'devices',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Device_View"
                            },
                            {
                                id: 10,
                                title: 'admin.menu.manualControl',
                                link:'group-devices',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Group_Device_View"
                            },
                            {
                                id: 11,
                                title: 'admin.menu.autoControl',
                                link:'automatic-controls',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Auto_Controller_View"
                            }
                        ]
                    },
                    {
                        id: 13,
                        title: 'admin.menu.alarm.name',
                        icon: 'alarm',
                        privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Alarm_Controller_View, Alarm_History_View",
                        submenu:[
                            {
                                id: 14,
                                title: 'admin.menu.alarm.config',
                                link:'alarm-config',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Alarm_Controller_View"
                            },
                            {
                                id: 15,
                                title: 'admin.menu.alarm.history',
                                link:'alarm-history',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Alarm_History_View"
                            }
                        ]
                    },
                    {
                        id: 16,
                        title: 'admin.menu.master',
                        icon: 'library_books',
                        privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN,Currency_View,Uom_Type_View,Uom_View",
                        submenu:[
                            // {
                            //     id: 5,
                            //     title: 'admin.menu.currency',
                            //     link:'currency',
                            //     privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Currency_View"
                            // },
                            {
                                id: 17,
                                title: 'admin.menu.uomType',
                                link:'uomTypes',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Uom_Type_View"
                            },
                            {
                                id: 18,
                                title: 'admin.menu.uom',
                                link:'uoms',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Uom_View"
                            },
                        ]
                    },
                    {
                        id: 19,
                        title: 'admin.menu.administration',
                        icon: '&#xE8B8;',
                        privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN,User_View,Organization_View,Role_View,Privilege_View",
                        submenu:[
                            {
                                title: 'admin.menu.users',
                                link: 'users',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, User_View"
                            },
                            {
                                title: 'admin.menu.roles',
                                link: 'roles',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Role_View"
                            },
                            {
                                title: 'admin.menu.privileges',
                                link: 'privileges',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Privilege_View"
                            },
                            {
                                title: 'admin.menu.notification',
                                link: 'notifications',
                                privilege:"ROLE_SYSTEM_ADMIN,ROLE_SYSTEM_USER,ROLE_FARM_ADMIN, Notification_View"
                            }
                        ]
                    }
                ]
            };

            $scope.goToManger = function (){
                $state.go('dashboard-manager');
            }

            var NBHSchedule = {
                id: 12,
                    title: 'admin.menu.autoSchedule',
                    link:'ninhbinh-automatic-schedule',
                    privilege:"ROLE_SYSTEM_ADMIN, ROLE_SYSTEM_USER, ROLE_FARM_ADMIN, NBH_Auto_View"
            }
            // console.log($window.localStorage.getItem("code"));
            if ($window.localStorage.getItem("code") === "NBH") {
                menu.inventory[4].submenu.push(NBHSchedule);
            }

            $scope.sections = menu[$rootScope.toState.data.sideBarMenu];
            $scope.linkActive = $rootScope.toState.data.parentLink;
            $rootScope.$on('$stateChangeSuccess', function () {
                $scope.linkActive = $rootScope.toState.data.parentLink;
                $scope.sections = menu[$rootScope.toState.data.sideBarMenu];

                if($scope.linkActive){
                    $timeout(function () {
                        var sideBar = $('#sidebar_main');
                        sideBar.find('li.act_item').closest('li.act_section').addClass('current_section');
                    })
                }
            });
        }
    ])
;