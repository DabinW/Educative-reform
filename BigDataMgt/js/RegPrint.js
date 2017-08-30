var RegPrintController = function ($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,$filter) {
    var self = this;
    var InitError = true;
    var loginhistory = localStorageService.get(systemname+'LoginInfo');
    $scope._id=loginhistory["_id"];
    var ActionRouteURL = "\\ReturnAssertInfo\\ActionRoute";


//初始化


    $scope.RegPrint_dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url:serverURL + '/ReturnAssertInfo/GetReviewedRegAssertsList?baseinfo='+$scope._id,
            type: 'POST'
        })
        .withDataProp('data')
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withBootstrap()
        .withOption('createdRow', function(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        })
        .withPaginationType('full_numbers')
        .withDisplayLength(10)
        .withLanguage({
            //sUrl: 'http://cdn.datatables.net/plug-ins/380cb78f450/i18n/Chinese.json'
            sUrl: '/BigDataMgt/JsonData/InputJSON/DTLanguage.json'
        });

    $scope.RegPrint_dtColumns = [
        DTColumnBuilder.newColumn('pcbhfw').withTitle('资产编号'),
        DTColumnBuilder.newColumn('zcmc').withTitle('资产名称'),
        DTColumnBuilder.newColumn('flh').withTitle('分类编号'),
        DTColumnBuilder.newColumn('lydw').withTitle('责任单位'),
        DTColumnBuilder.newColumn('lyr').withTitle('责任人'),
        DTColumnBuilder.newColumn('djrq').withTitle('登记日期'),
        DTColumnBuilder.newColumn(null)
            .withTitle('打印').notSortable()
            .renderWith(function actionsHtml(data, type, full, meta) {
                var returnstr = "<button class=\"btn btn-primary btn-xs\" ng-click=\"Print_Open(\'" + data._id + "\')\">入账打印</button>";
                return returnstr;
            })
    ];

    $scope.RegPrint_dtOptions_xs = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url:serverURL + '/ReturnAssertInfo/GetReviewedRegAssertsList?baseinfo='+$scope._id,
            type: 'POST'
        })
        .withDataProp('data')
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withBootstrap()
        .withDOM('it')
        .withScroller()
        .withOption('scrollY', 400)
        .withOption('createdRow', function(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        })
        .withPaginationType('full_numbers')
        .withDisplayLength(10)
        .withLanguage({
            //sUrl: 'http://cdn.datatables.net/plug-ins/380cb78f450/i18n/Chinese.json'
            sUrl: '/BigDataMgt/JsonData/InputJSON/DTLanguage.json'
        });

    $scope.RegPrint_dtColumns_xs = [
        DTColumnBuilder.newColumn(null)
            .withTitle('帐目信息').notSortable()
            .renderWith(function actionsHtml(data, type, full, meta) {
                var returnstr =
                    "<div class=\"InTableList\">"+
                        "<p>"+data.pcbhfw+"-" +data.zcmc+"-"  +data.xz+"</p>"+
                        "<p>"+data.flh+"-"  +data.lydw+"-"  +data.lyr+"</p>"+
                        "</div>" + "<button class=\"btn btn-primary btn-xs\" ng-click=\"Print_Open(\'" + data._id + "\')\">入账打印</button>";
                return returnstr;
            })
    ];
    $rootScope.NowPrintID={};
    //打印方法
    $scope.Print_Open = function(id) {
        $scope.NowPrintID=id;
        window.open("/AssertMgt/AssetsRegister_Print.html","_blank")
        localStorageService.set('NowPrintID',$scope.NowPrintID);
    };
};

var AssetsRegister_PrintController = function ($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,$filter) {
    var s="";
    var theDate=new Date();
    s += theDate.getFullYear()+"-";                         // 获取年份。
    s += (theDate.getMonth() + 1) + "-";            // 获取月份。
    s += theDate.getDate();                   // 获取日。
    $rootScope.myDate=s;

    var self = this;
    var InitError = true;
    var loginhistory = localStorageService.get(systemname+'LoginInfo');
    var NowPrintID = localStorageService.get('NowPrintID');
    $scope._id=loginhistory["_id"];

    //打印方法
    $scope.Print_GetList = function() {
        $http.post(serverURL +"/ReturnAssertInfo/GetRegAssertsDetailMore", {
            baseinfo:$scope._id, AskString:NowPrintID
        }).then(function(response){
                $scope.PrintInfo=response.data;
                localStorageService.remove('NowPrintID');
            });
    };
    $scope.Print_GetList();
};