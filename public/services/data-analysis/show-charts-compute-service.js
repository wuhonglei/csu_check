angular.module('showChartService', [])
    .factory('drawComputeChartsService', ['$http', function($http) {
        var chart = {};
        chart.getComputeChart = function(url, fromDate, untilDate) {
            if (Date.parse(fromDate) > Date.parse(untilDate)) return "date-error";
            var formatDate = function(date) {
                var y = date.getFullYear();
                var m = date.getMonth() + 1;
                var d = date.getDate();
                if (m < 10) m = '0' + m;
                if (d < 10) d = '0' + d;
                return [y, m, d].join("-");
            };
            url = url + formatDate(fromDate) + "/" + formatDate(untilDate);
            console.info("请求URL:", url);
            var obj = $http.get(url).then(function(response) {
                return { "date": response.data.date, "data": response.data.data };
            }, function(response) {
                return "error";
            });
            return obj;
        }
        return chart;
    }]);
