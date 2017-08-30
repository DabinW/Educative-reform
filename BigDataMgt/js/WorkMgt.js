//var app = angular.module('AssertIndexApp')

var ActionRouteURL = "\\ReturnWork\\ActionRoute";
var WorkMgtController = function ($scope, $rootScope, $http, $q,$compile,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,localStorageService,$filter) {
    var self = this;
    var InitError = true;
    //�����ֵ�
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

    //��ȡ�򻯽�ɫ��&ģ���
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
        DTColumnBuilder.newColumn('wtype').withTitle('��������'),
        DTColumnBuilder.newColumn('wplanendtime').withTitle('������ʱ��'),
        DTColumnBuilder.newColumn('wrole').withTitle('������Ľ�ɫ'),
        DTColumnBuilder.newColumn('wHandleModule').withTitle('�������ģ��'),
        DTColumnBuilder.newColumn('wdescript').withTitle('��������'),
        DTColumnBuilder.newColumn(null)
            .withTitle('����').notSortable()
            .renderWith(function actionsHtml(data, type, full, meta) {
                var returnstr =
                    "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                    "<button class=\"btn btn-primary btn-xs\" ng-click=\"ShowWorkInfo(\'" + data._id.$oid + "\')\">�޸�</button>"+
                    "<button class=\"btn btn-danger btn-xs\" ng-click=\"DelWorkDic(\'" + data._id.$oid + "\')\">ɾ��</button>"+
                    "</div>";
                return returnstr;
            })
    ];
    //�ύ����
    $scope.SubmitWorkInfo=function(){
        var postdata = angular.toJson($scope.WorkInfo);
        $http.post(serverURL+"/ReturnWork/WorkDicSave", {
           baseinfo:$scope._id, AskString:postdata
        }).success(function (data) {
            $scope.GetAllWorkInstance.reloadData();  //��������
            $scope.AlertDialog.AlertDialogMessage = data;
            $scope.AlertDialog.AlertDialogOpen();
            $scope.AlertDialog.showButton = true;
            $scope.ShowWorkTable();
        });
    };
    //��ʾ�޸�
    $scope.ShowWorkInfo=function(id){
        $http.post(serverURL+"/ReturnWork/GetWorkDicInfo", {
           baseinfo:$scope._id, AskString:id
        }).success(function (data) {
            $scope.ShowAddWorkFrom();
            $scope.WorkInfo = data;
        });
    };
    //ɾ��
    $scope.DelWorkDic=function(id){
        $http.post(serverURL+"/ReturnWork/WorkDicDelete", {
             baseinfo:$scope._id, AskString:id
        }).success(function (data) {
            $scope.GetAllWorkInstance.reloadData();  //��������
            $scope.AlertDialog.AlertDialogMessage = data;
            $scope.AlertDialog.AlertDialogOpen();
            $scope.AlertDialog.showButton = true;
        });
    };

};
var MyWorkMgtController = function ($scope, $rootScope, $http, $q,$compile,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,localStorageService,$filter) {
    //�������
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


    //��ȡ�򻯽�ɫ��
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
        DTColumnBuilder.newColumn('wtype').withTitle('��������'),
        DTColumnBuilder.newColumn('wstarttime').withTitle('����ʼʱ��'),
        DTColumnBuilder.newColumn('wplanendtime').withTitle('����Ԥ�����ʱ��'),
        DTColumnBuilder.newColumn('wdescript').withTitle('��������'),
        DTColumnBuilder.newColumn(null)
            .withTitle('����').notSortable()
            .renderWith(function actionsHtml(data, type, full, meta) {
                var returnstr =
                    "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                    "<button class=\"btn btn-primary btn-xs\" ng-click=\"ShowMyWorkInfo(\'" + data._id.$oid + "\')\">��ϸ</button>"+
                    "</div>";
                return returnstr;
            })
    ];

    //�ύ����
    $scope.SubmitMyWorkInfo=function(){
        var postdata = angular.toJson($scope.MyWorkInfo);
        $http.post(serverURL+"/ReturnWork/WorkInfoSave", {
            baseinfo:$scope._id, AskString:postdata
        }).success(function (data) {
            $scope.GetAllMyWorkInstance.reloadData();  //��������
            $scope.AlertDialog.AlertDialogMessage = data;
            $scope.AlertDialog.AlertDialogOpen();
            $scope.AlertDialog.showButton = true;
            $scope.ShowMyWorkTable();
        });
    };
    //�������
    $scope.GoEndWork=function(){
        $scope.ConfirmDialog.ConfirmDialogMessage = "ȷ��Ҫ������������";
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
    //��ʾ������ϸ
    $scope.ShowMyWorkInfo=function(id){
        $http.post(serverURL+"/ReturnWork/GetWorkInfo", {
            baseinfo:$scope._id, AskString:id
        }).success(function (data) {
            $scope.MyWorkInfo=data;
            $scope.ShowMyWorkDetail();
        });
    };

    //����������Ϣ
    $scope.GetNowMyWorkInfo=function(){
        $http.post(serverURL+"/ReturnWork/GetWorkInfo", {
            baseinfo:$scope._id, AskString:$scope.MyWorkInfo._id.$oid
        }).success(function (data) {
            $scope.MyWorkInfo=data;
        });

    };

    //��ʾ�޸�
    $scope.ShowModify=function(){
        $scope.MyWorkFrom=true;
        $scope.AddWorkMatter=false;
    };

    $scope.WorkMatterInfo={};
    //��ʾ��������С��
    $scope.ShowWorkMatter=function(){
        $scope.WorkMatterInfo={};
        $scope.WorkMatterInfo.workid=$scope.MyWorkInfo._id.$oid;
        $scope.MyWorkFrom=false;
        $scope.AddWorkMatter=true;
        $scope.FileUploadDialog.filebaseinfo={};
    };
    //cancel����С��
    $scope.CancelWorkRemark=function(){
        $scope.AddWorkMatter=false;
    };

//�ļ��ϴ����ڴ�
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
            askdata.AchieveType = "�������";
            askdata.AchieveComefrom = "����С��";
            askdata.AchieveMainTitle = "����С���ļ�" ;
            $scope.FileUploadDialog.filebaseinfo=askdata;
        }
        $scope.FileUploadDialog.init();
        $scope.FileUploadDialog.FileUploadModelOpen(function(){
            if ($scope.FileUploadDialog.filebaseinfo._id != undefined)
                $scope.WorkMatterInfo.FileID = $scope.FileUploadDialog.filebaseinfo._id.$oid;
        });
    }

    //����С��
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
    //ɾ��С��
    $scope.DelRemark=function(id){
        $scope.ConfirmDialog.ConfirmDialogMessage = "ȷ��Ҫɾ����С����";
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

    //��ʾС���ļ�
    $scope.ShowFileList=function(id){
        $http.post(serverURL+"/ReturnAchievement/GetAchieveInfo", {
            baseinfo:$scope._id, AskString:id
        }).success(function (data) {
            $rootScope.RemarkFileList=data;
        });
    };

};
