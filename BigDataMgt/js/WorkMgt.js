//var app = angular.module('AssertIndexApp')

var ActionRouteURL = "\\ReturnWork\\ActionRoute";
var WorkMgtController = function ($scope, $rootScope, $http, $q,$compile,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,localStorageService,$filter) {
    var self = this;
    var InitError = true;
    //事务字典
    $scope.ShowWorkTable=function(){
        $scope.WorkTable=true;
        $scope.WorkFrom=false;
    };
    $scope.ShowWorkTable();

    $scope.ShowAddWorkFrom=function(){
        $scope.WorkInfo={};
        $scope.WorkTable=false;
        $scope.WorkFrom=true;
    };

    //获取简化角色表&模块表
    var GetSimpleRolesListURL = "\\ReturnSysAuth\\GetSimpleRolesList";
    var GetSimpleModuleListURL = "\\ReturnSysAuth\\GetSimpleModuleList";
    $scope.getInitInfo = function () {
        var GetSimpleRoles = $http.get(GetSimpleRolesListURL+'?baseinfo='+$scope._id, { cache: false });
        var GetSimpleModule = $http.get(GetSimpleModuleListURL+'?baseinfo='+$scope._id, { cache: false });
        $q.all([GetSimpleRoles, GetSimpleModule]).then(function (values) {
            $scope.GetSimpleRolesList = values[0].data;
            $scope.GetSimpleModuleList = values[1].data;
        }, function(response) {
            $rootScope.TheHttpResponse.status = response.status.toString();
        });
    };
    $scope.getInitInfo();

    $scope.TypeHeaderBlur = function(e,data){
        if (!data){
            e.target.value = "";
        }
        else if (data==""){
            e.target.value = "";
        }
    };
    $scope.getZCType = function(val) {
        return $http.post(serverURL +"/ReturnSysAuth/getUsersByKey", {
             baseinfo:"", AskString:val
        }).then(function(response){
            return response.data;
        });
    };

    $scope.GetAllWorkTable_dtOptions = DTOptionsBuilder.fromSource(serverURL+'/ReturnWork/GetAllWorkDic?baseinfo='+$scope._id)
        .withBootstrap()
        .withOption('createdRow', function(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        })
        .withOption('fnInitComplete',function(){
            DTInstances.getList().then(function(dtInstances) {
                dtInstances.GetAllWorkTable.dataTable.fnFilterOnReturn();
                $scope.GetAllWorkInstance = dtInstances.GetAllWorkTable;
            });
        })

        .withPaginationType('full_numbers')
        .withDisplayLength(10)
        .withLanguage({
            //sUrl: 'http://cdn.datatables.net/plug-ins/380cb78f450/i18n/Chinese.json'
            sUrl: '/BigDataMgt/JsonData/InputJSON/DTLanguage.json'
        });
    $scope.GetAllWorkTable_dtColumns = [
        DTColumnBuilder.newColumn('wtype').withTitle('事务类型'),
        DTColumnBuilder.newColumn('wplanendtime').withTitle('额定的完成时间'),
        DTColumnBuilder.newColumn('wrole').withTitle('事务处理的角色'),
        DTColumnBuilder.newColumn('wHandleModule').withTitle('事务处理的模块'),
        DTColumnBuilder.newColumn('wdescript').withTitle('事务描述'),
        DTColumnBuilder.newColumn(null)
            .withTitle('操作').notSortable()
            .renderWith(function actionsHtml(data, type, full, meta) {
                var returnstr =
                    "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                    "<button class=\"btn btn-primary btn-xs\" ng-click=\"ShowWorkInfo(\'" + data._id.$oid + "\')\">修改</button>"+
                    "<button class=\"btn btn-danger btn-xs\" ng-click=\"DelWorkDic(\'" + data._id.$oid + "\')\">删除</button>"+
                    "</div>";
                return returnstr;
            })
    ];
    //提交方法
    $scope.SubmitWorkInfo=function(){
        var postdata = angular.toJson($scope.WorkInfo);
        $http.post(serverURL+"/ReturnWork/WorkDicSave", {
           baseinfo:$scope._id, AskString:postdata
        }).success(function (data) {
            $scope.GetAllWorkInstance.reloadData();  //数据重载
            $scope.AlertDialog.AlertDialogMessage = data;
            $scope.AlertDialog.AlertDialogOpen();
            $scope.AlertDialog.showButton = true;
            $scope.ShowWorkTable();
        });
    };
    //显示修改
    $scope.ShowWorkInfo=function(id){
        $http.post(serverURL+"/ReturnWork/GetWorkDicInfo", {
           baseinfo:$scope._id, AskString:id
        }).success(function (data) {
            $scope.ShowAddWorkFrom();
            $scope.WorkInfo = data;
        });
    };
    //删除
    $scope.DelWorkDic=function(id){
        $http.post(serverURL+"/ReturnWork/WorkDicDelete", {
             baseinfo:$scope._id, AskString:id
        }).success(function (data) {
            $scope.GetAllWorkInstance.reloadData();  //数据重载
            $scope.AlertDialog.AlertDialogMessage = data;
            $scope.AlertDialog.AlertDialogOpen();
            $scope.AlertDialog.showButton = true;
        });
    };

};
var MyWorkMgtController = function ($scope, $rootScope, $http, $q,$compile,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,localStorageService,$filter) {
    //事务管理
    $scope.ShowMyWorkTable=function(){
        $scope.MyWorkTable=true;
        $scope.MyWorkFrom=false;
        $scope.MyWorkDetail=false;
    };
    $scope.ShowMyWorkTable();

    $scope.ShowAddMyWorkFrom=function(){
        $scope.MyWorkInfo={};
        $scope.MyWorkTable=false;
        $scope.MyWorkFrom=true;
    };
    $scope.ShowMyWorkDetail=function(){
        $scope.MyWorkDetail=true;
        $scope.MyWorkTable=false;
        $scope.MyWorkFrom=false;
    };


    //获取简化角色表
    var GetUsersListURL = "\\ReturnSysAuth\\getUsers";
    $scope.getInitInfo = function () {
        var GetUsersList = $http.get(serverURL +GetUsersListURL+'?baseinfo='+$scope._id, { cache: false });
        $q.all([GetUsersList]).then(function (values) {
            $scope.GetALLUsers = values[0].data;
        }, function(response) {
            $rootScope.TheHttpResponse.status = response.status.toString();
        });
    };
    $scope.getInitInfo();


    $scope.GetMyAllWorkTable_dtOptions = DTOptionsBuilder.fromSource(serverURL +'/ReturnWork/GetAllWorksByUserInfo?baseinfo='+$scope._id)
        .withBootstrap()
        .withOption('createdRow', function(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        })
        .withOption('fnInitComplete',function(){
            DTInstances.getList().then(function(dtInstances) {
                dtInstances.GetMyAllWorkTable.dataTable.fnFilterOnReturn();
                $scope.GetAllMyWorkInstance = dtInstances.GetMyAllWorkTable;
            });
        })

        .withPaginationType('full_numbers')
        .withDisplayLength(10)
        .withLanguage({
            //sUrl: 'http://cdn.datatables.net/plug-ins/380cb78f450/i18n/Chinese.json'
            sUrl: '/BigDataMgt/JsonData/InputJSON/DTLanguage.json'
        });
    $scope.GetMyAllWorkTable_dtColumns = [
        DTColumnBuilder.newColumn('wtype').withTitle('事务类型'),
        DTColumnBuilder.newColumn('wstarttime').withTitle('事务开始时间'),
        DTColumnBuilder.newColumn('wplanendtime').withTitle('事务预计完成时间'),
        DTColumnBuilder.newColumn('wdescript').withTitle('事务描述'),
        DTColumnBuilder.newColumn(null)
            .withTitle('操作').notSortable()
            .renderWith(function actionsHtml(data, type, full, meta) {
                var returnstr =
                    "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                    "<button class=\"btn btn-primary btn-xs\" ng-click=\"ShowMyWorkInfo(\'" + data._id.$oid + "\')\">详细</button>"+
                    "</div>";
                return returnstr;
            })
    ];

    //提交方法
    $scope.SubmitMyWorkInfo=function(){
        var postdata = angular.toJson($scope.MyWorkInfo);
        $http.post(serverURL+"/ReturnWork/WorkInfoSave", {
            baseinfo:$scope._id, AskString:postdata
        }).success(function (data) {
            $scope.GetAllMyWorkInstance.reloadData();  //数据重载
            $scope.AlertDialog.AlertDialogMessage = data;
            $scope.AlertDialog.AlertDialogOpen();
            $scope.AlertDialog.showButton = true;
            $scope.ShowMyWorkTable();
        });
    };
    //事务结束
    $scope.GoEndWork=function(){
        $scope.ConfirmDialog.ConfirmDialogMessage = "确定要结束该事务吗？";
        $scope.ConfirmDialog.ConfirmDialogOpen(function () {
            $http.post(serverURL+"/ReturnWork/WorkEnd", {
                baseinfo:$scope._id, AskString:$scope.MyWorkInfo._id.$oid
            }).success(function (data) {
                $scope.AlertDialog.AlertDialogMessage = data;
                $scope.AlertDialog.AlertDialogOpen();
                $scope.AlertDialog.showButton = true;
                $scope.ShowMyWorkTable();
            });
        });
    };
    //显示事务详细
    $scope.ShowMyWorkInfo=function(id){
        $http.post(serverURL+"/ReturnWork/GetWorkInfo", {
            baseinfo:$scope._id, AskString:id
        }).success(function (data) {
            $scope.MyWorkInfo=data;
            $scope.ShowMyWorkDetail();
        });
    };

    //更新事务信息
    $scope.GetNowMyWorkInfo=function(){
        $http.post(serverURL+"/ReturnWork/GetWorkInfo", {
            baseinfo:$scope._id, AskString:$scope.MyWorkInfo._id.$oid
        }).success(function (data) {
            $scope.MyWorkInfo=data;
        });

    };

    //显示修改
    $scope.ShowModify=function(){
        $scope.MyWorkFrom=true;
        $scope.AddWorkMatter=false;
    };

    $scope.WorkMatterInfo={};
    //显示更新事务小节
    $scope.ShowWorkMatter=function(){
        $scope.WorkMatterInfo={};
        $scope.WorkMatterInfo.workid=$scope.MyWorkInfo._id.$oid;
        $scope.MyWorkFrom=false;
        $scope.AddWorkMatter=true;
        $scope.FileUploadDialog.filebaseinfo={};
    };
    //cancel事务小节
    $scope.CancelWorkRemark=function(){
        $scope.AddWorkMatter=false;
    };

//文件上传窗口打开
    $scope.uploadpicture = function(){
        $scope.FileUploadDialog.fileAccept = "*";
        $scope.FileUploadDialog.baseinfo = $scope._id;
        if ($scope.WorkMatterInfo.FileID != undefined &&  $scope.WorkMatterInfo.FileID != ""){
            var getAchivementInfo = $http.get(serverURL +"\\ReturnAchievement\\GetAchieveInfo" + "?baseinfo="+$scope._id+"&AskString=" + $scope.WorkMatterInfo.FileID, { cache: false });
            $q.all([getAchivementInfo]).then(function (values) {
                if (values[0].data != "") {
                    $scope.FileUploadDialog.filebaseinfo = values[0].data;
                }
            }, function(response) {
                $rootScope.TheHttpResponse.status = response.status.toString();
            });
        }else{
            var askdata = {};
            askdata.AchieveType = "事务管理";
            askdata.AchieveComefrom = "事务小节";
            askdata.AchieveMainTitle = "事务小节文件" ;
            $scope.FileUploadDialog.filebaseinfo=askdata;
        }
        $scope.FileUploadDialog.init();
        $scope.FileUploadDialog.FileUploadModelOpen(function(){
            if ($scope.FileUploadDialog.filebaseinfo._id != undefined)
                $scope.WorkMatterInfo.FileID = $scope.FileUploadDialog.filebaseinfo._id.$oid;
        });
    }

    //保存小节
    $scope.SubmitWorkRemark=function(){
        var postdata=angular.toJson($scope.WorkMatterInfo);
        $http.post(serverURL+"/ReturnWork/WorkRemarkSave", {
            baseinfo:$scope._id, AskString:postdata
        }).success(function (data) {
            $scope.AlertDialog.AlertDialogMessage = data;
            $scope.AlertDialog.AlertDialogOpen();
            $scope.AlertDialog.showButton = true;
            $scope.AddWorkMatter=false;
            $scope.GetNowMyWorkInfo();
        });
    };
    //删除小节
    $scope.DelRemark=function(id){
        $scope.ConfirmDialog.ConfirmDialogMessage = "确定要删除该小节吗？";
        $scope.ConfirmDialog.ConfirmDialogOpen(function () {
            $http.post(serverURL+"/ReturnWork/WorkRemarkDelete", {
                baseinfo:$scope._id, AskString:id
            }).success(function (data) {
                $scope.AlertDialog.AlertDialogMessage = data;
                $scope.AlertDialog.AlertDialogOpen();
                $scope.AlertDialog.showButton = true;
                $scope.GetNowMyWorkInfo();
            });
        });

    };

    //显示小节文件
    $scope.ShowFileList=function(id){
        $http.post(serverURL+"/ReturnAchievement/GetAchieveInfo", {
            baseinfo:$scope._id, AskString:id
        }).success(function (data) {
            $rootScope.RemarkFileList=data;
        });
    };

};
