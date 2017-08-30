var RegPrintController = function ($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,$filter) {
    var self = this;
    var InitError = true;
    var loginhistory = localStorageService.get(systemname+'LoginInfo');
    $scope._id=loginhistory["_id"];
    var ActionRouteURL = "\\ReturnAssertInfo\\ActionRoute";


//��ʼ��


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
        DTColumnBuilder.newColumn('pcbhfw').withTitle('�ʲ����'),
        DTColumnBuilder.newColumn('zcmc').withTitle('�ʲ�����'),
        DTColumnBuilder.newColumn('flh').withTitle('������'),
        DTColumnBuilder.newColumn('lydw').withTitle('���ε�λ'),
        DTColumnBuilder.newColumn('lyr').withTitle('������'),
        DTColumnBuilder.newColumn('djrq').withTitle('�Ǽ�����'),
        DTColumnBuilder.newColumn(null)
            .withTitle('��ӡ').notSortable()
            .renderWith(function actionsHtml(data, type, full, meta) {
                var returnstr = "<button class=\"btn btn-primary btn-xs\" ng-click=\"Print_Open(\'" + data._id + "\')\">���˴�ӡ</button>";
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
            .withTitle('��Ŀ��Ϣ').notSortable()
            .renderWith(function actionsHtml(data, type, full, meta) {
                var returnstr =
                    "<div class=\"InTableList\">"+
                        "<p>"+data.pcbhfw+"-" +data.zcmc+"-"  +data.xz+"</p>"+
                        "<p>"+data.flh+"-"  +data.lydw+"-"  +data.lyr+"</p>"+
                        "</div>" + "<button class=\"btn btn-primary btn-xs\" ng-click=\"Print_Open(\'" + data._id + "\')\">���˴�ӡ</button>";
                return returnstr;
            })
    ];
    $rootScope.NowPrintID={};
    //��ӡ����
    $scope.Print_Open = function(id) {
        $scope.NowPrintID=id;
        window.open("/AssertMgt/AssetsRegister_Print.html","_blank")
        localStorageService.set('NowPrintID',$scope.NowPrintID);
    };
};

var AssetsRegister_PrintController = function ($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,$filter) {
    var s="";
    var theDate=new Date();
    s += theDate.getFullYear()+"-";                         // ��ȡ��ݡ�
    s += (theDate.getMonth() + 1) + "-";            // ��ȡ�·ݡ�
    s += theDate.getDate();                   // ��ȡ�ա�
    $rootScope.myDate=s;

    var self = this;
    var InitError = true;
    var loginhistory = localStorageService.get(systemname+'LoginInfo');
    var NowPrintID = localStorageService.get('NowPrintID');
    $scope._id=loginhistory["_id"];

    //��ӡ����
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