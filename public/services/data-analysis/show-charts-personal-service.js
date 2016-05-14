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
                if (data.message === "nodata") {
                    console.warn("个人图表没有数据");
                    return {
                        message: "nodata"
                    }
                }

                var formatWeekDay = function(date) {
                    var month = date.getMonth() + 1 + '月';
                    var day = date.getDate() + '日';
                    return '\n' + [month, day].join("");
                };

                // 给起始和截止日期加上 xx月-xx日 ,最后的形式: 星期一 4月-28日
                arrDate = data.date;
                arrDate[0] += formatWeekDay(fromDate);
                arrDate[arrDate.length - 1] += formatWeekDay(untilDate);

                arrData = data.data;
                // ms: 6.86 h 
                // phd: 8.00 h
                var degreeRegExp = /ms/i;
                var markLineData = [{
                    label: {
                        normal: {
                            formatter: '{b}' + (degreeRegExp.test(data.degree) ? 6.86 : 8) + ' h'
                        }
                    },
                    name: '基准时长',
                    coord: [arrDate[0], degreeRegExp.test(data.degree) ? 6.86 : 8]
                }, {
                    name: '基准时长',
                    coord: [arrDate[arrDate.length - 1], degreeRegExp.test(data.degree) ? 6.86 : 8]
                }];
                console.info("基准时间:", markLineData);
                var totalTime = 0;
                for (var i = 0, len = arrData.length; i < len; i++) {
                    totalTime += arrData[i];
                }
                return {
                    "date": arrDate,
                    "data": arrData,
                    "totalTime": Math.round(totalTime) + ' h',
                    "baseLine": markLineData
                };
            }, function(response) {
                return "error";
            });
            return obj;
        }
        return chart;
    }]);
