angular.module('myApp').controller('TableCtrl', ['$scope', 'getTableService', TableCtrl]);

function TableCtrl($scope, getTableService) {
    // 变量初始化
    $scope.searchDate = new Date();

    $scope.isPunctual = function() {
        console.info("按时 = ", $scope.search.isPunctual);
    };

    $scope.showName = function() {
        console.info("姓名:", $scope.search.name);
    };

    $scope.showLab = function() {
        console.info("实验室", $scope.search.lab);
    }

    $scope.setOrder = function() {
        $scope.clicked = true;
        $scope.order = '11';
        $scope.reverse = !$scope.reverse;
    };

    // 显示日期
    $scope.disDate = function() {
        console.info("日期 = ", $scope.searchDate);
        // 获取特定日期的数据表格
        getTableService.getTable("/detail/", $scope.searchDate).success(function(data) {
            // 请求成功
            // console.info(data);
            var headerArr = data.shift();
            headerArr.pop();
            $scope.tableHeader = headerArr;
            $scope.tableContent = data;
        });
    };
    // 获取当前日期的数据表格
    getTableService.getTable("/detail/", $scope.searchDate).success(function(data) {
        // 请求成功
        // console.info(data);
        var headerArr = data.shift();
        headerArr.pop();
        $scope.tableHeader = headerArr;
        $scope.tableContent = data;
    });
}
