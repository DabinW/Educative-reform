var LoginApp = angular.module('LoginApp', ['ui.bootstrap','ngSanitize', 'LocalStorageModule','datatables','ngResource'
    ,'matchMedia'])
.config(['$controllerProvider', function($controllerProvider) {
    $controllerProvider.allowGlobals();
}]);

var systemname = "BigDataSystem";
var serverURL = "";

var LoginCtrl = function ($scope, $http, $q, localStorageService,screenSize,$rootScope) {
    $scope.loginInfo = {
        "username": "",
        "password": "",
        "ifremenberme": true
    };

    $scope.errors = { loginerror: "" };
    $scope.loginerrorshow = false;

    $scope.loginhistory = {
        "loginid": "",
        "username": "",
        "logintime": ""
    };

    $scope.signInfo = {
        "orgname": "",
        "orgcode": "",
        "username": "",
        "idcard": "",
        "email": "",
        "mobile": "",
        "qq": "",
        "password": ""
    };
    $rootScope.desktop = screenSize.is('md, lg');
    $rootScope.mobile = screenSize.is('xs, sm');

    var loginurl = "\\ReturnSysAuth\\GetLoginInfo";
    var ifCrossAccess = false;

    $scope.FormKeyPress = function(event,formvalid){
        if (event.charCode == 13)
            $scope.login(formvalid);
    }

    $scope.login = function (isValid) {
        try {
            if (isValid) {
                $scope.errors.loginerror = "正在验证登录信息.....";
                $scope.loginerrorshow = true;
                if($rootScope.desktop)
                {
                    $scope.loginInfo.device="desktop";
                }
                else
                {
                    $scope.loginInfo.device="mobile";
                }
                var askstring = JSON.stringify($scope.loginInfo);
                var getLoginResult = $http.get(serverURL +loginurl + "?AskString=" + askstring+"&remark="+systemname, { cache: false });
                $q.all([getLoginResult]).then(function (values) {
                    if (ifCrossAccess) {
                        var xmldoc = $.parseXML(values[0].data);
                        var result = $.parseJSON(xmldoc.childNodes[0].textContent);
                 
                    }
                    else{
                        result = values[0].data;
                        
                    }
                    if (result.error != null && result.error != "") {
                        $scope.errors.loginerror = result.error;
                        $scope.loginerrorshow = true;
                        $scope.$apply();
                    }
                    else {
                        localStorageService.set(systemname+'LoginInfo', result.data);
                        window.location = "index.html";
                    }
                });
            }
        }
        catch (e) {
            $scope.errors.loginerror = result.error;
            $scope.loginerrorshow = true;
            $scope.$apply();
        }
    };

    var logininit = function () {
        try {
            var loginhistory = localStorageService.get(systemname+'LoginInfo');
            if (loginhistory != null) {
                $scope.errors.loginerror = "正在验证登录历史......";
                $scope.loginerrorshow = true;
                var getLoginResult = $http.get(serverURL +"\\ReturnSysAuth\\GetLoginStatusByID" + "?AskString=" + loginhistory["_id"]+"&remark="+systemname, { cache: false });
                $q.all([getLoginResult]).then(function (values) {
                    if (ifCrossAccess) {
                        var xmldoc = $.parseXML(values[0].data);
                        var result = $.parseJSON(xmldoc.childNodes[0].textContent);
                    }
                    else
                        result = values[0].data;
                    if (result.error == "") {
                        window.location = "index.html";
                    }
                    else {
                        $scope.errors.loginerror = result.error;
                        localStorageService.remove(systemname+'LoginInfo');
                    }
                });
            }
        }
        catch (e) {
            $scope.errors.loginerror = result.error;
            $scope.loginerrorshow = true;
            $scope.$apply();
        }
    };

    logininit();

    $scope.AlertDialog = {
        AlertDialogMessage: "",
        AlertDialogOpen: function () {
            var $modal = $('#AlertDialog');
            $modal.modal();
        }
    };
}

