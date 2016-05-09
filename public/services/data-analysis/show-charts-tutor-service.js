angular.module('showChartService')
    .factory('drawTutorChartsService', ['$http', function($http) {
        var chart = {};
        chart.getTutorChart = function(url, name, fromDate, untilDate) {
            if (Date.parse(fromDate) > Date.parse(untilDate)) return "date-error";
            var NAME_PATTERN = /^[\u4e00-\u9fa5]+/i;
            var isNameValid = NAME_PATTERN.test(name);
            if (!isNameValid) return "name-error";

            var arrDate = new Array();
            var arrData = new Array();
            var arrName = new Array();
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
                // 如果返回的数据为空或未定义
                if (data.message === "nodata")
                    return {
                        message: "nodata"
                    };

                arrName = data.name;
                arrDate = data.date;
                arrData = data.data;
                var seriesData = [];

                for (var i = 0, len = data.data.length; i < len; i++) {
                    var obj = {
                        type: 'bar',
                        label: {
                            normal: {
                                show: true,
                                position: 'insideRight'
                            }
                        },
                        stack: '总时长'
                    };
                    obj.name = arrName[i];
                    obj.data = arrData[i];
                    seriesData.push(obj);
                }
                return {
                    "name": arrName,
                    "date": arrDate,
                    "data": seriesData,
                    "metaData": arrData,
                    "degree": data.degree
                };

            }, function(response) {
                return "error";
            });
            return obj;
        }
        return chart;
    }]);
