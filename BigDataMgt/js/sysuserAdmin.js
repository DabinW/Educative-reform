var SysUserAdminController;
SysUserAdminController = function  ($scope, $rootScope, $http, $q,$compile,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,localStorageService,$filter) {
    var ActionRouteURL = "\\ReturnSysAuth\\ActionRoute";
    $scope.RoleTreeOptions = {
        nodeChildren: "children",
        isLeaf: function(node) {
            return (node.attr.ifPerson == "Y");
        }
    };
    $scope.ModuleTreeOptions = {
        nodeChildren: "children",
        isLeaf: function(node) {
            return (node.attr.ifPerson == "Y");
        }
    };
    $scope.selectedModuleNodes = [];
    $scope.NowRoleList=[];
    $scope.RoleInfo={
        IsChildrenRole:""
    };
    $scope.TreeDataInit = function() {
        $http.get('/ReturnSysAuth/GetRoleTreeDataAll'+"?remark="+systemname).then(function(data) {
            $scope.RoleTreeData = data.data;
            if (data.data.length>0){
                $scope.expandedRoleNodes = [$scope.RoleTreeData[0]];
            }
        });
        $http.post('/ReturnSysAuth/GetModuleTreeDataAll'+"?remark="+systemname).then(function(data) {
            $scope.ModuleTreeData = data.data;
            if (data.data.length>0){
                $scope.expandedModuleNodes = [$scope.ModuleTreeData[0]];
            }
        });
    };
    $scope.RoleSelected =function(sel) {
        $scope.selectedNode = sel;
        var postdata=angular.toJson($scope.selectedNode.attr._id);
        $http.post(serverURL + ActionRouteURL, {
            action:"GetRoleInfo", baseinfo:$scope._id, AskString: postdata,remark: systemname
        }).success(function (data) {
                $scope.NowSelected=data;
                $scope.Default();
                $scope.ShowNowSelected=true;
            }).error(function(response) {

            });
    };
    $scope.GetNowModuleTree=function(){
        $http.post('/ReturnSysAuth/GetModuleIDByRoleID',{AskString:$scope.selectedNode.attr._id,remark:systemname}).then(function(data) {
            var smodulelist = data.data;
            $scope.expandedModuleNodes = [$scope.ModuleTreeData[0]];
            angular.forEach($scope.ModuleTreeData, function(child) {
                var changeCheck = function(thechild){
                    if (!(thechild.children == null || thechild.children.length <1 || thechild.children == undefined)){
                        var ifopen = false;
                        angular.forEach(thechild.children,function(nextchild){
                            var thestate = changeCheck(nextchild);
                            if (thestate && !ifopen){ ifopen = true; }
                        })
                        if (ifopen){ $scope.expandedModuleNodes.push(thechild); }
                        return ifopen;
                    }
                    else {
                        var cidIn = smodulelist.indexOf(thechild.attr._id.toString());
                        if (cidIn >= 0){ thechild.hased = true; }
                        else { thechild.hased = false; }
                        return thechild.hased;
                    }
                }
                changeCheck(child);
            });
        });
    }
    $scope.ModuleInfo={};
    $scope.NowModuleInfo={};
    $scope.ModuleSelected =function(sel) {
        $scope.selectedModuleNode = sel;
        $http.post(serverURL + ActionRouteURL, {
            action:"GetModuleByID", baseinfo:$scope._id, AskString:  $scope.selectedModuleNode.attr._id,remark:systemname
        }).success(function (data) {
                $scope.NowModuleInfo=data;
                $scope.ModuleInfo=data;
                $scope.ModuleFrom=true;
                $scope.ButtonShow="Modify";
            })
    };
    $scope.TreeDataInit();
    //初始页面
    $scope.Default=function(){
        $scope.ShowChangeRole=false;
        $scope.ShowRoleAssignmentModule=false;
        $scope.ShowUserAssignmentRole=false;
        $scope.RoleAssignmentModuleButton=false;
        $scope.UserAssignmentRoleButton=false;
        $scope.ModuleFrom=false;
        $scope.ShowNowSelected=false;
        $scope.ShowButtonGroup=true;
    };
    $scope.Default();

    //显示添加角色
    $scope.ShowAddRole=function(){
        $scope.RoleInfo={};
        $scope.RoleInfo.RoleParentID=$scope.NowSelected.RoleParentID;
        $scope.ButtonShow="Add";
        $scope.ShowChangeRole=true;
        $scope.ShowRoleAssignmentModule=false;
        $scope.ShowUserAssignmentRole=false;
        $scope.RoleAssignmentModuleButton=false;
        $scope.UserAssignmentRoleButton=false;
        $scope.ShowNowSelected=false;
    };
    //显示修改角色
    $scope.ModifyRole=function(){
        $scope.RoleInfo=$scope.NowSelected;
        $scope.ButtonShow="Modify";
        $scope.ShowChangeRole=true;
        $scope.ShowRoleAssignmentModule=false;
        $scope.ShowUserAssignmentRole=false;
        $scope.RoleAssignmentModuleButton=false;
        $scope.UserAssignmentRoleButton=false;
        $scope.ShowNowSelected=false;
    };
    //提交添加角色
    $scope.AddRoleInfo=function(){
        $scope.RoleInfo.RoleParentID=$scope.NowSelected.RoleID;
        var postdata = angular.toJson( $scope.RoleInfo);
        $http.post(serverURL + ActionRouteURL, {
            action:"RoleAdd", baseinfo:$scope._id, AskString: postdata,remark : systemname
        }).success(function (data) {
                $scope.AlertDialog.AlertDialogMessage = data;
                $scope.ShowChangeRole=false;
                $scope.TreeDataInit();
                $scope.AlertDialog.AlertDialogOpen();
                $scope.AlertDialog.showButton = true;
            }).error(function(response) {
            });
    };

    //提交修改角色
    $scope.ModifyRoleInfo=function(){
//        $scope.RoleInfo.RoleParentID=$scope.RoleParentID;
        var postdata = angular.toJson( $scope.RoleInfo);
        $http.post(serverURL + ActionRouteURL, {
            action:"RoleUpdate", baseinfo:$scope._id, AskString: postdata,remark : systemname
        }).success(function (data) {
                $scope.AlertDialog.AlertDialogMessage = data;
                $scope.ShowChangeRole=false;
                $scope.TreeDataInit();
                $scope.AlertDialog.AlertDialogOpen();
                $scope.AlertDialog.showButton = true;
            }).error(function(response) {
            });
    };
    //删除角色
    $scope.DelRole=function(){
        $scope.ShowRoleAssignmentModule=false;
        $scope.ShowUserAssignmentRole=false;
        $scope.RoleInfo.RoleName=$scope.NowSelected.RoleName;
        $scope.RoleInfo.RoleID=$scope.NowSelected.RoleID;
        $scope.ConfirmDialog.ConfirmDialogMessage = "确定要删除"+$scope.RoleInfo.RoleName+"吗？";
        $scope.ConfirmDialog.ConfirmDialogOpen(function () {
            var postdata = angular.toJson( $scope.RoleInfo.RoleID);
            $http.post(serverURL + ActionRouteURL, {
                action:"RoleDelete", baseinfo:$scope._id, AskString: postdata,remark : systemname
            }).success(function (data) {
                    $scope.AlertDialog.AlertDialogMessage = data;
                    $scope.TreeDataInit();
                    $scope.AlertDialog.AlertDialogOpen();
                    $scope.AlertDialog.showButton = true;
                }).error(function(response) {
                });
        });

    };
    //显示角色分配模块
    $scope.RoleAssignmentModule=function(){
        $scope.GetNowModuleTree();
        $scope.RoleAssignmentModuleButton=true;
        $scope.UserAssignmentRoleButton=false;
        $scope.ShowChangeRole=false;
        $scope.ShowRoleAssignmentModule=true;
        $scope.ShowUserAssignmentRole=false;
        $scope.ShowNowSelected=false;
        $scope.ShowButtonGroup=false;
    };

    //提交角色分配模块
    $scope.SubmitRoleAssignmentModule=function(){
        var theSelectedModules = [];
        var getSelectedModules = function(theModules){
            if (!(theModules.children == null || theModules.children.length <1 || theModules.children == undefined)){
                angular.forEach(theModules.children,function(nextchild){
                    getSelectedModules(nextchild);
                })
            }
            else {
                if (theModules.hased){
                    theSelectedModules.push(theModules.attr._id.toString())
                }
            }
        }
        getSelectedModules($scope.ModuleTreeData[0]);
        var postdata={
            roleid:$scope.NowSelected.RoleID,
            roleModulelist: theSelectedModules
        };
        var AskString=angular.toJson(postdata);
        $http.post(serverURL + ActionRouteURL, {
            action:"RoleAssignModule", baseinfo:$scope._id, AskString: AskString,remark : systemname
        }).success(function (data) {
                $scope.AlertDialog.AlertDialogMessage = data;
                $scope.TreeDataInit();
                $scope.AlertDialog.AlertDialogOpen();
                $scope.AlertDialog.showButton = true;
            }).error(function(response) {
            });
    };
    //获取人员列表

    $scope.NowRoleUserInstance = null;
    $scope.NowSelected = {RoleID : ""};
    $scope.NowRoleUser_dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url:serverURL+ "\\ReturnSysAuth\\getPageUsersByRoleid",
            data:function (data) {
                data.baseinfo = $scope._id;
                data.AskString =  $scope.NowSelected.RoleID;
                data.remark = systemname;
            },
            type: 'POST'
        })
        .withDataProp('data')
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withBootstrap()
        .withOption('createdRow', function(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
            //$scope.$apply();
        })
        .withOption('preDrawCallback',function(oSettings) {
            if (oSettings.json != undefined && oSettings.json != null){
                $scope.NowRoleList = oSettings.json.data;
            }
        })
        .withOption('fnInitComplete',function(){
            DTInstances.getList().then(function(dtInstances) {
                //dtInstances.AssetsOutputTable.dataTable.fnFilterOnReturn();
                $scope.NowRoleUserInstance = dtInstances.RoleUserTable;
            });
        })
        .withPaginationType('full')
        .withDisplayLength(10)
        .withLanguage({
            //sUrl: 'http://cdn.datatables.net/plug-ins/380cb78f450/i18n/Chinese.json'
            sUrl: '/HouseWeb/JsonData/InputJSON/DTLanguage.json'
        });
    $scope.NowRoleUser_dtColumn = [
        DTColumnBuilder.newColumn('')
            .withTitle('').notSortable()
            .renderWith(function actionsHtml(data, type, full, meta) {
                return '<input type="checkbox" ng-model="NowRoleList['+ meta.row +'].iftherole">';
            }),
        DTColumnBuilder.newColumn('UserID').withOption('width','50px').withTitle('人员编号'),
        DTColumnBuilder.newColumn('UserName').withOption('width','50px').withTitle('姓名'),
        DTColumnBuilder.newColumn('depName').withOption('width','200px').withTitle('单位名称'),
        DTColumnBuilder.newColumn('')
            .withTitle('').notSortable()
            .renderWith(function actionsHtml(data, type, full, meta) {
                return '<span>{{NowRoleList['+ meta.row +'].iftherole ? "是":"否"}}</span>';
            })
    ];

//
//    $scope.NowRoleList_dtOptions = DTOptionsBuilder.newOptions()
//        .withBootstrap()
//        .withPaginationType('full_numbers')
//        .withDisplayLength(10)
//        .withLanguage({
//            //sUrl: 'http://cdn.datatables.net/plug-ins/380cb78f450/i18n/Chinese.json'
//            sUrl: '/HouseWeb/JsonData/InputJSON/DTLanguage.json'
//        });
//    $scope.NowRoleList_dtColumnDefs = [
//        DTColumnDefBuilder.newColumnDef(0).notSortable(),
//        DTColumnDefBuilder.newColumnDef(1),
//        DTColumnDefBuilder.newColumnDef(2),
//        DTColumnDefBuilder.newColumnDef(3),
//        DTColumnDefBuilder.newColumnDef(4),
//        DTColumnDefBuilder.newColumnDef(5).notSortable(),
//    ];

    //显示用户分配角色
    $scope.UserAssignmentRole=function(){
//        $http.post(serverURL + ActionRouteURL, {
//            action:"getUsersByRoleid", baseinfo:$scope._id, AskString:  $scope.NowSelected.RoleID
//        }).success(function (List) {
//                $scope.NowRoleList=List;
//            })
        $scope.RoleAssignmentModuleButton=false;
        $scope.UserAssignmentRoleButton=true;
        $scope.ShowChangeRole=false;
        $scope.ShowRoleAssignmentModule=false;
        $scope.ShowUserAssignmentRole=true;
        $scope.ShowNowSelected=false;
        $scope.ShowButtonGroup=false;
        $scope.NowRoleUserInstance.reloadData();
    };
    //提交用户分配角色
    $scope.SubmitUserAssignmentRole=function(){
        var theSelectedRole = [];
        angular.forEach($scope.NowRoleList,function(uinfo){
            theSelectedRole.push({UserID:uinfo.UserID,iftherole:uinfo.iftherole})
        })
        var postdata={
            RoleID:$scope.NowSelected.RoleID,
            UserRoleList: theSelectedRole
        };
        var AskString=angular.toJson(postdata);
        $http.post(serverURL + ActionRouteURL, {
            action:"RoleAssignUsersFull", baseinfo:$scope._id, AskString: AskString,remark : systemname
        }).success(function (data) {
                $scope.AlertDialog.AlertDialogMessage = data;
                //$scope.TreeDataInit();
                $scope.NowRoleUserInstance.reloadData();
                $scope.AlertDialog.AlertDialogOpen();
                $scope.AlertDialog.showButton = true;
            }).error(function(response) {
            });
    };

    //显示添加模块
    $scope.ShowAddModule=function(){
        $scope.ModuleInfo={};
        $scope.ModuleInfo.ModuleParentID=$scope.NowModuleInfo.ModuleID;
        $scope.ButtonShow="Add";
        $scope.ModuleFrom=true;
    };
    //显示修改模块
    $scope.ShowModifyModule=function(){
        $scope.ModuleInfo=$scope.NowModuleInfo;
        $scope.ButtonShow="Modify";
        $scope.ModuleFrom=true;
    };
    //提交添加模块
    $scope.SubmitAddModule=function(isValid){
        //if(isValid){
        var postdata = angular.toJson($scope.ModuleInfo);
        $http.post(serverURL + ActionRouteURL, {
            action:"ModuleAdd", baseinfo:$scope._id, AskString: postdata,remark : systemname
        }).success(function (data) {
                $scope.AlertDialog.AlertDialogMessage = data;
                $scope.TreeDataInit();
                $scope.AlertDialog.AlertDialogOpen();
                $scope.AlertDialog.showButton = true;
            }).error(function(response) {
            });
        //}
        //else{
        //    $scope.AlertDialog.AlertDialogMessage = "请完整填写模块信息！";
        //    $scope.AlertDialog.AlertDialogOpen();
        //    $scope.AlertDialog.showButton = true;
        //}

    };

    //提交修改模块
    $scope.SubmitModifyModule=function(){
        var postdata = angular.toJson($scope.ModuleInfo);
        $http.post(serverURL + ActionRouteURL, {
            action:"ModuleUpdate", baseinfo:$scope._id, AskString: postdata,remark : systemname
        }).success(function (data) {
                $scope.AlertDialog.AlertDialogMessage = data;
                $scope.TreeDataInit();
                $scope.AlertDialog.AlertDialogOpen();
                $scope.AlertDialog.showButton = true;
            }).error(function(response) {
            });
    };

    //删除模块
    $scope.DelModule=function(){
        $scope.ShowRoleAssignmentModule=false;
        $scope.ShowUserAssignmentRole=false;
        $scope.ModuleInfo=$scope.NowModuleInfo;
        $scope.ConfirmDialog.ConfirmDialogMessage = "确定要删除"+$scope.ModuleInfo.ModuleName+"吗？";
        $scope.ConfirmDialog.ConfirmDialogOpen(function () {
            var postdata = angular.toJson( $scope.ModuleInfo.ModuleID);
            $http.post(serverURL + ActionRouteURL, {
                action:"ModuleDelete", baseinfo:$scope._id, AskString: postdata,remark : systemname
            }).success(function (data) {
                    $scope.AlertDialog.AlertDialogMessage = data;
                    $scope.TreeDataInit();
                    $scope.ModuleFrom=false;
                    $scope.AlertDialog.AlertDialogOpen();
                    $scope.AlertDialog.showButton = true;
                }).error(function(response) {
                });
        });
    };

    //取消方法
    $scope.Cancel=function(){
        $scope.ModuleInfo={};
        $scope.RoleInfo={};
        $scope.ModuleFrom=false;
        $scope.ShowChangeRole=false;
    };
};
//基本信息(暂用)
var HouseManageController;
HouseManageController = function ($scope, $rootScope, $http, $q,$compile,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,localStorageService,$filter) {
    var self = this;
    var InitError = true;

    var ActionRouteURL = "\\ReturnHouse\\ActionRoute";

    $scope.GetRoomInfoList=[];
    $scope.RoomInfo={};
    $scope.dwInfo={};
    var GetDepartmentsURL = "\\ReturnSysAuth\\getDepartments";
    //显示初始化
    $scope.CollapseRoomList = false;
    $scope.CollapseAddRoom = true;
    $scope.NowDepartments = [];

    $scope.items = [
        {   housename: "普通办公室",
            fjbh:"10",
            lcbh:"3",
            ldbh:"15",
            plance: "东区校园",
            jzmj: 4700,
            fwxz:"办公用房",
            fjmj:18,
            hx:"一室一厅",
            fht:"images/fht.jpg",
            lct:"images/lct.jpg"
        }
    ];




    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withBootstrap()
        .withPaginationType('full_numbers')
        .withDisplayLength(10)
        .withLanguage({
            //sUrl: 'http://cdn.datatables.net/plug-ins/380cb78f450/i18n/Chinese.json'
            sUrl: '/HouseWeb/JsonData/InputJSON/DTLanguage.json'
        });
    $scope.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0).notSortable(),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2),
        DTColumnDefBuilder.newColumnDef(3),
        DTColumnDefBuilder.newColumnDef(4).notSortable()
    ];


    //文件上传窗口打开
    $scope.uploadpicture = function(){
        $scope.FileUploadDialog.fileAccept = "*";
        $scope.FileUploadDialog.baseinfo = $scope._id;
        if ($scope.RegInfo.FileID != undefined &&  $scope.RegInfo.FileID != ""){
            var getAchivementInfo = $http.get(serverURL +"\\ReturnAchievement\\GetAchieveInfo" + "?baseinfo="+$scope._id+"&AskString=" + $scope.RegInfo.FileID, { cache: false });
            $q.all([getAchivementInfo]).then(function (values) {
                if (values[0].data != "") {
                    $scope.FileUploadDialog.filebaseinfo = values[0].data;
                }
            }, function(response) {
                $rootScope.TheHttpResponse.status = response.status.toString();
            });
        }else{
            var askdata = {};
            askdata.AchieveType = "资产登记";
            askdata.AchieveComefrom = "提交登记";
            askdata.AchieveMainTitle = "资产图片" ;
            $scope.FileUploadDialog.filebaseinfo=askdata;
        }
        $scope.FileUploadDialog.init();
        $scope.FileUploadDialog.FileUploadModelOpen(function(){
            if ($scope.FileUploadDialog.filebaseinfo._id != undefined)
                $scope.RegInfo.FileID = $scope.FileUploadDialog.filebaseinfo._id.$oid;
        });
    }



    //显示添加房间
    $scope.ShowAddRoom=function(){
        $scope.CollapseRoomList = true;
        $scope.CollapseAddRoom = false;
        $scope.NowAction="add";
        $scope.RoomInfo={};
    };
    //显示修改
    $scope.ShowRoomModify=function(index){
        $scope.RoomInfo= $scope.items[index]
        $scope.CollapseRoomList = true;
        $scope.CollapseAddRoom = false;
        $scope.NowAction="modify";

    };

    //返回方法
    $scope.GoBack=function(){
        $scope.CollapseRoomList = false;
        $scope.CollapseAddRoom = true;
        $scope.GetRoomInfoListInstance.reloadData();  //数据重载
    };
    //添加$修改房间提交
    $scope.SubmitRoom=function(){
        if(  $scope.NowAction=="add"){
            $scope.RoomInfo.dwdm= $scope.dwInfo.depid;
            $scope.RoomInfo.dwmc= $scope.dwInfo.depname;
            var AskString=$scope.RoomInfo;
            var postdata = angular.toJson(AskString);
            $http.post(serverURL + ActionRouteURL, {
                action:"AddRoomInfo", baseinfo:$scope._id, AskString:postdata
            }).success(function (data) {
                    $scope.AlertDialog.AlertDialogMessage = data;
                    $scope.AlertDialog.AlertDialogOpen();
                    $scope.AlertDialog.showButton = true;
                    $scope.GoBack();
                }).error(function(data,state) {
                    $rootScope.TheHttpResponse.status = state.toString();
                });
        }
        else
        {
            $scope.RoomInfo.dwdm= $scope.dwInfo.depid;
            $scope.RoomInfo.dwmc= $scope.dwInfo.depname;
            var AskString=$scope.RoomInfo;
            var postdata = angular.toJson(AskString);
            $http.post(serverURL + ActionRouteURL, {
                action:"ModifyRoomInfo", baseinfo:$scope._id, AskString: postdata
            }).success(function (data) {
                    $scope.AlertDialog.AlertDialogMessage = data;
                    $scope.AlertDialog.AlertDialogOpen();
                    $scope.AlertDialog.showButton = true;
                    $scope.GoBack();
                }).error(function(data,state) {
                    $rootScope.TheHttpResponse.status = state.toString();
                });
        }

    };


    //删除
    $scope.DelRoom=function(id){
        $scope.ConfirmDialog.ConfirmDialogMessage = "确定要删除吗?";
        $scope.ConfirmDialog.ConfirmDialogOpen(function () {
            $http.post(serverURL + ActionRouteURL, {
                action:"DelRoomInfo", baseinfo:$scope._id, AskString:id
            }).success(function (data) {
                    $scope.AlertDialog.AlertDialogMessage = data;
                    $scope.AlertDialog.AlertDialogOpen();
                    $scope.AlertDialog.showButton = true;
                    $scope.GoBack();
                }).error(function(data,state) {
                    $rootScope.TheHttpResponse.status = state.toString();
                });
        });
    };
};