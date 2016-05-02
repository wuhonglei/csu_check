angular.module('showChartService')
    .factory('drawPersonalChartsService', ['$http', function($http) {
        var chart = {};
        chart.getPersonalChart = function(url, name, fromDate, untilDate) {
            if (Date.parse(fromDate) > Date.parse(untilDate)) return "date-error";
            var NAME_PATTERN = /^[\u4e00-\u9fa5]+/i;
            var isNameValid = NAME_PATTERN.test(name);
            if (!isNameValid) return "name-error";

            var arrDate = new Array();
            var arrData = new Array();
            var formatDate = function(date) {
                var y = date.getFullYear();
                var m = date.getMonth() + 1;
                var d = date.getDate();
                if (m < 10) m = '0' + m;
                if (d < 10) d = '0' + d;
                return [y, m, d].join("-");
            };
            url = url + name + "/" + formatDate(fromDate) + "/" + formatDate(untilDate);
            var obj = $http.get(url).then(function(response) {
                var data = response.data;
                if (data === undefined) return { "date": arrDate, "data": arrData };
                arrDate = data.date;
                arrData = data.data;
                return { "date": arrDate, "data": arrData };
            }, function(response) {
                return "error";
            });
            return obj;
        }
        return chart;
    }]);
