var systemname = "BigDataSystem";

var SysLogController = function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder){
    var self = this;
    var InitError = true;
    var loginhistory = localStorageService.get(systemname+'LoginInfo');
    $scope.authUserid=loginhistory["authUserid"];
    $scope._id=loginhistory["_id"];

    //资产系统日志--------

    $scope.SysLog_dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: serverURL +'/ReturnSysAuth/AjaxGetHistoryList?baseinfo='+$scope._id+"&remark="+systemname,
            type: 'POST'
        })
        .withDataProp('data')
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withOption('scrollX', '100%')
        .withOption('scrollY', '400')
        .withBootstrap()
        .withPaginationType('full_numbers')
        .withDisplayLength(10)
        .withLanguage({
            //sUrl: 'http://cdn.datatables.net/plug-ins/380cb78f450/i18n/Chinese.json'
            sUrl: '/BigDataMgt/JsonData/InputJSON/DTLanguage.json'
        });
    $scope.SysLog_dtColumns = [
        DTColumnBuilder.newColumn('aType').withOption('width', 70).withTitle('操作模块'),
        DTColumnBuilder.newColumn('aName').withOption('width', 70).withTitle('操作'),
        DTColumnBuilder.newColumn('logtime').withOption('width',150).withTitle('操作时间'),
        DTColumnBuilder.newColumn('uname').withOption('width', 70).withTitle('操作人'),
        DTColumnBuilder.newColumn('aResult').withOption('width', 200).withTitle('操作结果'),
        DTColumnBuilder.newColumn('aContent').withOption('width', 1000).withTitle('操作内容')
    ];


};
