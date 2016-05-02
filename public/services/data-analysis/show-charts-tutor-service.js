angular.module('showChartService')
    .factory('drawPersonalChartsService', ['$http', function($http) {
        var chart = {};
        chart.getPersonalChart = function(url, name, startDate, untilDate) {
            var NAME_PATTERN = /^[\u4e00-\u9fa5]+/i;
            var isNameValid = NAME_PATTERN.test(name);
            if (!isNameValid) return "error";
            // 一天的毫秒数
            var oneDay = 24 * 60 * 60 * 1000;
            // 两个日期所相差的天数
            var diffDay = Math.abs(untilDate.getTime() - startDate.getTime()) / oneDay + 1;
            var startIndex = Math.abs(startDate.getTime() - new Date("2016-03-01").getTime()) / oneDay;
            var arrDate = new Array();
            var arrData = new Array();
            var obj = $http.get(url).then(function(response) {
                var data = response.data[name];
                if (data === undefined) return { "date": arrDate, "data": arrData };
                for (var i = startIndex, len = startIndex + diffDay; i < len; i++) {
                    arrDate.push(data[i][0].substring(5));
                    arrData.push(data[i][1]);
                }
                return { "date": arrDate, "data": arrData };
            }, function(response) {
                return "error";
            });
            return obj;
        }
        return chart;
    }]);
