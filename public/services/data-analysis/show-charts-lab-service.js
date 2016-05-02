angular.module('showChartService')
    .factory('drawLabChartsService', ['$http', function($http) {
        var chart = {};
        chart.getLabChart = function(url, labName, fromDate, untilDate) {
            var LAB_PATTERN = /(^[\u4e00-\u9fa5]+\-?[\d]*|^\d+\-?\d+$)/i;
            var isNameValid = LAB_PATTERN.test(labName);
            if (!isNameValid) return "error";

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
            url = url + labName + "/" + formatDate(fromDate) + "/" + formatDate(untilDate);
            var obj = $http.get(url).then(function(response) {
                var data = response.data;
                // 如果返回的数据为空或未定义
                if (data === undefined || data.length === 0)
                    return {
                        "name": arrName,
                        "date": arrDate,
                        "data": arrData
                    };

                arrName = data.name;
                arrDate = data.date;
                arrData = data.data;
                var seriesData = [];

                for (var i = 0, len = data.data.length; i < len; i++) {
                    var obj = {
                        type: 'line',
                        markLine: {
                            lineStyle: {
                                normal: {
                                    type: 'dashed'
                                }
                            },
                            data: [{
                                name: '平均时间',
                                // 支持 'average', 'min', 'max'
                                type: 'average'
                            }]
                        }
                    };
                    obj.name = arrName[i];
                    obj.data = arrData[i];
                    seriesData.push(obj);
                }
                return {
                    "name": arrName,
                    "date": arrDate,
                    "data": seriesData
                };
            }, function(response) {
                return "error";
            });
            return obj;
        }
        return chart;
    }]);
