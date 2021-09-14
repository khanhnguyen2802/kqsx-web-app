(function () {
    'use strict';
    angular.module('erpApp')
        .controller('ProductController', ProductController);

    ProductController.$inject = ['$rootScope', '$scope', '$state', '$http',
        'AlertService', '$translate', 'TableController', 'ComboBoxController', 'AlertModalService',
        'Product', '$timeout', 'ProductCategory', 'ErrorHandle', '$window'];

    function ProductController($rootScope, $scope, $state, $http,
                               AlertService, $translate, TableController, ComboBoxController, AlertModalService,
                               Product, $timeout, ProductCategory, ErrorHandle, $window) {
        var tenantId = $window.localStorage.getItem("farmId") ? $window.localStorage.getItem("farmId") : 0;
        $scope.ComboBox = {};

        $scope.blockModal = null;
        $scope.blockUI = function () {
            if($scope.blockModal != null)
                $scope.blockModal.hide();
            $scope.blockModal = null;
            $scope.blockModal = UIkit.modal.blockUI('<div class=\'uk-text-center\'>Đang xử lý ...<br/><img class=\'uk-margin-top\' src=\'assets/img/spinners/spinner_success.gif\' alt=\'\'>');
        };
        // ========================== TABLE ==============
        // khai bao cac column va kieu du lieu
        var columns = {
            'id': 'Number',
            'code': 'Text',
            'categoryId': 'Number',
//            'created': 'DateTime', // tên công ty cha
//            'userId':'Number',
//            'createdBy': 'Text',
            'name': 'Text'
        };
        $scope.tenantId = $window.localStorage.getItem("farmId");
        // khai bao cau hinh cho bang
        var tableConfig = {
            tableId: "products",            //table Id
            model: "products",             //model
            defaultSort:"created",          //sap xep mac dinh theo cot nao
            sortType: "desc",                //kieu sap xep
            loadFunction: Product.getPageFull,     //api load du lieu
            columns: columns,               //bao gom cac cot nao
            handleAfterReload: null,        //xu ly sau khi load du lieu
            handleAfterReloadParams: null,  //tham so cho xu ly sau khi load
            deleteCallback: null,           //delete callback
            customParams: "tenantId==" + tenantId,               //dieu kien loc ban dau
            pager_id: "table_product_pager",   //phan trang
            page_id: "product_selectize_page", //phan trang
            page_number_id: "product_selectize_pageNum",   //phan trang
            page_size_option: ["5", "10", "25", "50"]   //lua chon size cua 1 page
        };

        TableController.initTable($scope, tableConfig);     //khoi tao table
        TableController.sortDefault(tableConfig.tableId);   //set gia tri sap xep mac dinh
        TableController.reloadPage(tableConfig.tableId);    //load du lieu cho table
        // =================END TABLE ============

        // ==============CBB====================
        // dm cha
        var categoryCbb = {
            id:'categoryCbb',
            url:'/api/product-categories',
            replaceUrl:'/search?query=',
            originParams:'',
            valueField:'id',
            labelField:'categoryName',
            searchField:'categoryName',
            table: $scope.TABLES['products'],
            column: 'categoryId',
            maxItems:1,
            ngModel:[],
            options: [],
            placeholder:$translate.instant("global.placeholder.search")
        };
        ComboBoxController.init($scope, categoryCbb);

        // danh muc tao moi
        var categoryComboBox = {
            id:'category',
            url:'/api/product-categories',
            replaceUrl: '/search?query=',
            originParams:'', // chỉ lấy địa điểm
            valueField:'id',
            labelField:'categoryName',
            searchField:'categoryName',
            table: null,
            column: null,
            maxItems:1,
            ngModel:[],
            options:[],
            placeholder: $translate.instant("global.placeholder.choose")
        };
        ComboBoxController.init($scope, categoryComboBox);

        // ng tao
        var userComboBox = {
            id:'userId',
            url:'/api/users',
            originParams:'', // chỉ lấy địa điểm
            valueField:'email',
            labelField:'email',
            searchField:'email',
            table: $scope.TABLES['products'],
            column: "createdBy",
            maxItems:null,
            ngModel:[],
            options:[],
            placeholder: $translate.instant("global.placeholder.choose")
        };
        ComboBoxController.init($scope, userComboBox);
        // ==================END CBB===================
        $scope.firstLoad = function (id) {
            // $scope.blockUI();
            ProductCategory.search(tenantId, id).then(function (data) {
                if($scope.blockModal != null) $scope.blockModal.hide();
                reloadTree(data);
            }).catch(function (data) {
                if($scope.blockModal != null) $scope.blockModal.hide();
                ErrorHandle.handleError(data);
            });
        };
        $scope.firstLoad(0);
        // ==================== TREE ====================
        var dataRoot = [
            {
                title:  $translate.instant("infrastructure.categoryProduct.name"),
                key: 0,
                folder: true,
                expanded: true,
                children: []
            }
        ];

        function reloadTree(data){
            if (!angular.isDefined(data) || data == null || data.length === 0 || data === ''){
                $scope.empty = true;
            } else {
                $scope.empty = false;
            }

            dataRoot[0].children = data;
            data = dataRoot;

            var $tFilter = $("#tree");

            $tFilter.fancytree({
                extensions: ["dnd", "filter", "edit"],
                source: data,
                activate: function (event, data) {
                    var node = data.node;
                    $("#echoActivated").text(node.title + ", key=" + node.key);
                },
                click: function (event, data) {
                    var nodes = [];
                    data.node.visit(function (node) {
                        nodes.push(node.key);  // or node.key, ...
                    });
                    if (nodes.length === 0) {
                        nodes.push(data.node.key)
                    }

                    $rootScope.findByTree(data.node);
                    if ($(".contextMenu:visible").length > 0) {
                        $(".contextMenu").hide();
                    }
                },
                renderNode: function (event, data) {
                    var node = data.node;

                    node.tooltip = node.title;
                    if(node.data.titleShort){
                        node.setTitle(node.data.titleShort);
                    } else{
                        node.setTitle(node.title);
                    }
                },
                createNode: function (event, data) {
                    bindContextMenu(data.node.span);
                },
                filter: {
                    mode: "hide"  // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
                },
                dnd: {
                    preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
                    preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
                    autoExpandMS: 400,
                    dragStart: function (node, data) {
                        return true;
                    },
                    dragEnter: function (node, data) {
                        //               return true;
                        if (node.parent !== data.otherNode.parent)
                            return false;
                        return ["before", "after"];
                    },
                    dragDrop: function (node, data) {
                        data.otherNode.moveTo(node, data.hitMode);
                    }
                }
            });

            var tree = $tFilter.fancytree("getTree");
            var treeFilterReset = $("#tree_filter_reset");
            $("#filter_input").keyup(function (e) {
                var n,
                    opts = {
                        mode: "hide",
                        autoExpand: true,
                        leavesOnly: $("#leavesOnly").is(":checked")
                    },
                    match = $(this).val();
                console.log(match);
                match = ComboBoxController.removeUnicode($(this).val());

                if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                    $("#tree_filter_reset").click();
                    return;
                }

                n = tree.filterNodes(function (node) {
                    return new RegExp(match, "i").test(ComboBoxController.removeUnicode(node.title));
                }, opts);

                // if ($("#tree_filter_regex").is(":checked")) {
                //     // Pass function to perform match
                //     n = tree.filterNodes(function (node) {
                //         return new RegExp(match, "i").test(ComboBoxController.removeUnicode(node.title));
                //     }, opts);
                // } else {
                //     // Pass a string to perform case insensitive matching
                //     n = tree.filterNodes(function (node) {
                //         return new RegExp(match, "i").test(ComboBoxController.removeUnicode(node.title));
                //     }, opts);
                // }
                treeFilterReset.attr("disabled", false);

            });
            // reset filter

            treeFilterReset.click(function () {
                $("#filter_input").val('');
                tree.clearFilter();
            });
        }

        //binding context to category tree
        function bindContextMenu(span) {
            // Add context menu to this node:
            $(span).contextMenu({menu: "myMenu"}, function (action, el, pos) {
                // The event was bound to the <span> tag, but the node object
                // is stored in the parent <li> tag
                var node = $.ui.fancytree.getNode(el);
                $scope.canChangeCategoryParent = true;
                switch (action) {
                    case "add":
                        addCategory(node);
                        break;
                    case "add_material":
                        addMaterial(node);
                        break;
                    case "edit":
                        editCategory(node);
                        break;
                    case "remove":
                        deleteCategory(node);
                        break;
                    case "rename":

                    default:
                        alert("Todo: appply action '" + action + "' to node " + node);
                }
            });
        }

        // function getParent(node) {
        //     var relation = "";
        //     while (node.parent != null) {
        //         relation = node.title + "/" + relation;
        //         node = node.parent
        //     }
        //     return relation
        // }
        //
        // function getRootKey(node) {
        //     var key = 0;
        //     while (node.key !== 0) {
        //         key = node.key;
        //         node = node.parent;
        //         if(node == null) break;
        //     }
        //     return key;
        // }

        function addMaterial(node){
            if(node.children && node.children.length > 0){
                return handelError("error.categoryProduct.notCreateProduct");
            } else{
                $state.go('products-create', {materialCategoryId: node.key});
            }
        }

        $scope.onAddCategory = function(){
            categoryComboBox.resetScroll = true;
            categoryComboBox.options = [{ id: 0, categoryName: dataRoot[0].title }];
            ComboBoxController.init($scope, categoryComboBox);
            $timeout(function () {
                angular.element("#categoryBtn").trigger("click");
                $scope.addCategory = true;

                $scope.category = {
                    name: "",
                    id: "",
                    parentId: 0,
                    farmId: tenantId,
                    createdBy: $rootScope.currentUser.fullName
                };
            });
        }

        function addCategory(node){
            $scope.node = node;
            // push options
            if(node.data && node.data.description != ""){
                categoryComboBox.resetScroll = true;
                categoryComboBox.options = [{ id: node.key, categoryName: node.data.categoryName }];
                ComboBoxController.init($scope, categoryComboBox);
            }
            if(node.key == 0){
                categoryComboBox.resetScroll = true;
                categoryComboBox.options = [{ id: 0, categoryName: node.title }];
                ComboBoxController.init($scope, categoryComboBox);
            }
            console.log(node.key);
            $timeout(function () {
                angular.element("#categoryBtn").trigger("click");
                $scope.addCategory = true;

                $scope.category = {
                    name: "",
                    id: "",
                    parentId: node.key,
                    farmId: tenantId,
                    createdBy: $rootScope.currentUser.fullName
                };
            });
        }

        function editCategory(node) {
            $scope.addCategory = false;
            $scope.node = node;

            if(node.key == 0){
                return handelError("error.categoryProduct.notEditCategory");
            }
            if(node.data.tenantId !=null && $rootScope.currentUser.tenantId !=null
                && $rootScope.currentUser.tenantId !=undefined
                && $rootScope.currentUser.tenantId != node.data.tenantId){
                return handelError("error.categoryProduct.notPermissionEdit");
            }
            if(node.parent.key != 0){
                categoryComboBox.resetScroll = true;
                categoryComboBox.options = [{ id: node.parent.key, categoryName: node.data.titleLong }];
                ComboBoxController.init($scope, categoryComboBox);
            } else{
                categoryComboBox.resetScroll = true;
                categoryComboBox.options = [{ id: node.key, categoryName: dataRoot[0].title }];
                ComboBoxController.init($scope, categoryComboBox);
            }
            //get product in category
            var query ="query=tenantId==" + $scope.tenantId + ";categoryId==" + node.key + "&page=0&size=1";
            Product.getPageFull(query).then(function (resp) {
                if(resp.data.length) {
                    $scope.canChangeCategoryParent = false;
                    ProductCategory.getOne(resp.data[0].categoryId).then(function (resp) {
                        $scope.categoryParentName = resp.categoryName;
                    }).catch(function (error) {
                        return handelError(error);
                    });
                }
            }).catch(function (error) {
                return handelError(error);
            });

            $scope.category = {
                name: node.tooltip,
                description: node.data.description,
                id: node.key,
                parentId: node.parent.key != 0 ? node.parent.key : 0,
                tenantId: node.data.tenantId,
                createdBy: node.data.createdBy
            };

            $timeout(function () {
                angular.element("#categoryBtn").trigger("click");
                $("#newCategory").parsley();
            });
        }

        function deleteCategory(node) {
            //var messError ="";
            if(node.key == 0){
                return handelError("error.categoryProduct.notDeleteCategory");
            }

            if(node.children !=null && node.children.length >0){
                return handelError("error.categoryProduct.usedCategory");
            }

            if(node.data.tenantId !=null && $rootScope.currentUser.tenantId !=null
                && $rootScope.currentUser.tenantId !=undefined
                && $rootScope.currentUser.tenantId != node.data.tenantId){
                return handelError("error.categoryProduct.notPermissionDelele");
            }

            //get product in category
            var query ="query=categoryId=="+node.key;
            Product.getPageFull(query).then(function (res) {
                console.log(res.data);
                if(res.data !=null && res.data.length >0)
                    return handelError("error.categoryProduct.usedCategory");
                else{
                    $scope.node = node;
                    $scope.category = {
                        name: node.title,
                        description: node.data.description,
                        id: node.key
                    };
                    $scope.deleteConfirm();
                }
            })
        }

        function handelError(messError){
            //AlertModalService.handleOneError(messError);
            AlertService.error(messError);
            $scope.$apply();
        }

        function isEmpty(obj){
            return Object.keys(obj).length === 0 && obj.constructor === Object;
        }

        // function getParentName(node){
        //     var data = node.parent.data;
        //     var arrParent = [];
        //
        //     while(!isEmpty(data)){
        //         arrParent.push(node.title);
        //
        //         node = node.parent;
        //         data = node.data;
        //     }
        //
        //     if(arrParent.length < 1) arrParent.push(node.tooltip);
        //
        //     var parentName = "";
        //     for (var i = arrParent.length - 1; i >= 0; i --){
        //         parentName = parentName ? parentName + "/" + arrParent[i] : arrParent[i];
        //     }
        //     return parentName;
        // }

        //find by categories tree
        $rootScope.findByTree = function findByTree(node) {
            // check if click attribute node
            if(node !=null && node.key !=null &&  node.data.type == 5){
                Value.getByAttribute(node.key).then(function (data) {
                    $scope.values = data;
                    $scope.selectAttribute = true;
                })
            } else {
                $scope.selectAttribute = false;
            }
        };

        $scope.createCategory = function() {
            if($scope.btnDisable) return;
            var $form = $("#form_create_material");
            $("#form_create_material").parsley();
            if (!$scope.form_create_material.$valid) return;
            if(!ComboBoxController.checkIsValidForm($form)) return;

            $scope.btnDisable = true;
            ProductCategory.create($scope.category).then(function (data) {
                if($scope.blockModal != null) $scope.blockModal.hide();

                AlertService.success("success.msg.create");
                $timeout(function () {
                    angular.element("#closeCategoryBtn").trigger("click");
                    $scope.firstLoad(data.farmId);
                });

                $timeout(function () {
                    $scope.btnDisable = false;
                },150);
            }).catch(function (data) {
                if($scope.blockModal != null) $scope.blockModal.hide();
                $scope.btnDisable = false;
                if(data && data.data && data.data.errorKey == "existsName"){
                    AlertModalService.handleOneError($translate.instant("error.categoryProduct.nameExistsInParent") + $scope.node.title);
                } else{
                    ErrorHandle.handleOneError(data);
                }
            });
        };

        $scope.updateCategory = function(){
            var $form = $("#form_create_material");
            $("#form_create_material").parsley();
            if (!$scope.form_create_material.$valid) return;
            if(!ComboBoxController.checkIsValidForm($form)) return;

            UIkit.modal.confirm($translate.instant("infrastructure.categoryProduct.messConfirmEdit"), function () {
                $scope.blockUI();
                ProductCategory.update($scope.category).then(function (data) {
                    if($scope.blockModal != null) $scope.blockModal.hide();

                    AlertService.success("success.msg.update");
                    $timeout(function () {
                        angular.element("#closeCategoryBtn").trigger("click");
                        $scope.firstLoad(data.id);
                    });
                }).catch(function (data) {
                    if($scope.blockModal != null) $scope.blockModal.hide();
                    ErrorHandle.handleOneError(data);
                });
            }, {
                labels: {
                    'Ok': $translate.instant("global.button.ok"),
                    'Cancel': $translate.instant("global.button.cancel")
                }
            });
        };

        $scope.deleteConfirm = function(){
            UIkit.modal.confirm($translate.instant("infrastructure.categoryProduct.messConfirmDelete"), function () {
                $scope.blockUI();
                ProductCategory.deleteOne($scope.category.id).then(function () {
                    if($scope.blockModal != null) $scope.blockModal.hide();
                    $scope.node.remove();
                    AlertService.success("success.msg.delete");
                }).catch(function (data) {
                    if($scope.blockModal != null) $scope.blockModal.hide();
                    console.log(data);
                    ErrorHandle.handleOneError(data);
                });
            }, {
                labels: {
                    'Ok': $translate.instant("global.button.ok"),
                    'Cancel': $translate.instant("global.button.cancel")
                }
            });
        };

        $scope.showTree = true;
        $scope.toogleTree = function () {
            $scope.showTree = !$scope.showTree;
        };
        reloadTree(null);
        // ==================== END TREE ====================
        // ham xoa mac dinh
        $scope.defaultDelete = function () {
            TableController.defaultDelete(tableConfig.tableId, Product.deleteMany,"product");
        }

        $scope.deleteOne = function(id){
            UIkit.modal.confirm($translate.instant("global.actionConfirm.delete"), function () {
                Product.deleteOne(id).then(function () {
                    TableController.reloadPage(tableConfig.tableId);
                }).catch(function(err){
                    var errorKey = err.data.errorKey;
                    if(errorKey){
                        AlertModalService.handleOneError($translate.instant("error.product.productInUse"));
                    }else  AlertModalService.handleOneError($translate.instant("error.product.deleteFault"));
                })
            }, {
                labels: {
                    'Ok': $translate.instant("global.button.delete"),
                    'Cancel': $translate.instant("global.button.cancel2")
                }
            });
        }
    }
})();
