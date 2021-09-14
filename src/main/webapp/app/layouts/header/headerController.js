angular
    .module('erpApp')
    .controller('main_headerCtrl', [
        '$timeout',
        'tmhDynamicLocale',
        '$scope',
        '$window',
        '$localStorage',
        '$state',
        'Auth',
        'LogsService',
        'NotificationService',
        'User',
        'ErrorHandle',
        '$filter',
        '$translate',
        '$rootScope',
        'Organization',
        'HOST_DEVICE_SOCKET',
        function ($timeout, tmhDynamicLocale, $scope, $window, $localStorage, $state, Auth, LogsService, NotificationService, User, ErrorHandle, $filter, $translate, $rootScope, Organization, HOST_DEVICE_SOCKET) {
            const NOTIFICATION_ALARM = 'Alarm';
            $scope.userData = {};
            $scope.userData = $rootScope.currentUser;
            $scope.currentFarmId = null;
            $scope.oldFarmId = null;

            $scope.moduleTitle = {
                "admin": $translate.instant("admin.menu.administration"),
                "inventory": $translate.instant("admin.menu.sourceTrace"),
            };
            $scope.module = $scope.moduleTitle[$rootScope.toState.data.sideBarMenu];
            // reload tenant
            // đoạn này k dùng rootScope vì rootScope watch state change sẽ dính tới trang khác => bị duplicate
            $scope.$on('$stateChangeSuccess', function (event, toState, toParams) {
                if (toParams && toParams.isUpdateTenant) {
                    User.current().then(function (data) {
                        console.log('update Tenants!!!');
                        if (data.id !== undefined && data.id !== null) {
                            $scope.userData = data;
                            $rootScope.currentUser = data;
                            refreshOptionsFarm();
                        }
                    });
                }
                $scope.module = $scope.moduleTitle[$rootScope.toState.data.sideBarMenu]
            });
            $rootScope.$watch('currentUser', function (currentUser) {
                $scope.userData = currentUser;
            });
            $scope.logout = function () {
                Auth.logout();
                $scope.$emit('heyRoot', {
                    type: "userLogout",
                    message: "User Logout!!!",
                    from: "headerController"
                });
                $state.go('login');
            };

            /*============================================= NOTIFICATIONS ============================================*/
            $scope.hideNotificationTitle = $translate.instant('inventory.logs.hideNotification')
            $scope.markAsReadTitle = $translate.instant('inventory.logs.markAsRead')
            $scope.markAsUnReadTitle = $translate.instant('inventory.logs.markAsUnRead')
            $scope.notificationTitle = $translate.instant('inventory.logs.notification')
            $scope.seenTitle = $translate.instant('inventory.logs.seen')

            $scope.TIME_DISPLAY = {
                "hour": $translate.instant('inventory.logs.time.hour'),
                "minute": $translate.instant('inventory.logs.time.minute'),
                "at": $translate.instant('inventory.logs.time.at'),
                "ago": $translate.instant('inventory.logs.time.ago'),
                "yesterday": $translate.instant('inventory.logs.time.yesterday')
            };

            $scope.logDatas = {};
            LogsService.init($scope);
            //$scope.logDatas = LogsService.getAllNotification();
            // ===================== TENANT SELECT =======================
            $scope.userData = $rootScope.currentUser;
            $scope.farmSwitcherConfig = {
                maxItems: 1,
                valueField: 'id',
                labelField: 'name',
                searchField: 'name',
                create: false,
                render: {
                    item: function (langData) {
                        return '<div style="padding-right: 16px;font-size: 16px; font-weight: bold; color: white;  text-transform: uppercase;text-shadow: -1px -1px 0 grey, 1px -1px 0 grey, -1px 1px 0 grey, 1px 1px 0 grey;">' + langData.name + '</div>';
                    }
                },
                onDropdownClose: function (dropdown) {
                    // console.log(dropdown)
                    // neu k chon value thi lay value cu
                    // var existsVal = $(dropdown).prev().find('input').parent().find('div');
                    // if(existsVal.length === 0) {
                    //     let $select = $('#farm_switcher').selectize();
                    //     $select[0].selectize.setValue($scope.oldFarmId);
                    // }
                }
            };

            refreshOptionsFarm();

            function refreshOptionsFarm() {
                $scope.farmSwitcherOptions = [];
                var tenants = $scope.userData && $scope.userData.tenantViews ? $scope.userData.tenantViews : [];

                if (tenants.length > 0) {
                    for (var i = 0; i < tenants.length; i++) {
                        $scope.farmSwitcherOptions.push($scope.userData.tenantViews[i]);
                    }

                    setDefaultTenant();
                } else {
                    localStorage.removeItem("farmName");
                    localStorage.removeItem("farmId");
                    localStorage.removeItem("code");
                }
            }

            function setDefaultTenant() {
                // có localStorage thì lấy ra đã
                $scope.farmSeted = false;
                var tenants = $scope.userData && $scope.userData.tenantViews ? $scope.userData.tenantViews : [];
                var defaultOrganizationId = $window.localStorage.getItem("farmId");
                var defaultO = {};

                if (defaultOrganizationId != null) {
                    for (var i = 0; i < tenants.length; i++) {
                        if (tenants[i].id === parseInt(defaultOrganizationId)) {
                            defaultO = tenants[i];
                            $scope.farmSeted = true;
                            break;
                        }
                    }
                }

                // vẫn k tồn tại id tenant cũ thì gán mặc định = 0
                if (!$scope.farmSeted) {
                    defaultO = tenants[0];
                }
                $scope.currentFarmId = defaultO.id;
                $scope.oldFarmId = defaultO.id;
                $rootScope.farmId = defaultO.id;
                $scope.farmName = defaultO.name;
                $window.localStorage.setItem("farmId", defaultO.id);
                $window.localStorage.setItem("farmName", defaultO.name);
                $window.localStorage.setItem("code", defaultO.code);
            }

            $scope.firstChange = true;
            $scope.selectFarm = function (oId) {
                if (!$scope.firstChange && $scope.oldFarmId != oId) {
                    $(this).blur();
                    var orgName = "";
                    var code = ""
                    if (!oId) return;
                    UIkit.modal.confirm("Để chuyển sang trang trại khác, bạn cần chọn lại trang trại mặc định trong màn hình trang chủ", function () {
                        $window.localStorage.setItem("farmId", oId);
                        $scope.currentFarmId = oId;
                        $scope.oldFarmId = $scope.currentFarmId;
                        for (var i = 0; i < $scope.farmSwitcherOptions.length; i++) {
                            if (parseInt(oId) === $scope.farmSwitcherOptions[i].id) {
                                orgName = $scope.farmSwitcherOptions[i].name;
                                code = $scope.farmSwitcherOptions[i].code;
                                $window.localStorage.setItem("farmName", orgName);
                                $window.localStorage.setItem("code", code);
                                break;
                            }
                        }
                        $timeout(function () {
                            $state.go('dashboard');
                            $window.location.reload();
                        });
                    }, function () {
                        let $select = $('#farm_switcher').selectize();
                        $select[0].selectize.setValue($scope.oldFarmId);
                    }, {
                        labels: {
                            'Ok': $translate.instant("global.button.ok"),
                            'Cancel': $translate.instant("global.button.cancel")
                        }
                    });
                }
            };
            $timeout(function () {
                $scope.firstChange = false;

                // click outside input search
                $("#farm_switcher-selectized").focusout(function () {
                    var txtSearch = $("#farm_switcher-selectized").val();
                    if (txtSearch) {
                        let $select = $('#farm_switcher').selectize();
                        $select[0].selectize.setValue($scope.oldFarmId);
                    }
                });
            }, 500);

            // ================= END TENANT EVENT ======================

            $scope.notifications = [];
            $scope.avatarImg = 'assets/img/avatars/avatar.jpg';

            // User.current().then(function (data) {
            //     if(data.id != undefined && data.id != null) {
            //         $scope.userData = data;
            //         $rootScope.currentUser = data;
            //         // $scope.getNotifications(data.id);
            //     }
            // })

            setInterval(function () {
                User.current().then(function (data) {
                    if (data.active == 0) {
                        Auth.logout();
                        $state.go('login');
                    } else if (data.id != undefined && data.id != null) {
                        $scope.userData = data;
                        $rootScope.currentUser = data;
                    }
                }).catch(function (data) {
                    Auth.logout();
                    $state.go('login');
                })
            }, 60000);

            $scope.getNotifications = function (idUser) {
                $scope.pageNum = 0;
                $scope.noMoreItemRemain = false;
                LogsService.getByRecipient(idUser).then(function (data) {
                    $scope.notifications = data.data;
                    //sortArrayByIntegerField($scope.notifications, 'created', 'desc');
                    $scope.generateNotificationTimeString($scope.notifications);
                }).catch(function (data) {
                    ErrorHandle.handleError(data);
                });
            }

            $scope.getNotificationsNotSeen = function (idUser) {
                LogsService.countNotRead(idUser).then(function (data) {
                    $scope.logDatas.totalNotifications = data.data;
                }).catch(function (data) {
                    ErrorHandle.handleError(data);
                });
            }

            $scope.mouseHoverNotification = function (index, status) {
                $scope.notifications[index]['mouse_hover'] = status;
            }

            $scope.markAsRead = function (index) {
                //console.log("Mark As Read: "+ index)
                if ($scope.notifications[index].id != undefined && $scope.notifications[index].id != null) {
                    LogsService.markAsRead($scope.notifications[index].id).then(function (data) {
                        $scope.notifications[index].read = false;
                    }).catch(function (data) {
                        ErrorHandle.handleError(data);
                    })
                }
            }

            $scope.markAsUnRead = function (index) {
                //console.log("Mark As UnRead: "+ index)
                if ($scope.notifications[index].id != undefined && $scope.notifications[index].id != null) {
                    LogsService.markAsUnRead($scope.notifications[index].id).then(function (data) {
                    }).catch(function (data) {
                        $scope.notifications[index].read = false;
                        ErrorHandle.handleError(data);
                    })
                }
            }

            $scope.markAllAsRead = function () {
                //console.log("Mark All As Read!")
                if ($scope.notifications.length == 0)
                    return;

                if ($scope.userData.id != undefined && $scope.userData.id != null) {
                    LogsService.markAllAsRead($scope.userData.id).then(function (data) {
                        updateNotificationMarkAllAsRead();
                    }).catch(function (data) {
                        ErrorHandle.handleError(data);
                    })
                }
            }

            $scope.hideNotification = function (index) {
                //console.log("Hide Notification: "+ index)
                if ($scope.notifications[index].id != undefined && $scope.notifications[index].id != null) {
                    $scope.notifications[index].isHide = true;
                    // LogsService.hideNotification($scope.notifications[index].id).then(function (data) {
                    //     if($scope.userData.id != undefined && $scope.userData.id != null) {
                    //         $scope.getNotifications($scope.userData.id);
                    //         $scope.sendUpdateNotificationEvent();
                    //     }
                    // }).catch(function (data) {
                    //     ErrorHandle.handleError(data);
                    // })
                }
            }

            $scope.markAsDropdown = function () {
                if ($("#notificationDropdown").hasClass('uk-dropdown-shown')) {
                    //do nothing
                    return;
                }
                if ($scope.logDatas.totalNotifications == 0) {
                    //loadata if size =0
                    $scope.getNotifications($scope.userData.id);
                    return;
                }
                if ($scope.userData.id != undefined && $scope.userData.id != null) {

                    LogsService.markAllAsShowDropdown($scope.userData.id).then(function (data) {
                    }).catch(function (data) {
                        ErrorHandle.handleError(data);
                    });
                    //load data
                    $scope.getNotifications($scope.userData.id);
                }
            }

            $scope.showAllNotification = function () {
                //console.log("Show All Notification!")
                $state.go('notifications');
            }

            $scope.pageNum = 0;
            $scope.pageSizePerLoad = 10;
            $scope.showMoreNotify = false;
            $scope.showMoreNotifications = function () {
                $scope.pageNum++;
                $scope.showMoreNotify = true;
                if ($scope.userData.id != undefined && $scope.userData.id != null) {
                    setTimeout(function () {
                        $scope.getPagingNotifications($scope.userData.id, $scope.pageNum, $scope.pageSizePerLoad);
                    }, 700)
                }
            }

            $scope.getPagingNotifications = function (userId, pageNum, pageSize) {
                if (pageNum == 0)
                    $scope.notifications = [];
                $scope.showMoreNotify = true;
                LogsService.getByRecipientPaging(userId, pageNum, pageSize).then(function (data) {
                    //$scope.notifications = data.data;
                    if (data.data.length == 0) {
                        $scope.noMoreItemRemain = true;
                    } else {
                        for (var i = 0; i < data.data.length; i++) {
                            $scope.notifications.push(data.data[i]);
                        }
                        $scope.generateNotificationTimeString($scope.notifications);
                    }
                    $scope.showMoreNotify = false;

                }).catch(function (data) {
                    ErrorHandle.handleError(data);
                })
            };

            $('#notificationDropdownContainer').on('show.uk.dropdown', function () {
                //console.log("open")
            });

            $('#notificationDropdownContainer').on('hide.uk.dropdown', function () {
                //console.log("close")
                var need_hide = [];
                for (var i = 0; i < $scope.notifications.length; i++) {
                    if ($scope.notifications[i].isHide)
                        need_hide.push($scope.notifications[i].id);
                }
                if (need_hide.length > 0) {
                    $scope.$emit('heyRoot', {
                        type: "hideNotifications",
                        message: "Hello Root!!!",
                        from: "headerController",
                        data: need_hide
                    });
                }
            });

            $scope.generateNotificationTimeString = function (data) {
                if (data != undefined && data != null) {
                    for (var i = 0; i < data.length; i++) {
                        var date = new Date(data[i]['created']);
                        var presentTime = new Date();

                        var diffDate = $scope.findDifferentDate(date, presentTime);
                        if (diffDate == 0) {
                            // Today
                            var oneHour = 60 * 60 * 1000;
                            var diffTime = Math.abs(presentTime.getTime() - date.getTime());
                            if (diffTime < oneHour) {
                                var minDiff = Math.floor(diffTime / 60 / 1000);
                                data[i]['timeString'] = minDiff + " " + $scope.TIME_DISPLAY['minute'] + " " + $scope.TIME_DISPLAY['ago'];
                            } else {
                                var hourDiff = Math.floor(diffTime / 60 / 60 / 1000);
                                var minDiff = Math.floor((diffTime - hourDiff * 60 * 60 * 1000) / 60 / 1000);
                                data[i]['timeString'] = hourDiff + " " + $scope.TIME_DISPLAY['hour'] + " " +
                                    minDiff + " " + $scope.TIME_DISPLAY['minute'] + " " + $scope.TIME_DISPLAY['ago'];
                            }
                        } else if (diffDate == -1) {
                            // Yesterday
                            data[i]['timeString'] = $scope.TIME_DISPLAY['yesterday'] + " " + $scope.TIME_DISPLAY['at'] + " " + genTime(date.getTime());
                        } else {
                            // Display full date
                            data[i]['timeString'] = genDate(date.getTime()) + " " + $scope.TIME_DISPLAY['at'] + " " + genTime(date.getTime());
                        }
                    }
                }
            }

            function sortArrayByIntegerField(arrays, field, sort) {
                // field is an integer
                arrays.sort(function (a, b) {
                    if (sort === 'asc')
                        return a[field] - b[field];
                    else
                        return b[field] - a[field];
                })
            }

            function genDate(time) {
                return $filter('date')(time, 'dd/MM/yyyy');
            }

            function genTime(time) {
                return $filter('date')(time, 'HH:mm:ss');
            }

            $scope.findDifferentDate = function (firstDate, secondDate) {
                var oneDay = 24 * 60 * 60 * 1000;
                var diffTime = firstDate.getTime() - secondDate.getTime();
                return diffTime >= 0 ? Math.round(Math.abs(diffTime / oneDay)) : -Math.round(Math.abs(diffTime / oneDay));
            }

            $scope.goToNotification = function (index) {
                if (index >= 0 && index < $scope.notifications.length) {
                    var noti = $scope.notifications[index];
//                    var objectUrl = $scope.notifications[index].objectUrl;
//                    var objectId = $scope.notifications[index].objectId;
//                    if(objectId != undefined && objectId != null) {
//                        // check if object is deleted
//                        if($scope.notifications[index].objectType === "TraceRequest") {
//                            $state.go('trace-request-detail',{traceRequestId:objectId})
//                        } else if($scope.notifications[index].objectType === "Organization") {
//                            Organization.checkOne($scope.notifications[index].objectId).then(function (data) {
//                                console.log(data)
//                                if(data.length == 0) {
//                                    UIkit.modal.alert($translate.instant("error.adjustment.adjustment_is_delete"), {
//                                        labels: {
//                                            'Ok': "OK"
//                                        }
//                                    });
//                                } else {
//                                    UIkit.dropdown($('#notificationDropdownContainer')).hide()
//                                    window.location.href = objectUrl;
//                                    window.location.reload();
//                                }
//                            }).catch(function (data) {
//                                UIkit.modal.alert($translate.instant("error.adjustment.adjustment_is_delete"), {
//                                    labels: {
//                                        'Ok': "OK"
//                                    }
//                                });
//                            })
//                        } else {
//                            UIkit.dropdown($('#notificationDropdownContainer')).hide()
//                            window.location.href = objectUrl;
//                            window.location.reload();
//                        }
//                    }
                    $scope.markAsRead(index);
                    $('#notificationDropdownContainer').hide();
                    if (noti.objectType == NOTIFICATION_ALARM) {
                        var param = {'alarmId': noti.objectId};
                        $state.go('alarm-history-detail', param);
                    }

                }
            }

            // Listen for events from root controller
//            $scope.$on('updateNotifications', function (event, args) {
//                if(args.from !== 'headerController') {
//                    if($scope.userData.id != undefined && $scope.userData.id != null) {
//                        $scope.getNotifications($scope.userData.id)
//                    }
//                }
//            });

            var stompClient;
            var socket;
            const WEB_SOCKET_URL = HOST_DEVICE_SOCKET;

            var stompFailureCallback = function (error) {
                console.log('STOMP: ' + error);
                setTimeout(stompConnect, 31000);
                console.log('STOMP: Reconecting in 31 seconds');
            };

            function stompSuccessCallback() {
                console.log("stompSuccessCallback");
                stompClient.subscribe('/topic/triggerNotify/' + $scope.userData.id, function (response) {
                    //var data = JSON.parse(response.body);                    
                    var content = response.body;
                    if (content !== '' && content !== null && content !== undefined && content.length > 0) {
                        var objNotification = JSON.parse(content);
                        for (var name in objNotification) {
                            var value = objNotification[name];
                            switch (name) {
                                case "create_and_send_notififcation":
                                    //load number notification not dropdown
                                    $scope.getNotificationsNotSeen($scope.userData.id);
                                    break;
                                case "mask_as_show_drop_down":
                                    //load number notification not dropdown
                                    $scope.getNotificationsNotSeen($scope.userData.id);
                                    break;
                                case "mask_all_as_read":
                                    //update data in popup and notification page
                                    updateNotificationMarkAllAsRead();
                                    $scope.sendUpdateNotificationEvent();
                                    break;
                                case "mask_as_read":
                                    //update data in popup and notification page
                                    updateNotificationMarkAsRead(value);
                                    $scope.sendUpdateNotificationEvent();
                                    break;
                                case "mask_as_un_read":
                                    //update data in popup and notification page
                                    updateNotificationMarkAsUnRead(value);
                                    $scope.sendUpdateNotificationEvent();
                                    break;
                                default:
                                    console.log(name + ": " + value);
                            }
                        }
                    }

                });
            }

            function stompConnect() {
                console.log('STOMP: Attempting connection');
                // recreate the stompClient to use a new WebSocket            
                socket = new SockJS(WEB_SOCKET_URL);
                stompClient = Stomp.over(socket);
                stompClient.connect({}, stompSuccessCallback, stompFailureCallback);
            }

            stompConnect();

            function updateNotificationMarkAsRead(id) {
                for (var i = 0; i < $scope.notifications.length; i++) {
                    var noti = $scope.notifications[i];
                    if (noti.id == id) {
                        noti.read = true;
                        break;
                    }
                }
            }

            function updateNotificationMarkAsUnRead(id) {
                for (var i = 0; i < $scope.notifications.length; i++) {
                    var noti = $scope.notifications[i];
                    if (noti.id == id) {
                        noti.read = false;
                        break;
                    }
                }
            }

            function updateNotificationMarkAllAsRead() {
                for (var i = 0; i < $scope.notifications.length; i++) {
                    var noti = $scope.notifications[i];
                    noti.read = true;
                }
            }

            // Send event to root controller
            $scope.sendUpdateNotificationEvent = function () {
                $scope.$emit('heyRoot', {
                    type: "updateNotifications",
                    message: "Hello Root!!!",
                    from: "headerController"
                });
            }

            // language switcher
            if ($window.localStorage.getItem("lang") != null) {
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
                    option: function (langData, escape) {
                        return '<div class="option">' +
                            '<i class="item-icon flag-' + escape(langData.value).toUpperCase() + '"> </i>' +
                            '<span>' + '   ' + escape(langData.title) + '</span>' +
                            '</div>';
                    },
                    item: function (langData, escape) {
                        return '<div class="item"><i class="item-icon flag-' + escape(langData.value).toUpperCase() + '"></i></div>';
                    }
                },
                valueField: 'value',
                labelField: 'title',
                searchField: 'title',
                create: false,
                onInitialize: function (selectize) {
                    $('#lang_switcher').next().children('.selectize-input').find('input').attr('readonly', true);
                },
                onChange: function (value) {
                    var langKey = value === 'gb' ? 'en' : (value === 'vn' ? 'vi' : 'en');
                    $translate.use(langKey);
                    tmhDynamicLocale.set(langKey);
                    $window.localStorage.setItem("lang", value);
                }
            };
            $scope.$watch('langSwitcherModel', function () {
                var value = $scope.langSwitcherModel;
                var langKey = value === 'gb' ? 'en' : (value === 'vn' ? 'vi' : 'en');
                $translate.use(langKey);
                tmhDynamicLocale.set(langKey);
            });

            var initNotification = function () {
                if ($scope.userData.id != undefined && $scope.userData.id != null) {
                    $scope.getNotificationsNotSeen($scope.userData.id);
                }
            };

            initNotification();

            /*=========================================== END NOTIFICATIONS ==========================================*/
        }
    ])
;