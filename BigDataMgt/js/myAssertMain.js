
function userController($scope,$http) {
    var self = this;	

    $scope.assertTypes = [{ tname: "�Ҿ�", tid: "01" }, { tname: "�豸", tid: "01" }, { tname: "�Ĳ�", tid: "01" }, { tname: "��ȷ���ʲ�", tid: "01" }, ];
    $scope.SelectedAssertType = "";
    $scope.mySelections = [];
    $scope.mySelections2 = [];
    $scope.myData = [];
    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: false
    };

    $scope.modal = {
        "title": "Title",
        "content": "Hello Modal<br />This is a multiline message!"
    };

    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [250, 500, 1000], //page Sizes
        pageSize: 250, //Size of Paging data
        currentPage: 1 //what page they are currently on
    };
    self.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            //var nprUrl = ".\\JsonData\\jsonLoad.json";
            var nprUrl = "\\UserCenter\\AssetMgt\\GetAllAssetListByUser";
            var jsondata = null;
            $http({
                method: 'GET',
                url: nprUrl
            }).success(function (data, status) {
                jsondata = data;
                //                if (searchText) {
                //                    var ft = searchText.toLowerCase();
                //                    data = jsondata.filter(function (item) {
                //                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                //                    });
                //                } else {
                //                    data = jsondata;
                //                }
                var res = jsondata;
                var pagedData = res.slice((page - 1) * pageSize, page * pageSize);
                $scope.myData = pagedData;
                $scope.totalServerItems = res.length;
            }).error(function (data, status) {
                jsondata = "error";
            });

//            if (!$scope.$$phase) {
//                $scope.$apply();
//            }
        }, 100);
    };

    $scope.$watch('pagingOptions', function () {
        self.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
    }, true);
    $scope.$watch('filterOptions', function () {
        self.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
    }, true);
    self.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    $scope.gridOptions = {
		data: 'myData',
		jqueryUITheme: false,
		jqueryUIDraggable: false,
		selectedItems: $scope.mySelections,
		showFilter: true,
        showSelectionCheckbox: false,
        multiSelect: false,
        showGroupPanel: false,
        showColumnMenu: false,
        enableCellSelection: true,
        enableCellEditOnFocus: false,
        enablePaging: true,
        showFooter: true,
        totalServerItems: 'totalServerItems',
        filterOptions: $scope.filterOptions,
        pagingOptions: $scope.pagingOptions,
        columnDefs: [{ field: 'showtype', displayName: '�ʲ�����', sortable: false, width: 90 },
                     { field: 'aname', displayName: '�ʲ�����', sortable: true, width: 120 },
                     { field: 'aCode', displayName: '�ʲ����', sortable: true, width: 90 },
                     { field: 'adetail', displayName: '�ʲ�����', sortable: false, resizable: true },
                     { field: 'aState', displayName: '��״', sortable: true, width: 90 },
                     { field: 'auser', displayName: 'ʹ��/������', sortable: true, width: 90 },
                     { field: 'aCreator', displayName: '������', sortable: false, width: 90 },
                     { field: 'apurchaseTime', displayName: '����ʱ��', sortable: true, width: 90 }
        ]
    };    
};