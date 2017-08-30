var IndexCtrl = ['$compile','$scope', '$q', '$http', '$sce','$interval','localStorageService',
    'DTOptionsBuilder','DTColumnDefBuilder','$rootScope','screenSize',
    function ($compile,$scope, $q, $http, $sce, $interval, localStorageService, DTOptionsBuilder, DTColumnDefBuilder,$rootScope,screenSize) {
        $rootScope.mylogininfo = {myDate : ""};

        $rootScope.desktop = screenSize.is('md, lg');
        $rootScope.mobile = screenSize.is('xs, sm');
        $scope.count = 0;
        $scope.rtime = 16;
        $scope.x = 0;
        $scope.y = 0;


        $scope.tabs = [];
        $rootScope.disabled="disabled";
        $rootScope.TheHttpResponse = {"status" : ""};
        $rootScope.$watch('TheHttpResponse.status', function() {
            var resp = $rootScope.TheHttpResponse;
            switch (resp.status){
                case "810":
                    $scope.AlertDialog.AlertDialogMessage = "没有登录信息，请重新登录！";
                    $scope.AlertDialog.showButton = true;
                    $scope.AlertDialog.AlertDialogOpen();
                    break;
                case "812":
                    $scope.AlertDialog.AlertDialogMessage = "登录已超时，请重新登录！";
                    $scope.AlertDialog.showButton = true;
                    $scope.AlertDialog.AlertDialogOpen();
                    break;
                case "813":
                    $scope.AlertDialog.AlertDialogMessage = "对不起，您没有相关操作权限！";
                    $scope.AlertDialog.showButton = true;
                    $scope.AlertDialog.AlertDialogOpen();
                    break;
                case "":
                    break;
                default:
                    $scope.AlertDialog.AlertDialogMessage = "网络访问出错【"+resp.status+"】，请重试！";
                    $scope.AlertDialog.showButton = true;
                    $scope.AlertDialog.AlertDialogOpen();
                    break;
            }
            $rootScope.TheHttpResponse.status = "";
        });


        $scope.AlertDialog = {
            AlertDialogMessage: "",
            showButton:true,
            AlertDialogOpen: function () {
                document.getElementById('AlertDialogContent').innerHTML = $scope.AlertDialog.AlertDialogMessage;
                var $modal = $('#AlertDialog');
                $modal.modal();
            },
            AlertDialogRefresh: function () {
                document.getElementById('AlertDialogContent').innerHTML = $scope.AlertDialog.AlertDialogMessage;
            },
            ActionModelClose: function () {
                var $modal = $('#AlertDialog');
                $modal.modal('destroy');
            }
        };

        $scope.ConfirmDialog = {
            ConfirmDialogMessage: "",
            ConfirmDialogOpen: function (action) {
                document.getElementById('ConfirmDialogContent').innerHTML = $scope.ConfirmDialog.ConfirmDialogMessage;
                var $modal = $('#ConfirmDialog');
                $modal.modal();
                $('#ConfirmOK').one("click", action);
                $modal.on('hidden.bs.modal', function () {
                    $('#ConfirmOK').unbind("click");
                })
            }
        }

        $scope.FileUploadDialog = {
            files: [],
            filebaseinfo : {},
            fileAccept : "*",
            cfdddmAskString : "",
            baseinfo : "",
            responsedata : {},
            file_remove : function(file) {
                uiUploader.removeFile(file);
                var element = document.getElementById('uploadfilediv');
                element.innerHTML  = element.innerHTML;
            },
            file_Change : function(){
                var element = document.getElementById('uploadfile0');
                var files = element.files;
                uiUploader.addFiles(files);
                $scope.FileUploadDialog.files = uiUploader.getFiles();
                var NowType=[];
                var txt=["txt"];
                var jpg=["jpg","png","bmp","jepg","gif"];
                var xls=["csv","xls","xlsx","xlsm"];
                var doc=["doc","docx"];
                var ppt=["ppt","pptx"];
                var pdf=["pdf"];
                var zip=["zip","rar","7z","cab"];
                for(var i= 0;i<$scope.FileUploadDialog.files.length; i++){
                    var type = $scope.FileUploadDialog.files[i].name.substr($scope.FileUploadDialog.files[i].name.lastIndexOf('.') + 1).toLocaleLowerCase();
                    var NowTypeicon = "file-o";
                    if (txt.indexOf(type)>=0)
                        NowTypeicon = "file-text-o";
                    if (jpg.indexOf(type)>=0)
                        NowTypeicon = "file-image-o";
                    if (xls.indexOf(type)>=0)
                        NowTypeicon = "file-excel-o";
                    if (doc.indexOf(type)>=0)
                        NowTypeicon = "file-word-o";
                    if (ppt.indexOf(type)>=0)
                        NowTypeicon = "file-powerpoint-o";
                    if (pdf.indexOf(type)>=0)
                        NowTypeicon = "file-pdf-o";
                    if (zip.indexOf(type)>=0)
                        NowTypeicon = "file-zip-o";
                    $scope.FileUploadDialog.files[i].NowType = NowTypeicon;
                }
                $scope.$apply();
            },
            file_clean : function() {
                uiUploader.removeAll();
            },
            init : function(){
                this.file_clean();
                this.files = [];
                var element = document.getElementById('uploadfilediv');
                element.innerHTML  = element.innerHTML;
                var inputelement = document.getElementById('uploadfile0');
                //inputelement.accept = this.fileAccept;
            },
            file_delete : function(filename){
                var deleteinfo = {_id:$scope.FileUploadDialog.filebaseinfo._id,delfilename:filename};
                $http.post(serverURL +"\\ReturnAchievement\\ActionRoute",{
                    action:"DelAchieveFile",baseinfo: $scope._id, AskString: angular.toJson(deleteinfo)
                }).success(function (data) {
                        var result = data;
                    }).error(function(response) {
                        $rootScope.TheHttpResponse.status = response.status.toString();
                    });
            },
            file_upload : function() {
                uiUploader.startUpload({
                    url: '/ReturnAchievement/AchieveUpload',
                    concurrency: 2,
                    baseinfo : $scope.FileUploadDialog.baseinfo,
                    AskString : angular.toJson($scope.FileUploadDialog.filebaseinfo),
                    onProgress: function(file) {
                        $scope.$apply();
                    },
                    onCompleted: function(response) {
                        if (response.indexOf("错误") < 0){
                            $scope.FileUploadDialog.filebaseinfo = JSON.parse(response);
                        }
                        else {
                            $scope.FileUploadDialog.responsedata = response;
                        }
                        $scope.$apply();
                        uiUploader.removeAll();
                        $scope.FileUploadDialog.files = [];
                    }
                });
            },
            FileUploadModelOpen: function (action) {
                var $modal = $('#FileUploadModel');
                $modal.modal();
                var element = document.getElementById('uploadfile0');
                $('#FileUploadEnd').one("click", action);
                uiUploader.removeAll();
            }
        }


        $scope.ActionModel = {
            ActionModelTitle: "",
            ActionModelTemplateUrl: "",
            ActionModelOpen: function () {
                var $modal = $('#ActionModel');
                $modal.modal();
            },
            ActionModelClose: function () {
                this.ActionModelTemplateUrl = "";
                var $modal = $('#ActionModel');
                $modal.modal('destroy');
            }
        }

        $rootScope.AlertDialog = $scope.AlertDialog;
        $rootScope.ConfirmDialog = $scope.ConfirmDialog;
        $rootScope.ActionModel = $scope.ActionModel;

        $scope.userloginfo = {};
        $scope.userLoginID = "";

        $scope.userHomeUrl = "UserHome.html";
        $scope.testUrl = "Test.html";

        $scope.CommDataMgt = "DataSetMgt.html";
        $scope.PushtabInfo=function(i,scan){
            if(scan=="d")
            {
                switch (i)
                {
                    case 'zcdj':
                        tabinfo={
                            templateUrl: "AssetsTemplate/AssetsRegisterTemplate.html",
                            title: "资产账目登记",
                            type: "template"
                        };
                        $scope.OpenTabs(tabinfo);
                        break;
                    case 'grcx':
                        tabinfo={
                            templateUrl: "AssetsTemplate/AssetsOwnQueryTemplate.html",
                            title: "个人资产账目管理",
                            type: "template"
                        };
                        $scope.OpenTabs(tabinfo);
                        break;
                    case 'cgdj':
                        tabinfo={
                            templateUrl: "PurchaseAskReg.html",
                            title: "采购项目登记",
                            type: "template"
                        };
                        $scope.OpenTabs(tabinfo);
                        break;
                    case 'rzdy':
                        tabinfo={
                            templateUrl:"AssetsTemplate/RegPrintTemplate.html",
                            title: "资产入账打印",
                            type: "template"
                        };
                        $scope.OpenTabs(tabinfo);
                        break;
                    case 'swgl':
                        tabinfo={
                            templateUrl:"WorkMgt/MyWork.html",
                            title: "事务管理",
                            type: "template"
                        };
                        $scope.OpenTabs(tabinfo);
                        break;
                    case '未审核的资产登记':
                        tabinfo={
                            templateUrl: "AssetsTemplate/AssetsRegisterTemplate.html",
                            title: "资产账目登记",
                            type: "template"
                        };
                        $scope.OpenTabs(tabinfo);
                        break;
                    case '七日内已审核通过的资产登记':
                        tabinfo={
                            templateUrl:"AssetsTemplate/RegPrintTemplate.html",
                            title: "资产入账打印",
                            type: "template"
                        };
                        $scope.OpenTabs(tabinfo);
                        break;
                    case '所有责任资产':
                        tabinfo={
                            templateUrl:"AssetsTemplate/AssetsOwnQueryTemplate.html",
                            title: "个人资产账目管理",
                            type: "template"
                        };
                        $scope.OpenTabs(tabinfo);
                        break;
                    case '在用资产':
                        tabinfo={
                            templateUrl:"AssetsTemplate/AssetsOwnQueryTemplate.html",
                            title: "个人资产账目管理",
                            type: "template"
                        };
                        $scope.OpenTabs(tabinfo);
                        break;
                    case '待领用资产':
                        tabinfo={
                            templateUrl:"AssetsTemplate/AssetsOwnQueryTemplate.html",
                            title: "个人资产账目管理",
                            type: "template"
                        };
                        $scope.OpenTabs(tabinfo);
                        break;

                }
            }
            else{
                switch (i)
                {
                    case'home':
                        $scope.userHomeUrl = "UserHome.html";
                        break;
                    case 'zcdj':
                        $scope.userHomeUrl = "AssetsTemplate/AssetsRegisterTemplate.html";
                        break;
                    case 'grcx':
                        $scope.userHomeUrl = "AssetsTemplate/AssetsOwnQueryTemplate.html";
                        break;
                    case 'cgdj':
                        $scope.userHomeUrl = "PurchaseAskReg.html";
                        break;
                    case 'rzdy':
                        $scope.userHomeUrl = "AssetsTemplate/RegPrintTemplate.html";
                        break;
                    case 'swgl':
                        $scope.userHomeUrl = "WorkMgt/MyWork.html";
                        $scope.OpenTabs(tabinfo);
                        break;
                    case '未审核的资产登记':
                        $scope.userHomeUrl = "AssetsTemplate/AssetsRegisterTemplate.html";
                        break;
                    case '七日内已审核通过的资产登记':
                        $scope.userHomeUrl = "AssetsTemplate/RegPrintTemplate.html";
                        break;
                    case '所有责任资产':
                        $scope.userHomeUrl = "AssetsTemplate/AssetsOwnQueryTemplate.html";
                        break;
                    case '在用资产':
                        $scope.userHomeUrl = "AssetsTemplate/AssetsOwnQueryTemplate.html";
                        break;
                    case '待领用资产':
                        $scope.userHomeUrl = "AssetsTemplate/AssetsOwnQueryTemplate.html";
                        break;
                }
            }
        };

        $scope.OpenTabs = function (tabinfo) {
            var hasvalue = getObjects($scope.tabs, "title", tabinfo.title);
            if (hasvalue.length == 0) {
                $scope.tabs.push(tabinfo);
                $scope.tabs[$scope.tabs.length - 1].active = true;
            }
            else {
                var id = getTabId($scope.tabs, "title", tabinfo.title);
                if (id >= 0)
                    $scope.tabs[id].active = true;

            };
            $('.sidebar').toggleClass('reveal');
        }


        $scope.getIframeUrl = function (url) {
            var theurl = $sce.trustAsResourceUrl(url);
            return $sce.trustAsResourceUrl(url);
        }

        $scope.CloseTab = function (index) {
            $scope.tabs.splice(index, 1);
        }

        $scope.MyModules = [];

        var ifCrossAccess = false;
        $scope.InitUser = function () {
            $scope.AlertDialog.AlertDialogMessage = "初始化用户数据中，请等待......";
            $scope.AlertDialog.showButton = false;
            $scope.AlertDialog.AlertDialogOpen();
            try {
                var loginhistory = localStorageService.get(systemname+'LoginInfo');
                if (loginhistory != null) {
                    var getLoginResult = $http.get(serverURL +"\\ReturnSysAuth\\GetLoginStatusByID" + "?AskString=" + loginhistory["_id"]+"&remark="+systemname, { cache: false });
                    $q.all([getLoginResult]).then(function (values) {
                        var result;
                        if (ifCrossAccess) {
                            var xmldoc = $.parseXML(values[0].data);
                            result = $.parseJSON(xmldoc.childNodes[0].textContent);
                        }
                        else
                            result = values[0].data;
                        if (result.error != "") {
                            $scope.AlertDialog.AlertDialogMessage = result.error;
                            $scope.AlertDialog.showButton = true;
                            localStorageService.remove(systemname+'LoginInfo');
                            window.location = "login.html";
                        }
                        else {
                            $scope.MyModules = $.parseJSON(loginhistory["modules"]);
                            localStorageService.set(systemname+'LoginInfo', result.data);
                            $scope.userloginfo = $.parseJSON(result.data);
                            $scope.userLoginID = loginhistory["authUserid"];
                            $scope._id = loginhistory["_id"];
                        }
                        $scope.AlertDialog.ActionModelClose();
                    }, function(response) {
                        $rootScope.TheHttpResponse.status = response.status.toString();
                    });
                }
                else
                    window.location = "login.html";
            }
            catch (e) {
                $scope.AlertDialog.AlertDialogMessage = e.Message;
                $scope.AlertDialog.showButton = true;
                window.location = "login.html";
            }
        }

        $scope.navType = 'tabs';

        $scope.$on("ActionDone", function (event, data) {
            var name = event.name;
            $scope.$broadcast(data);
        })

        angular.element(document).ready(function () {
            $scope.InitUser();
        });



        var ActionRouteURL = "\\ReturnSysAuth\\ActionRoute";
        var loginhistory = localStorageService.get(systemname+'LoginInfo');
        $scope.authUserid=loginhistory["authUserid"];
        $scope._id=loginhistory["_id"];
        $scope.ipaddress=loginhistory["ipaddress"];
        $scope.loginTime=loginhistory["loginTime"];

        $scope.userinfo={
            qq:"",
            phone:"",
            email: "",
            mobile:"",
            userid:""

        };
        $rootScope.userinfo={
            qq:"",
            phone:"",
            email: "",
            mobile:"",
            userid:""

        };

//获取当前时间及自动登出
        $scope.GetNowTime=function(){
            var now = new Date();

            var year = now.getFullYear();       //年
            var month = now.getMonth() + 1;     //月
            var day = now.getDate();            //日

            var hh = now.getHours();            //时
            var mm = now.getMinutes();          //分
            var ss = now.getSeconds();           //秒

            var clock = year + "-";

            if(month < 10)
                clock += "0";

            clock += month + "-";

            if(day < 10)
                clock += "0";

            clock += day + " ";

            if(hh < 10)
                clock += "0";

            clock += hh + ":";
            if (mm < 10) clock += '0';
            clock += mm + ":";

            if (ss < 10) clock += '0';
            clock += ss;
            $rootScope.mylogininfo.myDate=clock;

        };
        setInterval(function(){
             $scope.count++;
            if ($scope.count == $scope.rtime*60) {
               window.location = "login.html";
            }
        }, 1000);


         document.onmousemove = function (event) {
            var x1 = event.clientX;
            var y1 = event.clientY;
            if ($scope.x != x1 || $scope.y != y1) {
                $scope.count = 0;
            }
            $scope.x = x1;
            $scope.y = y1;
        };

        //监听键盘
        document.onkeydown = function () {
            $scope.count = 0;
        };
//加载个人信息
        $scope.Edit_infoOpen = function(){
            $http.post(serverURL + ActionRouteURL, {
                action:"getUserInfo",baseinfo: $scope._id, AskString:$scope.authUserid
            }).success(function (data) {
                    $scologpe.userinfo=data;
                    $rootScope.userinfo.userid=$scope.userinfo.userid;
                    $rootScope.userinfo.qq=$scope.userinfo.qq;
                    $rootScope.userinfo.mobile=$scope.userinfo.mobile;
                    $rootScope.userinfo.phone=$scope.userinfo.phone;
                    $rootScope.userinfo.email=$scope.userinfo.email;
                    $scope.ActionModel.ActionModelTitle = "修改个人资料";
                    $scope.ActionModel.ActionModelTemplateUrl = "template/Edit_info_Template.html";
                    $scope.ActionModel.ActionModelOpen();
                }).error(function(response) {
                    $rootScope.TheHttpResponse.status = response.status.toString();
                });
        }

        $scope.AutoExitOpen = function(){
            $scope.ActionModel.ActionModelTitle = "自动登出提示";
            $scope.ActionModel.ActionModelTemplateUrl = "template/AutoExit.html";
            $scope.$apply();
            $scope.ActionModel.ActionModelOpen();
        }


//修改个人信息提交
        $scope.$on('Edit_info_OK', function (event, data) {
            $scope.NowUserinfo={};
            $scope.NowUserinfo.userid=$rootScope.userinfo.userid;
            $scope.NowUserinfo.qq=$scope.userinfo.qq;
            $scope.NowUserinfo.phone=$scope.userinfo.phone;
            $scope.NowUserinfo.mobile=$scope.userinfo.mobile;
            $scope.NowUserinfo.email=$scope.userinfo.email;
            var askstring =$scope.NowUserinfo;
            var postdata = JSON.stringify(askstring);
            $http.post(serverURL + ActionRouteURL, {
                action:"ModifyUserBaseInfo",baseinfo: $scope._id, AskString: postdata
            }).success(function (data) {
                    $scope.AlertDialog.AlertDialogMessage = data;
                    $scope.AlertDialog.AlertDialogOpen();
                    $scope.AlertDialog.showButton = true;
                }).error(function(response) {
                    $rootScope.TheHttpResponse.status = response.status.toString();
                });

        });

        //继续使用
        $scope.$on('Continue_ok', function (event, data) {
            $interval.cancel($scope.tinterval);
            $scope.InitUser();
            loginhistory = localStorageService.get(systemname+'LoginInfo');
            $scope.loginTime=loginhistory["loginTime"];
        });
        //直接退出
        $scope.$on('Exit_ok', function (event, data) {
            $interval.cancel($scope.tinterval);
            $scope.loginout();
        });
        //退出登录
        $scope.loginout=function(){
            var loginoutURL="\\ReturnSysAuth\\ActionRoute?url=loginout";
            var loginout = $http.get(serverURL +loginoutURL + "&AskString=" +$scope._id+"&remark="+systemname, { cache: false });
            $q.all([loginout]).then(function (values) {
                window.location = "login.html";
            },function(info){
                alert(info.data);
                window.location = "login.html"});
            localStorageService.remove(systemname+'LoginInfo');
        }


    }];

var AutoExitController = ['$scope','$rootScope','$interval', function ($scope, $rootScope,$interval){
    $scope.NowTime = 10;
    $scope.tinterval = $interval(function(){
        if ($scope.NowTime == 0) {
            $scope.Exit_ok();
        }
        $scope.NowTime= $scope.NowTime-1;
    }, 1000);

    $scope.Exit_ok = function(){
        $scope.$emit('ActionDone', "Exit_ok");

        $scope.ActionModel.ActionModelClose();
    }

    $scope.Continue_ok = function(){
        $scope.$emit('ActionDone', "Continue_ok");
        $interval.cancel($scope.tinterval);
        $scope.ActionModel.ActionModelClose();
    }

}];

var EditInfoController = ['$scope','$rootScope',function ($scope, $rootScope){
    $scope.Edit_info_OK = function(){
        $scope.$emit('ActionDone', "Edit_info_OK");
        $scope.ActionModel.ActionModelClose();
    }
}];
