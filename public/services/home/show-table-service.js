angular.module('showTableService', [])
    .factory('getTableService', ['$http', function($http) {
        var table = {};
        table.getTable = function(url, date) {
            var searchDate = new Date(date.toString());
            var year = searchDate.getFullYear();
            var month = searchDate.getMonth() + 1;
            var day = searchDate.getDate();
            if (month < 10) { month = '0' + month;}
            if (day < 10 ) { day = '0' + day;}
            var url = url + [year, month, day].join("-");
            return $http.get(url);
        };
        return table;
    }]);

