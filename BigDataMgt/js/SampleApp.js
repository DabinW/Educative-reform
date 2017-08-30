Date.prototype.Format = function (fmt) {//author:meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

var systemname = "BigDataSystem";

function resizeIframe(obj) {
    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
}

function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

function QueryString() {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], pair[1]];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(pair[1]);
        }
    }
    return query_string;
};

function setObjectPropsToValue(sourceObj, props, targetValue,ifrevesal) {
    for (var x in sourceObj) {
        if (typeof sourceObj[x] != "object") {
            var needchange = props.indexOf(x);
            if (needchange >= 0) {
                sourceObj[x] = targetValue;
            }
            else if (typeof targetValue == "boolean" && ifrevesal){
                sourceObj[x] = !targetValue;
            }
        }
        else {
            sourceObj[x] = setObjectPropsToValue(sourceObj[x], props, targetValue);
        }
    };
    return sourceObj;
}

function setObjectFieldToValue(sourceObj, keyname, keyvalue, props, targetValue) {

    if ((keyname in sourceObj) && (sourceObj[keyname] == keyvalue || sourceObj[keyname][0] == keyvalue)){
        for (var x in sourceObj) {
            if (x == props) {
                sourceObj[x] = targetValue;
            }
        };
        return sourceObj;
    }
    else if (typeof sourceObj == "object" || typeof sourceObj == "array"){
        for (var x in sourceObj) {
            if (typeof sourceObj[x] == "object") {
                var convertresult = setObjectFieldToValue(sourceObj[x], keyname, keyvalue, props, targetValue)
                if ( convertresult != null){
                    sourceObj[x] = convertresult;
                    return sourceObj;
                }
            }
        };
    }
    return null;
}

function getTabId(tabobj, key, val) {
    var objects = [];
    for (var i in tabobj) {
        if (!tabobj.hasOwnProperty(i)) continue;
        if (typeof tabobj[i] == 'object') {
            objects = objects.concat(getObjects(tabobj[i], key, val));
            if (objects.length > 0) return i;
        }
    }
    return -1;
}

var SampleApp = angular.module('SampleApp', ['LocalStorageModule'])
    .config(['$controllerProvider', function($controllerProvider) {
        $controllerProvider.allowGlobals();
    }]);

SampleApp.service('DataMgtService',['$http','$rootScope','localStorageService', function formService($http,$rootScope, localStorageService) {
    var loginhistory = localStorageService.get(systemname+'LoginInfo');
    var uid = "";
    var ActionUrl = "/ReturnData/";
    if (loginhistory != null) {
        uid = loginhistory["_id"];
    }
    return {
        commDataDetailGet: commDataDetailGet
    };
    function commDataDetailGet(datasetname,keyname,keyvalue) {
        var postdata = {datasetname:datasetname,keyname:keyname,keyvalue:keyvalue};
        return $http.post(ActionUrl+"commDataDetailGet", {
            baseinfo: uid, AskString: angular.toJson(postdata),remark:systemname
        }).then(function (resultData) {
                if (resultData.data.toString().indexOf("错误") >= 0 || resultData.data.toString().indexOf("error") >= 0) {
                    $rootScope.AlertDialog.AlertDialogMessage = resultData.data;
                    $rootScope.AlertDialog.showButton = true;
                    $rootScope.AlertDialog.AlertDialogOpen();
                }
                else{
                    return resultData.data;
                }
            });
    }
}]);

//内容明细控件
var PrintController =['$scope', '$http', '$q', 'localStorageService','DataMgtService',function ($scope, $http, $q, localStorageService,DataMgtService) {
    var urlParams = QueryString();
    var printname = urlParams.dataset;
    var keyvalue = angular.fromJson(decodeURI(urlParams.keyvalue));
    var vm = $scope;
    vm.printinfo = null;

    if (printname != undefined && printname != null && printname != ""){
        DataMgtService.commDataDetailGet("PrintPage","name",printname).then(function(result){
            if (result!=null){
                vm.printSet = result;
                vm.printUrl = vm.printSet.url;
                vm.datasource = vm.printSet.datasource;
                vm.keyfield = vm.printSet.keyfield;
                if (keyvalue != undefined && keyvalue != null && keyvalue != ""){
                    DataMgtService.commDataDetailGet(vm.datasource,vm.keyfield,keyvalue).then(function(result){
                        if (result!=null){
                            $scope.printinfo = result;
                        }
                    });
                }
            }
        });
    }
}];

var PagePlaintContentController = ['$scope', '$http', '$q', 'localStorageService','DataMgtService',function ($scope, $http, $q, localStorageService,DataMgtService) {

    var urlParams = QueryString();
    var vm = $scope;
    var loginhistory = localStorageService.get(systemname+'LoginInfo');
    var uid = "";
    vm.initerror = false;
    if (loginhistory != null) {
        uid = loginhistory["_id"];
    }
    var ActionUrl = "/ReturnAchievement/";
    vm.ctype = "【不确定类型页面无法编辑】";
    vm.errormsg = "";
    if (urlParams.ctype != undefined && urlParams.ctype != ""){
        if (urlParams.ctype == "html"){
            vm.ctype = "【HTML文件编辑】";
            $http.post(ActionUrl+"GetPlainFile", {
                baseinfo: uid, AskString: angular.toJson(urlParams),remark:systemname
            }).then(function (resultData) {
                    if (resultData.status != 200){
                        vm.initerror = true;
                        vm.errormsg = "获取页面内容失败，代码："+resultData.status;
                    } else {
                        if (resultData.data.indexOf("错误") == 0){
                            vm.initerror = true;
                            vm.errormsg = resultData.data;
                        }
                        else
                            vm.content = resultData.data;
                    }
            });
        }
        else if (urlParams.ctype == "ctrl"){
            vm.ctype = "【CTRL内容编辑】";
            $http.post(ActionUrl+"GetPlainFile", {
                baseinfo: uid, AskString: angular.toJson(urlParams),remark:systemname
            }).then(function (resultData) {
                    if (resultData.status != 200){
                        vm.initerror = true;
                        vm.errormsg = "获取页面内容失败，代码："+resultData.status;
                    } else {
                        if (resultData.data.indexOf("错误") == 0){
                            vm.initerror = true;
                            vm.errormsg = resultData.data;
                        }
                        else
                            vm.content = resultData.data;
                    }
                });
        }else{
            vm.initerror = true;
        }
    }else{
        vm.initerror = true;
    }


    vm.Save = function(){
        urlParams.content = vm.content;
        $http.post(ActionUrl+"WritePlainFile", {
            baseinfo: uid, AskString: angular.toJson(urlParams),remark:systemname
        }).then(function (resultData) {
                if (resultData.status != 200){
                    vm.errormsg = "写入内容请求失败，代码："+resultData.status;
                } else {
                    vm.errormsg =  resultData.data;
                }
         });
    }
}];