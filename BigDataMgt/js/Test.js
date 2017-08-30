//var app = angular.module('AssertIndexApp')



var ActionRouteURL = "\\ReturnSysAuth\\ActionRoute";
var TestController;
TestController = function ($scope, $rootScope,$http, $q,localStorageService, DTOptionsBuilder, DTColumnDefBuilder) {

    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withBootstrap()
        .withPaginationType('full_numbers')
        .withDisplayLength(10)
        .withLanguage({
            //sUrl: 'http://cdn.datatables.net/plug-ins/380cb78f450/i18n/Chinese.json'
            sUrl: '/BigDataMgt/JsonData/InputJSON/DTLanguage.json'
        });
    $scope.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0).notSortable(),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2),
        DTColumnDefBuilder.newColumnDef(3),
        DTColumnDefBuilder.newColumnDef(4),
        DTColumnDefBuilder.newColumnDef(5),
        DTColumnDefBuilder.newColumnDef(6).notSortable()
    ];

//����ҳ����ݻ�ȡ
    self.GetTestList=function(){
        $http.post(serverURL + ActionRouteURL, {
            action:"GetAllInterFaceInfo",baseinfo: $scope._id, AskString:""
        }).success(function (data) {
            $scope.GetAllInterFaceInfo=data;
            }).error(function(response) {
                $rootScope.TheHttpResponse.status = response.status.toString();
            });
    };
    self.GetTestList();

    $rootScope.nowTest={
        action:"",
        AskString:"",
        error:"",
        remark:""
    }

//����޸Ĵ���
    $scope.TestModifyOpen=function(index){

        $scope.ActionModel.ActionModelTitle = "�޸�";
        $scope.ActionModel.ActionModelTemplateUrl = "template/TestModifyOpen.html";
        $scope.ActionModel.ActionModelOpen();
        $rootScope.nowTest.action=$scope.GetAllInterFaceInfo[index].action;
        $rootScope.nowTest.AskString=$scope.GetAllInterFaceInfo[index].AskString;
        $rootScope.nowTest.error=$scope.GetAllInterFaceInfo[index].error;
        $rootScope.nowTest.remark=$scope.GetAllInterFaceInfo[index].remark;
    };
//�ύ�޸�
    $scope.$on('TestModify_OK', function (event, data) {
        var AskString={
            action:"",
            AskString:"",
            error:"",
            remark:""
        }
        AskString.action = $rootScope.nowTest.action;
        AskString.AskString = $rootScope.nowTest.AskString;
        AskString.error=  $rootScope.nowTest.error;
        AskString.remark = $rootScope.nowTest.remark;
        var postdata = JSON.stringify(AskString);
        $http.post(serverURL + ActionRouteURL, {
            action:"GetInterFaceInfo",baseinfo: $scope._id, AskString: postdata,error:" 500 (Internal Server Error)"
        }).success(function (data) {
            }).error(function(response) {
                $rootScope.TheHttpResponse.status = response.status.toString();
            });
    });


}

var TestModifyController;
TestModifyController = function  ($scope, $rootScope){
    $scope.TestModify_OK = function(){
        $scope.$emit('ActionDone', "TestModify_OK");
        $scope.ActionModel.ActionModelClose();
    }
}
