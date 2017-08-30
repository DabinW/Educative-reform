﻿var SmsController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService){

        $scope.SmsList_dtColumns= null;
        $scope.SmsList_dtOptions= null;
        tableService.initSimpleDTColumn("SmsInfo",0).then(function(result){
            $scope.SmsList_dtColumns = result;
            $scope.SmsList_dtOptions = tableService.initSimpleTableOptions("ftip","/DataImport/GetCommonDataList?AskString=SmsInfo&remark="+systemname);
        });
        $scope.smsinfoschema = {};
        $scope.smseditform = [];
        $scope.smsinfomodel = {};
        formService.formFieldOptions("SmsInfo").then(function(result){
            $scope.smsinfoschema = result;
            $scope.smseditform = [
                "*",
                {
                    type: "submit",

                    title: "保存"
                }
            ];
        });
        $scope.pageshow = {mainbutton:true,mbutton:{addbutton:true,patchdelbutton:true},smsedit:false,smstable:true};
        $scope.SmsAdd = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["smsedit"],true,true);
        };
        $scope.goback = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["smsedit"],false,true);
        }
    }];

var DatasetMgtController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService){
        //数据集管理
        $scope.Dataset_dtColumns= null;
        $scope.Dataset_dtOptions= null;
        $rootScope.Dataset_dtInstance = null;
        $rootScope.Dataset_data = null;
        $scope.ImportDataSetName = "DataSets";
        $scope.ImportDataSetColumnName = "DataSetsColumns";
        tableService.initSimpleDTColumn("DataSets",0).then(function(result){
            $scope.DatasetInfoList_dtColumns = result;
            $scope.DatasetInfoList_dtColumns.push(DTColumnBuilder.newColumn(null)
                .withTitle('操作').notSortable()
                .renderWith(function actionsHtml(data, type, full, meta) {
                    var returnstr =
                        "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                            "<button class=\"btn btn-error btn-xs\" ng-click=\"cloneDataset(\'" + meta.row + "\')\">复制</button>"+
                            "<button class=\"btn btn-warning btn-xs\" ng-click=\"intoDatasetColumnsMgt(\'" + meta.row + "\')\">列管理</button>"+
                            "<button class=\"btn btn-success btn-xs\" ng-click=\"DatasetModify(\'" + meta.row + "\')\">修改</button>"+
                            "<button class=\"btn btn-danger btn-xs\" ng-click=\"DatasetDelete(\'" + meta.row + "\')\">删除</button>"
                    "</div>";
                    return returnstr;
                }));
            var getDatasetOption = {"datasetname":"DataSets","search":null};
            $scope.DatasetInfoList_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                data.baseinfo = $scope._id;
                data.AskString = angular.toJson(getDatasetOption);
                data.remark = systemname;
            },"DatasetInfoListTable","Dataset_dtInstance","Dataset_data")
                .withOption('createdRow', function(row, data, dataIndex) {
                    $compile(angular.element(row).contents())($scope);
                });
        });
        $scope.DatasetInfoSchema = {};
        $scope.DatasetInfoEditForm = [];
        $scope.DatasetInfoModel = {};
        formService.formFieldOptions("DataSets").then(function(result){
            $scope.DatasetInfoSchema = result;
            $scope.DatasetInfoEditForm = [
                {"type": "section","htmlClass": "row",
                    "items": [
                        {"type": "section","htmlClass": "col-xs-6","items": ["TableDBName"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["TableCHName"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["TargetDatabase"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["TargetCollection"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["ConDetecteField"]}
                    ]
                },
                {
                    "type": "help",
                    "helpvalue": "<div class=\"alert alert-info\">以下定义，是属于上层数据集内数组字段的定义，可以不填写！</div>"
                },
                {"type": "section","htmlClass": "row",
                    "items": [
                        {"type": "section","htmlClass": "col-xs-6","items": ["BelongSet"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["BelongSetColumn"]}
                    ]
                },
                {type: "actions",
                    items: [
                        { type: 'button', style: 'btn-success', title: '保存',onClick:"saveDataSet()"},
                        { type: 'button', style: 'btn-info', title: '取消', onClick:"DatasetGoback()" }
                    ]
                    ,condition: "NowDatasetAdd == false"
                },
                {type: "actions",
                    items: [
                        { type: 'button', style: 'btn-success', title: '添加',onClick:"insertDataSet()"},
                        { type: 'button', style: 'btn-info', title: '取消', onClick:"DatasetGoback()" }
                    ]
                    ,condition: "NowDatasetAdd == true"
                }
            ];
        });
        $scope.pageshow = {datasetmgt:true,mainbutton:true,mbutton:{addbutton:true,patchdelbutton:true},datesetedit:false,DatasetTable:true,
            columnsmgt:false,columnsmainbutton:false,columnedit:false,columnTable:false};
        $scope.DatasetAdd = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["datasetmgt","datesetedit"],true,true);
            $scope.NowDatasetAdd = true;
            $scope.DatasetInfoModel = {};
        }
        $scope.DatasetModify = function(index){
            $scope.DatasetKeyValue =  $rootScope.Dataset_data[index]["TableDBName"];
            DataMgtService.commDataDetailGet("DataSets","TableDBName",$scope.DatasetKeyValue).then(function(result){
                if (result!=null){
                    $scope.DatasetInfoModel = result;
                    $scope.pageshow = setObjectPropsToValue($scope.pageshow,["datasetmgt","datesetedit"],true,true);
                    $scope.NowDatasetAdd = false;
                }
            });
        }
        var reloadDataSetTable = function(){
            $rootScope.Dataset_dtInstance.reloadData();
            $scope.DatasetGoback();
        }
        $scope.saveDataSet = function(){
            DataMgtService.commDataUpdate("DataSets",$scope.DatasetInfoModel,null,"TableDBName",$scope.DatasetKeyValue).then(function(result){
                result ? reloadDataSetTable() : null;
            });
        }
        $scope.cloneDataset = function(index){
            var clonedata = $rootScope.Dataset_data[index];
            DataMgtService.commDataClone("DataSets","TableDBName",clonedata["TableDBName"]).then(function(result){
                result ? reloadDataSetTable() : null;
            });
        }
        $scope.insertDataSet = function(){
            DataMgtService.commDataInsert("DataSets",$scope.DatasetInfoModel).then(function(result){
                result ? reloadDataSetTable() : null;
            });
        }
        $scope.DatasetDelete = function(index){
            var deldata = $rootScope.Dataset_data[index];
            DataMgtService.commDataDelete("DataSets","TableDBName",deldata["TableDBName"]).then(function(result){
                result ? reloadDataSetTable() : null;
            });
        }
        $scope.DatasetGoback = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["datasetmgt","mainbutton","addbutton","DatasetTable"],true,true);
        }

        $scope.intoDatasetColumnsMgt = function(index){
            $scope.DatasetInfoModel = $rootScope.Dataset_data[index];
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["columnsmgt","columnsmainbutton","columnTable"],true,true);
            $scope.getColumnsData = {"datasetname":"DataSetsColumns","belongkeyname":"TableDBName","belongkeyvalue":$scope.DatasetInfoModel.TableDBName,"BelongSetColumn":"Columns"};
            $rootScope.column_dtInstance.reloadData();
        }

        //列管理
        $scope.columnInfoList_dtColumns= null;
        $scope.columnInfoList_dtOptions= null;
        $rootScope.column_dtInstance = null;
        $rootScope.column_data = null;
        tableService.initSimpleDTColumn("DataSetsColumns",0).then(function(result){
            $scope.columnInfoList_dtColumns = result;
            $scope.columnInfoList_dtColumns.push(DTColumnBuilder.newColumn(null)
                .withTitle('操作').notSortable()
                .renderWith(function actionsHtml(data, type, full, meta) {
                    var returnstr =
                        "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                            "<button class=\"btn btn-error btn-xs\" ng-click=\"cloneColumn(\'" + meta.row + "\')\">复制</button>"+
                            "<button class=\"btn btn-success btn-xs\" ng-click=\"ColumnModify(\'" + meta.row + "\')\">修改</button>"+
                            "<button class=\"btn btn-danger btn-xs\" ng-click=\"ColumnDelete(\'" + meta.row + "\')\">删除</button>"
                    "</div>";
                    return returnstr;
                }));
            $scope.getColumnsData = {"datasetname":"DataSetsColumns","belongkeyname":"TableDBName","belongkeyvalue":"","BelongSetColumn":"Columns"};
            $scope.columnInfoList_dtOptions = tableService.initAjaxTableOptions("/ReturnData/commonDataListGetFromArray",function (data) {
                data.baseinfo = $scope._id;
                data.AskString = angular.toJson($scope.getColumnsData);
                data.remark = systemname;
            },"columnInfoListTable","column_dtInstance","column_data")
                .withOption('createdRow', function(row, data, dataIndex) {
                    $compile(angular.element(row).contents())($scope);
                });
        })
        $scope.columnInfoSchema = {};
        $scope.columnInfoEditForm = [];
        $scope.columnInfoModel = {};
        formService.formFieldOptions("DataSetsColumns").then(function(result){
            $scope.columnInfoSchema = result;
            $scope.columnInfoEditForm = [
                {"type": "section","htmlClass": "row",
                    "items": [
                        {"type": "section","htmlClass": "col-xs-4","items": ["ColCHName"]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["ColDBName"]},
                        {"type": "select","htmlClass": "col-xs-4","key": "ColType",titleMap: [
                            {value:"ObjectId",name:"ObjectId"},
                            { value: "string", name: "字符型" },
                            { value: "boolean", name: "布尔型" },
                            { value: "integer", name: "整数型" },
                            { value: "decimal", name: "浮点型" },
                            { value: "datetime", name: "日期时间型" },
                            { value: "date", name: "日期型" },
                            { value: "time", name: "时间型" },
                            { value: "array", name: "数组型" },
                            { value: "object", name: "对象型" }
                        ]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["defaultvalue"]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["priority"]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["format"],condition: "model.ColType == 'string' || model.ColType == 'array'"},
                        {"type": "section","htmlClass": "col-xs-4","items": ["arrayMainField"],condition: "model.format == 'multiselect' || model.ColType == 'array'"},
                        {"type": "section","htmlClass": "col-xs-4","items": ["arrayShowField"],condition: "model.format == 'multiselect' || model.ColType == 'array'"}
                    ]
                },
                {"type": "section","htmlClass": "row",
                    "items": [
                        {"type": "section","htmlClass": "col-xs-4","items": ["ColIsNull"]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["CanEdit"]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["IfShowInTable"]}
                    ]
                },
                {
                    "type": "help",
                    "helpvalue": "<div class=\"alert alert-info\">以下定义，是属于不予填写，在列表显示时，从其他数据集获取，可以不填写！</div>"
                },
                {"type": "section","htmlClass": "row",
                    "items": [
                        {"type": "section","htmlClass": "col-xs-6","items": ["comefromDataset"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["joinfield"]}
                    ]
                },
                {type: "actions",
                    items: [
                        { type: 'button', style: 'btn-success', title: '保存',onClick:"saveColumn()"},
                        { type: 'button', style: 'btn-info', title: '取消', onClick:"ColumnGoback()" }
                    ]
                    ,condition: "NowColumnAdd == false"
                },
                {type: "actions",
                    items: [
                        { type: 'button', style: 'btn-success', title: '添加',onClick:"insertColumn()"},
                        { type: 'button', style: 'btn-info', title: '取消', onClick:"ColumnGoback()" }
                    ]
                    ,condition: "NowColumnAdd == true"
                }
            ];
        });
        var reloadColumnTable = function(){
            $rootScope.column_dtInstance.reloadData();
            $scope.ColumnGoback();
        }
        $scope.ColumnAdd = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["columnsmgt","columnedit"],true,true);
            $scope.NowColumnAdd = true;
            $scope.columnInfoModel = {};
        }
        $scope.ColumnModify = function(index){
            $scope.ColumnKeyValue =  $rootScope.column_data[index]["ColDBName"];
            DataMgtService.commDataDetailGetFromArray("DataSetsColumns","TableDBName",$scope.DatasetInfoModel.TableDBName,"ColDBName",$scope.ColumnKeyValue).then(function(result){
                if (result!=null){
                    $scope.columnInfoModel = result;
                    $scope.pageshow = setObjectPropsToValue($scope.pageshow,["columnsmgt","columnedit"],true,true);
                    $scope.NowColumnAdd = false;
                }
            });
        };
        $scope.saveColumn = function(){
            DataMgtService.commDataUpdateFromArray("DataSetsColumns","TableDBName",$scope.DatasetInfoModel.TableDBName,$scope.columnInfoModel,null,"ColDBName",$scope.ColumnKeyValue).then(function(result){
                result ? reloadColumnTable() : null;
            });
        };
        $scope.cloneColumn = function(index){
            var clonedata = $rootScope.column_data[index];
            DataMgtService.commDataCloneFromArray("DataSetsColumns","TableDBName",$scope.DatasetInfoModel.TableDBName,"ColDBName",clonedata["ColDBName"]).then(function(result){
                result ? reloadColumnTable() : null;
            });
        };
        $scope.insertColumn = function(){
            DataMgtService.commDataInsertFromArray("DataSetsColumns","TableDBName",$scope.DatasetInfoModel.TableDBName,$scope.columnInfoModel).then(function(result){
                result ? reloadColumnTable() : null;
            });
        };
        $scope.ColumnDelete = function(index){
            var deldata = $rootScope.column_data[index];
            DataMgtService.commDataDeleteFromArray("DataSetsColumns","TableDBName",$scope.DatasetInfoModel.TableDBName,"ColDBName",deldata["ColDBName"]).then(function(result){
                result ? reloadColumnTable() : null;
            });
        };
        $scope.ColumnGoback = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["columnsmgt","columnsmainbutton","columnTable"],true,true);
        }
    }];

//工作流
var WorkFlowMgtController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService){
        //数据集管理
        $scope.WorkFlow_dtColumns= null;
        $scope.WorkFlow_dtOptions= null;
        $rootScope.WorkFlow_dtInstance = null;
        $rootScope.WorkFlow_data = null;
        $scope.ImportWorkFlowName = "WorkFlows";
        $scope.ImportStatuFlowName = "StatuFlow";
        tableService.initSimpleDTColumn("WorkFlows",0).then(function(result){
            $scope.WorkFlowInfoList_dtColumns = result;
            $scope.WorkFlowInfoList_dtColumns.push(DTColumnBuilder.newColumn(null)
                .withTitle('操作').notSortable()
                .renderWith(function actionsHtml(data, type, full, meta) {
                    var returnstr =
                        "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                            "<button class=\"btn btn-error btn-xs\" ng-click=\"cloneWorkFlow(\'" + meta.row + "\')\">复制</button>"+
                            "<button class=\"btn btn-warning btn-xs\" ng-click=\"intoWorkFlowColumnsMgt(\'" + meta.row + "\')\">列管理</button>"+
                            "<button class=\"btn btn-success btn-xs\" ng-click=\"WorkFlowModify(\'" + meta.row + "\')\">修改</button>"+
                            "<button class=\"btn btn-danger btn-xs\" ng-click=\"WorkFlowDelete(\'" + meta.row + "\')\">删除</button>"
                    "</div>";
                    return returnstr;
                }));
            var getWorkFlowOption = {"datasetname":"WorkFlows","search":null};
            $scope.WorkFlowInfoList_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                data.baseinfo = $scope._id;
                data.AskString = angular.toJson(getWorkFlowOption);
                data.remark = systemname;
            },"WorkFlowInfoListTable","WorkFlow_dtInstance","WorkFlow_data")
                .withOption('createdRow', function(row, data, dataIndex) {
                    $compile(angular.element(row).contents())($scope);
                });
        });
        $scope.WorkFlowInfoSchema = {};
        $scope.WorkFlowInfoEditForm = [];
        $scope.WorkFlowInfoModel = {};
        formService.formFieldOptions("WorkFlows").then(function(result){
            $scope.WorkFlowInfoSchema = result;
            $scope.WorkFlowInfoEditForm = [
                {"type": "section","htmlClass": "row",
                    "items": [
                        {"type": "section","htmlClass": "col-xs-6","items": ["TableDBName"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["TableCHName"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["TargetDatabase"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["TargetCollection"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["ConDetecteField"]}
                    ]
                },
                {
                    "type": "help",
                    "helpvalue": "<div class=\"alert alert-info\">以下定义，是属于上层数据集内数组字段的定义，可以不填写！</div>"
                },
                {"type": "section","htmlClass": "row",
                    "items": [
                        {"type": "section","htmlClass": "col-xs-6","items": ["BelongSet"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["BelongSetColumn"]}
                    ]
                },
                {type: "actions",
                    items: [
                        { type: 'button', style: 'btn-success', title: '保存',onClick:"saveWorkFlow()"},
                        { type: 'button', style: 'btn-info', title: '取消', onClick:"WorkFlowGoback()" }
                    ]
                    ,condition: "NowWorkFlowAdd == false"
                },
                {type: "actions",
                    items: [
                        { type: 'button', style: 'btn-success', title: '添加',onClick:"insertWorkFlow()"},
                        { type: 'button', style: 'btn-info', title: '取消', onClick:"WorkFlowGoback()" }
                    ]
                    ,condition: "NowWorkFlowAdd == true"
                }
            ];
        });
        $scope.pageshow = {WorkFlowmgt:true,mainbutton:true,mbutton:{addbutton:true,patchdelbutton:true},WorkFlowedit:false,WorkFlowTable:true,
            StatuFlowsmgt:false,StatuFlowsmainbutton:false,StatuFlowedit:false,StatuFlowTable:false};
        $scope.WorkFlowAdd = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["WorkFlowmgt","WorkFlowedit"],true,true);
            $scope.NowWorkFlowAdd = true;
            $scope.WorkFlowInfoModel = {};
        }
        $scope.WorkFlowModify = function(index){
            $scope.WorkFlowKeyValue =  $rootScope.WorkFlow_data[index]["Method"];
            DataMgtService.commDataDetailGet("WorkFlows","TableDBName",$scope.WorkFlowKeyValue).then(function(result){
                if (result!=null){
                    $scope.WorkFlowInfoModel = result;
                    $scope.pageshow = setObjectPropsToValue($scope.pageshow,["WorkFlowmgt","WorkFlowedit"],true,true);
                    $scope.NowWorkFlowAdd = false;
                }
            });
        }
        var reloadWorkFlowTable = function(){
            $rootScope.WorkFlow_dtInstance.reloadData();
            $scope.WorkFlowGoback();
        }
        $scope.saveWorkFlow = function(){
            DataMgtService.commDataUpdate("WorkFlows",$scope.WorkFlowInfoModel,null,"Method",$scope.WorkFlowKeyValue).then(function(result){
                result ? reloadWorkFlowTable() : null;
            });
        }
        $scope.cloneWorkFlow = function(index){
            var clonedata = $rootScope.WorkFlow_data[index];
            DataMgtService.commDataClone("WorkFlows","Method",clonedata["Method"]).then(function(result){
                result ? reloadWorkFlowTable() : null;
            });
        }
        $scope.insertWorkFlow = function(){
            DataMgtService.commDataInsert("WorkFlows",$scope.WorkFlowInfoModel).then(function(result){
                result ? reloadWorkFlowTable() : null;
            });
        }
        $scope.WorkFlowDelete = function(index){
            var deldata = $rootScope.WorkFlow_data[index];
            DataMgtService.commDataDelete("WorkFlows","Method",deldata["Method"]).then(function(result){
                result ? reloadWorkFlowTable() : null;
            });
        }
        $scope.WorkFlowGoback = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["WorkFlowmgt","mainbutton","addbutton","WorkFlowTable"],true,true);
        }

        $scope.intoStatuFlowsMgt = function(index){
            $scope.WorkFlowInfoModel = $rootScope.WorkFlow_data[index];
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["StatuFlowmgt","StatuFlowmainbutton","StatuFlowTable"],true,true);
            $scope.getStatuFlowsData = {"datasetname":"StatuFlow","belongkeyname":"Method","belongkeyvalue":$scope.WorkFlowInfoModel.Method,"BelongSetColumn":"Flows"};
            $rootScope.StatuFlow_dtInstance.reloadData();
        }

        //列管理
        $scope.StatuFlowInfoList_dtColumns= null;
        $scope.StatuFlowInfoList_dtOptions= null;
        $rootScope.StatuFlow_dtInstance = null;
        $rootScope.StatuFlow_data = null;
        tableService.initSimpleDTColumn("StatuFlow",0).then(function(result){
            $scope.StatuFlowInfoList_dtColumns = result;
            $scope.StatuFlowInfoList_dtColumns.push(DTColumnBuilder.newColumn(null)
                .withTitle('操作').notSortable()
                .renderWith(function actionsHtml(data, type, full, meta) {
                    var returnstr =
                        "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                            "<button class=\"btn btn-error btn-xs\" ng-click=\"cloneStatuFlow(\'" + meta.row + "\')\">复制</button>"+
                            "<button class=\"btn btn-success btn-xs\" ng-click=\"StatuFlowModify(\'" + meta.row + "\')\">修改</button>"+
                            "<button class=\"btn btn-danger btn-xs\" ng-click=\"StatuFlowDelete(\'" + meta.row + "\')\">删除</button>"
                    "</div>";
                    return returnstr;
                }));
            $scope.getStatuFlowsData = {"datasetname":"StatuFlow","belongkeyname":"Method","belongkeyvalue":"","BelongSetColumn":"Flows"};
            $scope.StatuFlowInfoList_dtOptions = tableService.initAjaxTableOptions("/ReturnData/commonDataListGetFromArray",function (data) {
                data.baseinfo = $scope._id;
                data.AskString = angular.toJson($scope.getStatuFlowsData);
                data.remark = systemname;
            },"StatuFlowInfoListTable","StatuFlow_dtInstance","StatuFlow_data")
                .withOption('createdRow', function(row, data, dataIndex) {
                    $compile(angular.element(row).contents())($scope);
                });
        })
        $scope.StatuFlowInfoSchema = {};
        $scope.StatuFlowInfoEditForm = [];
        $scope.StatuFlowInfoModel = {};
        formService.formFieldOptions("StatuFlow").then(function(result){
            $scope.StatuFlowInfoSchema = result;
            $scope.StatuFlowInfoEditForm = [
                {"type": "section","htmlClass": "row",
                    "items": [
                        {"type": "section","htmlClass": "col-xs-4","items": ["ColCHName"]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["ColDBName"]},
                        {"type": "select","htmlClass": "col-xs-4","key": "ColType",titleMap: [
                            {value:"ObjectId",name:"ObjectId"},
                            { value: "string", name: "字符型" },
                            { value: "boolean", name: "布尔型" },
                            { value: "integer", name: "整数型" },
                            { value: "decimal", name: "浮点型" },
                            { value: "datetime", name: "日期时间型" },
                            { value: "date", name: "日期型" },
                            { value: "time", name: "时间型" },
                            { value: "array", name: "数组型" },
                            { value: "object", name: "对象型" }
                        ]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["defaultvalue"]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["priority"]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["format"],condition: "model.ColType == 'string' || model.ColType == 'array'"},
                        {"type": "section","htmlClass": "col-xs-4","items": ["arrayMainField"],condition: "model.format == 'multiselect' || model.ColType == 'array'"},
                        {"type": "section","htmlClass": "col-xs-4","items": ["arrayShowField"],condition: "model.format == 'multiselect' || model.ColType == 'array'"}
                    ]
                },
                {"type": "section","htmlClass": "row",
                    "items": [
                        {"type": "section","htmlClass": "col-xs-4","items": ["ColIsNull"]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["CanEdit"]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["IfShowInTable"]}
                    ]
                },
                {
                    "type": "help",
                    "helpvalue": "<div class=\"alert alert-info\">以下定义，是属于不予填写，在列表显示时，从其他数据集获取，可以不填写！</div>"
                },
                {"type": "section","htmlClass": "row",
                    "items": [
                        {"type": "section","htmlClass": "col-xs-6","items": ["comefromDataset"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["joinfield"]}
                    ]
                },
                {type: "actions",
                    items: [
                        { type: 'button', style: 'btn-success', title: '保存',onClick:"saveStatuFlow()"},
                        { type: 'button', style: 'btn-info', title: '取消', onClick:"StatuFlowGoback()" }
                    ]
                    ,condition: "NowStatuFlowAdd == false"
                },
                {type: "actions",
                    items: [
                        { type: 'button', style: 'btn-success', title: '添加',onClick:"insertStatuFlow()"},
                        { type: 'button', style: 'btn-info', title: '取消', onClick:"StatuFlowGoback()" }
                    ]
                    ,condition: "NowStatuFlowAdd == true"
                }
            ];
        });
        var reloadStatuFlowTable = function(){
            $rootScope.StatuFlow_dtInstance.reloadData();
            $scope.StatuFlowGoback();
        }
        $scope.StatuFlowAdd = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["StatuFlowsmgt","StatuFlowedit"],true,true);
            $scope.NowStatuFlowAdd = true;
            $scope.StatuFlowInfoModel = {};
        }
        $scope.StatuFlowModify = function(index){
            $scope.StatuFlowKeyValue =  $rootScope.StatuFlow_data[index]["Status"];
            DataMgtService.commDataDetailGetFromArray("StatuFlow","Method",$scope.WorkFlowInfoModel.Method,"Status",$scope.StatuFlowKeyValue).then(function(result){
                if (result!=null){
                    $scope.StatuFlowInfoModel = result;
                    $scope.pageshow = setObjectPropsToValue($scope.pageshow,["StatuFlowsmgt","StatuFlowedit"],true,true);
                    $scope.NowStatuFlowAdd = false;
                }
            });
        };
        $scope.saveStatuFlow = function(){
            DataMgtService.commDataUpdateFromArray("StatuFlow","Method",$scope.WorkFlowInfoModel.Method,$scope.StatuFlowInfoModel,null,"Status",$scope.StatuFlowKeyValue).then(function(result){
                result ? reloadStatuFlowTable() : null;
            });
        };
        $scope.cloneStatuFlow = function(index){
            var clonedata = $rootScope.StatuFlow_data[index];
            DataMgtService.commDataCloneFromArray("StatuFlow","Method",$scope.WorkFlowInfoModel.Method,"Status",clonedata["Status"]).then(function(result){
                result ? reloadStatuFlowTable() : null;
            });
        };
        $scope.insertStatuFlow = function(){
            DataMgtService.commDataInsertFromArray("StatuFlow","Method",$scope.WorkFlowInfoModel.Method,"Status",$scope.StatuFlowInfoModel).then(function(result){
                result ? reloadStatuFlowTable() : null;
            });
        };
        $scope.StatuFlowDelete = function(index){
            var deldata = $rootScope.StatuFlow_data[index];
            DataMgtService.commDataDeleteFromArray("StatuFlow","Method",$scope.WorkFlowInfoModel.Method,"Status",deldata["Status"]).then(function(result){
                result ? reloadStatuFlowTable() : null;
            });
        };
        $scope.StatuFlowGoback = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["StatuFlowsmgt","StatuFlowsmainbutton","StatuFlowTable"],true,true);
        }
    }];

var FileRegisterController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm){
        //数据集管理
        $scope.File_dtColumns= null;
        $scope.File_dtOptions= null;
        $rootScope.FileInfo_dtInstance = null;
        $rootScope.FileInfo_data = null;
        tableService.initSimpleDTColumn("AchieveInfo",0).then(function(result){
            $scope.FileInfoList_dtColumns = result;
            $scope.FileInfoList_dtColumns.push(DTColumnBuilder.newColumn(null)
                .withTitle('操作').notSortable().withOption('width','150px')
                .renderWith(function actionsHtml(data, type, full, meta) {
                    var returnstr =
                        "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                            "<button class=\"btn btn-error btn-xs\" ng-click=\"cloneDataset(\'" + meta.row + "\')\">复制</button>"+
                            "<button class=\"btn btn-success btn-xs\" ng-click=\"DatasetModify(\'" + meta.row + "\')\">修改</button>"+
                            "<button class=\"btn btn-danger btn-xs\" ng-click=\"DatasetDelete(\'" + meta.row + "\')\">删除</button>"
                    "</div>";
                    return returnstr;
                }));
            var getFileInfoOption = {"datasetname":"AchieveInfo","search":null};
            $scope.FileInfoList_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                data.baseinfo = $scope._id;
                data.AskString = angular.toJson(getFileInfoOption);
                data.remark = systemname;
            },"FileListTable","FileInfo_dtInstance","FileInfo_data")
                .withOption('createdRow', function(row, data, dataIndex) {
                    $compile(angular.element(row).contents())($scope);
                });
        });
        $scope.DatasetInfoSchema = {};
        $scope.DatasetInfoEditForm = [];
        $scope.DatasetInfoModel = {};
        formService.formFieldOptions("AchieveInfo").then(function(result){
            $scope.DatasetInfoSchema = result;
            $scope.DatasetInfoEditForm = [
                {"type": "section","htmlClass": "row",
                    "items": [
                        {"type": "section","htmlClass": "col-xs-6","items": ["achievename"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["achieveNo"]},
                        {"type": "section","htmlClass": "col-xs-12","items": [{key:"acontent","config":"richEditor","height":"200"}]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["Applier"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["ApplyDate"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["keywords"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["state"]},
                        {"type": "section","htmlClass": "col-xs-6","items": ["type"]}
                    ]
                },
                {type: "actions",
                    items: [
                        { type: 'button', style: 'btn-success', title: '保存',onClick:"saveDataSet()"},
                        { type: 'button', style: 'btn-info', title: '取消', onClick:"DatasetGoback()" }
                    ]
                    ,condition: "NowDatasetAdd == false"
                },
                {type: "actions",
                    items: [
                        { type: 'button', style: 'btn-success', title: '添加',onClick:"insertDataSet()"},
                        { type: 'button', style: 'btn-info', title: '取消', onClick:"DatasetGoback()" }
                    ]
                    ,condition: "NowDatasetAdd == true"
                }
            ];
        });
        $scope.pageshow = {filemgt:true,mainbutton:true,mbutton:{addbutton:true,patchdelbutton:true},Fileedit:false,FileListTable:true};
        $scope.DatasetAdd = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["filemgt","Fileedit"],true,true);
            $scope.NowDatasetAdd = true;
            $scope.DatasetInfoModel = {};
        };
        $scope.DatasetModify = function(index){
            $scope.DatasetKeyValue =  $rootScope.FileInfo_data[index]["achieveNo"];
            DataMgtService.commDataDetailGet("AchieveInfo","achieveNo",$scope.DatasetKeyValue).then(function(result){
                if (result!=null){
                    $scope.DatasetInfoModel = result;
                    $scope.pageshow = setObjectPropsToValue($scope.pageshow,["filemgt","Fileedit"],true,true);
                    $scope.NowDatasetAdd = false;
                }
            });
        }
        var reloadDataSetTable = function(){
            $rootScope.FileInfo_dtInstance.reloadData();
            $scope.DatasetGoback();
        }
        $scope.saveDataSet = function(){
            DataMgtService.commDataUpdate("AchieveInfo",$scope.DatasetInfoModel,null,"achieveNo",$scope.DatasetKeyValue).then(function(result){
                result ? reloadDataSetTable() : null;
            });
        }
        $scope.cloneDataset = function(index){
            var clonedata = $rootScope.FileInfo_data[index];
            DataMgtService.commDataClone("AchieveInfo","achieveNo",clonedata["achieveNo"]).then(function(result){
                result ? reloadDataSetTable() : null;
            });
        }
        $scope.insertDataSet = function(){
            DataMgtService.commDataInsert("AchieveInfo",$scope.DatasetInfoModel).then(function(result){
                result ? reloadDataSetTable() : null;
            });
        }
        $scope.DatasetDelete = function(index){
            var deldata = $rootScope.FileInfo_data[index];
            DataMgtService.commDataDelete("AchieveInfo","achieveNo",deldata["achieveNo"]).then(function(result){
                result ? reloadDataSetTable() : null;
            });
        }
        $scope.DatasetGoback = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["filemgt","mainbutton","addbutton","FileListTable"],true,true);
        }
    }];

var FileQueryController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService){
        //数据集管理
        $scope.File_dtColumns= null;
        $scope.File_dtOptions= null;
        $rootScope.FileInfo_dtInstance = null;
        $rootScope.FileInfo_data = null;
        tableService.initSimpleDTColumn("AchieveInfo",0).then(function(result){
            $scope.FileInfoList_dtColumns = result;
            var getFileInfoOption = {"datasetname":"AchieveInfo","search":null};
            $scope.FileInfoList_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                data.baseinfo = $scope._id;
                data.AskString = angular.toJson(getFileInfoOption);
                data.remark = systemname;
            },"FileListTable","FileInfo_dtInstance","FileInfo_data")
                .withOption('createdRow', function(row, data, dataIndex) {
                    $compile(angular.element(row).contents())($scope);
                });
        });

        $scope.pageshow = {filemgt:true,FileListTable:true};
    }];

var HouseManageController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm){
        var vm = $scope;
        vm.pageshow = {RoomMgtTable:true,RoomTable:true,RoomEdit:false,AdSearch:false,dataimport:false};
        $scope.room_dtColumns= null;
        $scope.room_dtOptions= null;
        $rootScope.roomList_dtInstance = null;
        $rootScope.roomList_data = null;
        vm.roomEditInfo = {};
        vm.getRoomOption = null;
        var loadRoomList = function(){
            tableService.initSimpleDTColumn("Room",0).then(function(result){
                $scope.room_dtColumns = result;
                $scope.room_dtColumns.push(DTColumnBuilder.newColumn(null)
                    .withTitle('操作').notSortable().withOption('width','150px')
                    .renderWith(function actionsHtml(data, type, full, meta) {
                        var returnstr =
                            "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                                "<button class=\"btn btn-error btn-xs\" ng-click=\"cloneRoom(\'" + meta.row + "\')\">复制</button>"+
                                "<button class=\"btn btn-success btn-xs\" ng-click=\"RoomInfoModify(\'" + meta.row + "\')\">修改</button>"+
                                "<button class=\"btn btn-danger btn-xs\" ng-click=\"RoomDelete(\'" + meta.row + "\')\">删除</button>"
                        "</div>";
                        return returnstr;
                    }));
                var search = [];
                vm.getRoomOption = {"datasetname":"Room","search":search};
                $scope.room_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                    data.baseinfo = $scope._id;
                    data.AskString = angular.toJson(vm.getRoomOption);
                    data.remark = systemname;
                },"roomListTable","roomList_dtInstance","roomList_data")
                    .withOption('createdRow', function(row, data, dataIndex) {
                        $compile(angular.element(row).contents())($scope);
                    });
                $scope.pageshow = setObjectPropsToValue($scope.pageshow,["RoomMgtTable","RoomTable"],true,true);
            });
            formService.formFieldOptions("Room").then(function(result){
                $scope.roomEditSchema = result;
                $scope.roomEditForm = [
                    {
                        "type": "template",
                        "template": '<div class="alert alert-info">当前处理的是【楼栋：{{model.buildNo}}】【楼层：{{model.floorNo}}】房间信息！当前编号：{{model.roomid}}</div>'
                    },
                    {"type": "section","htmlClass": "row","items":[
                        {"type": "select","htmlClass": "col-md-4","key": "buildNo",titleMap: [],onChange: "buildNoSelected()"},
                        {"type": "select","htmlClass": "col-md-4","key": "floorNo",titleMap: []}],
                        condition: "NowRoomAdd == true"
                    },
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"type": "section","htmlClass": "col-xs-4","items": [{key:"roomNo",onChange: function(modelValue,form) {
                                vm.roomEditInfo.roomid = vm.roomEditInfo.buildNo + '-'+vm.roomEditInfo.floorNo+'-'+modelValue
                            }}]},
                            {"type": "section","htmlClass": "col-xs-4","items": ["unitNo"]}
                        ]
                    },
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"type": "section","htmlClass": "col-xs-4","items": ["area"]},
                            {"type": "section","htmlClass": "col-xs-4","items": ["usageArea"]},
                            {"type": "select","htmlClass": "col-xs-4","key": "usageType",titleMap: [
                                { value: "教师周转房", name: "职工住房" },
                                { value: "公有用房", name: "公有用房" },
                                { value: "学生公寓", name: "学生公寓" },
                                { value: "经营性用房", name: "商业服务用房" }
                            ]}
                        ]
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '保存',onClick:"saveRoom()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"RoomEditGoback()" }
                        ]
                        ,condition: "NowRoomAdd == false"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '添加',onClick:"insertRoom()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"RoomEditGoback()" }
                        ]
                        ,condition: "NowRoomAdd == true"
                    }
                ];
                InitBuildingSets();
            });
        }
        var InitBuildingSets = function () {
            DataMgtService.commGetDic("Building","buildNo","name",null).then(function(result){
                if (result != null){
                    vm.roomEditForm = setObjectFieldToValue(vm.roomEditForm,"key","buildNo","titleMap",result);
                }
            });
        };

        vm.buildNoSelected = function(){
            var search = [];
            //search.push({field:"buildNo",keywords:vm.InitRoomSelectOption.buildNo,condition:"="});
            DataMgtService.commGetDicFromArray("BuildingFloor","buildNo",vm.roomEditInfo.buildNo,"floorNo","floorNo",search).then(function(result){
                if (result != null){
                    vm.roomEditForm = setObjectFieldToValue(vm.roomEditForm,"key","floorNo","titleMap",result);
                }
            });
        }

        loadRoomList();

        vm.AddRoom = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["RoomMgtTable","RoomEdit"],true,true);
            vm.NowRoomAdd = true;
            vm.roomEditInfo = {};
        };

        vm.RoomInfoModify = function(index){
            vm.RoomKeyValue =  $rootScope.roomList_data[index]["roomid"];
            DataMgtService.commDataDetailGet("Room","roomid",vm.RoomKeyValue).then(function(result){
                if (result!=null){
                    vm.roomEditInfo = result;
                    vm.pageshow = setObjectPropsToValue(vm.pageshow,["RoomMgtTable","RoomEdit"],true,true);
                    vm.NowRoomAdd = false;
                }
            });
        };
        var reloadRoomTable = function(){
            $rootScope.roomList_dtInstance.reloadData();
            $scope.RoomEditGoback();
        }
        $scope.saveRoom = function(){
            DataMgtService.commDataUpdate("Room",vm.roomEditInfo,null,"roomid",$scope.RoomKeyValue).then(function(result){
                result ? reloadRoomTable() : null;
            });
        }
        $scope.cloneRoom = function(index){
            var clonedata = $rootScope.roomList_data[index];
            DataMgtService.commDataClone("Room","roomid",clonedata["roomid"]).then(function(result){
                result ? reloadRoomTable() : null;
            });
        }
        $scope.insertRoom = function(){
            DataMgtService.commDataInsert("Room",vm.roomEditInfo).then(function(result){
                result ? reloadRoomTable() : null;
            });
        }
        $scope.RoomDelete = function(index){
            var deldata = $rootScope.roomList_data[index];
            DataMgtService.commDataDelete("Room","roomid",deldata["roomid"]).then(function(result){
                result ? reloadRoomTable() : null;
            });
        }
        vm.RoomEditGoback = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["RoomMgtTable","RoomTable"],true,true);
        }
        vm.RoomAdSearchInfo= {data : [{field:"",keywords:"",condition:"="}]};
        vm.RoomAdSearchField = [{value:"buildNo",name:"楼栋"},{value:"floorNo",name:"楼层"},{value:"unitNo",name:"单元"},{value:"usageType",name:"用途"},{value:"area",name:"建筑面积"}];
        vm.showAdSearch = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AdSearch"],!vm.pageshow.AdSearch,false);
        }
        vm.RoomAdSearchGo = function(){
            vm.getRoomOption = {"datasetname":"Room","search":vm.RoomAdSearchInfo.data};
            reloadRoomTable()
        }
        vm.ResetRoomAdSearch = function(){
            vm.getRoomOption = {"datasetname":"Room","search":null};
            reloadRoomTable()
        }

        vm.exportRoomInfo = function(){
            DataMgtService.commDataExportExcel(vm.getRoomOption.datasetname,vm.getRoomOption.search);
        }
        $scope.importdataset = "Room";
        vm.importRoomInfo = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["dataimport"],true,true);
        }
    }];

var PublicHouseUseageManageController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.pageshow = {PublicHouseMgtTable:true,PublicHouseTable:true,PublicHouseEdit:false,AdSearch:false};
        $scope.PublicHouse_dtColumns= null;
        $scope.PublicHouse_dtOptions= null;
        $rootScope.PublicHouseList_dtInstance = null;
        $rootScope.PublicHouseList_data = null;
        vm.PublicHouseEditInfo = {};
        vm.getPublicHouseOption = null;

        var loadPublicHouseList = function(){
            tableService.initSimpleDTColumn("PublicHouseUseage",0).then(function(result){
                $scope.PublicHouse_dtColumns = result;
                $scope.PublicHouse_dtColumns.push(DTColumnBuilder.newColumn(null)
                    .withTitle('操作').notSortable().withOption('width','150px')
                    .renderWith(function actionsHtml(data, type, full, meta) {
                        var returnstr =
                            "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                                "<button class=\"btn btn-error btn-xs\" ng-click=\"clonePublicHouse(\'" + meta.row + "\')\">复制</button>"+
                                "<button class=\"btn btn-success btn-xs\" ng-click=\"PublicHouseInfoModify(\'" + meta.row + "\')\">调整使用</button>"+
                                "<button class=\"btn btn-danger btn-xs\" ng-click=\"PublicHouseDelete(\'" + meta.row + "\')\">退还</button>"
                        "</div>";
                        return returnstr;
                    }));
                var search = [];
                vm.getPublicHouseOption = {"datasetname":"PublicHouseUseage","search":search};
                $scope.PublicHouse_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                    data.baseinfo = $scope._id;
                    data.AskString = angular.toJson(vm.getPublicHouseOption);
                    data.remark = systemname;
                },"PublicHouseListTable","PublicHouseList_dtInstance","PublicHouseList_data")
                    .withOption('createdRow', function(row, data, dataIndex) {
                        $compile(angular.element(row).contents())($scope);
                    });
                $scope.pageshow = setObjectPropsToValue($scope.pageshow,["PublicHouseMgtTable","PublicHouseTable"],true,true);
            });
            formService.formFieldOptions("PublicHouseUseage").then(function(result){
                $scope.PublicHouseEditSchema = result;
                $scope.PublicHouseEditForm = [
                    {
                        "type": "template",
                        "template": '<div class="alert alert-info" ng-show="model.roomid">当前拟使用的是【{{model.roomid}}】房间，房间使用面积：{{model.usageArea}}平米</div>'
                    },

                    {"type": "section","htmlClass": "row","items":[{
                        "key": "roomid","htmlClass": "col-xs-4",
                        "typeahead": "room.roomid as room.roomid for room in evalExpr(\"getRoomBykey(modelValue)\",{'modelValue':$viewValue})",
                        "typeaheadOnSelect": "evalExpr(\"RoomSelected()\")",
                        condition: "NowPublicHouseAdd == true"
                    },
                        {"type": "select","htmlClass": "col-xs-4","key": "depid",titleMap:[],onChange:function(modelValue,form) {
                            var depname = $filter('filter')(vm.deplist, {value: modelValue})[0].name;
                            vm.PublicHouseEditInfo.depname = depname;
                        }},
                        {"type": "select","htmlClass": "col-xs-4","key": "usedirective",titleMap: [
                            { value: "办公室", name: "办公室" },
                            { value: "会议室", name: "会议室" },
                            { value: "资料室", name: "资料室" },
                            { value: "档案室", name: "档案室" },
                            { value: "活动室", name: "活动室" },
                            { value: "公共服务", name: "公共服务" },
                            { value: "教师工作", name: "教师工作" },
                            { value: "公共教学实验", name: "公共教学实验" },
                            { value: "专业教学实验", name: "专业教学实验" },
                            { value: "科研", name: "科研" },
                            { value: "其他", name: "其他" }
                        ]}]},
                    {
                        "type": "template",
                        "template": '<div class="alert alert-info col-xs-12">办公室/教师工作必须填写使用人员，当前拟使用人【姓名：{{model.username}} 工号：{{model.userid}} 职务职级：{{model.userlevel}}】</div>',
                        condition: "PublicHouseEditInfo.usedirective == '办公室' || PublicHouseEditInfo.usedirective == '教师工作'"
                    },
                    {"type": "section","htmlClass": "row",
                        "items": [{
                            "key": "userid","htmlClass": "col-xs-6",
                            "typeahead": "user.employeeNo as user.userName for user in evalExpr(\"getUsersBykey(modelValue)\",{'modelValue':$viewValue})",
                            "typeaheadOnSelect": "evalExpr(\"UserSelected()\")"
                        }],condition: "PublicHouseEditInfo.usedirective == '办公室' || PublicHouseEditInfo.usedirective == '教师工作'"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '保存',onClick:"savePublicHouse()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"PublicHouseEditGoback()" }
                        ]
                        ,condition: "NowPublicHouseAdd == false"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '添加',onClick:"insertPublicHouse()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"PublicHouseEditGoback()" }
                        ]
                        ,condition: "NowPublicHouseAdd == true"
                    }
                ];
                InitDicSets();
            });
        }
        var InitDicSets = function () {
            DataMgtService.commGetDic("Department","depId","depName",null).then(function(result){
                if (result != null){
                    vm.deplist = result;
                    vm.PublicHouseEditForm = setObjectFieldToValue(vm.PublicHouseEditForm,"key","depid","titleMap",result);
                }
            });
        };

        vm.getUsersBykey = function(key){
            var search = [];
//            if (vm.PublicHouseEditInfo.depid == "" || vm.PublicHouseEditInfo.depid == undefined || vm.PublicHouseEditInfo.depid == null){
//                return ;
//            }
            search.push({field:"depNo",keywords:vm.PublicHouseEditInfo.depid,condition:"left like"},
                {field:"userName",keywords:key,condition:"like",forerelation:"AND"});
            return DataMgtService.commDataListGet("Employee",search).then(function(result){
                return result;
            })
        }
        vm.getRoomBykey = function(key){
            var search = [];
            search.push({field:"roomid",keywords:key,condition:"like"},
                {field:"usageType",keywords:"公有用房",condition:"=",forerelation:"AND"});
            return DataMgtService.commDataListGet("Room",search).then(function(result){
                return result;
            })
        }

        vm.RoomSelected = function(){
            var search = [];
            search.push({field:"roomid",keywords:vm.PublicHouseEditInfo.roomid,condition:"="});
            DataMgtService.commDataDetailGet("Room","roomid",vm.PublicHouseEditInfo.roomid).then(function(result){
                if (result != null){
                    vm.PublicHouseEditInfo.usageArea = result.usageArea;
                }
            });
        }

        loadPublicHouseList();

        vm.UserSelected = function(){
            DataMgtService.commDataDetailGet("Employee","employeeNo",vm.DepPublicHouseEditInfo.userid).then(function(result){
                if (result != null){
                    vm.DepPublicHouseEditInfo.username = result.userName;
                    vm.DepPublicHouseEditInfo.userPost = result.post;
                    vm.DepPublicHouseEditInfo.userTitle = result.title;
                }
            });
        }

        vm.AddPublicHouse = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["PublicHouseMgtTable","PublicHouseEdit"],true,true);
            vm.NowPublicHouseAdd = true;
            vm.PublicHouseEditInfo = {};

        };

        vm.PublicHouseInfoModify = function(index){
            vm.PublicHouseKeyValue =  $rootScope.PublicHouseList_data[index]["roomid"];
            DataMgtService.commDataDetailGet("PublicHouseUseage","roomid",vm.PublicHouseKeyValue).then(function(result){
                if (result!=null){
                    vm.PublicHouseEditInfo = result;
                    vm.pageshow = setObjectPropsToValue(vm.pageshow,["PublicHouseMgtTable","PublicHouseEdit"],true,true);
                    vm.NowPublicHouseAdd = false;
                }
            });
        };
        var reloadPublicHouseTable = function(){
            $rootScope.PublicHouseList_dtInstance.reloadData();
            $scope.PublicHouseEditGoback();
        }
        $scope.savePublicHouse = function(){
            DataMgtService.commDataUpdate("PublicHouseUseage",vm.PublicHouseEditInfo,null,"roomid",$scope.PublicHouseKeyValue).then(function(result){
                result ? reloadPublicHouseTable() : null;
            });
        }
        $scope.clonePublicHouse = function(index){
            var clonedata = $rootScope.PublicHouseList_data[index];
            DataMgtService.commDataClone("PublicHouseUseage","roomid",clonedata["roomid"]).then(function(result){
                result ? reloadPublicHouseTable() : null;
            });
        }
        $scope.insertPublicHouse = function(){
            DataMgtService.commDataInsert("PublicHouseUseage",vm.PublicHouseEditInfo).then(function(result){
                result ? reloadPublicHouseTable() : null;
            });
        }
        $scope.PublicHouseDelete = function(index){
            var deldata = $rootScope.PublicHouseList_data[index];
            DataMgtService.commDataDelete("PublicHouseUseage","roomid",deldata["roomid"]).then(function(result){
                result ? reloadPublicHouseTable() : null;
            });
        }
        vm.PublicHouseEditGoback = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["PublicHouseMgtTable","PublicHouseTable"],true,true);
        }
        vm.PublicHouseAdSearchInfo= {data : [{field:"",keywords:"",condition:"="}]};
        vm.PublicHouseAdSearchField = [{value:"roomid",name:"房间编号"},{value:"depname",name:"使用单位"},{value:"usedirective",name:"用途"}];
        vm.showAdSearch = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AdSearch"],!vm.pageshow.AdSearch,false);
        }
        vm.PublicHouseAdSearchGo = function(){
            vm.getPublicHouseOption = {"datasetname":"PublicHouseUseage","search":vm.PublicHouseAdSearchInfo.data};
            reloadPublicHouseTable()
        }
        vm.ResetPublicHouseAdSearch = function(){
            vm.getPublicHouseOption = {"datasetname":"PublicHouseUseage","search":null};
            reloadPublicHouseTable()
        }
        vm.exportPublicHouseUseageInfo= function(){
            DataMgtService.commDataExportExcel(vm.getPublicHouseOption.datasetname,vm.getPublicHouseOption.search);
        }
    }];

var DepPublicHouseUseageManageController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.pageshow = {DepPublicHouseMgtTable:true,DepPublicHouseTable:true,DepPublicHouseEdit:false,AdSearch:false,DepPublicHouseDemandEdit:false};
        vm.DepPublicHouse_dtColumns= null;
        vm.DepPublicHouse_dtOptions= null;
        $rootScope.DepPublicHouseList_dtInstance = null;
        $rootScope.DepPublicHouseList_data = null;
        vm.DepPublicHouseEditInfo = {};
        vm.DepPublicHouseDemandEditInfo = {};
        vm.getDepPublicHouseOption = null;
        vm.nowDemandCount = 0;

        var loadDepPublicHouseList = function(){
            tableService.initSimpleDTColumn("PublicHouseUseage",0).then(function(result){
                vm.DepPublicHouse_dtColumns = result;
                vm.DepPublicHouse_dtColumns.push(DTColumnBuilder.newColumn(null)
                    .withTitle('操作').notSortable().withOption('width','150px')
                    .renderWith(function actionsHtml(data, type, full, meta) {
                        var returnstr =
                            "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                                "<button class=\"btn btn-error btn-xs\" ng-click=\"cloneDepPublicHouse(\'" + meta.row + "\')\">复制</button>"+
                                "<button class=\"btn btn-success btn-xs\" ng-click=\"DepPublicHouseInfoModify(\'" + meta.row + "\')\">调整使用</button>"+
                                "<button class=\"btn btn-danger btn-xs\" ng-click=\"DepPublicHouseDelete(\'" + meta.row + "\')\">退还</button>"
                        "</div>";
                        return returnstr;
                    }));
                var search = [];
                vm.getDepPublicHouseOption = {"datasetname":"PublicHouseUseage","search":search};
                vm.DepPublicHouse_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                    data.baseinfo = vm._id;
                    data.AskString = angular.toJson(vm.getDepPublicHouseOption);
                    data.remark = systemname;
                },"DepPublicHouseListTable","DepPublicHouseList_dtInstance","DepPublicHouseList_data")
                    .withOption('createdRow', function(row, data, dataIndex) {
                        $compile(angular.element(row).contents())($scope);
                    });
                vm.pageshow = setObjectPropsToValue(vm.pageshow,["DepPublicHouseMgtTable","DepPublicHouseTable"],true,true);
            });
            formService.formFieldOptions("PublicHouseUseage").then(function(result){
                vm.DepPublicHouseEditSchema = result;
                vm.DepPublicHouseEditForm = [
                    {
                        "type": "template",
                        "template": '<div class="alert alert-info" ng-show="model.roomid">当前拟使用的是【{{model.roomid}}】房间，房间使用面积：{{model.usageArea}}平米</div>'
                    },

                    {"type": "section","htmlClass": "row","items":[{
                        "key": "roomid","htmlClass": "col-xs-4",
                        "typeahead": "room.roomid as room.roomid for room in evalExpr(\"getRoomBykey(modelValue)\",{'modelValue':$viewValue})",
                        "typeaheadOnSelect": "evalExpr(\"RoomSelected()\")",
                        condition: "NowDepPublicHouseAdd == true"
                    },
                        {"type": "select","htmlClass": "col-xs-4","key": "usedirective",titleMap: [
                            { value: "办公室", name: "办公室" },
                            { value: "会议室", name: "会议室" },
                            { value: "资料室", name: "资料室" },
                            { value: "档案室", name: "档案室" },
                            { value: "活动室", name: "活动室" },
                            { value: "公共服务", name: "公共服务" },
                            { value: "教师工作", name: "教师工作" },
                            { value: "公共教学实验", name: "公共教学实验" },
                            { value: "专业教学实验", name: "专业教学实验" },
                            { value: "科研", name: "科研" },
                            { value: "其他", name: "其他" }
                        ]}]},
                    {
                        "type": "template",
                        "template": '<div class="alert alert-info col-xs-12">办公室/教师工作必须填写使用人员，当前拟使用人【姓名：{{model.username}} 工号：{{model.userid}} 职务职级：{{model.userlevel}}】</div>',
                        condition: "DepPublicHouseEditInfo.usedirective == '办公室' || DepPublicHouseEditInfo.usedirective == '教师工作'"
                    },
                    {"type": "section","htmlClass": "row",
                        "items": [{
                            "key": "userid","htmlClass": "col-xs-6",
                            "typeahead": "user.employeeNo as user.userName for user in evalExpr(\"getUsersBykey(modelValue)\",{'modelValue':$viewValue})",
                            "typeaheadOnSelect": "evalExpr(\"UserSelected()\")"
                        }],condition: "DepPublicHouseEditInfo.usedirective == '办公室' || DepPublicHouseEditInfo.usedirective == '教师工作'"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '保存',onClick:"saveDepPublicHouse()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"DepPublicHouseEditGoback()" }
                        ]
                        ,condition: "NowDepPublicHouseAdd == false"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '添加',onClick:"insertDepPublicHouse()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"DepPublicHouseEditGoback()" }
                        ]
                        ,condition: "NowDepPublicHouseAdd == true"
                    }
                ];
            });

            formService.formFieldOptions("PublicHouseUseage").then(function(result){
                $scope.DepPublicHouseDemandEditSchema = result;
                $scope.DepPublicHouseDemandEditForm = [
                    {
                        "type": "template",
                        "template": '<div class="alert alert-info" ng-show="model.roomid">当前拟使用的是【{{model.roomid}}】房间，房间使用面积：{{model.usageArea}}平米</div>'
                    },

                    {"type": "section","htmlClass": "row","items":[{
                        "key": "roomid","htmlClass": "col-xs-4",
                        "typeahead": "room.roomid as room.roomid for room in evalExpr(\"getRoomBykey(modelValue)\",{'modelValue':$viewValue})",
                        "typeaheadOnSelect": "evalExpr(\"RoomSelected()\")",
                        condition: "NowPublicHouseAdd == true"
                    },
                        {"type": "select","htmlClass": "col-xs-4","key": "depid",titleMap:[],onChange:function(modelValue,form) {
                            var depname = $filter('filter')(vm.deplist, {value: modelValue})[0].name;
                            vm.DepPublicHouseEditInfo.depname = depname;
                        }},
                        {"type": "select","htmlClass": "col-xs-4","key": "usedirective",titleMap: [
                            { value: "办公室", name: "办公室" },
                            { value: "会议室", name: "会议室" },
                            { value: "资料室", name: "资料室" },
                            { value: "档案室", name: "档案室" },
                            { value: "活动室", name: "活动室" },
                            { value: "公共服务", name: "公共服务" },
                            { value: "教师工作", name: "教师工作" },
                            { value: "公共教学实验", name: "公共教学实验" },
                            { value: "专业教学实验", name: "专业教学实验" },
                            { value: "科研", name: "科研" },
                            { value: "其他", name: "其他" }
                        ]}]},
                    {
                        "type": "template",
                        "template": '<div class="alert alert-info col-xs-12">办公室/教师工作必须填写使用人员，当前拟使用人【姓名：{{model.username}} 工号：{{model.userid}} 职务职级：{{model.userlevel}}】</div>',
                        condition: "DepPublicHouseEditInfo.usedirective == '办公室' || DepPublicHouseEditInfo.usedirective == '教师工作'"
                    },
                    {"type": "section","htmlClass": "row",
                        "items": [{
                            "key": "userid","htmlClass": "col-xs-6",
                            "typeahead": "user.employeeNo as user.userName for user in evalExpr(\"getUsersBykey(modelValue)\",{'modelValue':$viewValue})",
                            "typeaheadOnSelect": "evalExpr(\"UserSelected()\")"
                        }],condition: "DepPublicHouseEditInfo.usedirective == '办公室' || DepPublicHouseEditInfo.usedirective == '教师工作'"
                    },

                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '提交申请',onClick:"submitDepPublicHouse()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"DepPublicHouseEditGoback()" }
                        ]
                        ,condition: "NowPublicHouseAdd == true"
                    }
                ];
                InitDicSets();
            });
        }

        var InitDicSets = function () {
            var loginhistory = localStorageService.get(systemname+'LoginInfo');
            var search = [];
            search.push({field:"depId",keywords:loginhistory.userdid,condition:"="});
            DataMgtService.commGetDic("Department","depId","depName",search).then(function(result){
                if (result != null){
                    vm.deplist = result;
                    vm.DepPublicHouseDemandEditForm = setObjectFieldToValue(vm.DepPublicHouseDemandEditForm,"key","depid","titleMap",result);
                }
            });
        };

        vm.getRoomBykey = function(key){
            var search = [];
            search.push({field:"roomid",keywords:key,condition:"like"},
                {field:"usageType",keywords:"公有用房",condition:"=",forerelation:"AND"});
            return DataMgtService.commDataListGet("Room",search).then(function(result){
                return result;
            })
        }

        vm.RoomSelected = function(){
            var search = [];
            search.push({field:"roomid",keywords:vm.DepPublicHouseEditInfo.roomid,condition:"="});
            DataMgtService.commDataDetailGet("Room","roomid",vm.DepPublicHouseEditInfo.roomid).then(function(result){
                if (result != null){
                    vm.DepPublicHouseEditInfo.usageArea = result.usageArea;
                }
            });
        }

        vm.getUsersBykey = function(key){
            var search = [];
            search.push({field:"depNo",keywords:vm.DepPublicHouseEditInfo.depid,condition:"left like"},
                {field:"userName",keywords:key,condition:"like",forerelation:"AND"});
            return DataMgtService.commDataListGet("Employee",search).then(function(result){
                return result;
            })
        }
        vm.UserSelected = function(){
            DataMgtService.commDataDetailGet("Employee","employeeNo",vm.DepPublicHouseEditInfo.userid).then(function(result){
                if (result != null){
                    vm.DepPublicHouseEditInfo.username = result.userName;
                    vm.DepPublicHouseEditInfo.userPost = result.post;
                    vm.DepPublicHouseEditInfo.userTitle = result.title;
                }
            });
        }

        loadDepPublicHouseList();

        vm.DepPubHouseDemand= function () {
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["DepPublicHouseMgtTable","DepPublicHouseDemandEdit"],true,true);
            vm.NowPublicHouseAdd = true;
            vm.DepPublicHouseEditInfo = {};
        };
        vm.submitDepPublicHouse = function(){
            DataMgtService.commDataUpdate("PublicHouseUseage",vm.DepPublicHouseEditInfo,null,"roomid",vm.DepPublicHouseEditInfo.roomid).then(function(result){
                result ? reloadDepPublicHouseTable() : null;
            });
        }

        vm.DepPublicHouseInfoModify = function(index){
            vm.DepPublicHouseKeyValue =  $rootScope.DepPublicHouseList_data[index]["roomid"];
            DataMgtService.commDataDetailGet("PublicHouseUseage","roomid",vm.DepPublicHouseKeyValue).then(function(result){
                if (result!=null){
                    vm.DepPublicHouseEditInfo = result;
                    vm.pageshow = setObjectPropsToValue(vm.pageshow,["DepPublicHouseMgtTable","DepPublicHouseEdit"],true,true);
                    vm.NowDepPublicHouseAdd = false;
                }
            });
        };
        var reloadDepPublicHouseTable = function(){
            $rootScope.DepPublicHouseList_dtInstance.reloadData();
            vm.DepPublicHouseEditGoback();
        }
        vm.saveDepPublicHouse = function(){
            DataMgtService.commDataUpdate("PublicHouseUseage",vm.DepPublicHouseEditInfo,null,"roomid",vm.DepPublicHouseKeyValue).then(function(result){
                result ? reloadDepPublicHouseTable() : null;
            });
        }
        vm.DepPublicHouseDelete = function(index){
            var deldata = $rootScope.DepPublicHouseList_data[index];
            DataMgtService.commDataDelete("PublicHouseUseage","roomid",deldata["roomid"]).then(function(result){
                result ? reloadDepPublicHouseTable() : null;
            });
        }
        vm.DepPublicHouseEditGoback = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["DepPublicHouseMgtTable","DepPublicHouseTable"],true,true);
        }
        vm.DepPublicHouseAdSearchInfo= {data : [{field:"",keywords:"",condition:"="}]};
        vm.DepPublicHouseAdSearchField = [{value:"roomid",name:"房间编号"},{value:"depname",name:"使用单位"},{value:"usedirective",name:"用途"}];
        vm.showAdSearch = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AdSearch"],!vm.pageshow.AdSearch,false);
        }
        vm.DepPublicHouseAdSearchGo = function(){
            vm.getDepPublicHouseOption = {"datasetname":"PublicHouseUseage","search":vm.DepPublicHouseAdSearchInfo.data};
            reloadDepPublicHouseTable()
        }
        vm.ResetDepPublicHouseAdSearch = function(){
            vm.getDepPublicHouseOption = {"datasetname":"PublicHouseUseage","search":null};
            reloadDepPublicHouseTable()
        }
        vm.exportDepPublicHouseUseageInfo= function(){
            DataMgtService.commDataExportExcel(vm.getDepPublicHouseOption.datasetname,vm.getDepPublicHouseOption.search);
        }
    }];

var EmployeeManageController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,$filter){
        var vm = $scope;
        vm.pageshow = {EmployeeMgtTable:true,EmployeeTable:true,EmployeeEdit:false,AdSearch:false,dataimport:false};
        $scope.Employee_dtColumns= null;
        $scope.Employee_dtOptions= null;
        $rootScope.EmployeeList_dtInstance = null;
        $rootScope.EmployeeList_data = null;
        vm.EmployeeEditInfo = {};
        vm.getEmployeeOption = null;
        var loadEmployeeList = function(){
            tableService.initSimpleDTColumn("Employee",0).then(function(result){
                $scope.Employee_dtColumns = result;
                $scope.Employee_dtColumns.push(DTColumnBuilder.newColumn(null)
                    .withTitle('操作').notSortable().withOption('width','150px')
                    .renderWith(function actionsHtml(data, type, full, meta) {
                        var returnstr =
                            "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                                "<button class=\"btn btn-error btn-xs\" ng-click=\"cloneEmployee(\'" + meta.row + "\')\">复制</button>"+
                                "<button class=\"btn btn-success btn-xs\" ng-click=\"EmployeeInfoModify(\'" + meta.row + "\')\">修改</button>"+
                                "<button class=\"btn btn-danger btn-xs\" ng-click=\"EmployeeDelete(\'" + meta.row + "\')\">删除</button>"
                        "</div>";
                        return returnstr;
                    }));
                var search = [];
                vm.getEmployeeOption = {"datasetname":"Employee","search":search};
                $scope.Employee_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                    data.baseinfo = $scope._id;
                    data.AskString = angular.toJson(vm.getEmployeeOption);
                    data.remark = systemname;
                },"EmployeeListTable","EmployeeList_dtInstance","EmployeeList_data")
                    .withOption('createdRow', function(row, data, dataIndex) {
                        $compile(angular.element(row).contents())($scope);
                    });
                $scope.pageshow = setObjectPropsToValue($scope.pageshow,["EmployeeMgtTable","EmployeeTable"],true,true);
            });
            formService.formFieldOptions("Employee").then(function(result){
                $scope.EmployeeEditSchema = result;
                $scope.EmployeeEditForm = [
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"key": "UserName","htmlClass": "col-xs-4"},
                            {"key": "UserID","htmlClass": "col-xs-4"},
                            {
                                "key": "DepId","htmlClass": "col-xs-4",type: "select",titleMap:[],onChange:function(modelValue,form) {
                                var depname = $filter('filter')(vm.deplist, {value: modelValue})[0].name;
                                vm.EmployeeEditInfo.depName = depname;
                            }},
                            {"key": "Sex","htmlClass": "col-xs-4","type": "select",titleMap: [
                                { value: "男", name: "男" },
                                { value: "女", name: "女" }
                            ]},
                            {"key": "tel","htmlClass": "col-xs-4"},
                            {"key": "notes","htmlClass": "col-xs-12"}
                        ]},
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '保存',onClick:"saveStudent()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"StudentEditGoback()" }
                        ]
                        ,condition: "NowStudentAdd == false"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '添加',onClick:"insertStudent()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"StudentEditGoback()" }
                        ]
                        ,condition: "NowStudentAdd == true"
                    }
                ];
                InitDepartmentSets();
            });
        }

        loadEmployeeList();
        vm.getDepBykey = function(key){
            var search = [];
            search.push({field:"depName",keywords:key,condition:"like"});
            return DataMgtService.commDataListGet("Department",search).then(function(result){
                return result;
            })
        }
        vm.DepSelected = function(){

        }
        var InitDepartmentSets = function () {
            DataMgtService.commGetDic("Department","depId","depName",null).then(function(result){
                if (result != null){
                    vm.deplist = result;
                    vm.EmployeeEditForm = setObjectFieldToValue(vm.EmployeeEditForm,"key","DepId","titleMap",result);
                }
            });
        };
        vm.getJobpostBykey = function(key){
            var search = [];
            search.push({field:"value",keywords:key,condition:"like"});
            return DataMgtService.commDataListGet("jobpost",search).then(function(result){
                return result;
            })
        }
        vm.getPositiontitleBykey = function(key){
            var search = [];
            search.push({field:"value",keywords:key,condition:"like"});
            return DataMgtService.commDataListGet("positiontitle",search).then(function(result){
                return result;
            })
        }

        vm.AddEmployee = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["EmployeeMgtTable","EmployeeEdit"],true,true);
            vm.NowEmployeeAdd = true;
            vm.EmployeeEditInfo = {};
        };
        vm.EmployeeInfoModify = function(index){
            vm.EmployeeKeyValue =  $rootScope.EmployeeList_data[index]["employeeNo"];
            DataMgtService.commDataDetailGet("Employee","employeeNo",vm.EmployeeKeyValue).then(function(result){
                if (result!=null){
                    vm.EmployeeEditInfo = result;
                    vm.pageshow = setObjectPropsToValue(vm.pageshow,["EmployeeMgtTable","EmployeeEdit"],true,true);
                    vm.NowEmployeeAdd = false;
                }
            });
        };
        var reloadEmployeeTable = function(){
            $rootScope.EmployeeList_dtInstance.reloadData();
            $scope.EmployeeEditGoback();
        }
        $scope.saveEmployee = function(){
            DataMgtService.commDataUpdate("Employee",vm.EmployeeEditInfo,null,"employeeNo",$scope.EmployeeKeyValue).then(function(result){
                result ? reloadEmployeeTable() : null;
            });
        }
        $scope.cloneEmployee = function(index){
            var clonedata = $rootScope.EmployeeList_data[index];
            DataMgtService.commDataClone("Employee","employeeNo",clonedata["employeeNo"]).then(function(result){
                result ? reloadEmployeeTable() : null;
            });
        }
        $scope.insertEmployee = function(){
            DataMgtService.commDataInsert("Employee",vm.EmployeeEditInfo).then(function(result){
                result ? reloadEmployeeTable() : null;
            });
        }
        $scope.EmployeeDelete = function(index){
            var deldata = $rootScope.EmployeeList_data[index];
            DataMgtService.commDataDelete("Employee","employeeNo",deldata["employeeNo"]).then(function(result){
                result ? reloadEmployeeTable() : null;
            });
        }
        vm.EmployeeEditGoback = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["EmployeeMgtTable","EmployeeTable"],true,true);
        }
        vm.EmployeeAdSearchInfo= {data : [{field:"",keywords:"",condition:"="}]};
        vm.EmployeeAdSearchField = [{value:"depName",name:"部门"},{value:"jobpost",name:"职务"},{value:"positionTitle",name:"职称"},{value:"userName",name:"姓名"},{value:"Education",name:"学历"}];
        vm.showAdSearch = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AdSearch"],!vm.pageshow.AdSearch,false);
        }
        vm.EmployeeAdSearchGo = function(){
            vm.getEmployeeOption = {"datasetname":"Employee","search":vm.EmployeeAdSearchInfo.data};
            reloadEmployeeTable()
        }
        vm.ResetEmployeeAdSearch = function(){
            vm.getEmployeeOption = {"datasetname":"Employee","search":null};
            reloadEmployeeTable()
        }

        vm.exportEmployeeInfo = function(){
            DataMgtService.commDataExportExcel(vm.getEmployeeOption.datasetname,vm.getEmployeeOption.search);
        }
        $scope.importdataset = "Employee";
        vm.importEmployeeInfo = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["dataimport"],true,true);
        }
    }];

var DepartmentManageController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm){
        var vm = $scope;
        vm.pageshow = {DepartmentMgtTable:true,DepartmentTable:true,DepartmentEdit:false,AdSearch:false,dataimport:false};
        $scope.Department_dtColumns= null;
        $scope.Department_dtOptions= null;
        $rootScope.DepartmentList_dtInstance = null;
        $rootScope.DepartmentList_data = null;
        vm.DepartmentEditInfo = {};
        vm.getDepartmentOption = null;
        var loadDepartmentList = function(){
            tableService.initSimpleDTColumn("Department",0).then(function(result){
                $scope.Department_dtColumns = result;
                $scope.Department_dtColumns.push(DTColumnBuilder.newColumn(null)
                    .withTitle('操作').notSortable().withOption('width','150px')
                    .renderWith(function actionsHtml(data, type, full, meta) {
                        var returnstr =
                            "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                                "<button class=\"btn btn-error btn-xs\" ng-click=\"cloneDepartment(\'" + meta.row + "\')\">复制</button>"+
                                "<button class=\"btn btn-success btn-xs\" ng-click=\"DepartmentInfoModify(\'" + meta.row + "\')\">修改</button>"+
                                "<button class=\"btn btn-danger btn-xs\" ng-click=\"DepartmentDelete(\'" + meta.row + "\')\">删除</button>"
                        "</div>";
                        return returnstr;
                    }));
                var search = [];
                vm.getDepartmentOption = {"datasetname":"Department","search":search};
                $scope.Department_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                    data.baseinfo = $scope._id;
                    data.AskString = angular.toJson(vm.getDepartmentOption);
                    data.remark = systemname;
                },"DepartmentListTable","DepartmentList_dtInstance","DepartmentList_data")
                    .withOption('createdRow', function(row, data, dataIndex) {
                        $compile(angular.element(row).contents())($scope);
                    });
                $scope.pageshow = setObjectPropsToValue($scope.pageshow,["DepartmentMgtTable","DepartmentTable"],true,true);
            });
            formService.formFieldOptions("Department").then(function(result){
                $scope.DepartmentEditSchema = result;
                $scope.DepartmentEditForm = [
                    {
                        "type": "section", "htmlClass": "row",
                        "items": [
                            { "type": "section", "htmlClass": "col-xs-6", "items": ["depId"] },
                            { "type": "section", "htmlClass": "col-xs-6", "items": ["depName"] },
                            { "type": "select", "htmlClass": "col-xs-6", "key": "depAttribute",
                                titleMap:[{value:"行政工作",name:"行政工作"},{value:"党务部门",name:"党务部门"},{value:"教学单位",name:"教学单位"},{value:"科研机构",name:"科研机构"}] },
                            { "type": "section", "htmlClass": "col-xs-6", "items": ["createTime"] }
                        ]
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '保存',onClick:"saveDepartment()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"DepartmentEditGoback()" }
                        ]
                        ,condition: "NowDepartmentAdd == false"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '添加',onClick:"insertDepartment()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"DepartmentEditGoback()" }
                        ]
                        ,condition: "NowDepartmentAdd == true"
                    }
                ];
            });
        }

        loadDepartmentList();

        vm.AddDepartment = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["DepartmentMgtTable","DepartmentEdit"],true,true);
            vm.NowDepartmentAdd = true;
            vm.DepartmentEditInfo = {};
        };

        vm.DepartmentInfoModify = function(index){
            vm.DepartmentKeyValue =  $rootScope.DepartmentList_data[index]["depId"];
            DataMgtService.commDataDetailGet("Department","depId",vm.DepartmentKeyValue).then(function(result){
                if (result!=null){
                    vm.DepartmentEditInfo = result;
                    vm.pageshow = setObjectPropsToValue(vm.pageshow,["DepartmentMgtTable","DepartmentEdit"],true,true);
                    vm.NowDepartmentAdd = false;
                }
            });
        };
        var reloadDepartmentTable = function(){
            $rootScope.DepartmentList_dtInstance.reloadData();
            $scope.DepartmentEditGoback();
        }
        $scope.saveDepartment = function(){
            DataMgtService.commDataUpdate("Department",vm.DepartmentEditInfo,null,"depId",$scope.DepartmentKeyValue).then(function(result){
                result ? reloadDepartmentTable() : null;
            });
        }
        $scope.cloneDepartment = function(index){
            var clonedata = $rootScope.DepartmentList_data[index];
            DataMgtService.commDataClone("Department","depId",clonedata["depId"]).then(function(result){
                result ? reloadDepartmentTable() : null;
            });
        }
        $scope.insertDepartment = function(){
            DataMgtService.commDataInsert("Department",vm.DepartmentEditInfo).then(function(result){
                result ? reloadDepartmentTable() : null;
            });
        }
        $scope.DepartmentDelete = function(index){
            var deldata = $rootScope.DepartmentList_data[index];
            DataMgtService.commDataDelete("Department","depId",deldata["depId"]).then(function(result){
                result ? reloadDepartmentTable() : null;
            });
        }
        vm.DepartmentEditGoback = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["DepartmentMgtTable","DepartmentTable"],true,true);
        }
        vm.exportDepartmentInfo = function(){
            DataMgtService.commDataExportExcel(vm.getDepartmentOption.datasetname,vm.getDepartmentOption.search);
        }
        $scope.importdataset = "Department";
        vm.importDepartmentInfo = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["dataimport"],true,true);
        }
    }];
//	StudentManageMgt
var StudentManageController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,$filter){
        var vm = $scope;
        vm.pageshow = {StudentMgtTable:true,StudentTable:true,StudentEdit:false,AdSearch:false,dataimport:false};
        $scope.Student_dtColumns= null;
        $scope.Student_dtOptions= null;
        $rootScope.StudentList_dtInstance = null;
        $rootScope.StudentList_data = null;
        vm.StudentEditInfo = {};
        vm.getStudentOption = null;
        var loadStudentList = function(){
            tableService.initSimpleDTColumn("Student",0).then(function(result){
                $scope.Student_dtColumns = result;
                $scope.Student_dtColumns.push(DTColumnBuilder.newColumn(null)
                    .withTitle('操作').notSortable().withOption('width','150px')
                    .renderWith(function actionsHtml(data, type, full, meta) {
                        var returnstr =
                            "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                                "<button class=\"btn btn-error btn-xs\" ng-click=\"cloneStudent(\'" + meta.row + "\')\">复制</button>"+
                                "<button class=\"btn btn-success btn-xs\" ng-click=\"StudentInfoModify(\'" + meta.row + "\')\">修改</button>"+
                                "<button class=\"btn btn-danger btn-xs\" ng-click=\"StudentDelete(\'" + meta.row + "\')\">删除</button>"
                        "</div>";
                        return returnstr;
                    }));
                var search = [];
                vm.getStudentOption = {"datasetname":"Student","search":search};
                $scope.Student_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                    data.baseinfo = $scope._id;
                    data.AskString = angular.toJson(vm.getStudentOption);
                    data.remark = systemname;
                },"StudentListTable","StudentList_dtInstance","StudentList_data")
                    .withOption('createdRow', function(row, data, dataIndex) {
                        $compile(angular.element(row).contents())($scope);
                    });
                $scope.pageshow = setObjectPropsToValue($scope.pageshow,["StudentMgtTable","StudentTable"],true,true);
            });
            formService.formFieldOptions("Student").then(function(result){
                $scope.StudentEditSchema = result;
                $scope.StudentEditForm = [
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"key": "UserName","htmlClass": "col-xs-4"},
                            {"key": "UserID","htmlClass": "col-xs-4"},
                            {
                                "key": "DepId","htmlClass": "col-xs-4",type: "select",titleMap:[],onChange:function(modelValue,form) {
                                var depname = $filter('filter')(vm.deplist, {value: modelValue})[0].name;
                                vm.StudentEditInfo.depName = depname;
                            }},
                            {"key": "Sex","htmlClass": "col-xs-4","type": "select",titleMap: [
                                { value: "男", name: "男" },
                                { value: "女", name: "女" }
                            ]},
                            {"key": "tel","htmlClass": "col-xs-4"},
                            {"key": "notes","htmlClass": "col-xs-12"}
                        ]},
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '保存',onClick:"saveStudent()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"StudentEditGoback()" }
                        ]
                        ,condition: "NowStudentAdd == false"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '添加',onClick:"insertStudent()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"StudentEditGoback()" }
                        ]
                        ,condition: "NowStudentAdd == true"
                    }
                ];
                InitDepartmentSets();

            });
        }

        loadStudentList();
        vm.getDepBykey = function(key){
            var search = [];
            search.push({field:"depName",keywords:key,condition:"like"});
            return DataMgtService.commDataListGet("Department",search).then(function(result){
                vm.deplist = result;
                return result;
            })
        }
        var InitDepartmentSets = function () {
            DataMgtService.commGetDic("Department","depId","depName",null).then(function(result){
                if (result != null){
                    vm.deplist = result;
                    vm.StudentEditForm = setObjectFieldToValue(vm.StudentEditForm,"key","DepId","titleMap",result);
                }
            });
        };
        vm.AddStudent = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["StudentMgtTable","StudentEdit"],true,true);
            vm.NowStudentAdd = true;
            vm.StudentEditInfo = {};
        };

        vm.StudentInfoModify = function(index){
            vm.StudentKeyValue =  $rootScope.StudentList_data[index]["StuNo"];
            DataMgtService.commDataDetailGet("Student","StuNo",vm.StudentKeyValue).then(function(result){
                if (result!=null){
                    vm.StudentEditInfo = result;
                    vm.pageshow = setObjectPropsToValue(vm.pageshow,["StudentMgtTable","StudentEdit"],true,true);
                    vm.NowStudentAdd = false;
                }
            });
        };
        var reloadStudentTable = function(){
            $rootScope.StudentList_dtInstance.reloadData();
            $scope.StudentEditGoback();
        }
        $scope.saveStudent = function(){
            DataMgtService.commDataUpdate("Student",vm.StudentEditInfo,null,"StuNo",$scope.StudentKeyValue).then(function(result){
                result ? reloadStudentTable() : null;
            });
        }
        $scope.cloneStudent = function(index){
            var clonedata = $rootScope.StudentList_data[index];
            DataMgtService.commDataClone("Student","depId",clonedata["StuNo"]).then(function(result){
                result ? reloadStudentTable() : null;
            });
        }
        $scope.insertStudent = function(){
            DataMgtService.commDataInsert("Student",vm.StudentEditInfo).then(function(result){
                result ? reloadStudentTable() : null;
            });
        }
        $scope.StudentDelete = function(index){
            var deldata = $rootScope.StudentList_data[index];
            DataMgtService.commDataDelete("Student","StuNo",deldata["StuNo"]).then(function(result){
                result ? reloadStudentTable() : null;
            });
        }
        vm.StudentEditGoback = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["StudentMgtTable","StudentTable"],true,true);
        }
        vm.StudentAdSearchInfo= {data : [{field:"",keywords:"",condition:"="}]};
        vm.StudentAdSearchField = [{value:"depName",name:"部门"},{value:"Major",name:"专业"},{value:"StuName",name:"姓名"},{value:"StuNo",name:"学号"}];
        vm.showAdSearch = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AdSearch"],!vm.pageshow.AdSearch,false);
        }
        vm.StudentAdSearchGo = function(){
            vm.getStudentOption = {"datasetname":"Student","search":vm.StudentAdSearchInfo.data};
            reloadStudentTable()
        }
        vm.ResetStudentAdSearch = function(){
            vm.getStudentOption = {"datasetname":"Student","search":null};
            reloadStudentTable()
        }

        vm.exportStudentInfo = function(){
            DataMgtService.commDataExportExcel(vm.getStudentOption.datasetname,vm.getStudentOption.search);
        }
        $scope.importdataset = "Student";
        vm.importStudentInfo = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["dataimport"],true,true);
        }
    }];

var ExtEmployeeManageController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm){
        var vm = $scope;
        vm.pageshow = {ExtEmployeeMgtTable:true,ExtEmployeeTable:true,ExtEmployeeEdit:false,AdSearch:false,dataimport:false};
        $scope.ExtEmployee_dtColumns= null;
        $scope.ExtEmployee_dtOptions= null;
        $rootScope.ExtEmployeeList_dtInstance = null;
        $rootScope.ExtEmployeeList_data = null;
        vm.ExtEmployeeEditInfo = {};
        vm.getExtEmployeeOption = null;
        var loadExtEmployeeList = function(){
            tableService.initSimpleDTColumn("ExtEmployee",0).then(function(result){
                $scope.ExtEmployee_dtColumns = result;
                $scope.ExtEmployee_dtColumns.push(DTColumnBuilder.newColumn(null)
                    .withTitle('操作').notSortable().withOption('width','150px')
                    .renderWith(function actionsHtml(data, type, full, meta) {
                        var returnstr =
                            "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                                "<button class=\"btn btn-error btn-xs\" ng-click=\"cloneExtEmployee(\'" + meta.row + "\')\">复制</button>"+
                                "<button class=\"btn btn-success btn-xs\" ng-click=\"ExtEmployeeInfoModify(\'" + meta.row + "\')\">修改</button>"+
                                "<button class=\"btn btn-danger btn-xs\" ng-click=\"ExtEmployeeDelete(\'" + meta.row + "\')\">删除</button>"
                        "</div>";
                        return returnstr;
                    }));
                var search = [];
                vm.getExtEmployeeOption = {"datasetname":"ExtEmployee","search":search};
                $scope.ExtEmployee_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                    data.baseinfo = $scope._id;
                    data.AskString = angular.toJson(vm.getExtEmployeeOption);
                    data.remark = systemname;
                },"ExtEmployeeListTable","ExtEmployeeList_dtInstance","ExtEmployeeList_data")
                    .withOption('createdRow', function(row, data, dataIndex) {
                        $compile(angular.element(row).contents())($scope);
                    });
                $scope.pageshow = setObjectPropsToValue($scope.pageshow,["ExtEmployeeMgtTable","ExtEmployeeTable"],true,true);
            });
            formService.formFieldOptions("ExtEmployee").then(function(result){
                $scope.ExtEmployeeEditSchema = result;
                $scope.ExtEmployeeEditForm = [
                    {
                        "type": "template",
                        "template": '<div class="alert alert-info">当前处理的是【楼栋：{{model.buildNo}}】【楼层：{{model.floorNo}}】房间信息！当前编号：{{model.employeeNo}}</div>'
                    },
                    {"type": "section","htmlClass": "row","items":[
                        {"type": "select","htmlClass": "col-md-4","key": "buildNo",titleMap: [],onChange: "buildNoSelected()"},
                        {"type": "select","htmlClass": "col-md-4","key": "floorNo",titleMap: []}],
                        condition: "NowExtEmployeeAdd == true"
                    },
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"type": "section","htmlClass": "col-xs-4","items": [{key:"extEmployeeNo",onChange: function(modelValue,form) {
                                vm.ExtEmployeeEditInfo.extEmployeeNo = vm.roomEditInfo.buildNo + '-'+vm.roomEditInfo.floorNo+'-'+modelValue
                            }}]},
                            {"type": "section","htmlClass": "col-xs-4","items": ["unitNo"]}
                        ]
                    },
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"type": "section","htmlClass": "col-xs-4","items": ["area"]},
                            {"type": "section","htmlClass": "col-xs-4","items": ["usageArea"]},
                            {"type": "select","htmlClass": "col-xs-4","key": "usageType",titleMap: [
                                { value: "教师周转房", name: "职工住房" },
                                { value: "公有用房", name: "公有用房" },
                                { value: "学生公寓", name: "学生公寓" },
                                { value: "经营性用房", name: "商业服务用房" }
                            ]}
                        ]
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '保存',onClick:"saveExtEmployee()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"ExtEmployeeEditGoback()" }
                        ]
                        ,condition: "NowExtEmployeeAdd == false"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '添加',onClick:"insertExtEmployee()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"ExtEmployeeEditGoback()" }
                        ]
                        ,condition: "NowExtEmployeeAdd == true"
                    }
                ];
                InitBuildingSets();
            });
        }
        var InitBuildingSets = function () {
            DataMgtService.commGetDic("Building","buildNo","name",null).then(function(result){
                if (result != null){
                    vm.ExtEmployeeEditForm = setObjectFieldToValue(vm.ExtEmployeeEditForm,"key","buildNo","titleMap",result);
                }
            });
        };

        vm.buildNoSelected = function(){
            var search = [];
            DataMgtService.commGetDicFromArray("BuildingFloor","buildNo",vm.ExtEmployeeEditInfo.buildNo,"floorNo","floorNo",search).then(function(result){
                if (result != null){
                    vm.ExtEmployeeEditForm = setObjectFieldToValue(vm.ExtEmployeeEditForm,"key","floorNo","titleMap",result);
                }
            });
        }

        loadExtEmployeeList();

        vm.AddExtEmployee = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["ExtEmployeeMgtTable","ExtEmployeeEdit"],true,true);
            vm.NowExtEmployeeAdd = true;
            vm.ExtEmployeeEditInfo = {};
        };

        vm.ExtEmployeeInfoModify = function(index){
            vm.ExtEmployeeKeyValue =  $rootScope.ExtEmployeeList_data[index]["extEmployeeNo"];
            DataMgtService.commDataDetailGet("ExtEmployee","extEmployeeNo",vm.ExtEmployeeKeyValue).then(function(result){
                if (result!=null){
                    vm.ExtEmployeeEditInfo = result;
                    vm.pageshow = setObjectPropsToValue(vm.pageshow,["ExtEmployeeMgtTable","ExtEmployeeEdit"],true,true);
                    vm.NowExtEmployeeAdd = false;
                }
            });
        };
        var reloadExtEmployeeTable = function(){
            $rootScope.ExtEmployeeList_dtInstance.reloadData();
            $scope.ExtEmployeeEditGoback();
        }
        $scope.saveExtEmployee = function(){
            DataMgtService.commDataUpdate("ExtEmployee",vm.ExtEmployeeEditInfo,null,"extEmployeeNo",$scope.ExtEmployeeKeyValue).then(function(result){
                result ? reloadExtEmployeeTable() : null;
            });
        }
        $scope.cloneExtEmployee = function(index){
            var clonedata = $rootScope.ExtEmployeeList_data[index];
            DataMgtService.commDataClone("ExtEmployee","extEmployeeNo",clonedata["extEmployeeNo"]).then(function(result){
                result ? reloadExtEmployeeTable() : null;
            });
        }
        $scope.insertExtEmployee = function(){
            DataMgtService.commDataInsert("ExtEmployee",vm.ExtEmployeeEditInfo).then(function(result){
                result ? reloadExtEmployeeTable() : null;
            });
        }
        $scope.ExtEmployeeDelete = function(index){
            var deldata = $rootScope.ExtEmployeeList_data[index];
            DataMgtService.commDataDelete("ExtEmployee","extEmployeeNo",deldata["extEmployeeNo"]).then(function(result){
                result ? reloadExtEmployeeTable() : null;
            });
        }
        vm.ExtEmployeeEditGoback = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["ExtEmployeeMgtTable","ExtEmployeeTable"],true,true);
        }
        vm.ExtEmployeeAdSearchInfo= {data : [{field:"",keywords:"",condition:"="}]};
        vm.ExtEmployeeAdSearchField = [{value:"buildNo",name:"楼栋"},{value:"floorNo",name:"楼层"},{value:"unitNo",name:"单元"},{value:"usageType",name:"用途"},{value:"area",name:"建筑面积"}];
        vm.showAdSearch = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AdSearch"],!vm.pageshow.AdSearch,false);
        }
        vm.ExtEmployeeAdSearchGo = function(){
            vm.getExtEmployeeOption = {"datasetname":"ExtEmployee","search":vm.ExtEmployeeAdSearchInfo.data};
            reloadExtEmployeeTable()
        }
        vm.ResetExtEmployeeAdSearch = function(){
            vm.getExtEmployeeOption = {"datasetname":"ExtEmployee","search":null};
            reloadExtEmployeeTable()
        }

        vm.exportExtEmployeeInfo = function(){
            DataMgtService.commDataExportExcel(vm.getExtEmployeeOption.datasetname,vm.getExtEmployeeOption.search);
        }
        $scope.importdataset = "ExtEmployee";
        vm.importExtEmployeeInfo = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["dataimport"],true,true);
        }
    }];

var CommercialHouseManageController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm){
        var vm = $scope;
        vm.pageshow = {CommercialHouseMgtTable:true,CommercialHouseTable:true,CommercialHouseEdit:false,AdSearch:false,dataimport:false};
        $scope.CommercialHouse_dtColumns= null;
        $scope.CommercialHouse_dtOptions= null;
        $rootScope.CommercialHouseList_dtInstance = null;
        $rootScope.CommercialHouseList_data = null;
        vm.CommercialHouseEditInfo = {};
        vm.getCommercialHouseOption = null;
        var loadCommercialHouseList = function(){
            tableService.initSimpleDTColumn("CommercialHouse",0).then(function(result){
                $scope.CommercialHouse_dtColumns = result;
                $scope.CommercialHouse_dtColumns.push(DTColumnBuilder.newColumn(null)
                    .withTitle('操作').notSortable().withOption('width','150px')
                    .renderWith(function actionsHtml(data, type, full, meta) {
                        var returnstr =
                            "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                                "<button class=\"btn btn-error btn-xs\" ng-click=\"cloneCommercialHouse(\'" + meta.row + "\')\">复制</button>"+
                                "<button class=\"btn btn-success btn-xs\" ng-click=\"CommercialHouseInfoModify(\'" + meta.row + "\')\">修改</button>"+
                                "<button class=\"btn btn-danger btn-xs\" ng-click=\"CommercialHouseDelete(\'" + meta.row + "\')\">删除</button>"
                        "</div>";
                        return returnstr;
                    }));
                var search = [];
                vm.getCommercialHouseOption = {"datasetname":"CommercialHouse","search":search};
                $scope.CommercialHouse_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                    data.baseinfo = $scope._id;
                    data.AskString = angular.toJson(vm.getCommercialHouseOption);
                    data.remark = systemname;
                },"CommercialHouseListTable","CommercialHouseList_dtInstance","CommercialHouseList_data")
                    .withOption('createdRow', function(row, data, dataIndex) {
                        $compile(angular.element(row).contents())($scope);
                    });
                $scope.pageshow = setObjectPropsToValue($scope.pageshow,["CommercialHouseMgtTable","CommercialHouseTable"],true,true);
            });
            formService.formFieldOptions("CommercialHouse").then(function(result){
                $scope.CommercialHouseEditSchema = result;
                $scope.CommercialHouseEditForm = [
                    {
                        "type": "template",
                        "template": '<div class="alert alert-info">当前处理的是【楼栋：{{model.buildNo}}】【楼层：{{model.floorNo}}】房间信息！当前编号：{{model.employeeNo}}</div>'
                    },
                    {"type": "section","htmlClass": "row","items":[
                        {"type": "select","htmlClass": "col-md-4","key": "buildNo",titleMap: [],onChange: "buildNoSelected()"},
                        {"type": "select","htmlClass": "col-md-4","key": "floorNo",titleMap: []}],
                        condition: "NowCommercialHouseAdd == true"
                    },
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"type": "section","htmlClass": "col-xs-4","items": [{key:"roomid",onChange: function(modelValue,form) {
                                vm.CommercialHouseEditInfo.CommercialHouseNo = vm.roomEditInfo.buildNo + '-'+vm.roomEditInfo.floorNo+'-'+modelValue
                            }}]},
                            {"type": "section","htmlClass": "col-xs-4","items": ["unitNo"]}
                        ]
                    },
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"type": "section","htmlClass": "col-xs-4","items": ["area"]},
                            {"type": "section","htmlClass": "col-xs-4","items": ["usageArea"]},
                            {"type": "select","htmlClass": "col-xs-4","key": "usageType",titleMap: [
                                { value: "教师周转房", name: "职工住房" },
                                { value: "公有用房", name: "公有用房" },
                                { value: "学生公寓", name: "学生公寓" },
                                { value: "经营性用房", name: "商业服务用房" }
                            ]}
                        ]
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '保存',onClick:"saveCommercialHouse()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"CommercialHouseEditGoback()" }
                        ]
                        ,condition: "NowCommercialHouseAdd == false"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '添加',onClick:"insertCommercialHouse()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"CommercialHouseEditGoback()" }
                        ]
                        ,condition: "NowCommercialHouseAdd == true"
                    }
                ];
                InitBuildingSets();
            });
        }
        var InitBuildingSets = function () {
            DataMgtService.commGetDic("Building","buildNo","name",null).then(function(result){
                if (result != null){
                    vm.CommercialHouseEditForm = setObjectFieldToValue(vm.CommercialHouseEditForm,"key","buildNo","titleMap",result);
                }
            });
        };

        vm.buildNoSelected = function(){
            var search = [];
            DataMgtService.commGetDicFromArray("BuildingFloor","buildNo",vm.CommercialHouseEditInfo.buildNo,"floorNo","floorNo",search).then(function(result){
                if (result != null){
                    vm.CommercialHouseEditForm = setObjectFieldToValue(vm.CommercialHouseEditForm,"key","floorNo","titleMap",result);
                }
            });
        }

        loadCommercialHouseList();

        vm.AddCommercialHouse = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["CommercialHouseMgtTable","CommercialHouseEdit"],true,true);
            vm.NowCommercialHouseAdd = true;
            vm.CommercialHouseEditInfo = {};
        };

        vm.CommercialHouseInfoModify = function(index){
            vm.CommercialHouseKeyValue =  $rootScope.CommercialHouseList_data[index]["roomid"];
            DataMgtService.commDataDetailGet("CommercialHouse","roomid",vm.CommercialHouseKeyValue).then(function(result){
                if (result!=null){
                    vm.CommercialHouseEditInfo = result;
                    vm.pageshow = setObjectPropsToValue(vm.pageshow,["CommercialHouseMgtTable","CommercialHouseEdit"],true,true);
                    vm.NowCommercialHouseAdd = false;
                }
            });
        };
        var reloadCommercialHouseTable = function(){
            $rootScope.CommercialHouseList_dtInstance.reloadData();
            $scope.CommercialHouseEditGoback();
        }
        $scope.saveCommercialHouse = function(){
            DataMgtService.commDataUpdate("CommercialHouse",vm.CommercialHouseEditInfo,null,"roomid",$scope.CommercialHouseKeyValue).then(function(result){
                result ? reloadCommercialHouseTable() : null;
            });
        }
        $scope.cloneCommercialHouse = function(index){
            var clonedata = $rootScope.CommercialHouseList_data[index];
            DataMgtService.commDataClone("CommercialHouse","roomid",clonedata["roomid"]).then(function(result){
                result ? reloadCommercialHouseTable() : null;
            });
        }
        $scope.insertCommercialHouse = function(){
            DataMgtService.commDataInsert("CommercialHouse",vm.CommercialHouseEditInfo).then(function(result){
                result ? reloadCommercialHouseTable() : null;
            });
        }
        $scope.CommercialHouseDelete = function(index){
            var deldata = $rootScope.CommercialHouseList_data[index];
            DataMgtService.commDataDelete("CommercialHouse","roomid",deldata["roomid"]).then(function(result){
                result ? reloadCommercialHouseTable() : null;
            });
        }
        vm.CommercialHouseEditGoback = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["CommercialHouseMgtTable","CommercialHouseTable"],true,true);
        }
        vm.CommercialHouseAdSearchInfo= {data : [{field:"",keywords:"",condition:"="}]};
        vm.CommercialHouseAdSearchField = [{value:"buildNo",name:"楼栋"},{value:"floorNo",name:"楼层"},{value:"unitNo",name:"单元"},{value:"usageType",name:"用途"},{value:"area",name:"建筑面积"}];
        vm.showAdSearch = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AdSearch"],!vm.pageshow.AdSearch,false);
        }
        vm.CommercialHouseAdSearchGo = function(){
            vm.getCommercialHouseOption = {"datasetname":"CommercialHouse","search":vm.CommercialHouseAdSearchInfo.data};
            reloadCommercialHouseTable()
        }
        vm.ResetCommercialHouseAdSearch = function(){
            vm.getCommercialHouseOption = {"datasetname":"CommercialHouse","search":null};
            reloadCommercialHouseTable()
        }

        vm.exportCommercialHouseInfo = function(){
            DataMgtService.commDataExportExcel(vm.getCommercialHouseOption.datasetname,vm.getCommercialHouseOption.search);
        }
        $scope.importdataset = "CommercialHouse";
        vm.importCommercialHouseInfo = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["dataimport"],true,true);
        }
    }];

var PublicAreaInfoController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm){
        var vm = $scope;
        vm.pageshow = {PublicAreaInfoMgtTable:true,PublicAreaInfoTable:true,PublicAreaInfoEdit:false,AdSearch:false,dataimport:false};
        $scope.PublicAreaInfo_dtColumns= null;
        $scope.PublicAreaInfo_dtOptions= null;
        $rootScope.PublicAreaInfoList_dtInstance = null;
        $rootScope.PublicAreaInfoList_data = null;
        vm.PublicAreaInfoEditInfo = {};
        vm.getPublicAreaInfoOption = null;
        var loadPublicAreaInfoList = function(){
            tableService.initSimpleDTColumn("PublicAreaInfo",0).then(function(result){
                $scope.PublicAreaInfo_dtColumns = result;
                $scope.PublicAreaInfo_dtColumns.push(DTColumnBuilder.newColumn(null)
                    .withTitle('操作').notSortable().withOption('width','150px')
                    .renderWith(function actionsHtml(data, type, full, meta) {
                        var returnstr =
                            "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                                "<button class=\"btn btn-success btn-xs\" ng-click=\"PublicAreaInfoInfoModify(\'" + meta.row + "\')\">修改</button>"+
                                "<button class=\"btn btn-danger btn-xs\" ng-click=\"PublicAreaInfoDelete(\'" + meta.row + "\')\">删除</button>"
                        "</div>";
                        return returnstr;
                    }));
                var search = [];
                vm.getPublicAreaInfoOption = {"datasetname":"PublicAreaInfo","search":search};
                $scope.PublicAreaInfo_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                    data.baseinfo = $scope._id;
                    data.AskString = angular.toJson(vm.getPublicAreaInfoOption);
                    data.remark = systemname;
                },"PublicAreaInfoListTable","PublicAreaInfoList_dtInstance","PublicAreaInfoList_data")
                    .withOption('createdRow', function(row, data, dataIndex) {
                        $compile(angular.element(row).contents())($scope);
                    });
                $scope.pageshow = setObjectPropsToValue($scope.pageshow,["PublicAreaInfoMgtTable","PublicAreaInfoTable"],true,true);
            });
            formService.formFieldOptions("PublicAreaInfo").then(function(result){
                $scope.PublicAreaInfoEditSchema = result;
                $scope.PublicAreaInfoEditForm = [
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"type": "section","htmlClass": "col-xs-4","items": ["AreaName"]},
                            {"type": "section","htmlClass": "col-xs-4","items": ["AreaRange"]},
                            {"type": "section","htmlClass": "col-xs-4","items": ["remarks"]}
                        ]
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '保存',onClick:"savePublicAreaInfo()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"PublicAreaInfoEditGoback()" }
                        ]
                        ,condition: "NowPublicAreaInfoAdd == false"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '添加',onClick:"insertPublicAreaInfo()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"PublicAreaInfoEditGoback()" }
                        ]
                        ,condition: "NowPublicAreaInfoAdd == true"
                    }
                ];
            });
        }



        loadPublicAreaInfoList();

        vm.AddPublicAreaInfo = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["PublicAreaInfoMgtTable","PublicAreaInfoEdit"],true,true);
            vm.NowPublicAreaInfoAdd = true;
            vm.PublicAreaInfoEditInfo = {};
        };

        vm.PublicAreaInfoInfoModify = function(index){
            vm.PublicAreaInfoKeyValue =  $rootScope.PublicAreaInfoList_data[index]["_id"];
            DataMgtService.commDataDetailGet("PublicAreaInfo","_id",vm.PublicAreaInfoKeyValue).then(function(result){
                if (result!=null){
                    vm.PublicAreaInfoEditInfo = result;
                    vm.pageshow = setObjectPropsToValue(vm.pageshow,["PublicAreaInfoMgtTable","PublicAreaInfoEdit"],true,true);
                    vm.NowPublicAreaInfoAdd = false;
                }
            });
        };
        var reloadPublicAreaInfoTable = function(){
            $rootScope.PublicAreaInfoList_dtInstance.reloadData();
            $scope.PublicAreaInfoEditGoback();
        }
        $scope.savePublicAreaInfo = function(){
            DataMgtService.commDataUpdate("PublicAreaInfo",vm.PublicAreaInfoEditInfo,null,"_id",$scope.PublicAreaInfoKeyValue).then(function(result){
                result ? reloadPublicAreaInfoTable() : null;
            });
        }
        $scope.clonePublicAreaInfo = function(index){
            var clonedata = $rootScope.PublicAreaInfoList_data[index];
            DataMgtService.commDataClone("PublicAreaInfo","_id",clonedata["_id"]).then(function(result){
                result ? reloadPublicAreaInfoTable() : null;
            });
        }
        $scope.insertPublicAreaInfo = function(){
            DataMgtService.commDataInsert("PublicAreaInfo",vm.PublicAreaInfoEditInfo).then(function(result){
                result ? reloadPublicAreaInfoTable() : null;
            });
        }
        $scope.PublicAreaInfoDelete = function(index){
            var deldata = $rootScope.PublicAreaInfoList_data[index];
            DataMgtService.commDataDelete("PublicAreaInfo","_id",deldata["_id"]).then(function(result){
                result ? reloadPublicAreaInfoTable() : null;
            });
        }
        vm.PublicAreaInfoEditGoback = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["PublicAreaInfoMgtTable","PublicAreaInfoTable"],true,true);
        }
        vm.PublicAreaInfoAdSearchInfo= {data : [{field:"",keywords:"",condition:"="}]};
        vm.PublicAreaInfoAdSearchField = [{value:"AreaName",name:"区域名称"},{value:"AreaRange",name:"地理范围"},{value:"remarks",name:"备注"}];
        vm.showAdSearch = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AdSearch"],!vm.pageshow.AdSearch,false);
        }
        vm.PublicAreaInfoAdSearchGo = function(){
            vm.getPublicAreaInfoOption = {"datasetname":"PublicAreaInfo","search":vm.PublicAreaInfoAdSearchInfo.data};
            reloadPublicAreaInfoTable()
        }
        vm.ResetPublicAreaInfoAdSearch = function(){
            vm.getPublicAreaInfoOption = {"datasetname":"PublicAreaInfo","search":null};
            reloadPublicAreaInfoTable()
        }

        vm.exportPublicAreaInfoInfo = function(){
            DataMgtService.commDataExportExcel(vm.getPublicAreaInfoOption.datasetname,vm.getPublicAreaInfoOption.search);
        }
        $scope.importdataset = "PublicAreaInfo";
        vm.importPublicAreaInfoInfo = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["dataimport"],true,true);
        }
    }];

//新闻内容管理
var NewsCenterController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService){

        var myDate = new Date();
        myDate.toLocaleString( );        //获取日期与时间
        var time = new Date().Format("yyyy-MM-dd hh:mm:ss");

        var loginhistory = localStorageService.get(systemname+'LoginInfo');

        $scope.NewsCenter_dtColumns= null;
        $scope.NewsCenter_dtOptions= null;
        $rootScope.NewsCenter_dtInstance = null;
        $rootScope.NewsCenter_data = null;
        //var search = [];
        //search.push({field:"ItemType",keywords:"公共设施报修",condition:"="});

        tableService.initSimpleDTColumn("NewsCenter",0).then(function(result){
            $scope.NewsCenter_dtColumns = result;
            $scope.NewsCenter_dtColumns.push(DTColumnBuilder.newColumn(null)
                .withTitle('操作').notSortable()
                .renderWith(function actionsHtml(data, type, full, meta) {
                    var returnstr =
                        "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                            "<button class=\"btn btn-success btn-xs\" ng-click=\"NewsCenterModify(\'" + meta.row + "\')\">修改</button>"+
                            "<button class=\"btn btn-danger btn-xs\" ng-click=\"NewsCenterDelete(\'" + meta.row + "\')\">删除</button>"
                    "</div>";
                    return returnstr;
                }));
            var getNewsCenterOption = {"datasetname":"NewsCenter","search":""};
            $scope.NewsCenter_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                data.baseinfo = $scope._id;
                data.AskString = angular.toJson(getNewsCenterOption);
                data.remark = systemname;
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
                            { value: "采购公告", name: "采购公告" },
                            { value: "采购结果公示", name: "采购结果公示" },
                            { value: "工作动态", name: "工作动态" },
                            { value: "政策法规", name: "政策法规" },
                            { value: "规章制度", name: "规章制度" },
                            { value: "常用下载", name: "常用下载" }
                        ]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["title"]},
                        {"type": "section","htmlClass": "col-xs-4","items": ["summary"]},
                        {"type": "section","htmlClass": "col-xs-12","items": [{key:"t_content",config:"richEditor",height:"300"}]}
                    ]
                },
                {type: "actions",
                    items: [
                        { type: 'button', style: 'btn-success', title: '保存',onClick:"saveNewsCenter()"},
                        { type: 'button', style: 'btn-info', title: '取消', onClick:"NewsCenterGoback()" }
                    ]
                    ,condition: "NowNewsCenterAdd == false"
                },
                {type: "actions",
                    items: [
                        { type: 'button', style: 'btn-success', title: '添加',onClick:"insertNewsCenter()"},
                        { type: 'button', style: 'btn-info', title: '取消', onClick:"NewsCenterGoback()" }
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
            $scope.NewsCenterInfoModel.createtime=myDate;
            $scope.NewsCenterInfoModel.UserID=loginhistory.authUserid;
            $scope.NewsCenterInfoModel.creator=loginhistory.username;
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

//耗材供应信息管理
var ConsumInfoController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm){
        var vm = $scope;
        vm.pageshow = {ConsumInfoMgtTable:false,ConsumInfoTable:true,ConsumInfoEdit:false,AdSearch:false,dataimport:false,CannotDoThis:true};
        $scope.ConsumInfo_dtColumns= null;
        $scope.ConsumInfo_dtOptions= null;
        $rootScope.ConsumInfoList_dtInstance = null;
        $rootScope.ConsumInfoList_data = null;
        vm.ConsumInfoEditInfo = {};
        vm.getConsumInfoOption = null;

        $scope.supplierInfo = {};
        $scope.CannotDothis = true;

        vm.userType = "";
        var initSupplierInfo = function(){
            var loginhistory = localStorageService.get(systemname+'LoginInfo');
            if (loginhistory != null){
                var uid = loginhistory.authUserid;
                vm.userType = loginhistory.authtype;
                if (vm.userType == "供应商"){
                    $http.get("/ReturnPurchase/GetSupplierContractDetail?baseinfo="+loginhistory._id+"&AskString="+uid).then(function(result){
                        if (result.data != ""){
                            vm.supplierInfo = result.data;
                            loadConsumInfoList();
                        }
                    })
                }
                else {
                    loadConsumInfoList();
                }
            }
        }
        vm.search = [];
        var initActionRule = function(usertype){
            if (usertype == "供应商"){
                vm.search = [{field:"supplier",keywords:vm.supplierInfo.orgidentify,condition:"="}];
            }
            else {
                vm.search = [{field:"supplier",keywords:vm.supplierInfo.orgidentify,condition:"="}];
            }

        }


        var loadConsumInfoList = function(){
            tableService.initSimpleDTColumn("ConsumInfo",0).then(function(result){
                $scope.ConsumInfo_dtColumns = result;
                $scope.ConsumInfo_dtColumns.push(DTColumnBuilder.newColumn(null)
                    .withTitle('操作').notSortable().withOption('width','150px')
                    .renderWith(function actionsHtml(data, type, full, meta) {
                        var returnstr =
                            "<div ng-show=\"userType == '供应商'\" class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                                "<button class=\"btn btn-success btn-xs\" ng-click=\"ConsumInfoInfoModify(\'" + meta.row + "\')\">修改</button>"+
                                "<button class=\"btn btn-danger btn-xs\" ng-click=\"ConsumInfoDelete(\'" + meta.row + "\')\">删除</button>"
                        "</div>";
                        return returnstr;
                    }));
                var search = [];
                if (vm.userType == "供应商"){
                    search.push({field:"supplier",keywords:vm.supplierInfo.orgidentify,condition:"="});
                }
                vm.getConsumInfoOption = {"datasetname":"ConsumInfo","search":search};
                $scope.ConsumInfo_dtOptions = tableService.initAjaxServerTableOptions("/ReturnData/commDataPageListGet",function (data) {
                    data.baseinfo = $scope._id;
                    data.AskString = angular.toJson(vm.getConsumInfoOption);
                    data.remark = systemname;
                },"ConsumInfoListTable","ConsumInfoList_dtInstance","ConsumInfoList_data")
                    .withOption('createdRow', function(row, data, dataIndex) {
                        $compile(angular.element(row).contents())($scope);
                    });
                $scope.pageshow = setObjectPropsToValue($scope.pageshow,["ConsumInfoMgtTable","ConsumInfoTable"],true,true);
            });
            formService.formFieldOptions("ConsumInfo").then(function(result){
                $scope.ConsumInfoEditSchema = result;
                $scope.ConsumInfoEditForm = [
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"name","fieldAddonLeft": "耗材名称",notitle: true}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"specification","fieldAddonLeft": "规格型号",notitle: true}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"price","fieldAddonLeft": "单价",notitle: true}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"PriceUnit","fieldAddonLeft": "计价单位",notitle: true}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"SupplyTime","fieldAddonLeft": "供货时长",notitle: true}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"CreatorName","fieldAddonLeft": "生产厂商",notitle: true}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"contactuname","fieldAddonLeft": "联系人",notitle: true}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"contactuphone","fieldAddonLeft": "联系电话",notitle: true}]}
                        ]
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '保存',onClick:"saveConsumInfo()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"ConsumInfoEditGoback()" }
                        ]
                        ,condition: "NowConsumInfoAdd == false"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '添加',onClick:"insertConsumInfo()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"ConsumInfoEditGoback()" }
                        ]
                        ,condition: "NowConsumInfoAdd == true"
                    }
                ];
            });
        }
        initSupplierInfo();
        vm.AddConsumInfo = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["ConsumInfoMgtTable","ConsumInfoEdit"],true,true);
            vm.NowConsumInfoAdd = true;
            vm.ConsumInfoEditInfo = {};
        };

        vm.ConsumInfoInfoModify = function(index){
            vm.ConsumInfoKeyValue =  $rootScope.ConsumInfoList_data[index]["_id"];
            DataMgtService.commDataDetailGet("ConsumInfo","_id",vm.ConsumInfoKeyValue).then(function(result){
                if (result!=null){
                    vm.ConsumInfoEditInfo = result;
                    vm.pageshow = setObjectPropsToValue(vm.pageshow,["ConsumInfoMgtTable","ConsumInfoEdit"],true,true);
                    vm.NowConsumInfoAdd = false;
                }
            });
        };
        var reloadConsumInfoTable = function(){
            $rootScope.ConsumInfoList_dtInstance.reloadData();
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["ConsumInfoMgtTable","ConsumInfoTable"],true,true);
        }
        $scope.saveConsumInfo = function(){
            DataMgtService.commDataUpdate("ConsumInfo",vm.ConsumInfoEditInfo,null,"_id",$scope.ConsumInfoKeyValue).then(function(result){
                result ? reloadConsumInfoTable() : null;
            });
        }
        $scope.cloneConsumInfo = function(index){
            var clonedata = $rootScope.ConsumInfoList_data[index];
            DataMgtService.commDataClone("ConsumInfo","_id",clonedata["_id"]).then(function(result){
                result ? reloadConsumInfoTable() : null;
            });
        }
        $scope.insertConsumInfo = function(){
            DataMgtService.commDataInsert("ConsumInfo",vm.ConsumInfoEditInfo).then(function(result){
                result ? reloadConsumInfoTable() : null;
            });
        }
        vm.ConsumInfoDelete = function(index){
            var deldata = $rootScope.ConsumInfoList_data[index];
            DataMgtService.commDataDelete("ConsumInfo","_id",deldata["_id"]).then(function(result){
                result ? reloadConsumInfoTable() : null;
            });
        }
        vm.ConsumInfoEditGoback = function(){
            reloadConsumInfoTable();
        }
        vm.ConsumInfoAdSearchInfo= {data : [{field:"",keywords:"",condition:"="}]};
        vm.ConsumInfoAdSearchField = [{value:"buildNo",name:"楼栋"},{value:"floorNo",name:"楼层"},{value:"unitNo",name:"单元"},{value:"usageType",name:"用途"},{value:"area",name:"建筑面积"}];
        vm.showAdSearch = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AdSearch"],!vm.pageshow.AdSearch,false);
        }
        vm.ConsumInfoAdSearchGo = function(){
            vm.getConsumInfoOption = {"datasetname":"ConsumInfo","search":vm.ConsumInfoAdSearchInfo.data};
            reloadConsumInfoTable()
        }
        vm.ResetConsumInfoAdSearch = function(){
            vm.getConsumInfoOption = {"datasetname":"ConsumInfo","search":null};
            reloadConsumInfoTable()
        }

        vm.exportConsumInfoInfo = function(){
            DataMgtService.commDataExportExcel(vm.getConsumInfoOption.datasetname,vm.getConsumInfoOption.search);
        }
        $scope.importdataset = "ConsumInfo";
        vm.importConsumInfoInfo = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["dataimport"],true,true);
        }
    }];


//耗材供贷历史查询
var ConsumHistroyController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){

        var vm = $scope;

        var myDate = new Date();
        myDate.toLocaleString( );        //获取日期与时间
        vm.nowtime = new Date().Format("yyyy-MM-dd hh:mm:ss");





        //通用初始化
        vm.showoption = {};
        var loginhistory = localStorageService.get(systemname+'LoginInfo');
        vm.userid = loginhistory["authUserid"];
        vm.username = loginhistory["username"];
        vm.userdid = loginhistory["userdid"];
        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        vm.OtherEditInfo = {};
        vm.NowZZFInfo = null;
        vm.NowZFInfo = null;
        vm.NowRCFInfo = null;
        vm.ChooseTeacherHouseInfo = null;
        vm.userdetail = null;

        vm.dataset = "ConsumSupplyReg";

        vm.showoption.tabletype="AjaxServer";
        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        vm.showoption.initSearch =[{field:"authUserid",keywords: vm.userid ,condition:"="}];

        vm.showoption.ExtendEditForm = [
            {"type": "section","htmlClass": " row","items":[

                {"type": "section","htmlClass": "col-xs-6","items": ["AcceptDepID"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["AcceptDepName"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["AcceptWorkerID"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["AcceptWorker"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["Applier"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["ApplierName"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["name"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["price"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["count"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["invoiceNum"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["supplier"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["supplierName"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["specification"]}
            ]}
        ];


        vm.showoption.InsertBefore = function () {
            return vm.CommDataEditInfo;
        };

        vm.showoption.MainAction = [
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出使用信息"},
            {ButtonType:"btn-success",actionFuncName:"importCommDataInfo",actionName:"导入使用信息"},
            {ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}];

        vm.showoption.nowTableActions = [
            {ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionTitle:"修改",actionName:"修改"},
            {ButtonType:"btn-danger",actionFuncName:"CommDataDelete",actionTitle:"删除",actionName:"删除"}
        ];
        vm.showoption.needrefresh="refresh";

    }];


//耗材供货屏蔽项管理
var CanNotRegisterConsumInfoController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){

        var vm = $scope;

        var myDate = new Date();
        myDate.toLocaleString( );        //获取日期与时间
        vm.nowtime = new Date().Format("yyyy-MM-dd hh:mm:ss");

        //通用初始化
        vm.showoption = {};
        var loginhistory = localStorageService.get(systemname+'LoginInfo');
        vm.userid = loginhistory["authUserid"];
        vm.username = loginhistory["username"];
        vm.userdid = loginhistory["userdid"];
        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        vm.OtherEditInfo = {};
        vm.NowZZFInfo = null;
        vm.NowZFInfo = null;
        vm.NowRCFInfo = null;
        vm.ChooseTeacherHouseInfo = null;
        vm.userdetail = null;

        vm.dataset = "CanNotRegisterConsumInfo";

        vm.tabletype="AjaxServer";
        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        vm.showoption.initSearch = [];

        vm.showoption.ExtendEditForm = [
            {"type": "section","htmlClass": " row","items":[
                {"type": "section","htmlClass": "col-xs-6","items": ["name"]}
            ]}
        ];

        vm.showoption.InsertBefore = function () {
            vm.CommDataEditInfo.UserID = vm.userid;
            vm.CommDataEditInfo.UserName = vm.username;
            return vm.CommDataEditInfo;
        };

        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加屏蔽项"}];

        vm.showoption.nowTableActions = [
            {ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionTitle:"修改",actionName:"修改"},
            {ButtonType:"btn-danger",actionFuncName:"CommDataDelete",actionTitle:"删除",actionName:"删除"}
        ];
        vm.showoption.needrefresh="refresh";

    }];


//耗材供货登记管理
var ConsumSupplyRegController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm){
        var vm = $scope;
        vm.pageshow = {ConsumSupplyRegMgtTable:false,ConsumSupplyRegTable:true,ConsumSupplyRegEdit:false,ConsumSupplyAcceptedTable:false,AdSearch:false,dataimport:false,CannotDoThis:true};
        $scope.ConsumSupplyReg_dtColumns= null;
        $scope.ConsumSupplyReg_dtOptions= null;
        $rootScope.ConsumSupplyRegList_dtInstance = null;
        $rootScope.ConsumSupplyRegList_data = null;
        $scope.ConsumSupplyAccepted_dtColumns= null;
        $scope.ConsumSupplyAccepted_dtOptions= null;
        $rootScope.ConsumSupplyAcceptedList_dtInstance = null;
        $rootScope.ConsumSupplyAcceptedList_data = null;
        vm.ConsumSupplyRegEditInfo = {};
        vm.getConsumSupplyRegOption = null;
        vm.getConsumSupplyAcceptedOption = null;

        $scope.supplierInfo = {};
        $scope.CannotDothis = true;

        vm.userType = "";
        vm.userdepinfo = "";
        vm.doing = 0;
        vm.hased = 0;
        var initSupplierInfo = function(){
            var loginhistory = localStorageService.get(systemname+'LoginInfo');
            if (loginhistory != null){
                vm.uid = loginhistory.authUserid;
                vm.uname = loginhistory.username;
                vm.userType = loginhistory.authtype;
                if (vm.userType == "供应商"){
                    $http.get("/ReturnPurchase/GetSupplierContractDetail?baseinfo="+loginhistory._id+"&AskString="+vm.uid).then(function(result){
                        if (result.data != ""){
                            $scope.supplierInfo = result.data;
                            loadConsumSupplyRegList();
                        }
                    })
                }
                else {
                    DataMgtService.commDataDetailGet("Department","depid",loginhistory.userdid.replace(/(^\s*)|(\s*$)/g, "")).then(function(result){
                        vm.userdepinfo = result;
                        loadConsumSupplyRegList();
                    });
                }
            }
        }
        vm.search = [];
        vm.ConsumSupplyReg_dtColumns = [];
        vm.ConsumSupplyAccepted_dtColumns = [];
        vm.showdoing = false;
        var initActionRule = function(usertype){
            vm.ConsumSupplyRegEditInfo = {};
            if (usertype == "供应商"){
                vm.search = [{field:"supplier",keywords:vm.supplierInfo.orgidentify,condition:"="}];
                vm.ConsumSupplyRegEditInfo.supplier = vm.supplierInfo.orgidentify;
                vm.ConsumSupplyRegEditInfo.supplierName = vm.supplierInfo.orgname;
            }
            else {
                vm.search = [{field:"AcceptWorkerID",keywords:vm.uid,condition:"="}];
                vm.ConsumSupplyRegEditInfo.AcceptDepID = vm.userdepinfo.depid;
                vm.ConsumSupplyRegEditInfo.AcceptDepName = vm.userdepinfo.depname;
                vm.ConsumSupplyRegEditInfo.AcceptWorkerID = vm.uid;
                vm.ConsumSupplyRegEditInfo.AcceptWorker = vm.uname;
            }
            vm.ConsumSupplyRegEditInfo.Applier = vm.uid;
            vm.ConsumSupplyRegEditInfo.ApplierName = vm.uname;
        }

        var initStaticInfo = function(usertype){
            var search = [];
            var doingSearch = [];
            var hasedSearch = [];
            if (usertype == "供应商"){
                search = [{field:"supplier",keywords:vm.supplierInfo.orgidentify,condition:"="}];
            }
            else {
                search = [{field:"AcceptWorkerID",keywords:vm.uid,condition:"="}];
            }
            doingSearch = search.slice(0);
            doingSearch.push({forerelation:"AND",field:"status",keywords:"已验收",condition:"!="});
            hasedSearch = search.slice(0);
            hasedSearch.push({forerelation:"AND",field:"status",keywords:"已验收",condition:"="});
            DataMgtService.commDataStatic("ConsumSupplyReg",doingSearch).then(function(result){
                vm.doing = result;
            });
            DataMgtService.commDataStatic("ConsumSupplyReg",hasedSearch).then(function(result){
                vm.hased = result;
            });
        }


        var loadConsumSupplyRegList = function(){
            initActionRule(vm.userType);
            initStaticInfo(vm.userType);
            vm.NowInfo = "待验收";
            vm.showdoing = true;
            vm.ConsumSupplyReg_dtColumns = [
                DTColumnBuilder.newColumn(null)
                    .withTitle('<input type="checkbox" ng-model="checkboxes.checkedAll" ng-click="toggleAll()">').notSortable()
                    .renderWith(function actionsHtml(data, type, full, meta) {
                        return '<input type="checkbox" ng-click="toggleOne('+ meta.row +')" ng-model="checkboxes.items['+ meta.row +']">';
                    })];
            if (vm.userType != "供应商"){
                vm.ConsumSupplyReg_dtColumns.push(
                    DTColumnBuilder.newColumn('name').withTitle('耗材'),
                    DTColumnBuilder.newColumn('price').withTitle('价格'),
                    DTColumnBuilder.newColumn('PriceUnit').withTitle('价格单位'),
                    DTColumnBuilder.newColumn('count').withTitle('数量'),
                    DTColumnBuilder.newColumn('supplierName').withTitle('供货商'),
                    DTColumnBuilder.newColumn('SupplyDate').withTitle('发货日期').withOption('defaultContent', ' '));
            }
            else {
                vm.ConsumSupplyReg_dtColumns.push(
                    DTColumnBuilder.newColumn('name').withTitle('耗材'),
                    DTColumnBuilder.newColumn('price').withTitle('价格'),
                    DTColumnBuilder.newColumn('count').withTitle('数量'),
                    DTColumnBuilder.newColumn('PriceUnit').withTitle('价格单位'),
                    DTColumnBuilder.newColumn('AcceptDepName').withTitle('接收单位'),
                    DTColumnBuilder.newColumn('AcceptWorker').withTitle('接收人'),
                    DTColumnBuilder.newColumn('SupplyDate').withTitle('发货日期').withOption('defaultContent', ' '));
            }

            if (vm.userType != "供应商"){
                vm.ConsumSupplyAccepted_dtColumns.push(
                    DTColumnBuilder.newColumn('name').withTitle('耗材'),
                    DTColumnBuilder.newColumn('price').withTitle('价格'),
                    DTColumnBuilder.newColumn('PriceUnit').withTitle('价格单位'),
                    DTColumnBuilder.newColumn('count').withTitle('数量'),
                    DTColumnBuilder.newColumn('supplierName').withTitle('供货商'),
                    DTColumnBuilder.newColumn('SupplyDate').withTitle('发货日期'),
                    DTColumnBuilder.newColumn('AcceptedFlag').withTitle('验收单号').withOption('defaultContent', ' '));
            }
            else {
                vm.ConsumSupplyAccepted_dtColumns.push(
                    DTColumnBuilder.newColumn('name').withTitle('耗材'),
                    DTColumnBuilder.newColumn('price').withTitle('价格'),
                    DTColumnBuilder.newColumn('count').withTitle('数量'),
                    DTColumnBuilder.newColumn('PriceUnit').withTitle('价格单位'),
                    DTColumnBuilder.newColumn('AcceptDepName').withTitle('接收单位'),
                    DTColumnBuilder.newColumn('AcceptWorker').withTitle('接收人'),
                    DTColumnBuilder.newColumn('SupplyDate').withTitle('发货日期'),
                    DTColumnBuilder.newColumn('AcceptedFlag').withTitle('验收单号').withOption('defaultContent', ' '));
            }

            $scope.ConsumSupplyReg_dtColumns.push(DTColumnBuilder.newColumn(null)
                .withTitle('操作').notSortable().withOption('width','150px')
                .renderWith(function actionsHtml(data, type, full, meta) {
                    var returnstr =
                        "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                            "<button ng-show=\"showdoing\"  class=\"btn btn-success btn-xs\" ng-click=\"ConsumSupplyRegInfoModify(\'" + meta.row + "\')\">修改</button>"+
                            "<button ng-show=\"userType != '供应商' && showdoing\" class=\"btn btn-primary btn-xs\" ng-click=\"AcceptSupply(\'" + meta.row + "\')\">验收</button>"+
                            "<button ng-show=\"showdoing\"  class=\"btn btn-danger btn-xs\" ng-click=\"ConsumSupplyRegDelete(\'" + meta.row + "\')\">删除</button>"+
                            "</div>";
                    return returnstr;
                }));

            $scope.ConsumSupplyAccepted_dtColumns.push(DTColumnBuilder.newColumn(null)
                .withTitle('操作').notSortable().withOption('width','150px')
                .renderWith(function actionsHtml(data, type, full, meta) {
                    var returnstr =
                        "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                            "<button ng-show=\"!showdoing\" class=\"btn btn-danger btn-xs\" ng-click=\"PrintConsumOpen(\'" + data.AcceptedFlag + "\')\">打印</button>"+
                            "</div>";
                    return returnstr;
                }));

            vm.checkboxes = { 'checkedAll': false, items: [] ,values: [], 'checkedNum' : 0};

            vm.toggleAll = function(){
                //$scope.checkboxes.checkedAll = !$scope.checkboxes.checkedAll;
                vm.checkboxes.checkedNum = 0;
                angular.forEach(vm.checkboxes.items,function(data,index){
                    vm.checkboxes.items[index] = vm.checkboxes.checkedAll;
                });
                if (vm.checkboxes.checkedAll)
                    vm.checkboxes.checkedNum = vm.checkboxes.items.length;
            }

            vm.toggleOne = function(index){
                if (vm.checkboxes.items[index])
                    vm.checkboxes.checkedNum = vm.checkboxes.checkedNum +1;
                else
                    vm.checkboxes.checkedNum = vm.checkboxes.checkedNum -1;
                if (vm.checkboxes.checkedNum == vm.checkboxes.items.length)
                    vm.checkboxes.checkedAll = true;
                else
                    vm.checkboxes.checkedAll = false;
            }

            vm.search.push({forerelation:"AND",field:"status",keywords:"已验收",condition:"!="});
            vm.getConsumSupplyRegOption = {"datasetname":"ConsumSupplyReg","search":vm.search};
            vm.ConsumSupplyReg_dtOptions = tableService.initAjaxServerTableOptions("/ReturnData/commDataPageListGet",function (data) {
                data.baseinfo = vm._id;
                data.AskString = angular.toJson(vm.getConsumSupplyRegOption);
                data.remark = systemname;
            },"ConsumSupplyRegListTable","ConsumSupplyRegList_dtInstance","ConsumSupplyRegList_data")
                .withOption('preDrawCallback', function(oSettings) {
                    if (oSettings.bAjaxDataGet)
                        $scope.checkboxes = { 'checkedAll': false, items: [] ,values: [], 'checkedNum' : 0};
                    if (oSettings.json != undefined && oSettings.json != null){
                        $rootScope["ConsumSupplyRegList_data"] = oSettings.json.data;
                    }
                })
                .withOption('headerCallback', function(header) {
                    if (!$scope.headerCompiled) {
                        $scope.headerCompiled = true;
                        $compile(angular.element(header).contents())($scope);
                    }
                })
                .withOption('createdRow', function(row, data, dataIndex) {
                    $scope.checkboxes.items[dataIndex] = false;
                    $scope.checkboxes.values[dataIndex] = data._id;
                    $compile(angular.element(row).contents())($scope);
                    $scope.$apply();
                });
            vm.getConsumSupplyAcceptedOption = {"datasetname":"ConsumSupplyReg","search":[{forerelation:"AND",field:"status",keywords:"已验收",condition:"="}]};
            vm.ConsumSupplyAccepted_dtOptions = tableService.initAjaxServerTableOptions("/ReturnData/commDataPageListGet",function (data) {
                data.baseinfo = vm._id;
                data.AskString = angular.toJson(vm.getConsumSupplyAcceptedOption);
                data.remark = systemname;
            },"ConsumSupplyAcceptedListTable","ConsumSupplyAcceptedList_dtInstance","ConsumSupplyAcceptedList_data")
                .withOption('createdRow', function(row, data, dataIndex) {
                    $compile(angular.element(row).contents())($scope);
                    $scope.$apply();
                });
            $scope.pageshow = setObjectPropsToValue(vm.pageshow,["ConsumSupplyRegMgtTable","ConsumSupplyRegTable"],true,true);
            formService.formFieldOptions("ConsumSupplyReg").then(function(result){
                vm.ConsumSupplyRegEditSchema = result;
                vm.ConsumSupplyRegEditForm = [
                    {
                        "type": "template",
                        "template": '<div class="alert alert-info">当前耗材接收单位：【{{model.AcceptDepName}}】，接收（验收人）人：【{{model.AcceptWorker}}】</div>'
                        ,condition: "userType != '供应商'"
                    },
                    {
                        "type": "template",
                        "template": '<div class="alert alert-info">当前耗材供货单位：【{{model.supplierName}}】，机构代码：【{{model.supplier}}】</div>'
                        ,condition: "userType == '供应商'"
                    },
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"name","fieldAddonLeft": "耗材名称",notitle: true,
                                "typeahead": "m as m.name+'('+ m.specification+')' for m in evalExpr(\"getConsumByKey(modelValue)\",{'modelValue':$viewValue})",
                                "typeaheadOnSelect": "evalExpr(\"ConsumSelected()\")"}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"specification","fieldAddonLeft": "规格型号",notitle: true}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"price","fieldAddonLeft": "单价",notitle: true}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"count","fieldAddonLeft": "数量",notitle: true}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"PriceUnit","fieldAddonLeft": "计价单位",notitle: true}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"SupplyDate","fieldAddonLeft": "发货日期",notitle: true}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"CreatorName","fieldAddonLeft": "生产厂商",notitle: true}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"invoiceNum","fieldAddonLeft": "发票号",notitle: true}]}
                        ]
                    },
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"supplier","fieldAddonLeft": "供货商机构代码",notitle: true,
                                "typeahead": "m as m.name+'('+ m.value+')' for m in evalExpr(\"getOrgByKey(modelValue)\",{'modelValue':$viewValue})",
                                "typeaheadOnSelect": "evalExpr(\"supplierSelected()\")"}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"supplierName","fieldAddonLeft": "供货商名称",notitle: true,
                                "typeahead": "m as m.name+'('+ m.value+')' for m in evalExpr(\"getOrgByKey(modelValue)\",{'modelValue':$viewValue})",
                                "typeaheadOnSelect": "evalExpr(\"supplierNameSelected()\")"}]}
                        ],condition: "userType != '供应商'"
                    },
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"AcceptDepName","fieldAddonLeft": "接收单位",notitle: true,
                                "typeahead": "m as m.name for m in evalExpr(\"getdeplist(modelValue)\",{'modelValue':$viewValue})",
                                "typeaheadOnSelect": "evalExpr(\"depSelected()\")"}]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{key:"AcceptWorker","fieldAddonLeft": "接收人",notitle: true,
                                "typeahead": "m as m.name+'('+m.value+')' for m in evalExpr(\"getUserByKey(modelValue)\",{'modelValue':$viewValue})",
                                "typeaheadOnSelect": "evalExpr(\"userSelected()\")"
                            }]}
                        ],condition: "userType == '供应商'"
                    },
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"type": "section","htmlClass": "col-xs-12","items": [{key:"remark","fieldAddonLeft": "备注",notitle: true}]}
                        ]
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '保存',onClick:"saveConsumSupplyReg(SupplyRegForm)"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"ConsumSupplyRegEditGoback()" }
                        ]
                        ,condition: "NowConsumSupplyRegAdd == false"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '添加',onClick:"insertConsumSupplyReg(SupplyRegForm)"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"ConsumSupplyRegEditGoback()" }
                        ]
                        ,condition: "NowConsumSupplyRegAdd == true"
                    }
                ];
            });
        }

        vm.loadConsumSupplyList = function(type){
            initActionRule(vm.userType);
            if (type == "hased"){
                vm.search.push({forerelation:"AND",field:"status",keywords:"已验收",condition:"="});
                vm.showdoing = false;
                $scope.pageshow = setObjectPropsToValue(vm.pageshow,["ConsumSupplyRegMgtTable","ConsumSupplyAcceptedTable"],true,true);
                vm.NowInfo = "已验收";
                vm.getConsumSupplyAcceptedOption = {"datasetname":"ConsumSupplyReg","search":vm.search};
                if ($scope.ConsumSupplyAccepted_dtOptions != null && $scope.ConsumSupplyAccepted_dtOptions != undefined && $rootScope.ConsumSupplyAcceptedList_dtInstance != null){
                    $rootScope.ConsumSupplyAcceptedList_dtInstance.reloadData();
                }
            }
            if (type == "reg"){
                vm.search.push({forerelation:"AND",field:"status",keywords:"已验收",condition:"!="});
                vm.showdoing = true;
                vm.NowInfo = "待验收";
                vm.getConsumSupplyRegOption = {"datasetname":"ConsumSupplyReg","search":vm.search};
                if ($scope.ConsumSupplyReg_dtOptions != null && $scope.ConsumSupplyReg_dtOptions != undefined){
                    $rootScope.ConsumSupplyRegList_dtInstance.reloadData();
                }
                $scope.pageshow = setObjectPropsToValue(vm.pageshow,["ConsumSupplyRegMgtTable","ConsumSupplyRegTable"],true,true);
            }

        }

        initSupplierInfo();
        vm.getdeplist = function(key) {
            var search = [];
            search.push({field:"depname",keywords:key,condition:"like"});
            return DataMgtService.commGetDic("Department","depid","depname",search).then(function(result){
                return result;
            });
        };
        vm.depSelected = function(){
            vm.ConsumSupplyRegEditInfo.AcceptDepID = vm.ConsumSupplyRegEditInfo.AcceptDepName.value;
            vm.ConsumSupplyRegEditInfo.AcceptDepName = vm.ConsumSupplyRegEditInfo.AcceptDepName.name;
            vm.ConsumSupplyRegEditInfo.AcceptWorkerID = "";
            vm.ConsumSupplyRegEditInfo.AcceptWorker = "";
        }
        vm.getUserByKey = function(key) {
            var search = [];
            search.push({field:"username",keywords:key,condition:"like"});
            if (vm.ConsumSupplyRegEditInfo.AcceptDepID != null && vm.ConsumSupplyRegEditInfo.AcceptDepID != undefined && vm.ConsumSupplyRegEditInfo.AcceptDepID != ""){
                search.push({field:"depid",keywords:vm.ConsumSupplyRegEditInfo.AcceptDepID,condition:"left like",forerelation:"AND"});
            }
            return DataMgtService.commGetDic("Workers","userid","username",search).then(function(result){
                return result;
            });
        };
        vm.userSelected = function(){
            vm.ConsumSupplyRegEditInfo.AcceptWorkerID = vm.ConsumSupplyRegEditInfo.AcceptWorker.value;
            vm.ConsumSupplyRegEditInfo.AcceptWorker = vm.ConsumSupplyRegEditInfo.AcceptWorker.name;
        }
        vm.getOrgByKey = function(key) {
            var search = [];
            search.push({field:"orgname",keywords:key,condition:"like"});
            search.push({forerelation:"OR",field:"orgidentify",keywords:key,condition:"like"});
            return DataMgtService.commGetDic("SupplierOrgs","orgidentify","orgname",search).then(function(result){
                return result;
            });
        };
        vm.supplierSelected = function(){
            vm.ConsumSupplyRegEditInfo.supplierName = vm.ConsumSupplyRegEditInfo.supplier.name;
            vm.ConsumSupplyRegEditInfo.supplier = vm.ConsumSupplyRegEditInfo.supplier.value;
        }
        vm.supplierNameSelected = function(){
            vm.ConsumSupplyRegEditInfo.supplier = vm.ConsumSupplyRegEditInfo.supplierName.value;
            vm.ConsumSupplyRegEditInfo.supplierName = vm.ConsumSupplyRegEditInfo.supplierName.name;
        }
        vm.getConsumByKey = function(key) {
            var search = [];
            if (vm.userType == "供应商"){
                search.push({"join":"AND","0":[{field:"supplier",keywords:vm.supplierInfo.orgidentify,condition:"="}],
                    "1":[{field:"name",keywords:key,condition:"like"},
                        {field:"specification",keywords:key,condition:"like",forerelation:"OR"}]
                });
            }
            else{
                search.push({field:"name",keywords:key,condition:"like"});
                search.push({field:"specification",keywords:key,condition:"like",forerelation:"OR"});
            }
            return DataMgtService.commDataListGet("ConsumInfo",search).then(function(result){
                return result;
            });
        };
        vm.ConsumSelected = function(){
            vm.ConsumSupplyRegEditInfo.specification = vm.ConsumSupplyRegEditInfo.name.specification;
            vm.ConsumSupplyRegEditInfo.price = vm.ConsumSupplyRegEditInfo.name.price;
            vm.ConsumSupplyRegEditInfo.PriceUnit = vm.ConsumSupplyRegEditInfo.name.PriceUnit;
            vm.ConsumSupplyRegEditInfo.CreatorName = vm.ConsumSupplyRegEditInfo.name.CreatorName;
            vm.ConsumSupplyRegEditInfo.supplier = vm.ConsumSupplyRegEditInfo.name.supplier;
            vm.ConsumSupplyRegEditInfo.supplierName = vm.ConsumSupplyRegEditInfo.name.supplierName;
            vm.ConsumSupplyRegEditInfo.type = vm.ConsumSupplyRegEditInfo.name.type;
            vm.ConsumSupplyRegEditInfo.name = vm.ConsumSupplyRegEditInfo.name.name;
        }

        var reloadConsumSupplyRegTable = function(){
            $rootScope.ConsumSupplyRegList_dtInstance.reloadData();
            initStaticInfo(vm.userType);
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["ConsumSupplyRegMgtTable","ConsumSupplyRegTable"],true,true);
        }

        //打印跳转
        $scope.PrintConsumOpen = function (id) {
            localStorageService.set('NowConsumRegPrintID', id);
            window.open("/BigDataMgt/Consum_Print.html","_blank");
        };

        //验收
        vm.AcceptSupply = function(index){
            vm.ConsumSupplyRegKeyValue =  $rootScope.ConsumSupplyRegList_data[index]["_id"];
            DataMgtService.commDataDetailGet("ConsumSupplyReg","_id",vm.ConsumSupplyRegKeyValue).then(function(result){
                if (result!=null){
                    vm.ConsumSupplyRegEditInfo = result;
                    var m = result;
                    $rootScope.ConfirmDialog.ConfirmDialogMessage = "你确定验收通过：由"+m.supplierName+"提供的"+ m.name+"("+ m.specification+"),"+ m.price+"/"+ m.PriceUnit
                        +",合计"+ (m.price*m.count)+"元？";
                    $rootScope.ConfirmDialog.ConfirmDialogOpen(function(){
                        vm.ConsumSupplyRegEditInfo.status = "已验收";
                        vm.ConsumSupplyRegEditInfo.AcceptedFlag = Math.uuidWithData(8, 16);
                        DataMgtService.commDataUpdate("ConsumSupplyReg",vm.ConsumSupplyRegEditInfo,null,"_id",$scope.ConsumSupplyRegKeyValue).then(function(result){
                            result ? reloadConsumSupplyRegTable() : null;
                        });
                    })
                }
            });
        }

        vm.AcceptSupplyOne = function (aid,uuid) {
            var result = {};
            result.status = "已验收";
            result.AcceptedFlag = uuid;
            return DataMgtService.commDataUpdate("ConsumSupplyReg",result,["status","AcceptedFlag"],"_id",aid).then(function(result){
                if ( typeof result  == "object")
                    $scope.successed = $scope.successed + 1;
                else
                    $scope.errored = $scope.errored + 1;
                $rootScope.AlertDialog.AlertDialogMessage = "成功验收："+$scope.successed+"条信息；出现错误："+$scope.errored+"次";
            });
        };

        vm.BatchAcceptSupply = function () {
            $scope.successed = 0;
            $scope.errored = 0;
            var tabledata = $rootScope["ConsumSupplyRegList_data"];
            var theorg = "";
            var orgerror = false;
            var price = 0;
            var need = 0;
            var prom = [];
            var nowuuid = Math.uuidWithData(8, 16);
            $scope.checkboxes.items.forEach(function (obj, i) {
                if ($scope.checkboxes.items[i] == true && !orgerror){
                    if (theorg == "")
                        theorg = tabledata[i].supplierName;
                    else if (tabledata[i].supplierName != theorg){
                        orgerror = true;
                    }
                    price = price + tabledata[i].price*tabledata[i].count;
                    need = need +1;
                }
            });
            if (need <= 0 ){
                $rootScope.AlertDialog.AlertDialogMessage = "请先选择需要批量验收的耗材！";
                $rootScope.AlertDialog.showButton = true;
                $rootScope.AlertDialog.AlertDialogOpen();
                return;
            }
            if (orgerror){
                $rootScope.AlertDialog.AlertDialogMessage = "批量验收的耗材【只能来自同一供货商】，请重新选择！";
                $rootScope.AlertDialog.showButton = true;
                $rootScope.AlertDialog.AlertDialogOpen();
                return;
            }
            $rootScope.ConfirmDialog.ConfirmDialogMessage = "你确定验收通过：由【"+theorg+"】提供的【"+ need+"】条供货"
                +",合计【"+ price+"】元？";
            $rootScope.ConfirmDialog.ConfirmDialogOpen(function(){
                $scope.checkboxes.items.forEach(function (obj, i) {
                    if ($scope.checkboxes.items[i] == true && !orgerror){
                        prom.push($scope.AcceptSupplyOne($scope.checkboxes.values[i],nowuuid));
                    }
                });
                $q.all(prom).then(function (values) {
                    $rootScope.AlertDialog.AlertDialogMessage = "批量验收成功，验收单号：【"+nowuuid+"】";
                    $rootScope.AlertDialog.showButton = true;
                    $rootScope.AlertDialog.AlertDialogOpen();
                    reloadConsumSupplyRegTable();
                },function(){
                    $rootScope.AlertDialog.AlertDialogMessage = "批量验收出现错误，请稍后重试！";
                    $rootScope.AlertDialog.showButton = true;
                    $rootScope.AlertDialog.AlertDialogOpen();
                    reloadConsumSupplyRegTable();
                });
            })
        };

        var checkIfAgreeSupplier = function(orgid){
            return DataMgtService.commDataDetailGet("SupplierOrgs","orgidentify",orgid).then(function(result){
                if (result!=null && result.IfAgree)
                    return true;
                else
                    return false;
            });
        }

        //基本数据增删改
        vm.AddConsumSupplyReg = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["ConsumSupplyRegMgtTable","ConsumSupplyRegEdit"],true,true);
            vm.NowConsumSupplyRegAdd = true;
            initActionRule(vm.userType);
            vm.ConsumSupplyRegEditInfo.SupplyDate = new Date().toDateString();
            $scope.$broadcast('schemaFormRedraw');
        };
        vm.ConsumSupplyRegInfoModify = function(index){
            vm.ConsumSupplyRegKeyValue =  $rootScope.ConsumSupplyRegList_data[index]["_id"];
            DataMgtService.commDataDetailGet("ConsumSupplyReg","_id",vm.ConsumSupplyRegKeyValue).then(function(result){
                if (result!=null){
                    vm.ConsumSupplyRegEditInfo = result;
                    vm.pageshow = setObjectPropsToValue(vm.pageshow,["ConsumSupplyRegMgtTable","ConsumSupplyRegEdit"],true,true);
                    vm.NowConsumSupplyRegAdd = false;
                }
            });
        };
        $scope.saveConsumSupplyReg = function(form){
            $scope.$broadcast('schemaFormValidate');
            if (form.$valid){
                checkIfAgreeSupplier(vm.ConsumSupplyRegEditInfo.supplier).then(function(ifagree){
                    vm.ConsumSupplyRegEditInfo.IfAgreeSupplier = ifagree;
                    DataMgtService.commDataUpdate("ConsumSupplyReg",vm.ConsumSupplyRegEditInfo,null,"_id",$scope.ConsumSupplyRegKeyValue).then(function(result){
                        result ? reloadConsumSupplyRegTable() : null;
                    });
                });
            }
        }
        $scope.cloneConsumSupplyReg = function(index){
            var clonedata = $rootScope.ConsumSupplyRegList_data[index];
            DataMgtService.commDataClone("ConsumSupplyReg","_id",clonedata["_id"]).then(function(result){
                result ? reloadConsumSupplyRegTable() : null;
            });
        }
        $scope.insertConsumSupplyReg = function(form){
            vm.ConsumSupplyRegEditInfo.ApplyTime = new Date();
            $scope.$broadcast('schemaFormValidate');
            if (form.$valid){
                checkIfAgreeSupplier(vm.ConsumSupplyRegEditInfo.supplier).then(function(ifagree){
                    vm.ConsumSupplyRegEditInfo.IfAgreeSupplier = ifagree;
                    DataMgtService.commDataInsert("ConsumSupplyReg",vm.ConsumSupplyRegEditInfo).then(function(result){
                        result ? reloadConsumSupplyRegTable() : null;
                    });
                });
            }
        }
        $scope.ConsumSupplyRegDelete = function(index){
            var deldata = $rootScope.ConsumSupplyRegList_data[index];
            DataMgtService.commDataDelete("ConsumSupplyReg","_id",deldata["_id"]).then(function(result){
                result ? reloadConsumSupplyRegTable() : null;
            });
        }
        vm.ConsumSupplyRegEditGoback = function(){
            reloadConsumSupplyRegTable();
        }
        vm.ConsumSupplyRegAdSearchInfo= {data : [{field:"",keywords:"",condition:"="}]};
        vm.ConsumSupplyRegAdSearchField = [{value:"buildNo",name:"楼栋"},{value:"floorNo",name:"楼层"},{value:"unitNo",name:"单元"},{value:"usageType",name:"用途"},{value:"area",name:"建筑面积"}];
        vm.showAdSearch = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AdSearch"],!vm.pageshow.AdSearch,false);
        }
        vm.ConsumSupplyRegAdSearchGo = function(){
            vm.getConsumSupplyRegOption = {"datasetname":"ConsumSupplyReg","search":vm.ConsumSupplyRegAdSearchInfo.data};
            reloadConsumSupplyRegTable()
        }
        vm.ResetConsumSupplyRegAdSearch = function(){
            vm.getConsumSupplyRegOption = {"datasetname":"ConsumSupplyReg","search":null};
            reloadConsumSupplyRegTable()
        }
        vm.exportConsumSupplyRegInfo = function(){
            DataMgtService.commDataExportExcel(vm.getConsumSupplyRegOption.datasetname,vm.getConsumSupplyRegOption.search);
        }
        $scope.importdataset = "ConsumSupplyReg";
        vm.importConsumSupplyRegInfo = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["dataimport"],true,true);
        }
    }];

//供货商信息管理
var SupplierOrgsController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.pageshow = {SupplierOrgsMgtTable:false,SupplierOrgsTable:true,SupplierOrgsEdit:false,AdSearch:false,dataimport:false,CannotDoThis:true};
        $scope.SupplierOrgs_dtColumns= null;
        $scope.SupplierOrgs_dtOptions= null;
        $rootScope.SupplierOrgsList_dtInstance = null;
        $rootScope.SupplierOrgsList_data = null;
        vm.SupplierOrgsEditInfo = {};
        vm.getSupplierOrgsOption = null;

        $scope.supplierInfo = {};
        $scope.CannotDothis = true;
        var InitNowSupplyType= function () {
            DataMgtService.commDataListGet("AgreeSupplyType",null).then(function(result){
                if (result != null){
                    var nowSupplyTypes = [];
                    var hasSupplyTypes = $scope.SupplierOrgsEditInfo.AgreeSupplyType;
                    angular.forEach(result,function(item,index){
                        var SupplyTypeInfo = {typeid : item.typeid,typename : item.typename};
                        if (typeof hasSupplyTypes == "object" && $filter('filter')(hasSupplyTypes, {typeid: SupplyTypeInfo.typeid}).length > 0)
                            SupplyTypeInfo.ticker = true;
                        else
                            SupplyTypeInfo.ticker = false;
                        nowSupplyTypes.push(SupplyTypeInfo);
                    })
                    $scope.SelectSupplyTypeInfo = nowSupplyTypes;
                    $scope.SupplierOrgsEditForm = setObjectFieldToValue($scope.SupplierOrgsEditForm,"key","AgreeSupplyType","inputmodel",$scope.SelectSupplyTypeInfo);
                }
            });
        };

        var loadSupplierOrgsList = function(){
            tableService.initSimpleDTColumn("SupplierOrgs",0).then(function(result){
                $scope.SupplierOrgs_dtColumns = result;
                $scope.SupplierOrgs_dtColumns.push(DTColumnBuilder.newColumn(null)
                    .withTitle('操作').notSortable().withOption('width','150px')
                    .renderWith(function actionsHtml(data, type, full, meta) {
                        var returnstr =
                            "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                                "<button class=\"btn btn-success btn-xs\" ng-click=\"SupplierOrgsInfoModify(\'" + meta.row + "\')\">修改</button>"+
                                "<button class=\"btn btn-danger btn-xs\" ng-click=\"SupplierOrgsDelete(\'" + meta.row + "\')\">删除</button>"
                        "</div>";
                        return returnstr;
                    }));
                var search = [];
                vm.getSupplierOrgsOption = {"datasetname":"SupplierOrgs","search":search};
                $scope.SupplierOrgs_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                    data.baseinfo = $scope._id;
                    data.AskString = angular.toJson(vm.getSupplierOrgsOption);
                    data.remark = systemname;
                },"SupplierOrgsListTable","SupplierOrgsList_dtInstance","SupplierOrgsList_data")
                    .withOption('createdRow', function(row, data, dataIndex) {
                        $compile(angular.element(row).contents())($scope);
                    });
                $scope.pageshow = setObjectPropsToValue($scope.pageshow,["SupplierOrgsMgtTable","SupplierOrgsTable"],true,true);
            });
            formService.formFieldOptions("SupplierOrgs").then(function(result){
                $scope.SupplierOrgsEditSchema = result;
                $scope.SupplierOrgsEditForm = [
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"type": "section","htmlClass": "col-xs-6","items": ["orgidentify"]},
                            {"type": "section","htmlClass": "col-xs-6","items": ["orgname"]},
                            {"type": "section","htmlClass": "col-xs-6","items": ["orgregcapital"]},
                            {"type": "section","htmlClass": "col-xs-6","items": ["scope"]},
                            {"type": "section","htmlClass": "col-xs-6","items": ["IfAgree"]},
                            {"type": "section","htmlClass": "col-xs-6","items": [{"key": "AgreeSupplyType",inputmodel:[],defaultlabel:"typename",itemlabel:"typename",buttonlabel:"typename",tickproperty:"ticker",outputproperties:"typeid typename"}]},
                            {"type": "section","htmlClass": "col-xs-6","items": ["AgreeBeginDate"]},
                            {"type": "section","htmlClass": "col-xs-6","items": ["AgreeEndDate"]}
                        ]
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '保存',onClick:"saveSupplierOrgs()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"SupplierOrgsEditGoback()" }
                        ]
                        ,condition: "NowSupplierOrgsAdd == false"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '添加',onClick:"insertSupplierOrgs()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"SupplierOrgsEditGoback()" }
                        ]
                        ,condition: "NowSupplierOrgsAdd == true"
                    }
                ];
            });
        }

        loadSupplierOrgsList();

        vm.AddSupplierOrgs = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["SupplierOrgsMgtTable","SupplierOrgsEdit"],true,true);
            vm.NowSupplierOrgsAdd = true;
            vm.SupplierOrgsEditInfo = {AgreeSupplyType:[]};
            InitNowSupplyType();
        };

        vm.SupplierOrgsInfoModify = function(index){
            vm.SupplierOrgsKeyValue =  $rootScope.SupplierOrgsList_data[index]["_id"];
            DataMgtService.commDataDetailGet("SupplierOrgs","_id",vm.SupplierOrgsKeyValue).then(function(result){
                if (result!=null){
                    vm.SupplierOrgsEditInfo = result;
                    InitNowSupplyType();
                    vm.pageshow = setObjectPropsToValue(vm.pageshow,["SupplierOrgsMgtTable","SupplierOrgsEdit"],true,true);
                    vm.NowSupplierOrgsAdd = false;
                }
            });
        };
        var reloadSupplierOrgsTable = function(){
            $rootScope.SupplierOrgsList_dtInstance.reloadData();
            $scope.SupplierOrgsEditGoback();
        }
        $scope.saveSupplierOrgs = function(){
            DataMgtService.commDataUpdate("SupplierOrgs",vm.SupplierOrgsEditInfo,null,"_id",$scope.SupplierOrgsKeyValue).then(function(result){
                result ? reloadSupplierOrgsTable() : null;
            });
        }
        $scope.cloneSupplierOrgs = function(index){
            var clonedata = $rootScope.SupplierOrgsList_data[index];
            DataMgtService.commDataClone("SupplierOrgs","_id",clonedata["_id"]).then(function(result){
                result ? reloadSupplierOrgsTable() : null;
            });
        }
        $scope.insertSupplierOrgs = function(){
            DataMgtService.commDataInsert("SupplierOrgs",vm.SupplierOrgsEditInfo).then(function(result){
                result ? reloadSupplierOrgsTable() : null;
            });
        }
        $scope.SupplierOrgsDelete = function(index){
            var deldata = $rootScope.SupplierOrgsList_data[index];
            DataMgtService.commDataDelete("SupplierOrgs","_id",deldata["_id"]).then(function(result){
                result ? reloadSupplierOrgsTable() : null;
            });
        }
        vm.SupplierOrgsEditGoback = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["SupplierOrgsMgtTable","SupplierOrgsTable"],true,true);
        }
        vm.SupplierOrgsAdSearchInfo= {data : [{field:"",keywords:"",condition:"="}]};
        vm.SupplierOrgsAdSearchField = [{value:"buildNo",name:"楼栋"},{value:"floorNo",name:"楼层"},{value:"unitNo",name:"单元"},{value:"usageType",name:"用途"},{value:"area",name:"建筑面积"}];
        vm.showAdSearch = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AdSearch"],!vm.pageshow.AdSearch,false);
        }
        vm.SupplierOrgsAdSearchGo = function(){
            vm.getSupplierOrgsOption = {"datasetname":"SupplierOrgs","search":vm.SupplierOrgsAdSearchInfo.data};
            reloadSupplierOrgsTable()
        }
        vm.ResetSupplierOrgsAdSearch = function(){
            vm.getSupplierOrgsOption = {"datasetname":"SupplierOrgs","search":null};
            reloadSupplierOrgsTable()
        }

        vm.exportSupplierOrgsInfo = function(){
            DataMgtService.commDataExportExcel(vm.getSupplierOrgsOption.datasetname,vm.getSupplierOrgsOption.search);
        }
        $scope.importdataset = "SupplierOrgs";
        vm.importSupplierOrgsInfo = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["dataimport"],true,true);
        }
    }];

//协议供货类别管理
var AgreeSupplyTypeController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm){
        var vm = $scope;
        vm.pageshow = {AgreeSupplyTypeMgtTable:false,AgreeSupplyTypeTable:true,AgreeSupplyTypeEdit:false,AdSearch:false,dataimport:false,CannotDoThis:true};
        $scope.AgreeSupplyType_dtColumns= null;
        $scope.AgreeSupplyType_dtOptions= null;
        $rootScope.AgreeSupplyTypeList_dtInstance = null;
        $rootScope.AgreeSupplyTypeList_data = null;
        vm.AgreeSupplyTypeEditInfo = {};
        vm.getAgreeSupplyTypeOption = null;

        $scope.supplierInfo = {};
        $scope.CannotDothis = true;

        var loadAgreeSupplyTypeList = function(){
            tableService.initSimpleDTColumn("AgreeSupplyType",0).then(function(result){
                $scope.AgreeSupplyType_dtColumns = result;
                $scope.AgreeSupplyType_dtColumns.push(DTColumnBuilder.newColumn(null)
                    .withTitle('操作').notSortable().withOption('width','150px')
                    .renderWith(function actionsHtml(data, type, full, meta) {
                        var returnstr =
                            "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                                "<button class=\"btn btn-success btn-xs\" ng-click=\"AgreeSupplyTypeInfoModify(\'" + meta.row + "\')\">修改</button>"+
                                "<button class=\"btn btn-danger btn-xs\" ng-click=\"AgreeSupplyTypeDelete(\'" + meta.row + "\')\">删除</button>"
                        "</div>";
                        return returnstr;
                    }));
                var search = [];
                vm.getAgreeSupplyTypeOption = {"datasetname":"AgreeSupplyType","search":search};
                $scope.AgreeSupplyType_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                    data.baseinfo = $scope._id;
                    data.AskString = angular.toJson(vm.getAgreeSupplyTypeOption);
                    data.remark = systemname;
                },"AgreeSupplyTypeListTable","AgreeSupplyTypeList_dtInstance","AgreeSupplyTypeList_data")
                    .withOption('createdRow', function(row, data, dataIndex) {
                        $compile(angular.element(row).contents())($scope);
                    });
                $scope.pageshow = setObjectPropsToValue($scope.pageshow,["AgreeSupplyTypeMgtTable","AgreeSupplyTypeTable"],true,true);
            });
            formService.formFieldOptions("AgreeSupplyType").then(function(result){
                $scope.AgreeSupplyTypeEditSchema = result;
                $scope.AgreeSupplyTypeEditForm = [
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"type": "section","htmlClass": "col-xs-6","items": ["typeid"]},
                            {"type": "section","htmlClass": "col-xs-6","items": ["typename"]}
                        ]
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '保存',onClick:"saveAgreeSupplyType()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"AgreeSupplyTypeEditGoback()" }
                        ]
                        ,condition: "NowAgreeSupplyTypeAdd == false"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '添加',onClick:"insertAgreeSupplyType()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"AgreeSupplyTypeEditGoback()" }
                        ]
                        ,condition: "NowAgreeSupplyTypeAdd == true"
                    }
                ];
            });
        }

        loadAgreeSupplyTypeList();
        vm.AddAgreeSupplyType = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AgreeSupplyTypeMgtTable","AgreeSupplyTypeEdit"],true,true);
            vm.NowAgreeSupplyTypeAdd = true;
            vm.AgreeSupplyTypeEditInfo = {};
        };

        vm.AgreeSupplyTypeInfoModify = function(index){
            vm.AgreeSupplyTypeKeyValue =  $rootScope.AgreeSupplyTypeList_data[index]["_id"];
            DataMgtService.commDataDetailGet("AgreeSupplyType","_id",vm.AgreeSupplyTypeKeyValue).then(function(result){
                if (result!=null){
                    vm.AgreeSupplyTypeEditInfo = result;
                    vm.pageshow = setObjectPropsToValue(vm.pageshow,["AgreeSupplyTypeMgtTable","AgreeSupplyTypeEdit"],true,true);
                    vm.NowAgreeSupplyTypeAdd = false;
                }
            });
        };
        var reloadAgreeSupplyTypeTable = function(){
            $rootScope.AgreeSupplyTypeList_dtInstance.reloadData();
            $scope.AgreeSupplyTypeEditGoback();
        }
        $scope.saveAgreeSupplyType = function(){
            DataMgtService.commDataUpdate("AgreeSupplyType",vm.AgreeSupplyTypeEditInfo,null,"_id",$scope.AgreeSupplyTypeKeyValue).then(function(result){
                result ? reloadAgreeSupplyTypeTable() : null;
            });
        }
        $scope.cloneAgreeSupplyType = function(index){
            var clonedata = $rootScope.AgreeSupplyTypeList_data[index];
            DataMgtService.commDataClone("AgreeSupplyType","_id",clonedata["_id"]).then(function(result){
                result ? reloadAgreeSupplyTypeTable() : null;
            });
        }
        $scope.insertAgreeSupplyType = function(){
            DataMgtService.commDataInsert("AgreeSupplyType",vm.AgreeSupplyTypeEditInfo).then(function(result){
                result ? reloadAgreeSupplyTypeTable() : null;
            });
        }
        $scope.AgreeSupplyTypeDelete = function(index){
            var deldata = $rootScope.AgreeSupplyTypeList_data[index];
            DataMgtService.commDataDelete("AgreeSupplyType","_id",deldata["_id"]).then(function(result){
                result ? reloadAgreeSupplyTypeTable() : null;
            });
        }
        vm.AgreeSupplyTypeEditGoback = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AgreeSupplyTypeMgtTable","AgreeSupplyTypeTable"],true,true);
        }
        vm.AgreeSupplyTypeAdSearchInfo= {data : [{field:"",keywords:"",condition:"="}]};
        vm.AgreeSupplyTypeAdSearchField = [{value:"buildNo",name:"楼栋"},{value:"floorNo",name:"楼层"},{value:"unitNo",name:"单元"},{value:"usageType",name:"用途"},{value:"area",name:"建筑面积"}];
        vm.showAdSearch = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AdSearch"],!vm.pageshow.AdSearch,false);
        }
        vm.AgreeSupplyTypeAdSearchGo = function(){
            vm.getAgreeSupplyTypeOption = {"datasetname":"AgreeSupplyType","search":vm.AgreeSupplyTypeAdSearchInfo.data};
            reloadAgreeSupplyTypeTable()
        }
        vm.ResetAgreeSupplyTypeAdSearch = function(){
            vm.getAgreeSupplyTypeOption = {"datasetname":"AgreeSupplyType","search":null};
            reloadAgreeSupplyTypeTable()
        }

        vm.exportAgreeSupplyTypeInfo = function(){
            DataMgtService.commDataExportExcel(vm.getAgreeSupplyTypeOption.datasetname,vm.getAgreeSupplyTypeOption.search);
        }
        $scope.importdataset = "AgreeSupplyType";
        vm.importAgreeSupplyTypeInfo = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["dataimport"],true,true);
        }
    }];

var TeacherHomeConsumController = ['$scope', '$rootScope', '$http', '$q','localStorageService',
    function($scope, $rootScope, $http, $q,localStorageService){
        var vm = $scope;
        vm.pageshow = {ConsumSearch:true,OwnConsumMgt:false};
        vm.ConsumSearch = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["ConsumSearch"],true,true);
        }
        vm.OwnConsumMgt = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["OwnConsumMgt"],true,true);
        }
    }];

var SupplierHomeController = ['$scope', '$rootScope', '$http', '$q','localStorageService',
    function($scope, $rootScope, $http, $q,localStorageService){
        var vm = $scope;
        vm.pageshow = {ConsumInfoMgt:true,ConsumApplyMgt:false};
        vm.ConsumInfoMgt = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["ConsumInfoMgt"],true,true);
        }
        vm.ConsumApplyMgt = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["ConsumApplyMgt"],true,true);
        }
    }];

//耗材供货打印
var Consum_PrintController;
Consum_PrintController = function  ($scope, $rootScope, $http,DataMgtService, $q,$compile,localStorageService) {
    var theDate=new Date();
    $scope.myDate=$rootScope.myDate;

    var self = this;
    var InitError = true;
    var loginhistory = localStorageService.get(systemname+'LoginInfo');
    $scope.NowConsumRegPrintID = localStorageService.get('NowConsumRegPrintID');
    //$scope._id=loginhistory["_id"];

    $scope.PrintInfo = {AcceptedFlag : $scope.NowConsumRegPrintID,PrintDate : new Date().Format("yyyy-MM-dd")};
    var orginfo = {orgname:"",orgid:""};
    var price = 0;

    //打印方法
    $scope.Print_GetList = function() {
        DataMgtService.commDataListGet("ConsumSupplyReg",[{field:"AcceptedFlag",keywords:$scope.NowConsumRegPrintID,condition:"="}]).then(function(result){
            if (result!=null && result.length > 0){
                result.forEach(function (obj, i) {
                    if (orginfo.orgname == ""){
                        orginfo.orgname = obj.supplierName;
                        orginfo.orgid = obj.supplier;
                        orginfo.IfAgreeSupplier = obj.IfAgreeSupplier;
                    }
                    price = price + obj.price*obj.count;
                });
                $scope.PrintInfo.orginfo = orginfo;
                $scope.PrintInfo.count = result.length;
                $scope.PrintInfo.price = price;
                $scope.PrintInfo.list = result;
                localStorageService.remove('NowConsumRegPrintID');
            }
        });
    };
    $scope.Print_GetList();
};

var AssertStaticDicController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "AssertStaticDic";
        vm.showoption = {};

        //以下两个变量用于和控件交互form表单控制和表单编辑变量的值，以达到两层均可控制的目的
        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};

        vm.showoption.ExtendEditForm = [
            {"type": "section","htmlClass": "row","items":[
                {"type": "section","htmlClass": "col-xs-6","items": ["StaticName"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["StaticGroup"]},
                {"type": "select","htmlClass": "col-xs-6","key": "StaticType",titleMap: [
                    { value: "明细统计", name: "明细统计" },
                    { value: "分组合计统计", name: "分组合计统计" }
                ]},
                {"type": "section","htmlClass": "col-xs-6","items": ["ServerURL"]},
                {"type": "section","htmlClass": "col-xs-12","items": ["StaticSearch"]}
            ]}
        ];

        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加统计描述"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改"},
            {ButtonType:"btn-warning",actionFuncName:"cloneCommDataInfo",actionName:"复制"},
            {ButtonType:"btn-danger",actionFuncName:"CommDataDelete",actionName:"删除"}];

    }];

var TestController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "AssertStaticDic";
        vm.showoption = {};

        //以下两个变量用于和控件交互form表单控制和表单编辑变量的值，以达到两层均可控制的目的
        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};

        //以下showoption用来设置显示过程中的选项，可以设置，也可以不设置，或者更改，通常是单方向的，控件不主动修改，但会根据options的值不同调整显示和控制
        //MainAction用来设置显示在顶部的按钮样式及名称以及动作结构为：{ButtonType:"btn-sucess",actionFuncName:"CommDataInfoModify",actionName:"修改",showNum:""}
        //以下是标准写法
        //        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加使用信息"},
        //            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出使用信息"},
        //            {ButtonType:"btn-success",actionFuncName:"importCommDataInfo",actionName:"导入使用信息"},
        //            {ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}];
        //ExtendEditForm用于定义数据修改或添加表单，可以动态调整表单样式
        //nowFormActions用于自定义数据修改或添加表单的按钮样式和按钮名称，结构为{ButtonType:"btn-sucess",actionType:"save/insert",actionName:"修改"}
        //FormInit用于设置编辑表单初始化处理，如初始化某些下拉列表
        //InsertBefore用于设置编辑表单后，在添加新数据之前的数据处理
        //nowTableColumns用于自定义表列，不使用系统根据数据集定义自动生成的表
        //nowTableActions用于定义表操作列，结构为{ButtonType:"btn-sucess",actionFuncName:"CommDataInfoModify",actionName:"修改",show:""}，必须定义否则无任何操作
        //initSearch用于定义表格初始化的筛选条件，例如部门公共用房信息，初始筛选条件就是相关字段是某个部门编号的
        //nowSearch当前筛选条件，和initSearch一起用于动态控制表单数据显示
        //tabletype表类型，如果是AjaxServer将是动态服务器端分页获取数据的表，用于大数据量的表的显示，默认是普通的，不设置时自动默认

        vm.showoption.ExtendEditForm = [
            {"type": "section","htmlClass": "row","items":[
                {"type": "section","htmlClass": "col-xs-6","items": ["StaticName"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["StaticGroup"]},
                {"type": "select","htmlClass": "col-xs-6","key": "StaticType",titleMap: [
                    { value: "明细统计", name: "明细统计" },
                    { value: "分组合计统计", name: "分组合计统计" }
                ]},
                {"type": "section","htmlClass": "col-xs-6","items": ["ServerURL"]},
                {"type": "section","htmlClass": "col-xs-12","items": ["StaticSearch"]}
            ]}
        ];

        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加统计描述"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改"},
            {ButtonType:"btn-warning",actionFuncName:"CommDataDelete",actionName:"删除"}];

    }];


//打印页面管理
var PrintPageController = ['$scope',function ($scope) {
    var vm = $scope;
    vm.dataset = "PrintPage";
    vm.showoption = {};

    vm.CommDataEditForm = {};
    vm.CommDataEditInfo = {};
    vm.showoption.ExtendEditForm = [
        {"type": "section","htmlClass": "row",
            "items": [
                {"type": "section","htmlClass": "col-xs-6","items": ["name"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["url"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["datasource"]},
                {"type": "section","htmlClass": "col-xs-6","items": ["keyfield"]},
                {"type": "section","htmlClass": "col-xs-12","items": ["remark"]}
            ]
        }];

    vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加打印信息"},
        {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出打印信息"},
        {ButtonType:"btn-success",actionFuncName:"importCommDataInfo",actionName:"导入打印信息"},
        {ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}];
    vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataClone",actionName:"复制"},{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改"},
        {ButtonType:"btn-warning",actionFuncName:"CommDataDelete",actionName:"删除"}];

}];
//盘盈盘亏对照表
var ProfitAndLossController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.flowdataset = "Profit";
        vm.flowshowoption = {};
        vm.flowshowoption.tabletype="AjaxServer";

        var loginhistory = localStorageService.get(systemname+'LoginInfo');
        vm.userid = loginhistory["authUserid"];
        vm.username = loginhistory["username"];
        vm.userdepid = loginhistory["userdid"];

        vm.flowCommDataEditInfo = {};
        vm.flowOtherEditInfo = {};

        vm.flowshowoption.ExtendEditForm = [
            {"type": "section","htmlClass": "row",
                "items": [
                    {"type": "section","htmlClass": "col-xs-6","items": ["zcbh"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["zcmc"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["zcxh"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["ccbh"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["cfdd"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["lydw"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["lyr"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["bz"]}
                ]
            }];

        vm.flowshowoption.tabletype = "AjaxServer";


        vm.showstatus = true;
        //vm.statusshowoption.initSearch = [{field:"FlowId",keywords:workinfo._id.$oid,condition:"="}];
        //vm.nowWorkFlow = workinfo.WorkFlowName;
        //vm.nowWorkFlowId = workinfo._id.$oid;
        //vm.statusshowoption.refreshTable();


        vm.flowshowoption.MainAction = [
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出盘盈信息"},
            {ButtonType:"btn-success",actionFuncName:"importCommDataInfo",actionName:"导入盘盈信息"}
        ];
        vm.flowshowoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改"},
            {ButtonType:"btn-danger",actionFuncName:"CommDataDelete",actionName:"删除"}];

        //状态数据

        vm.statusdataset = "Loss";
        vm.statusshowoption = {};
        vm.statusshowoption.tabletype="AjaxServer";

        vm.statusCommDataEditInfo = {};
        vm.statusOtherEditInfo = {};

        vm.statusshowoption.initSearch = [{field:"FlowId",keywords:"",condition:"="}];
        vm.statusshowoption.ExtendEditForm = [
            {"type": "section","htmlClass": "row",
                "items": [
                    {"type": "section","htmlClass": "col-xs-6","items": ["zcbh"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["zcmc"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["zcxh"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["ccbh"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["cfdd"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["lydw"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["lyr"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["bz"]}
                ]
            }];

        vm.statusshowoption.tabletype = "AjaxServer";
        //vm.statusshowoption.InsertBefore = function(){
        //    var insertinfo = {};
        //    insertinfo.FlowId = vm.nowWorkFlowId;
        //    return insertinfo;
        //};
        vm.statusshowoption.MainAction = [
            {ButtonType:"btn-danger floatright",actionFuncName:"exportCommDataInfo",actionName:"导出盘亏信息"},
            {ButtonType:"btn-danger floatright",actionFuncName:"importCommDataInfo",actionName:"导入盘亏信息"}
        ];
        vm.statusshowoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改"},
            {ButtonType:"btn-danger",actionFuncName:"CommDataDelete",actionName:"删除"}];
    }];


var PageDescriptsController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "PageDescripts";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        //vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        //
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.EditHtml= function (info) {
            if (info.pagepath != null && info.pagepath != ''){
                window.open("plaintModify.html?ctype=html&filepath="+info.pagepath);
//                $scope.ActionModel.ActionModelTitle = '页面Html编辑';
//                $scope.ActionModel.ActionModelTemplateUrl = "plaintModify.html?ctype=html&filepath="+info.pagepath;
//                $scope.ActionModel.ActionModelOpen();
//                return;
            }else {
                $scope.AlertDialog.AlertDialogMessage = "该页面的html页面路径未定义，无法编辑，请首先定义相关路径。";
                $scope.AlertDialog.showButton = true;
                $scope.AlertDialog.AlertDialogOpen();
            }
        }
        vm.EditCtrl= function (info) {
            if (info.ctrlpath != null && info.ctrlpath != '' && info.ctrltag != null && info.ctrltag != ''){
                window.open("plaintModify.html?ctype=ctrl&filepath="+info.ctrlpath+"&ctrltag="+info.ctrltag);
//                $scope.ActionModel.ActionModelTitle = '页面Ctrl编辑';
//                $scope.ActionModel.ActionModelTemplateUrl = "plaintModify.html?ctype=ctrl&filepath="+info.ctrlpath+"&ctrltag="+info.ctrltag;
//                $scope.ActionModel.ActionModelOpen();
//                return;
            }else {
                $scope.AlertDialog.AlertDialogMessage = "该页面的Ctrl页面路径或者标签未定义，无法编辑，请首先定义相关路径。";
                $scope.AlertDialog.showButton = true;
                $scope.AlertDialog.AlertDialogOpen();
            }
        }
        vm.showoption.ExtendEditForm = [
            {"type": "section","htmlClass": "row",
                "items": [
                    {"type": "section","htmlClass": "col-xs-6","items": ["pageid"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["pagename"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["summary"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["state"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["pagepath"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["ctrlpath"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["ctrltag"]},
                    {"type": "section","htmlClass": "col-xs-12","items": [{key:"descript","config":"richEditor","height":"300"}]}
                ]
            }];
        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加页面信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出页面信息"},
            {ButtonType:"btn-success",actionFuncName:"importCommDataInfo",actionName:"导入页面信息"},
            {ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改"},
            {ButtonType:"btn-warning",actionFuncName:"CommDataDelete",actionName:"删除"},
            {ButtonType:"btn-warning",actionFuncName:"TableCallFunction",actionName:"HTML",params :"EditHtml"},
            {ButtonType:"btn-warning",actionFuncName:"TableCallFunction",actionName:"CTRl",params :"EditCtrl"}];
    }];
//OrgInfoMgt
var OrgInfoController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "OrgInfo";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        //vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        //
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {"type": "section","htmlClass": "row",
                "items": [
                    {"type": "section","htmlClass": "col-xs-6","items": ["orgid"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["orgname"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["orgtype"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["description"]}
                ]
            }];
        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加机构信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出机构信息"},
            {ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改机构信息"},
            {ButtonType:"btn-warning",actionFuncName:"CommDataDelete",actionName:"删除"}];
    }];
//OrgInfoMgt

//StudentManageMgt
StudentManageController =['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,$filter){
        var vm = $scope;
        vm.pageshow = {StudentMgtTable:true,StudentTable:true,StudentEdit:false,AdSearch:false,dataimport:false};
        $scope.Student_dtColumns= null;
        $scope.Student_dtOptions= null;
        $rootScope.StudentList_dtInstance = null;
        $rootScope.StudentList_data = null;
        vm.StudentEditInfo = {};
        vm.getStudentOption = null;
        var loadStudentList = function(){
            tableService.initSimpleDTColumn("Student",0).then(function(result){
                $scope.Student_dtColumns = result;
                $scope.Student_dtColumns.push(DTColumnBuilder.newColumn(null)
                    .withTitle('操作').notSortable().withOption('width','150px')
                    .renderWith(function actionsHtml(data, type, full, meta) {
                        var returnstr =
                            "<div class=\"btn-group\" role=\"group\" aria-label=\"...\">"+
                                "<button class=\"btn btn-error btn-xs\" ng-click=\"cloneStudent(\'" + meta.row + "\')\">复制</button>"+
                                "<button class=\"btn btn-success btn-xs\" ng-click=\"StudentInfoModify(\'" + meta.row + "\')\">修改</button>"+
                                "<button class=\"btn btn-danger btn-xs\" ng-click=\"StudentDelete(\'" + meta.row + "\')\">删除</button>"
                        "</div>";
                        return returnstr;
                    }));
                var search = [];
                vm.getStudentOption = {"datasetname":"Student","search":search};
                $scope.Student_dtOptions = tableService.initAjaxTableOptions("/DataImport/GetCommonDataList",function (data) {
                    data.baseinfo = $scope._id;
                    data.AskString = angular.toJson(vm.getStudentOption);
                    data.remark = systemname;
                },"StudentListTable","StudentList_dtInstance","StudentList_data")
                    .withOption('createdRow', function(row, data, dataIndex) {
                        $compile(angular.element(row).contents())($scope);
                    });
                $scope.pageshow = setObjectPropsToValue($scope.pageshow,["StudentMgtTable","StudentTable"],true,true);
            });
            formService.formFieldOptions("Student").then(function(result){
                $scope.StudentEditSchema = result;
                $scope.StudentEditForm = [
                    {"type": "section","htmlClass": "row",
                        "items": [
                            {"key": "UserName","htmlClass": "col-xs-4"},
                            {"key": "UserID","htmlClass": "col-xs-4"},
                            {
                                "key": "DepId","htmlClass": "col-xs-4",type: "select",titleMap:[],onChange:function(modelValue,form) {
                                var depname = $filter('filter')(vm.deplist, {value: modelValue})[0].name;
                                vm.StudentEditInfo.depName = depname;
                            }},
                            {"key": "Sex","htmlClass": "col-xs-4","type": "select",titleMap: [
                                { value: "男", name: "男" },
                                { value: "女", name: "女" }
                            ]},
                            {"key": "tel","htmlClass": "col-xs-4"},
                            {"key": "notes","htmlClass": "col-xs-12"}
                        ]},
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '保存',onClick:"saveStudent()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"StudentEditGoback()" }
                        ]
                        ,condition: "NowStudentAdd == false"
                    },
                    {type: "actions",
                        items: [
                            { type: 'button', style: 'btn-success', title: '添加',onClick:"insertStudent()"},
                            { type: 'button', style: 'btn-info', title: '取消', onClick:"StudentEditGoback()" }
                        ]
                        ,condition: "NowStudentAdd == true"
                    }
                ];
                InitDepartmentSets();

            });
        }

        loadStudentList();
        vm.getDepBykey = function(key){
            var search = [];
            search.push({field:"depName",keywords:key,condition:"like"});
            return DataMgtService.commDataListGet("Department",search).then(function(result){
                vm.deplist = result;
                return result;
            })
        }
        var InitDepartmentSets = function () {
            DataMgtService.commGetDic("Department","depId","depName",null).then(function(result){
                if (result != null){
                    vm.deplist = result;
                    vm.StudentEditForm = setObjectFieldToValue(vm.StudentEditForm,"key","DepId","titleMap",result);
                }
            });
        };
        vm.AddStudent = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["StudentMgtTable","StudentEdit"],true,true);
            vm.NowStudentAdd = true;
            vm.StudentEditInfo = {};
        };

        vm.StudentInfoModify = function(index){
            vm.StudentKeyValue =  $rootScope.StudentList_data[index]["StuNo"];
            DataMgtService.commDataDetailGet("Student","StuNo",vm.StudentKeyValue).then(function(result){
                if (result!=null){
                    vm.StudentEditInfo = result;
                    vm.pageshow = setObjectPropsToValue(vm.pageshow,["StudentMgtTable","StudentEdit"],true,true);
                    vm.NowStudentAdd = false;
                }
            });
        };
        var reloadStudentTable = function(){
            $rootScope.StudentList_dtInstance.reloadData();
            $scope.StudentEditGoback();
        }
        $scope.saveStudent = function(){
            DataMgtService.commDataUpdate("Student",vm.StudentEditInfo,null,"StuNo",$scope.StudentKeyValue).then(function(result){
                result ? reloadStudentTable() : null;
            });
        }
        $scope.cloneStudent = function(index){
            var clonedata = $rootScope.StudentList_data[index];
            DataMgtService.commDataClone("Student","depId",clonedata["StuNo"]).then(function(result){
                result ? reloadStudentTable() : null;
            });
        }
        $scope.insertStudent = function(){
            DataMgtService.commDataInsert("Student",vm.StudentEditInfo).then(function(result){
                result ? reloadStudentTable() : null;
            });
        }
        $scope.StudentDelete = function(index){
            var deldata = $rootScope.StudentList_data[index];
            DataMgtService.commDataDelete("Student","StuNo",deldata["StuNo"]).then(function(result){
                result ? reloadStudentTable() : null;
            });
        }
        vm.StudentEditGoback = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["StudentMgtTable","StudentTable"],true,true);
        }
        vm.StudentAdSearchInfo= {data : [{field:"",keywords:"",condition:"="}]};
        vm.StudentAdSearchField = [{value:"depName",name:"部门"},{value:"Major",name:"专业"},{value:"StuName",name:"姓名"},{value:"StuNo",name:"学号"}];
        vm.showAdSearch = function(){
            vm.pageshow = setObjectPropsToValue(vm.pageshow,["AdSearch"],!vm.pageshow.AdSearch,false);
        }
        vm.StudentAdSearchGo = function(){
            vm.getStudentOption = {"datasetname":"Student","search":vm.StudentAdSearchInfo.data};
            reloadStudentTable()
        }
        vm.ResetStudentAdSearch = function(){
            vm.getStudentOption = {"datasetname":"Student","search":null};
            reloadStudentTable()
        }

        vm.exportStudentInfo = function(){
            DataMgtService.commDataExportExcel(vm.getStudentOption.datasetname,vm.getStudentOption.search);
        }
        $scope.importdataset = "Student";
        vm.importStudentInfo = function(){
            $scope.pageshow = setObjectPropsToValue($scope.pageshow,["dataimport"],true,true);
        }
    }];
//StudentManageMgt

//studentGRD
var StudentGRDController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "Grademgt";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        //vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        //
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {"type": "section","htmlClass": "row",
                "items": [
                    {"type": "section","htmlClass": "col-xs-6","items": ["student_num"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["student_name"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["course_name"]},
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["course_num"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["teacher_name"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["score"] }
                ]
            }];
        vm.showoption.MainAction = [
            { ButtonType: "btn-success", actionFuncName: "exportCommDataInfo", actionName: "导出成绩信息" },
            { ButtonType: "btn-warning", actionFuncName: "showAdSearch", actionName: "高级检索" }];
       
    }];
//studentGRD

//StudentBasicInfo
var StudentBasicInfoController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "StudentBasicInfo";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        //vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        //
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {"type": "section","htmlClass": "row",
                "items": [
                    {"type": "section","htmlClass": "col-xs-6","items": ["student_name"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["student_num"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["nationality"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["student_sex"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["hometown"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["student_dept"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["student_major"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["student_class"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["student_dormitory"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["student_borndate"]}
                ]
            }];
        vm.showoption.MainAction = [{ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出学生信息"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改个人信息"}];
    }];
//StudentBasicInfo

//Course
var CourseInfoController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "Coursemgt";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        var search = [];
        search.push({field:"id",keywords:'3%',condition:"like"}); 
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
             {
                 "type": "section", "htmlClass": "row",
                 "items": [
                     { "type": "section", "htmlClass": "col-xs-6", "items": ["course_num"] },
                     { "type": "section", "htmlClass": "col-xs-6", "items": ["course_name"] },
                     { "type": "section", "htmlClass": "col-xs-6", "items": ["tea_name"] },
                     { "type": "section", "htmlClass": "col-xs-6", "items": ["teacher_tel"] }
                 ]
             }];

        vm.showoption.InsertBefore  = function() { 
                 DataMgtService.commDataListGetWithDetail("Coursemgt",search).then(function(result){ 
                  var arr = [];
                  for(var i = 0;i<result.length;i++){
                      arr.push(result[i].id);
                };
                 arr.sort(function(a,b){
                   return  b-a;
                     })
              var n = arr[0];
                  vm.CommDataEditInfo.id= n+1;                                     
                 });                                            
                vm.CommDataEditInfo = {};
                vm.CommDataEditInfo.schedule="申报";
                return vm.CommDataEditInfo;
              
        };




        vm.showoption.MainAction = [
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出课程信息"},
            {ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"选课"},
            {ButtonType:"btn-warning",actionFuncName:"CommDataDelete",actionName:"退选"}];
    }];
//CourseInfo

//Courseform
var CourseformController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "Courseform";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        //vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        //
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {"type": "section","htmlClass": "row",
                "items": [
                    {"type": "section","htmlClass": "col-xs-6","items": ["student_num"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["student_name"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["course_name"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["course_num"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["score"]}
                ]
            }];
        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加课表信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出课表信息"}
            ];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改课表信息"},
            {ButtonType:"btn-warning",actionFuncName:"CommDataDelete",actionName:"删除"}];
    }];
//Courseform

//Examarg
var ExamargController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "Examarg";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        //vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        //
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {
                "type": "section", "htmlClass": "row",
                "items": [
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["student_name"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["student_num"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["course_num"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["course_name"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["exam_place"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["exam_time"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["exam_timelon"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["exam_teacher"] }
                ]
            }];
        vm.showoption.MainAction = [
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出考试信息"},
            {ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}];
        
    }];
//Examarg

//Table
var TableController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "Table";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        //vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        //
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {
                "type": "section", "htmlClass": "row",
                "items": [
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["class_num"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["Monday"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["Tuesday"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["Wednesday"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["Thursday"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["Friday"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["Saturday"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["Sunday"] }
                ]
            }];
        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加课表信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出课表信息"},
            {ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}];
        vm.showoption.nowTableActions = [{ ButtonType: "btn-primary", actionFuncName: "CommDataInfoModify", actionName: "修改课表信息" },
            { ButtonType: "btn-warning", actionFuncName: "CommDataDelete", actionName: "删除" }];
    }];
//Table
        
//Grademgt

var GrademgtController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "Grademgt";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        //vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        //
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {"type": "section","htmlClass": "row",
                "items": [
                    {"type": "section","htmlClass": "col-xs-6","items": ["student_num"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["student_name"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["course_name"]},
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["course_num"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["teacher_name"] },
                    {"type": "section","htmlClass": "col-xs-6","items": ["score"]}
                ]
            }];
        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加成绩信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出成绩信息"},
            {ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改学生成绩"},
            {ButtonType:"btn-warning",actionFuncName:"CommDataDelete",actionName:"删除"}];
    }];
//Grademgt

//Coursemgt
var CoursemgtController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "Coursemgt";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        //vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        //
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {"type": "section","htmlClass": "row",
                "items": [
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["student_num"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["student_name"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["course_num"] },
                    {"type": "section","htmlClass": "col-xs-6","items": ["course_name"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["tea_name"]},
                    {"type": "section","htmlClass": "col-xs-6","items": ["teacher_tel"]}
                ]
            }];
        vm.showoption.MainAction = [
            {ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"同意选课"},
            {ButtonType:"btn-warning",actionFuncName:"CommDataDelete",actionName:"不同意"}];
    }];
//Coursemgt

//ClassInfomgt
var ClassInfomgtController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "ClassInfomgt";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        //vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        //
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {
                "type": "section", "htmlClass": "row",
                "items": [
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["Dept"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["major"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["class"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["mainteacher"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["support"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["class_num"] }
                ]
            }];
        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加班级信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出班级信息"},
            {ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改班级信息"},
            {ButtonType:"btn-warning",actionFuncName:"CommDataDelete",actionName:"删除"}];
    }];
//ClassInfomgt

//PeopleInfo
var StudentBasicInfoController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "PeopleInfo";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
         var search = [];
        search.push({field:"id",keywords:'1%',condition:"like"});    
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {"type": "section","htmlClass": "row",
                "items": [
                    {"type": "section","htmlClass": "col-xs-4","items": ["id"]},
                    {"type": "section","htmlClass": "col-xs-4","items": ["name"]},
                    {"type": "select","htmlClass": "col-xs-4","key": "sex",titleMap: [
                            { value:"男",name:"男"},
                            { value: "女", name: "女" }                           
                        ]},
                    
                    {"type": "section","htmlClass": "col-xs-4","items": ["nationality"]},
                    {"type": "section","htmlClass": "col-xs-4","items": ["birth"]},
                    {"type": "section","htmlClass": "col-xs-4","items": ["time_to_work"]},
                    {"type": "section","htmlClass": "col-xs-4","items": ["workplace"]},
                    {"type": "section","htmlClass": "col-xs-4","items": ["department_job"]},
                    {"type": "select","htmlClass": "col-xs-4","key": "administrative_ranks",titleMap: [
                            { value: "正部", name: "正部" },
                            { value: "副部", name: "副部" },
                            { value: "正厅", name: "正厅" },
                            { value: "副厅", name: "副厅" },
                            { value: "正处", name: "正处" },
                            { value: "副处", name: "副处" },
                            { value: "正科", name: "正科" },
                            { value: "副科", name: "副科" },
                            { value: "科员", name: "科员" }                                  
                        ]},
                    {"type": "section","htmlClass": "col-xs-4","items": ["major"]},
                    {"type": "select","htmlClass": "col-xs-4","key": "degree",titleMap: [
                            { value: "学士", name: "学士" },
                            { value: "硕士", name: "硕士" }, 
                            { value: "博士", name: "博士" }                          
                        ]},
                   {"type": "select","htmlClass": "col-xs-4","key": "positional_titles",titleMap: [
                            { value: "教授", name: "教授" },
                            { value: "副教授", name: "副教授" }, 
                            { value: "讲师", name: "讲师" }, 
                            { value: "助教", name: "助教" }, 
                            { value: "研究员", name: "研究员" }, 
                            { value: "副研究员", name: "副研究员" }, 
                            { value: "助理研究员", name: "助理研究员" }, 
                            { value: "研究实习员", name: "研究实习员" }              
                        ]},
                         {"type": "section","htmlClass": "col-xs-4","items": ["post_attachment"]},
                    {"type": "section","htmlClass": "col-xs-4","items": ["starttime"]},
                   
                    {"type": "section","htmlClass": "col-xs-4","items": ["finish_time"]},
                    {"type": "select","htmlClass": "col-xs-4","key": "category",titleMap: [
                            { value:"在职",name:"在职"},
                            { value: "挂职", name: "挂职" },
                            { value: "借调", name: "借调" },
                            { value: "实习", name: "实习" },
                            { value: "调研组", name: "调研组" }                                         
                        ]},
                    {"type": "section","htmlClass": "col-xs-4","items": ["tel"]},
		    {"type": "section","htmlClass": "col-xs-4","items": ["unusual_action"]},
                    {"type": "section","htmlClass": "col-xs-12","items": ["remark"]},
                ]
            }];
  
          vm.showoption.InsertBefore  = function() { 
                 DataMgtService.commDataListGetWithDetail("PeopleInfo",search).then(function(result){ 
                  var arr = [];
                  for(var i = 0;i<result.length;i++){
                      arr.push(result[i].id);
                };
                 arr.sort(function(a,b){
                   return  b-a;
                     })
              var n = arr[0];
                  vm.CommDataEditInfo.id= n+1;                                     
                 });                                       
              
                vm.CommDataEditInfo = {};
                vm.CommDataEditInfo.administrative_ranks="正部";
                vm.CommDataEditInfo.degree="博士";
                vm.CommDataEditInfo.positional_titles="教授";
                vm.CommDataEditInfo.category = "在职";
                
                return vm.CommDataEditInfo;
              
                };




	vm.Datadelete=function(info){
				swal({
					  title: "删除",
					  text: "是否确认删除",
					  type: "warning",
					  showCancelButton: true,
					  confirmButtonColor: "#DD6B55",
					  confirmButtonText: "确认",
					  cancelButtonText: '取消',
					  closeOnConfirm: false
					},
					function(){
						 DataMgtService.commDataDelete("PeopleInfo","id",info.id).then(function(result){
                    vm.showoption.refreshTable()
                });
					  swal("已删除!", "此条数据已经删除", "success");
					});
            }
        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加信息"},
        {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出信息"},
        {ButtonType:"btn-success",actionFuncName:"importCommDataInfo",actionName:"导入信息"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改信息"},
         {ButtonType:"btn-warning",actionFuncName:"TableCallFunction",actionName:"删除",params:"Datadelete"} ];
    }];
//PeopleInfo

//Reform

var ReformController = ['$compile', '$scope', '$rootScope', '$http', '$q', 'localStorageService',
    'DTColumnDefBuilder', 'DTOptionsBuilder', 'DTInstances', 'DTColumnBuilder', 'tableService', 'formService', 'DataMgtService', 'schemaForm', '$filter',
    function ($compile, $scope, $rootScope, $http, $q, localStorageService, DTColumnDefBuilder, DTOptionsBuilder, DTInstances, DTColumnBuilder, tableService, formService, DataMgtService, schemaForm, $filter) {
        var vm = $scope;
        vm.dataset = "Reforminfo";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        var search = [];
        search.push({field:"id",keywords:'1%',condition:"like"});   


        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {
                "type": "section", "htmlClass": "row",
                "items": [
                    { "type": "section", "htmlClass": "col-xs-4","items": ["id"] ,},
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["area"] },
                     { "type": "select", "htmlClass": "col-xs-4", "key": "region",titleMap:[
                                {value:"东部",name:"东部"},
                                {value:"中部",name:"中部"},
                                {value:"西部",name:"西部"},
                    ] },
                        //{ "type": "section", "htmlClass": "col-xs-6", "items": ["department_job"] },
                   
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["description"] },
                   /* { "type": "select", "htmlClass": "col-xs-3", "key": "schedule",titleMap:[
                                {value:"未启动",name:"未启动"},      
                                {value:"进行中",name:"进行中"},
                                {value:"已完成",name:"已完成"},
                    ] },*/
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["starttime"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["finish_time"] },
                   { "type": "section", "htmlClass": "col-xs-4", "items": ["brokerage"] },
                    //{ "type": "section", "htmlClass": "col-xs-4", "items": ["contacts"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["contacts"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["department_job"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["tel"] },
                        /*{ "type": "select", "htmlClass": "col-xs-3", "key": "schedule",titleMap:[
                                {value:"未启动",name:"未启动"},      
                                {value:"进行中",name:"进行中"},
                                {value:"已完成",name:"已完成"},
                    ] },
                     { "type": "select", "htmlClass": "col-xs-3", "key": "reformcase",titleMap:[
                                {value:"高考改革",name:"高考改革"},
                                {value:"综合改革方案备案",name:"综合改革方案备案"},
                                {value:"重点事项改革",name:"重点事项改革"},
                    ] },*/
                    //{ "type": "section", "htmlClass": "col-xs-3", "items": ["department_job"] },
                    

                    
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["fax"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["mailbox"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["remark"] },





                    { "type": "select", "htmlClass": "col-xs-4", "key": "reformcase",titleMap:[
                                {value:"高考改革",name:"高考改革"},
                                {value:"综合改革方案备案",name:"综合改革方案备案"},
                                {value:"重点事项改革",name:"重点事项改革"},
                    ] },
                    
                     { "type": "select", "htmlClass": "col-xs-4", "key": "schedule",titleMap:[
                                {value:"未启动",name:"未启动"},      
                                {value:"进行中",name:"进行中"},
                                {value:"已完成",name:"已完成"},
                    ] },
                    { "type": "select", "htmlClass": "col-xs-4", "key": "reform_effect",titleMap:[
                                {value:"好",name:"好"},
                                {value:"较好",name:"较好"},
                                {value:"一般",name:"一般"},
                    ] },
                    
                    /*{ "type": "select", "htmlClass": "col-xs-4", "key": "schedule",titleMap:[
                                {value:"未启动",name:"未启动"},      
                                {value:"进行中",name:"进行中"},
                                {value:"已完成",name:"已完成"},
                    ] },*/
                     /*{ "type": "select", "htmlClass": "col-xs-4", "key": "reformcase",titleMap:[
                                {value:"高考改革",name:"高考改革"},
                                {value:"综合改革方案备案",name:"综合改革方案备案"},
                                {value:"重点事项改革",name:"重点事项改革"},
                    ] },*/
                ]
            }];

        vm.showoption.InsertBefore  = function() { 
                 DataMgtService.commDataListGetWithDetail("Reforminfo",search).then(function(result){ 
                  var arr = [];
                  for(var i = 0;i<result.length;i++){
                      arr.push(result[i].id);
                };
                 arr.sort(function(a,b){
                   return  b-a;
                     })
              var n = arr[0];
                  vm.CommDataEditInfo.id= n+1;                                     
                 });                                                                        
                vm.CommDataEditInfo = {};
                vm.CommDataEditInfo.region="东部";
                vm.CommDataEditInfo.reformcase="高考改革";
                vm.CommDataEditInfo.schedule="已完成";
                return vm.CommDataEditInfo;
              
         };



	vm.Datadelete=function(info){
				swal({
					  title: "删除",
					  text: "是否确认删除",
					  type: "warning",
					  showCancelButton: true,
					  confirmButtonColor: "#DD6B55",
					  confirmButtonText: "确认",
					  cancelButtonText: '取消',
					  closeOnConfirm: false
					},
					function(){
						 DataMgtService.commDataDelete("Reforminfo","id",info.id).then(function(result){
                    vm.showoption.refreshTable()
                });
					  swal("已删除!", "此条数据已经删除", "success");
					});

                
            }
        vm.showoption.MainAction = [{ ButtonType: "btn-primary", actionFuncName: "AddCommData", actionName: "添加信息" },
            { ButtonType: "btn-success", actionFuncName: "exportCommDataInfo", actionName: "导出信息" },
            {ButtonType:"btn-success",actionFuncName:"importCommDataInfo",actionName:"导入信息"}
            //{ ButtonType: "btn-warning", actionFuncName: "showAdSearch", actionName: "高级检索" }
            ];
        vm.showoption.nowTableActions = [{ ButtonType: "btn-primary", actionFuncName: "CommDataInfoModify", actionName: "修改信息" },
            { ButtonType: "btn-warning", actionFuncName: "TableCallFunction",actionName:"删除",params:"Datadelete" }];
    }];

//Reform


//Filemgt
var FilemgtController = ['$compile', '$scope', '$rootScope', '$http', '$q', 'localStorageService',
    'DTColumnDefBuilder', 'DTOptionsBuilder', 'DTInstances', 'DTColumnBuilder', 'tableService', 'formService', 'DataMgtService', 'schemaForm', '$filter',
    function ($compile, $scope, $rootScope, $http, $q, localStorageService, DTColumnDefBuilder, DTOptionsBuilder, DTInstances, DTColumnBuilder, tableService, formService, DataMgtService, schemaForm, $filter) {
        var vm = $scope;
        vm.dataset = "filemgt";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        
        //vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
       vm.FileUploadDialog = function(info){
       //window.open("fileup.html")
 var $div = $('<div class="panel panel-primary" style="position:absolute;width: 400px;left: 800px;top:200px" id="upload"><div class="panel-heading">上传文件</div><div class="panel-body"><div class="row"><div class="col-md-12"><form class="form-horizontal" role="form"><div class="form-group" style="margin-left: 30px;"><input type="file" id="file1" name="file1"/></div><div class="form-group"><div class="col-md-offset-2 col-md-2"><input type="button" class="btn btn-info" style="position: absolute;width:80px;" id="comfin" value="确认上传"><button class="btn btn-danger" style="margin-left: 90px;" id="cancle">退出</button></div></div></form></div></div></div></div>')
  	$(document.body).append($div);
     var formData = new FormData();
	$("#comfin").click(function(){
        var str = $("#file1").val();
        var arr=str.split('\\');//注split可以用字符或字符串分割 
        var filename=arr[arr.length-1];//这就是要取得的图片名称 
        if(document.getElementById("file1").files[0].size>10485760){
            alert("文件大小不能大于10M");
        }
        else{
             var n = filename.indexOf(".");
            var fname = filename.substring(0,n);
            var fd = filename.substring(n+1)
            if(fname!=info.file_name){
                  alert("请保证上传文件名与添加的文件名一致");
            } 
            else{
                formData.append("file", document.getElementById("file1").files[0]);
        console.log(filename);
        var apiurl = "api/1.0/edu/system/account/uploadFiles2";
          $.ajax({
                    url: apiurl,
                    type: "POST",
                    data: formData,
                    cache:false,
                    contentType:false,
                    processData: false,
                    success: function (data) {
                        
                            alert("上传成功！");
                            $("#upload").remove();
                        if (data.status == "error") {
                            alert(data.msg);
                            //$(document.body).append($div).remove();
                        }
                       
                    },
                    error: function () {
                        alert("上传失败！");
                    }

                });
            }  
        }
        
        }); 
  	$("#cancle").click(function(){
  		$("#upload").remove();
  	})
  	 };
       vm.download =function(info){
            var fil = info.file_name;
            //var filname = fil+'.pdf';
            var str = encodeURI(encodeURI(fil));
		console.log(str);
            var apiurl = "http://114.55.25.231:1764/api/1.0/edu/system/account/downloadFiles?filename="+str;
            window.location.href= apiurl;
       }
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用
        vm.showoption.ExtendEditForm = [
            {
                "type": "section", "htmlClass": "row",
                "items": [
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["file_name"] },
                    { "type": "select", "htmlClass": "col-xs-6", "key": "category",titleMap:[
                               {value:"会议",name:"会议"},
                               {value:"调研",name:"调研"},
                               {value:"培训班",name:"培训班"},
                               {value:"文件编写",name:"文件编写"},
                               {value:"文稿起草",name:"文稿起草"},
                               {value:"司局函件",name:"司局函件"},
                               {value:"评估",name:"评估"},
                    ] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["draftsman"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["speaker"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["last_updated"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["keyword"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["theme"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["source"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["upload_date"] }
                   
                ]
            }];
	vm.Datadelete=function(info){
				swal({
					  title: "删除",
					  text: "是否确认删除",
					  type: "warning",
					  showCancelButton: true,
					  confirmButtonColor: "#DD6B55",
					  confirmButtonText: "确认",
					  cancelButtonText: '取消',
					  closeOnConfirm: false
					},
					function(){
						 DataMgtService.commDataDelete("filemgt","file_name",info.file_name).then(function(result){
                    vm.showoption.refreshTable()
                });
					  swal("已删除!", "此条数据已经删除", "success");
					});
            }
            vm.showoption.InsertBefore = function () {
					    vm.CommDataEditInfo = {};
					    vm.CommDataEditInfo.upload_date = new Date().Format("yyyy-MM-dd");
					    return vm.CommDataEditInfo;
					};
   			
        vm.showoption.MainAction = [{ ButtonType: "btn-primary", actionFuncName: "AddCommData", actionName: "添加文件信息" },
            { ButtonType: "btn-success", actionFuncName: "exportCommDataInfo", actionName: "导出文件信息" },
            //{ ButtonType: "btn-warning", actionFuncName: "showAdSearch", actionName: "高级检索" }
            ];
        vm.showoption.nowTableActions = [{ ButtonType: "btn-primary", actionFuncName: "CommDataInfoModify", actionName: "修改文件信息" },
        	{ButtonType:"btn-warning",actionFuncName:"TableCallFunction",actionName:"上传文件",params :"FileUploadDialog"},
        	 {ButtonType:"btn-success",actionFuncName:"TableCallFunction",actionName:"下载文件",params :"download"},
            { ButtonType: "btn-danger", actionFuncName: "TableCallFunction",actionName:"删除",params:"Datadelete" }];
    }];
//Filemgt

//test
var testController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "test";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        //vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        //
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {
                "type": "section", "htmlClass": "row",
                "items": [
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["t_name"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["sex"] }
                ]
            }];
        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出信息"},
            {ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改信息"},
            {ButtonType:"btn-warning",actionFuncName:"CommDataDelete",actionName:"删除"}];
    }];
//test

//schoolmember
var schoolmemberController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "schoolmember";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        var search = [];
        search.push({field:"id",keywords:'4%',condition:"like"});  
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {
                "type": "section", "htmlClass": "row",
                "items": [
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["id"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["name"] },
                    {"type": "select","htmlClass": "col-xs-4","key": "sex",titleMap: [
                            { value:"male",name:"男"},
                            { value: "female", name: "女" }                           
                    ]},
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["nationality"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["birth"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["area"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["schoolname"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["department_job"] },
                    
                    {"type": "select","htmlClass": "col-xs-4","key": "positional_titles",titleMap: [
                            { value: "教授", name: "教授" },
                            { value: "副教授", name: "副教授" }, 
                            { value: "讲师", name: "讲师" }, 
                            { value: "助教", name: "助教" }, 
                            { value: "研究员", name: "研究员" }, 
                            { value: "副研究员", name: "副研究员" }, 
                            { value: "助理研究员", name: "助理研究员" }, 
                            { value: "研究实习员", name: "研究实习员" }              
                    ]},
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["tel"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["fax"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["mailbox"] },
                    {"type": "select","htmlClass": "col-xs-6","key": "administrative_ranks",titleMap: [
                            { value: "正部", name: "正部" },
                            { value: "副部", name: "副部" },
                            { value: "正厅", name: "正厅" },
                            { value: "副厅", name: "副厅" },
                            { value: "正处", name: "正处" },
                            { value: "副处", name: "副处" },
                            { value: "正科", name: "正科" },
                            { value: "副科", name: "副科" },
                            { value: "科员", name: "科员" }                                  
                    ]},
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["unusual_action"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["remark"] }
                ]
            }];

       vm.showoption.InsertBefore  = function() {    
                      DataMgtService.commDataListGetWithDetail("schoolmember",search).then(function(result){ 
                  var arr = [];
                  for(var i = 0;i<result.length;i++){
                      arr.push(result[i].id);
                };
                 arr.sort(function(a,b){
                   return  b-a;
                     })
              var n = arr[0];
                  vm.CommDataEditInfo.id= n+1;                                     
                 });                                           
                vm.CommDataEditInfo = {};
                vm.CommDataEditInfo.administrative_ranks="正部";
                vm.CommDataEditInfo.positional_titles="教授";
                return vm.CommDataEditInfo;
              
            };







	vm.Datadelete=function(info){
				swal({
					  title: "删除",
					  text: "是否确认删除",
					  type: "warning",
					  showCancelButton: true,
					  confirmButtonColor: "#DD6B55",
					  confirmButtonText: "确认",
					  cancelButtonText: '取消',
					  closeOnConfirm: false
					},
					function(){
						 DataMgtService.commDataDelete("schoolmember","id",info.id).then(function(result){
                    vm.showoption.refreshTable()
                });
					  swal("已删除!", "此条数据已经删除", "success");
					});
            }
        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出信息"},
            {ButtonType:"btn-success",actionFuncName:"importCommDataInfo",actionName:"导入信息"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改信息"},
            {ButtonType:"btn-warning",actionFuncName:"TableCallFunction",actionName:"删除",params:"Datadelete"}];
    }];
//schoolmember

//expert
var expertController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "expert";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
          var search = [];
        search.push({field:"id",keywords:'5%',condition:"like"});    

        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

         vm.showoption.ExtendEditForm = [
            {
                "type": "section", "htmlClass": "row",
                "items": [
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["id"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["name"] },
                    {"type": "select","htmlClass": "col-xs-4","key": "sex",titleMap: [
                            { value:"男",name:"男"},
                            { value: "女", name: "女" }                           
                    ]},
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["nationality"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["birth"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["area"] },
                     { "type": "section", "htmlClass": "col-xs-4", "items": ["research_field"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["workplace"] },
                   
                    {"type": "select","htmlClass": "col-xs-4","key": "administrative_ranks",titleMap: [
                            { value: "正部", name: "正部" },
                            { value: "副部", name: "副部" },
                            { value: "正厅", name: "正厅" },
                            { value: "副厅", name: "副厅" },
                            { value: "正处", name: "正处" },
                            { value: "副处", name: "副处" },
                            { value: "正科", name: "正科" },
                            { value: "副科", name: "副科" },
                            { value: "科员", name: "科员" }                                  
                    ]},
                     { "type": "section", "htmlClass": "col-xs-4", "items": ["fax"] },
                    
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["tel"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["mailbox"] },
                    {"type": "select","htmlClass": "col-xs-6","key": "positional_titles",titleMap: [
                            { value: "教授", name: "教授" },
                            { value: "副教授", name: "副教授" }, 
                            { value: "讲师", name: "讲师" }, 
                            { value: "助教", name: "助教" }, 
                            { value: "研究员", name: "研究员" }, 
                            { value: "副研究员", name: "副研究员" }, 
                            { value: "助理研究员", name: "助理研究员" }, 
                            { value: "研究实习员", name: "研究实习员" }              
                    ]},
                    ,
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["unusual_action"] },
                    { "type": "section", "htmlClass": "col-xs-12", "items": ["remark"] }
                ]
            }];
       vm.showoption.InsertBefore  = function() { 
                     DataMgtService.commDataListGetWithDetail("expert",search).then(function(result){ 
                  var arr = [];
                  for(var i = 0;i<result.length;i++){
                      arr.push(result[i].id);
                };
                 arr.sort(function(a,b){
                   return  b-a;
                     })
              var n = arr[0];
                  vm.CommDataEditInfo.id= n+1; 
                   console.log(arr);                 
                 });                     
                    vm.CommDataEditInfo = {};
                    vm.CommDataEditInfo.administrative_ranks="正部";
                    vm.CommDataEditInfo.positional_titles="教授";
                    return vm.CommDataEditInfo;
              
                };









	 vm.Datadelete=function(info){
	 			swal({
					  title: "删除",
					  text: "是否确认删除",
					  type: "warning",
					  showCancelButton: true,
					  confirmButtonColor: "#DD6B55",
					  confirmButtonText: "确认",
					  cancelButtonText: '取消',
					  closeOnConfirm: false
					},
					function(){
						 DataMgtService.commDataDelete("expert","id",info.id).then(function(result){
                    vm.showoption.refreshTable()
                });
					  swal("已删除!", "此条数据已经删除", "success");
					});
            }


 
        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出信息"},
            {ButtonType:"btn-success",actionFuncName:"importCommDataInfo",actionName:"导入信息"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改信息"},
            {ButtonType:"btn-warning",actionFuncName:"TableCallFunction",actionName:"删除",params:"Datadelete"}];
    }];
//expert

//AdvisoryCommittee
var AdvisoryCommitteeController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "AdvisoryCommittee";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
         var search = [];
        search.push({field:"id",keywords:'2%',condition:"like"});    


        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {
                "type": "section", "htmlClass": "row",
                "items": [
                     { "type": "section", "htmlClass": "col-xs-4", "items": ["id"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["name"] },
                    {"type": "select","htmlClass": "col-xs-4","key": "sex",titleMap: [
                            { value:"男",name:"男"},
                            { value: "女", name: "女" }                           
                        ]},
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["nationality"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["birth"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["area"] },
                     { "type": "section", "htmlClass": "col-xs-4", "items": ["time"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["session"] },

                   {"type": "select","htmlClass": "col-xs-4","key": "group",titleMap: [
                            { value: "推进素质教育改革组", name: "推进素质教育改革组"},
                            { value: "义务教育均衡发展组", name: "义务教育均衡发展组" },
                            { value: "职业教育办学模式改革组", name: "职业教育办学模式改革组" },
                            { value: "终身教育体制机制建设组", name: "终身教育体制机制建设组" },
                            { value: "创新人才培养模式改革组", name: "创新人才培养模式改革组" },
                            { value: "考试招生制度改革组", name: "考试招生制度改革组" },
                            { value: "现代大学制度建设组", name: "现代大学制度建设组" },
                            { value: "办学体制改革组", name: "办学体制改革组" },
                            { value: "保障体制机制改革组", name: "保障体制机制改革组" },
                            { value: "省级统筹综合改革组", name: "省级统筹综合改革组" }
                    ]},
                   
                   { "type": "section", "htmlClass": "col-xs-4", "items": ["workplace"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["unusual_action"] },    
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["tel"] },
                    {"type": "select","htmlClass": "col-xs-6","key": "administrative_ranks",titleMap: [
                            { value: "正部", name: "正部" },
                            { value: "副部", name: "副部" },
                            { value: "正厅", name: "正厅" },
                            { value: "副厅", name: "副厅" },
                            { value: "正处", name: "正处" },
                            { value: "副处", name: "副处" },
                            { value: "正科", name: "正科" },
                            { value: "副科", name: "副科" },
                            { value: "科员", name: "科员" }                                  
                    ]},
                    {"type": "select","htmlClass": "col-xs-6","key": "positional_titles",titleMap: [
                            { value: "教授", name: "教授" },
                            { value: "副教授", name: "副教授" }, 
                            { value: "讲师", name: "讲师" }, 
                            { value: "助教", name: "助教" }, 
                            { value: "研究员", name: "研究员" }, 
                            { value: "副研究员", name: "副研究员" }, 
                            { value: "助理研究员", name: "助理研究员" }, 
                            { value: "研究实习员", name: "研究实习员" }              
                    ]}
                ]
            }];

      vm.showoption.InsertBefore  = function() {   
           vm.CommDataEditInfo = {};
                 DataMgtService.commDataListGetWithDetail("AdvisoryCommittee",search).then(function(result){ 
                  var arr = [];
                  for(var i = 0;i<result.length;i++){
                      arr.push(result[i].id);
                };
                 arr.sort(function(a,b){
                   return  b-a;
                     })
              var n = arr[0];
                  vm.CommDataEditInfo.id= n+1;                                     
                 });                                       
           
            vm.CommDataEditInfo.administrative_ranks="正部";
            vm.CommDataEditInfo.positional_titles="教授";
            return vm.CommDataEditInfo;
          
         };






	 vm.Datadelete=function(info){
	 			swal({
					  title: "删除",
					  text: "是否确认删除",
					  type: "warning",
					  showCancelButton: true,
					  confirmButtonColor: "#DD6B55",
					  confirmButtonText: "确认",
					  cancelButtonText: '取消',
					  closeOnConfirm: false
					},
					function(){
						 DataMgtService.commDataDelete("AdvisoryCommittee","id",info.id).then(function(result){
                    vm.showoption.refreshTable()
                });
					  swal("已删除!", "此条数据已经删除", "success");
					});
            }

        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出信息"},
            {ButtonType:"btn-success",actionFuncName:"importCommDataInfo",actionName:"导入信息"}]
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改信息"},
            {ButtonType:"btn-warning",actionFuncName:"TableCallFunction",actionName:"删除",params:"Datadelete"}];
    }];
//AdvisoryCommittee

//Departments
var DepartmentsController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "Departments";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
          var search = [];
        search.push({field:"id",keywords:'3%',condition:"like"});    

        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {
                "type": "section", "htmlClass": "row",
                "items": [
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["id"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["name"] },
                    {"type": "select","htmlClass": "col-xs-4","key": "sex",titleMap: [
                            { value:"male",name:"男"},
                            { value: "female", name: "女" }                           
                        ]},
                   
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["nationality"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["birth"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["area"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["post"] },
                    {"type": "select","htmlClass": "col-xs-4","key": "administrative_ranks",titleMap: [
                            { value: "正部", name: "正部" },
                            { value: "副部", name: "副部" },
                            { value: "正厅", name: "正厅" },
                            { value: "副厅", name: "副厅" },
                            { value: "正处", name: "正处" },
                            { value: "副处", name: "副处" },
                            { value: "正科", name: "正科" },
                            { value: "副科", name: "副科" },
                            { value: "科员", name: "科员" }                                  
                    ]},
                    {"type": "select","htmlClass": "col-xs-4","key": "positional_titles",titleMap: [
                            { value: "教授", name: "教授" },
                            { value: "副教授", name: "副教授" }, 
                            { value: "讲师", name: "讲师" }, 
                            { value: "助教", name: "助教" }, 
                            { value: "研究员", name: "研究员" }, 
                            { value: "副研究员", name: "副研究员" }, 
                            { value: "助理研究员", name: "助理研究员" }, 
                            { value: "研究实习员", name: "研究实习员" }              
                    ]},
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["tel"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["fax"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["mailbox"] },
		    { "type": "section", "htmlClass": "col-xs-6", "items": ["unusual_action"] },       
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["remarks"] }
                ]
            }];
        vm.showoption.InsertBefore  = function() { 
                  DataMgtService.commDataListGetWithDetail("Departments",search).then(function(result){ 
                  var arr = [];
                  for(var i = 0;i<result.length;i++){
                      arr.push(result[i].id);
                };
                 arr.sort(function(a,b){
                   return  b-a;
                     })
              var n = arr[0];
                  vm.CommDataEditInfo.id= n+1;                                     
                 });                                              
                vm.CommDataEditInfo = {};
                vm.CommDataEditInfo.administrative_ranks="正部";
                vm.CommDataEditInfo.positional_titles="教授";
                return vm.CommDataEditInfo;
              
        };







	vm.Datadelete=function(info){
				swal({
					  title: "删除",
					  text: "是否确认删除",
					  type: "warning",
					  showCancelButton: true,
					  confirmButtonColor: "#DD6B55",
					  confirmButtonText: "确认",
					  cancelButtonText: '取消',
					  closeOnConfirm: false
					},
					function(){
						 DataMgtService.commDataDelete("Departments","id",info.id).then(function(result){
                    vm.showoption.refreshTable()
                });
					  swal("已删除!", "此条数据已经删除", "success");
					});
            }
        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出信息"},
            {ButtonType:"btn-success",actionFuncName:"importCommDataInfo",actionName:"导入信息"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改信息"},
            {ButtonType:"btn-warning",actionFuncName:"TableCallFunction",actionName:"删除",params:"Datadelete"}];
    }];
//Departments



//Coursecommissioninfo
var CoursecommissioninfoController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "Coursecommissioninfo";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        var search = [];
        search.push({field:"id",keywords:'3%',condition:"like"});  
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用
        vm.Datadelete=function(info){
                swal({
                      title: "删除",
                      text: "是否确认删除",
                      type: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#DD6B55",
                      confirmButtonText: "确认",
                      cancelButtonText: '取消',
                      closeOnConfirm: false
                    },
                    function(){
                         DataMgtService.commDataDelete("Coursecommissioninfo","id",info.id).then(function(result){
                    vm.showoption.refreshTable()
                });
                      swal("已删除!", "此条数据已经删除", "success");
                    });
            }

        vm.showoption.ExtendEditForm = [
            {
                "type": "section", "htmlClass": "row",
                "items": [
                    { "type": "section", "htmlClass": "col-xs-5", "items": ["id"] },
                    { "type": "section", "htmlClass": "col-xs-5", "items": ["coursename"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["unit"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["person"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["tel"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["funding"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["starttime"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["finish_time"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["brokerage"] },
                     
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["results"] },
                    { "type": "select", "htmlClass": "col-xs-4", "key": "evaluation",titleMap:[
                                {value:"好",name:"好"},
                                {value:"较好",name:"较好"},
                                {value:"一般",name:"一般"},
                    ] },
                     { "type": "select", "htmlClass": "col-xs-5", "key": "schedule",titleMap:[
                                {value:"申报",name:"申报"},      
                                {value:"已立项",name:"已立项"},
                                {value:"中期检查",name:"中期检查"},
                                {value:"结题审核",name:"结题审核"},
                                {value:"已完成",name:"已完成"},
                    ] },      
                    { "type": "section", "htmlClass": "col-xs-5", "items": ["remark"] }
                ]
            }];
         vm.showoption.InsertBefore  = function() { 
                 DataMgtService.commDataListGetWithDetail("Coursecommissioninfo",search).then(function(result){ 
                  var arr = [];
                  for(var i = 0;i<result.length;i++){
                      arr.push(result[i].id);
                };
                 arr.sort(function(a,b){
                   return  b-a;
                     })
              var n = arr[0];
                  vm.CommDataEditInfo.id= n+1;                                     
                 });                                            
                vm.CommDataEditInfo = {};
                vm.CommDataEditInfo.schedule="申报";
                return vm.CommDataEditInfo;
              
        };






        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出信息"},
            {ButtonType:"btn-success",actionFuncName:"importCommDataInfo",actionName:"导入信息"},
            //{ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}
            ];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改信息"},
            {ButtonType:"btn-warning",actionFuncName:"TableCallFunction",actionName:"删除",params:"Datadelete"}];
    }];
//Coursecommissioninfo

//School
var SchoolController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "SchoolReforminfo";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
         var search = [];
        search.push({field:"id",keywords:'2%',condition:"like"}); 
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {
                "type": "section", "htmlClass": "row",
                "items": [
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["id"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["school"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["area"] },
                    
                    
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["description"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["starttime"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["finish_time"] },
                    { "type": "select", "htmlClass": "col-xs-4", "key": "region",titleMap:[
                                {value:"东部",name:"东部"},
                                {value:"中部",name:"中部"},
                                {value:"西部",name:"西部"},
                    ] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["contacts"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["department_job"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["tel"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["fax"] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["email"] },
                   
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["brokerage"] },
                    
                    { "type": "select", "htmlClass": "col-xs-4", "key": "reform_event",titleMap:[
                                {value:"高考改革",name:"高考改革"},
                                {value:"综合改革方案备案",name:"综合改革方案备案"},
                                {value:"重点事项改革",name:"重点事项改革"},
                    ] },
                    { "type": "select", "htmlClass": "col-xs-4", "key": "schedule",titleMap:[
                                {value:"未启动",name:"未启动"},      
                                {value:"进行中",name:"进行中"},
                                {value:"已完成",name:"已完成"},
                    ] },
                     { "type": "select", "htmlClass": "col-xs-4", "key": "reform_effect",titleMap:[
                                {value:"好",name:"好"},
                                {value:"较好",name:"较好"},
                                {value:"一般",name:"一般"},
                    ] },
                    { "type": "section", "htmlClass": "col-xs-4", "items": ["remark"] },
                ]
            }];
     vm.showoption.InsertBefore  = function() {   
                   DataMgtService.commDataListGetWithDetail("SchoolReforminfo",search).then(function(result){ 
                  var arr = [];
                  for(var i = 0;i<result.length;i++){
                      arr.push(result[i].id);
                };
                 arr.sort(function(a,b){
                   return  b-a;
                     })
              var n = arr[0];
                  vm.CommDataEditInfo.id= n+1;                                     
                 });                                  
                vm.CommDataEditInfo = {};
                vm.CommDataEditInfo.region="东部";
                vm.CommDataEditInfo.reform_event="高考改革";
                 vm.CommDataEditInfo.schedule="已完成";
                return vm.CommDataEditInfo;
              
        };        




	vm.Datadelete=function(info){
				swal({
					  title: "删除",
					  text: "是否确认删除",
					  type: "warning",
					  showCancelButton: true,
					  confirmButtonColor: "#DD6B55",
					  confirmButtonText: "确认",
					  cancelButtonText: '取消',
					  closeOnConfirm: false
					},
					function(){
						 DataMgtService.commDataDelete("SchoolReforminfo","id",info.id).then(function(result){
                    vm.showoption.refreshTable()
                });
					  swal("已删除!", "此条数据已经删除", "success");
					});


    
            }
        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出信息"},
            {ButtonType:"btn-success",actionFuncName:"importCommDataInfo",actionName:"导入打印信息"}
            //{ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}
            ];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改信息"},
            {ButtonType:"btn-warning",actionFuncName:"TableCallFunction",actionName:"删除",params:"Datadelete"}];
    }];
//School

//AdvisoryCouncil
var AdvisoryCouncilController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "AdvisoryCouncil";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        //vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据
        //
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用

        vm.showoption.ExtendEditForm = [
            {
                "type": "section", "htmlClass": "row",
                "items": [
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["id"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["name"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["sex"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["group"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["nationality"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["birth"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["area"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["workplace"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["administrative_ranks"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["positional_titles"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["session"] },
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["time"] },       
                    { "type": "section", "htmlClass": "col-xs-6", "items": ["tel"] }
                ]
            }];
        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出信息"},
            {ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改信息"},
            {ButtonType:"btn-warning",actionFuncName:"CommDataDelete",actionName:"删除"}];
    }];
//AdvisoryCouncil

//DailyWork
var DailyWorkController = ['$compile','$scope', '$rootScope', '$http', '$q','localStorageService',
    'DTColumnDefBuilder','DTOptionsBuilder','DTInstances','DTColumnBuilder','tableService','formService','DataMgtService','schemaForm','$filter',
    function($compile,$scope, $rootScope, $http, $q,localStorageService,DTColumnDefBuilder,DTOptionsBuilder,DTInstances,DTColumnBuilder,tableService,formService,DataMgtService,schemaForm,$filter){
        var vm = $scope;
        vm.dataset = "DailyWork";
        vm.showoption = {};

        vm.CommDataEditForm = {};
        vm.CommDataEditInfo = {};
        vm.tabletype = "ajaxServer";  //tabletype决定表格是否为Server端获取数据 
        //定义各类form表单，可以根据不同的操作需要定义多个表单，在下一级controller中用$scope[formname]的方式进行调用
          var search = [];
        search.push({field:"id",keywords:'4%',condition:"like"});   
        vm.showoption.ExtendEditForm = [
            {
                "type": "section", "htmlClass": "row",
                "items": [
                    { "type": "section", "htmlClass": "col-md-6", "items": ["id"] },
                    { "type": "section", "htmlClass": "col-md-6", "items": ["business_name"] },
                    { "type": "section", "htmlClass": "col-md-6", "items": ["specific_business"] },
                    { "type": "section", "htmlClass": "col-md-6", "items": ["theme"] },
                    { "type": "section", "htmlClass": "col-md-6", "items": ["keyword"] },
                    { "type": "select", "htmlClass": "col-md-6", "key": "category",titleMap:[
                               {value:"会议",name:"会议"},
                               {value:"调研",name:"调研"},
                               {value:"培训班",name:"培训班"},
                               {value:"文件编写",name:"文件编写"},
                               {value:"文稿起草",name:"文稿起草"},
                               {value:"司局函件",name:"司局函件"},
                               {value:"评估",name:"评估"},
                    ] },
                    { "type": "section", "htmlClass": "col-md-6", "items": ["brokerage"] },
                    { "type": "section", "htmlClass": "col-md-6", "items": ["participants"] },
                    { "type": "section", "htmlClass": "col-md-6", "items": ["site"] },
                    { "type": "section", "htmlClass": "col-md-6", "items": ["starttime"] },
                    { "type": "section", "htmlClass": "col-md-6", "items": ["finish_time"] },
                    { "type": "section", "htmlClass": "col-md-6", "items": ["remark"] }
                ]
            }];
         vm.showoption.InsertBefore  = function() {  
                  DataMgtService.commDataListGetWithDetail("DailyWork",search).then(function(result){ 
                  var arr = [];
                  for(var i = 0;i<result.length;i++){
                      arr.push(result[i].id);
                };
                 arr.sort(function(a,b){
                   return  b-a;
                     })
              var n = arr[0];
                  vm.CommDataEditInfo.id= n+1;                                     
                 });                                          
                vm.CommDataEditInfo = {};
                vm.CommDataEditInfo.category="会议";
                return vm.CommDataEditInfo;
              
        };





	vm.Datadelete=function(info){
				swal({
					  title: "删除",
					  text: "是否确认删除",
					  type: "warning",
					  showCancelButton: true,
					  confirmButtonColor: "#DD6B55",
					  confirmButtonText: "确认",
					  cancelButtonText: '取消',
					  closeOnConfirm: false
					},
					function(){
						 DataMgtService.commDataDelete("DailyWork","id",info.id).then(function(result){
                    vm.showoption.refreshTable()
                });
					  swal("已删除!", "此条数据已经删除", "success");
					});
            }
        vm.showoption.MainAction = [{ButtonType:"btn-primary",actionFuncName:"AddCommData",actionName:"添加信息"},
            {ButtonType:"btn-success",actionFuncName:"exportCommDataInfo",actionName:"导出信息"},
            {ButtonType:"btn-success",actionFuncName:"importCommDataInfo",actionName:"导入信息"}
            //{ButtonType:"btn-warning",actionFuncName:"showAdSearch",actionName:"高级检索"}
            ];
        vm.showoption.nowTableActions = [{ButtonType:"btn-primary",actionFuncName:"CommDataInfoModify",actionName:"修改信息"},
            {ButtonType:"btn-warning",actionFuncName:"TableCallFunction",actionName:"删除",params:"Datadelete"}];
    }];
//DailyWork
