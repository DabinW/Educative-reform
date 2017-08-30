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
    //��ʼҳ��
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

    //��ʾ��ӽ�ɫ
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
    //��ʾ�޸Ľ�ɫ
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
    //�ύ��ӽ�ɫ
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

    //�ύ�޸Ľ�ɫ
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
    //ɾ����ɫ
    $scope.DelRole=function(){
        $scope.ShowRoleAssignmentModule=false;
        $scope.ShowUserAssignmentRole=false;
        $scope.RoleInfo.RoleName=$scope.NowSelected.RoleName;
        $scope.RoleInfo.RoleID=$scope.NowSelected.RoleID;
        $scope.ConfirmDialog.ConfirmDialogMessage = "ȷ��Ҫɾ��"+$scope.RoleInfo.RoleName+"��";
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
    //��ʾ��ɫ����ģ��
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

    //�ύ��ɫ����ģ��
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
    //��ȡ��Ա�б�

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
        DTColumnBuilder.newColumn('UserID').withOption('width','50px').withTitle('��Ա���'),
        DTColumnBuilder.newColumn('UserName').withOption('width','50px').withTitle('����'),
        DTColumnBuilder.newColumn('depName').withOption('width','200px').withTitle('��λ����'),
        DTColumnBuilder.newColumn('')
            .withTitle('').notSortable()
            .renderWith(function actionsHtml(data, type, full, meta) {
                return '<span>{{NowRoleList['+ meta.row +'].iftherole ? "��":"��"}}</span>';
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

    //��ʾ�û������ɫ
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
    //�ύ�û������ɫ
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

    //��ʾ���ģ��
    $scope.ShowAddModule=function(){
        $scope.ModuleInfo={};
        $scope.ModuleInfo.ModuleParentID=$scope.NowModuleInfo.ModuleID;
        $scope.ButtonShow="Add";
        $scope.ModuleFrom=true;
    };
    //��ʾ�޸�ģ��
    $scope.ShowModifyModule=function(){
        $scope.ModuleInfo=$scope.NowModuleInfo;
        $scope.ButtonShow="Modify";
        $scope.ModuleFrom=true;
    };
    //�ύ���ģ��
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
        //    $scope.AlertDialog.AlertDialogMessage = "��������дģ����Ϣ��";
        //    $scope.AlertDialog.AlertDialogOpen();
        //    $scope.AlertDialog.showButton = true;
        //}

    };

    //�ύ�޸�ģ��
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

    //ɾ��ģ��
    $scope.DelModule=function(){
        $scope.ShowRoleAssignmentModule=false;
        $scope.ShowUserAssignmentRole=false;
        $scope.ModuleInfo=$scope.NowModuleInfo;
        $scope.ConfirmDialog.ConfirmDialogMessage = "ȷ��Ҫɾ��"+$scope.ModuleInfo.ModuleName+"��";
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

    //ȡ������
    $scope.Cancel=function(){
        $scope.ModuleInfo={};
        $scope.RoleInfo={};
        $scope.ModuleFrom=false;
        $scope.ShowChangeRole=false;
    };
};
//������Ϣ(����)
var HouseManageController;
HouseManageController = function ($scope, $rootScope, $http, $q,$compile,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,localStorageService,$filter) {
    var self = this;
    var InitError = true;

    var ActionRouteURL = "\\ReturnHouse\\ActionRoute";

    $scope.GetRoomInfoList=[];
    $scope.RoomInfo={};
    $scope.dwInfo={};
    var GetDepartmentsURL = "\\ReturnSysAuth\\getDepartments";
    //��ʾ��ʼ��
    $scope.CollapseRoomList = false;
    $scope.CollapseAddRoom = true;
    $scope.NowDepartments = [];

    $scope.items = [
        {   housename: "��ͨ�칫��",
            fjbh:"10",
            lcbh:"3",
            ldbh:"15",
            plance: "����У԰",
            jzmj: 4700,
            fwxz:"�칫�÷�",
            fjmj:18,
            hx:"һ��һ��",
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


    //�ļ��ϴ����ڴ�
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
            askdata.AchieveType = "�ʲ��Ǽ�";
            askdata.AchieveComefrom = "�ύ�Ǽ�";
            askdata.AchieveMainTitle = "�ʲ�ͼƬ" ;
            $scope.FileUploadDialog.filebaseinfo=askdata;
        }
        $scope.FileUploadDialog.init();
        $scope.FileUploadDialog.FileUploadModelOpen(function(){
            if ($scope.FileUploadDialog.filebaseinfo._id != undefined)
                $scope.RegInfo.FileID = $scope.FileUploadDialog.filebaseinfo._id.$oid;
        });
    }



    //��ʾ��ӷ���
    $scope.ShowAddRoom=function(){
        $scope.CollapseRoomList = true;
        $scope.CollapseAddRoom = false;
        $scope.NowAction="add";
        $scope.RoomInfo={};
    };
    //��ʾ�޸�
    $scope.ShowRoomModify=function(index){
        $scope.RoomInfo= $scope.items[index]
        $scope.CollapseRoomList = true;
        $scope.CollapseAddRoom = false;
        $scope.NowAction="modify";

    };

    //���ط���
    $scope.GoBack=function(){
        $scope.CollapseRoomList = false;
        $scope.CollapseAddRoom = true;
        $scope.GetRoomInfoListInstance.reloadData();  //��������
    };
    //���$�޸ķ����ύ
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


    //ɾ��
    $scope.DelRoom=function(id){
        $scope.ConfirmDialog.ConfirmDialogMessage = "ȷ��Ҫɾ����?";
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