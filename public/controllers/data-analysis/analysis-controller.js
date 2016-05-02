'use strict';
angular.module('myApp').controller('AnalysisCtrl', ['$scope', '$http', 'setRangeDateService', 'drawComputeChartsService', 'drawPersonalChartsService', 'drawLabChartsService',
    function($scope, $http, setRangeDateService,drawComputeChartsService, drawPersonalChartsService, drawLabChartsService) {
        // 初始化日期选择范围
        var rangeDate = setRangeDateService.setRangeDate();
        $scope.fromDate = rangeDate.fromDate;
        $scope.untilDate = rangeDate.untilDate;
        $scope.tooltip = {
            "title1": "查询计算机与理论研究所在这段日期的签到情况",
            "title2": "输入导师姓名，可查看该导师学生的签到情况",
            "title3": "输入实验室全称，如升后212或113-1,可查看该实验室学生的签到情况",
            "title4": "输入个人姓名，可查看该学生的签到情况"
        };

        // 基于准备好的dom，初始化echarts实例
        var myComputeChart = echarts.init(document.getElementById('chart-compute'));
        var myLabChart = echarts.init(document.getElementById('chart-lab'));
        var myTutorChart = echarts.init(document.getElementById('chart-tutor'));
        var myPersonalChart = echarts.init(document.getElementById('chart-person'));
        // 指定图表的配置项和数据
        var optionCompute = {
            title: {
                text: '理论研究所学生到勤率'
            },
            tooltip: {
                trigger: 'axis',
                formatter: '{b}:<br> {c}%'
            },
            legend: {
                data: ['按时率']
            },
            xAxis: {
                type: 'category',
                data: []
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} %'
                }
            },
            series: [{
                name: '按时率',
                type: 'line',
                data: []
            }]
        };
        var optionPersonal = {
            title: {
                text: '个人时长统计'
            },
            tooltip: {
                trigger: 'axis',
                formatter: '{b}:<br> {c} 小时'
            },
            legend: {
                data: ['个人时长']
            },
            toolbox: {
                show: true,
                feature: {
                    dataView: { readOnly: true },
                    magicType: { type: ['bar'] },
                    restore: {},
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                data: []
            },
            yAxis: {
                type: 'value',
                name: '时长:h'
            },
            series: [{
                name: '个人时长',
                type: 'line',
                data: []
            }]
        };
        var optionTutor = {
            title: {
                text: '导师学生时长',
                bottom: 'bottom'
            },
            tooltip: {},
            legend: {
                data: []
            },
            xAxis: {
                type: 'category',
                name: '时间',
                data: ['2016-04-01', '2016-04-02', '2016-04-03', '2016-04-04']
            },
            yAxis: {
                type: 'value',
                name: '时长:h',
                data: [6, 7, 8, 9, 10]
            },
            series: [{
                name: '',
                type: 'line',
                data: []
            }]
        };
        var optionLab = {
            title: {
                text: '实验室平均时长',
                bottom: 'bottom'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: []
            },
            xAxis: {
                type: 'category',
                data: []
            },
            yAxis: {
                // name: '时长:h',
                type: 'value'
            },
            toolbox: {
                show: true,
                bottom: 'bottom',
                feature: {
                    dataView: { readOnly: true },
                    magicType: { type: ['bar'] },
                    restore: {},
                    saveAsImage: {}
                }
            },
            series: []
        };

        // 使用刚指定的配置项和数据初始化空图表。
        myComputeChart.setOption(optionCompute);
        myLabChart.setOption(optionLab);
        myPersonalChart.setOption(optionPersonal);
        myTutorChart.setOption(optionTutor);

        // 动态更新图表数据
        $scope.searchDate = function() {
            var res = drawComputeChartsService.getComputeChart('/compute/',
                $scope.fromDate, $scope.untilDate);
            if (res === "date-error") {
                console.error("日期格式输入有误");
                return;
            }
            res.then(function(response) {
                myComputeChart.setOption({
                    xAxis: {
                        data: response.date
                    },
                    series: [{
                        name: "按时率",
                        data: response.data
                    }]
                });
            }, function(response) {
                console.info(response);
                console.error("获取计算机系到勤率失败");
            });
        };

        $scope.getLabData = function() {
            console.info("实验室名称:", $scope.labName);
            var res = drawLabChartsService.getLabChart('/lab/',
                $scope.labName, $scope.fromDate, $scope.untilDate);
            if (res === "date-error") {
                console.error("日期格式输入有误");
                return;
            }
            if (res === "name-error") {
                console.error("姓名格式输入错误");
                return;
            }
            res.then(
                function(response) {
                    // 请求成功
                    myLabChart.setOption({
                        legend: {
                            data: response.name
                        },
                        xAxis: {
                            data: response.date
                        },
                        series: response.data
                    })
                },
                function(response) {
                    // 请求失败
                });
        };

        $scope.getPernalData = function() {
            console.info("姓名:", $scope.name);
            var res = drawPersonalChartsService.getPersonalChart('/personal/',
                $scope.name, $scope.fromDate, $scope.untilDate);
            if (res === "date-error") {
                console.error("日期格式输入错误");
                return;
            }
            if (res === "name-error") {
                console.error("姓名格式输入有误");
                return;
            }
            res.then(
                function(response) {
                    // 请求成功
                    console.info("返回的数据:", response);
                    myPersonalChart.setOption({
                        xAxis: {
                            data: response.date
                        },
                        series: [{
                            name: "个人时长",
                            data: response.data,
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
                        }]
                    });
                },
                function(response) {
                    // 请求失败
                });
        }
    }
]);
