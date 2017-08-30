var indexapp = angular.module('AssertIndexApp')
indexapp.directive('ckEditor', [function () {
    return {
        require: '?ngModel',
        restrict: 'C',
        link: function (scope, elm, attr, model) {
            var isReady = false;
            var data = [];
            var ck = CKEDITOR.replace(elm[0], {
                filebrowserBrowseUrl: '/Filemanager/index.html',
                toolbar: [{ name: 'document', items: ['Source', 'Preview', 'Maximize'] }, // Defines toolbar group with name (used to create voice label) and items in 3 subgroups.
		                  ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'], 		// Defines toolbar group without name.
		                  {name: 'basicstyles', items: ['Bold', 'Italic', 'RemoveFormat'] },
                          { name: 'links', items: ['Link', 'Unlink', 'Anchor','Image', 'Table', 'HorizontalRule'] },                         
                          { name: 'styles', items: ['Format', 'FontSize'] },
                          { name: 'colors', items: ['TextColor'] }]
            });

            function setData() {
                if (!data.length) {
                    return;
                }

                var d = data.splice(0, 1);
                ck.setData(d[0] || '<span></span>', function () {
                    setData();
                    isReady = true;
                });
            }

            ck.on('instanceReady', function (e) {
                if (model) {
                    setData();
                }
            });

            elm.bind('$destroy', function () {
                ck.destroy(false);
            });

            if (model) {
                ck.on('change', function () {
                    scope.$apply(function () {
                        var data = ck.getData();
                        if (data == '<span></span>') {
                            data = null;
                        }
                        model.$setViewValue(data);
                    });
                });

                model.$render = function (value) {
                    if (model.$viewValue === undefined) {
                        model.$setViewValue(null);
                        model.$viewValue = null;
                    }

                    data.push(model.$viewValue);

                    if (isReady) {
                        isReady = false;
                        setData();
                    }
                };
            }

        }
    };
} ]); ;



function ContentMgtController($scope,$rootScope,$http,$q,localStorageService, DTOptionsBuilder, DTColumnDefBuilder) {
    var loginhistory = localStorageService.get(systemname+'LoginInfo');
    $scope._id=loginhistory["_id"];
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
        DTColumnDefBuilder.newColumnDef(4).notSortable()
    ];

    var self = this;
    var InitError = true;
    var getContentListURL = "\\ReturnContent\\GetContentList";
    var getContentDetailURL = "\\ReturnContent\\GetContentDetail";
    var postNewContentDetailURL = "\\ReturnContent\\AddNewContent";
    var postModifyContentDetailURL = "\\ReturnContent\\ModifyContent";
    var postDelContentDetailURL = "\\ReturnContent\\DelContent";
    var ContentTagsDictionarysUrl = "\\ReturnContent\\GetContentTagsDic";

	
    $scope.PersonInfo = {};
    $scope.ContentList = [];
    $scope.ContentInfo = {
        "OldTitle":"",
        "Title":"",
        "tContent":"",
        "Creator":"",
        "CreateTime":"",
        "Keywords":"",
        "outerLink":"",
        "sourceFrom":"",
        "readNum":"",
        "status":"",
        "validTime":"",
        "summary":""
    };
    $scope.ContentTags = [];
    $scope.SelectContentTags = {};

    $scope.ContentTagsChange = function(){
        if ($scope.SelectContentTags!=null){
            $scope.ContentInfo.Keywords = $scope.SelectContentTags.value;
        }
    }

    $scope.isCollapseDetail = true;
    $scope.isCollapseList = false;
    $scope.keywords = "";
    $scope.nowstart = 0;

    self.getInitInfo = function () {
        var getContentList = $http.get(serverURL +getContentListURL + "?keywords="+$scope.keywords+"&start=" + $scope.nowstart + "&num=0", { cache: false });
        var getContentTags = $http.get(serverURL +ContentTagsDictionarysUrl, { cache: false })
        $q.all([getContentList,getContentTags]).then(function (values) {
            $scope.ContentList = values[0].data;
            $scope.ContentTags = values[1].data;
        }, function(response) {
            $rootScope.TheHttpResponse.status = response.status.toString();
        });
    };

    self.getInitInfo();

    $scope.nowContentTitle = "";

    $scope.ContentInfoAdd = function(){
        $scope.ContentInfo = {
            "id":"",
            "title":"",
            "t_content":"",
            "creator":"",
            "createtime":"",
            "tags":"",
            "sorlink":"",
            "validdate" : "",
            "stick":0,
            "hotspot":false,
            "priority":0
        };
        $scope.isCollapseList = true;
        $scope.isCollapseDetail = false;
    }

    $scope.ContentInfoModify = function (contentid) {
        var getContentDetailURL = "\\ReturnContent\\GetContentDetail";
        var askstring = { "data": contentid };
        var postdata = JSON.stringify(askstring);
        var getContentDetail = $http.post(serverURL +getContentDetailURL+'?baseinfo='+$scope._id + "?AskString=" + postdata, { cache: false });
        $q.all([getContentDetail]).then(function (values) {
            $scope.ContentInfo = values[0].data;
            $scope.isCollapseList = true;
            $scope.isCollapseDetail = false;
        }, function(response) {
            $rootScope.TheHttpResponse.status = response.status.toString();
        });
    }

    $scope.DelContentInfo = function(id) {
        var askstring = { "uid": $scope.userLoginID, "data": id };
        var postdata = JSON.stringify(askstring);
        $scope.ConfirmDialog.ConfirmDialogMessage = "ɾ�����ݽ��޷��ָ�����ȷ��Ҫɾ��ǰ������?";
        $scope.ConfirmDialog.ConfirmDialogOpen(function(){
            var postdata = JSON.stringify(askstring);
            var getDelContentDetail = $http.post(serverURL +postDelContentDetailURL+'?baseinfo='+$scope._id+ "?AskString=" + postdata, { cache: false });
            $q.all([getDelContentDetail]).then(function (values) {
                var result = values[0].data;
                $scope.AlertDialog.AlertDialogMessage = result;
                $scope.AlertDialog.showButton = true;
                $scope.AlertDialog.AlertDialogOpen();
                self.getInitInfo();
                $scope.$apply();
            }, function(response) {
                $rootScope.TheHttpResponse.status = response.status.toString();
            });
        });
    }

    $scope.ContentInfoModifySubmit = function(isValid) {
        if (isValid){
            var askstring = { "uid": $scope.userLoginID, "data": $scope.ContentInfo };
            var postdata = JSON.stringify(askstring);
            if ($scope.ContentInfo.id != "")
                $http.post(serverURL +postModifyContentDetailURL, {
                                baseinfo: $scope._id,AskString: postdata
                }).success(function(data){
                    var result = data.data;
                    $scope.AlertDialog.AlertDialogMessage = data;
                    $scope.AlertDialog.AlertDialogOpen();
                    $scope.AlertDialog.showButton = true;
                    $scope.$apply();
                }).error(function(response) {
                        $rootScope.TheHttpResponse.status = response.status.toString();
                });
            else
                $http.post(serverURL +postNewContentDetailURL, {
                    baseinfo: $scope._id, AskString: postdata
                }).success(function (data) {
                    var result = data.data;
                    $scope.AlertDialog.AlertDialogMessage = data;
                    $scope.AlertDialog.showButton = true;
                    $scope.AlertDialog.AlertDialogOpen();
                    $scope.$apply();
                }).error(function(response) {
                        $rootScope.TheHttpResponse.status = response.status.toString();
                });
        }
    };

    $scope.ContentInfoModifyCancel = function () {
        $scope.ConfirmDialog.ConfirmDialogMessage = "���������б?��ǰ�༭���ݽ����豣�棬��ȷ��Ҫ������?";
        $scope.ConfirmDialog.ConfirmDialogOpen(function () {
            $scope.ContentInfo = {
                "id": "",
                "OldTitle": "",
                "Title": "",
                "tContent": "",
                "Creator": "",
                "CreateTime": "",
                "Keywords": "",
                "outerLink": "",
                "sourceFrom": "",
                "readNum": "",
                "status": "",
                "validTime": ""
            };
            self.getInitInfo();
            $scope.isCollapseList = false;
            $scope.isCollapseDetail = true;
            $scope.$apply();
        });
    }
};

var NewsCenterController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService){

        var myDate = new Date();
        myDate.toLocaleString( );        //��ȡ������ʱ��
        var time = new Date().Format("yyyy-MM-dd hh:mm:ss");

        var loginhistory = localStorageService.get(systemname+'LoginInfo');

        $scope.NewsCenter_dtColumns= null;
        $scope.NewsCenter_dtOptions= null;
        $rootScope.NewsCenter_dtInstance = null;
        $rootScope.NewsCenter_data = null;
        //var search = [];
        //search.push({field:"ItemType",keywords:"������ʩ����",condition:"="});

        tableService.initSimpleDTColumn("NewsCenter",0).then(function(result){
            $scope.NewsCenter_dtColumns = result;
            $scope.NewsCenter_dtColumns.push(DTColumnBuilder.newColumn(null)
                .withTitle('����').notSortable()
                .renderWith(function actionsHtml(data, type, full, meta) {
                    var returnstr =
                        "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                        "<button class=\"btn btn-error btn-xs\" ng-click=\"cloneNewsCenter(\'" + meta.row + "\')\">����</button>"+
                        "<button class=\"btn btn-success btn-xs\" ng-click=\"NewsCenterModify(\'" + meta.row + "\')\">�޸�</button>"+
                        "<button class=\"btn btn-danger btn-xs\" ng-click=\"NewsCenterDelete(\'" + meta.row + "\')\">ɾ��</button>"
                    "</div>";
                    return returnstr;
                }));
            var getNewsCenterOption = {"datasetname":"NewsCenter","search":""};
            $scope.NewsCenter_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                data.baseinfo = $scope._id;
                data.AskString = angular.toJson(getNewsCenterOption)
            },"NewsCentertable","NewsCenter_dtInstance","NewsCenter_data")
                .withOption('createdRow', function(row, data, dataIndex) {
                    $compile(angular.element(row).contents())($scope);
                });
        });
        $scope.NewsCenterInfoSchema = {};
        $scope.NewsCenterInfoEditForm = [];
        $scope.NewsCenterInfoModel = {};
        formService.formFieldOptions("NewsCenter").then(function(result){
            $scope.NewsCenterInfoSchema = result;
            $scope.NewsCenterInfoEditForm = [
                {"type": "section","htmlClass": "row",
                    "items": [
                        {"type": "select","htmlClass": "col-xs-4","key": "tags",titleMap: [
                            { value: "�����ƶ�", name: "�����ƶ�" },
                            { value: "������̬", name: "������̬" },
                            { value: "�б깫��", name: "�б깫��" },
                            { value: "�б깫��", name: "�б깫��" },
                            { value: "���߷���", name: "���߷���" },
                            { value: "��������", name: "��������" }
                        ]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["title"]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["summary"]},
                        {"type": "section","htmlClass": "col-xs-12","items": [{key:"t_content",config:"richEditor",height:"300"}]}
                    ]
                },
                {type: "actions",
                    items: [
                        { type: 'button', style: 'btn-success', title: '����',onClick:"saveNewsCenter()"},
                        { type: 'button', style: 'btn-info', title: 'ȡ��', onClick:"NewsCenterGoback()" }
                    ]
                    ,condition: "NowNewsCenterAdd == false"
                },
                {type: "actions",
                    items: [
                        { type: 'button', style: 'btn-success', title: '���',onClick:"insertNewsCenter()"},
                        { type: 'button', style: 'btn-info', title: 'ȡ��', onClick:"NewsCenterGoback()" }
                    ]
                    ,condition: "NowNewsCenterAdd == true"
                }
            ];
        });


        $scope.pageshow = {NewsCentermgt:true,mainbutton:true,mbutton:{addbutton:true,patchdelbutton:true},NewsCenteredit:false,NewsCentertable:true,
            columnsmgt:false,columnsmainbutton:false,columnedit:false,columnTable:false};
        $scope.NewsCenterAdd = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["NewsCentermgt","NewsCenteredit"],true,true);
            $scope.NowNewsCenterAdd = true;
            $scope.NewsCenterInfoModel = {};
        }
        $scope.NewsCenterModify = function(index){
            $scope.NewsCenterKeyValue =  $rootScope.NewsCenter_data[index]["_id"];
            DataMgtService.commDataDetailGet("NewsCenter","_id",$scope.NewsCenterKeyValue).then(function(result){
                if (result!=null){
                    $scope.NewsCenterInfoModel = result;
                    $scope.pageshow = setObjectPropsToValue($scope.pageshow,["NewsCentermgt","NewsCenteredit"],true,true);
                    $scope.NowNewsCenterAdd = false;
                }
            });
        }
        var reloadNewsCenterTable = function(){
            $rootScope.NewsCenter_dtInstance.reloadData();
            $scope.NewsCenterGoback();
        }
        $scope.saveNewsCenter = function(){
            DataMgtService.commDataUpdate("NewsCenter",$scope.NewsCenterInfoModel,null,"_id",$scope.NewsCenterKeyValue).then(function(result){
                result ? reloadNewsCenterTable() : null;
            });
        }
        $scope.cloneNewsCenter = function(index){
            var clonedata = $rootScope.NewsCenter_data[index];
            DataMgtService.commDataClone("NewsCenter","_id",clonedata["_id"]).then(function(result){
                result ? reloadNewsCenterTable() : null;
            });
        }
        $scope.insertNewsCenter = function(){
            $scope.NewsCenterInfoModel.UploadTime=myDate;
            $scope.NewsCenterInfoModel.UserID=loginhistory.authUserid;
            $scope.NewsCenterInfoModel.UserName=loginhistory.username;
            DataMgtService.commDataInsert("NewsCenter",$scope.NewsCenterInfoModel).then(function(result){
                result ? reloadNewsCenterTable() : null;
            });
        }
        $scope.NewsCenterDelete = function(index){
            var deldata = $rootScope.NewsCenter_data[index];
            DataMgtService.commDataDelete("NewsCenter","_id",deldata["_id"]).then(function(result){
                result ? reloadNewsCenterTable() : null;
            });
        }
        $scope.NewsCenterGoback = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["NewsCentermgt","mainbutton","addbutton","NewsCentertable"],true,true);
        }

    }];