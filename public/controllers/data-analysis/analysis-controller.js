'use strict';
angular.module('myApp').controller('AnalysisCtrl', ['$scope', '$http', 'setRangeDateService', 'drawComputeChartsService', 'drawPersonalChartsService', 'drawLabChartsService', 'showLabTable', 'drawTutorChartsService', '$alert',
    function($scope, $http, setRangeDateService, drawComputeChartsService, drawPersonalChartsService, drawLabChartsService, showLabTable, drawTutorChartsService, $alert) {
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
        // 理论研究所[配置选项]
        var optionCompute = {
            title: {
                text: '理论与软件所到勤率'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: '{b}:<br> {c}%'
            },
            legend: {
                data: ['按时率']
            },
            toolbox: {
                show: true,
                feature: {
                    dataView: { readOnly: true },
                    magicType: { type: ['line'] },
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
                axisLabel: {
                    formatter: '{value} %'
                }
            },
            series: [{
                name: '按时率',
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: 'rgba(47, 69, 84, 1)'
                    }
                },
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                        formatter: '{c} %'
                    }
                },
                data: []
            }]
        };
        // 个人图表配置选项
        var optionPersonal = {
            title: {
                text: '个人时长统计'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: '{b}:<br> {c} 小时'
            },
            legend: {
                data: ['个人时长']
            },
            toolbox: {
                show: true,
                feature: {
                    dataView: { readOnly: true },
                    magicType: { type: ['line'] },
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
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: 'rgba(82, 82, 82, 1)'
                    }
                },
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                        formatter: '{c} h'
                    }
                },
                data: []
            }]
        };
        // 实验室图表[配置选项]
        var optionLab = {
            title: {
                text: '实验室总时长',
                bottom: 'bottom'
            },
            tooltip: {
                // showContent: false,
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function(params) {
                    console.info(params);
                    if (params[0].dataIndex === -1) return '无数据';
                    var totalTime = 0;
                    for (var i = 0, len = params.length; i < len; i++) {
                        totalTime += params[i].value;
                    }
                    return '总时长: ' + Math.round(totalTime) + ' h';
                }
            },
            xAxis: {
                type: 'value',
            },
            yAxis: {
                // name: '时长:h',
                type: 'category',
                data: []
            },
            series: [{
                type: 'bar',
                data: []
            }]
        };

        // 导师图表[配置选项]
        var optionTutor = {
            title: {
                text: '导师学生总时长',
                bottom: 'bottom'
            },
            tooltip: {
                // showContent: false,
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function(params) {
                    console.info(params);
                    if (params[0].dataIndex === -1) return '无数据';
                    var totalTime = 0;
                    for (var i = 0, len = params.length; i < len; i++) {
                        totalTime += params[i].value;
                    }
                    return '总时长: ' + Math.round(totalTime) + ' h';
                }
            },
            xAxis: {
                type: 'value',
            },
            yAxis: {
                // name: '时长:h',
                type: 'category',
                data: []
            },
            series: [{
                type: 'bar',
                data: []
            }]
        };

        /*警告模态框*/
        // 查询成功
        var alertOptionSuc = {
            title: '恭喜!',
            content: '查询成功.',
            container: '.form-group',
            placement: 'top-right',
            type: 'success',
            duration: 3,
            show: false
        };

        // 日期格式或范围输入有误
        var alertOptionDate = {
            title: 'Sorry!',
            content: '日期输入有误.',
            container: '.form-group',
            placement: 'top-right',
            type: 'danger',
            duration: 3,
            show: false
        };

        // 姓名或实验室或导师格式输入有误
        var alertOptionPattern = {
            title: 'Sorry!',
            content: '格式输入有误.',
            container: '.form-group',
            placement: 'top-right',
            type: 'danger',
            duration: 3,
            show: false
        };

        // 无法查询到该信息
        var alertOptionNoData = {
            title: 'Sorry!',
            content: '无法查询到该信息.',
            container: '.form-group',
            placement: 'top-right',
            type: 'warning',
            duration: 3,
            show: false
        };

        // 初始化Alert框配置选项
        var myAlertSuc = $alert(alertOptionSuc);
        var myAlertDate = $alert(alertOptionDate);
        var myAlertPattern = $alert(alertOptionPattern);
        var myAlertNoData = $alert(alertOptionNoData);

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
                myComputeChart.setOption(optionCompute);
                myAlertDate.$promise.then(myAlertDate.show);
                console.error("日期格式输入有误");
                return;
            }
            res.then(function(response) {
                myAlertSuc.$promise.then(myAlertSuc.show);
                myComputeChart.setOption({
                    xAxis: {
                        data: response.date
                    },
                    series: [{
                        name: "按时率",
                        data: response.data,
                        markLine: {
                            label: {
                                normal: {
                                    formatter: '{c} %'
                                }
                            },
                            lineStyle: {
                                normal: {
                                    width: '2',
                                    color: 'rgb(192, 0, 0)',
                                    type: 'dashed'
                                }
                            },
                            data: [{
                                name: '平均到勤率',
                                // 支持 'average', 'min', 'max'
                                type: 'average'
                            }]
                        }
                    }]
                });
            }, function(response) {
                console.info(response);
                console.error("获取计算机系到勤率失败");
            });
        };

        // 请求个人数据
        $scope.getPernalData = function() {
            console.info("姓名:", $scope.name);
            var res = drawPersonalChartsService.getPersonalChart('/personal/',
                $scope.name, $scope.fromDate, $scope.untilDate);
            $scope.showPerson = false;
            if (res === "date-error") {
                myPersonalChart.setOption(optionPersonal);
                myAlertDate.$promise.then(myAlertDate.show);
                console.error("日期格式输入错误");
                return;
            }
            if (res === "name-error") {
                myPersonalChart.setOption(optionPersonal);
                myAlertPattern.$promise.then(myAlertPattern.show);
                console.error("姓名格式输入有误");
                return;
            }
            res.then(
                function(response) {
                    // 请求成功
                    if (response.message === "nodata") {
                        myPersonalChart.setOption(optionPersonal);
                        myAlertNoData.$promise.then(myAlertNoData.show);
                        console.warn("个人图标没有数据");
                        return;
                    }
                    myAlertSuc.$promise.then(myAlertSuc.show);
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
                                        width: '2',
                                        color: 'rgb(192, 0, 0)',
                                        type: 'dashed'
                                    }
                                },
                                data: [{
                                        label: {
                                            normal: {

                                                formatter: '平均{c} h'
                                            }
                                        },
                                        name: '平均时长',
                                        // 支持 'average', 'min', 'max'
                                        type: 'average'
                                    },
                                    response.baseLine
                                ]
                            }
                        }]
                    });
                    $scope.showPerson = true;
                    $scope.personTotalTime = response.totalTime;
                },
                function(response) {
                    // 请求失败
                });
        }

        // 请求实验室数据
        $scope.getLabData = function() {
            console.info("实验室名称:", $scope.labName);
            var res = drawLabChartsService.getLabChart('/lab/',
                $scope.labName, $scope.fromDate, $scope.untilDate);
            if (res === "date-error") {
                myLabChart.setOption(optionLab);
                myAlertDate.$promise.then(myAlertDate.show);
                console.error("日期格式输入有误");
                return;
            }
            if (res === "name-error") {
                myLabChart.setOption(optionLab);
                myAlertPattern.$promise.then(myAlertPattern.show);
                console.error("实验室格式输入错误");
                return;
            }
            res.then(
                function(response) {
                    if (response.message === "nodata") {
                        myLabChart.setOption(optionLab);
                        myAlertNoData.$promise.then(myAlertNoData.show);
                        console.warn("实验室图标没有数据");
                        return;
                    }
                    myAlertSuc.$promise.then(myAlertSuc.show);
                    // 清空当前实例
                    myLabChart.clear();
                    // 请求成功
                    var option = {
                        title: {
                            text: '实验室总时长',
                            bottom: 'bottom'
                        },
                        tooltip: {
                            // showContent: false,
                            trigger: 'axis',
                            axisPointer: { // 坐标轴指示器，坐标轴触发有效
                                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                            }
                        },
                        legend: {
                            data: response.name
                        },
                        xAxis: {
                            type: 'value',
                            name: '总时长 (h)'
                        },
                        yAxis: {
                            type: 'category',
                            data: response.date
                        },
                        series: response.data
                    };

                    myLabChart.setOption(option);
                    // console.info("图标实例化之后:", myLabChart.getOption());

                    // 有数据展示时展开表格
                    $scope.activePanelsLab = 0;
                    var tableObj = showLabTable.getLabTable(response.name,
                        response.date, response.metaData, response.late, response.degree);
                    // 设置表格底部, colspan 的数目
                    $scope.lab_td_length = response.date.length;
                    $scope.lab = {
                        header: tableObj.header,
                        content: tableObj.content
                    };


                    var dateFormat = function(date) {
                        var month = date.getMonth() + 1;
                        var day = date.getDate();
                        month = ((month < 10) ? '0' : '') + month + '月';
                        day = ((day < 10) ? '0' : '') + day + '日';
                        return [month, day].join("-");
                    }
                    var fileName = $scope.labName + "实验室" + dateFormat($scope.fromDate) + "至" + dateFormat($scope.untilDate);

                    response.metaData.unshift(response.date);
                    $scope.CSVContent = response.metaData;
                    $scope.filename = fileName;
                },
                function(response) {
                    // 请求失败
                    console.error("实验室图标请求失败");
                    return;
                });
        };

        // 请求导师数据
        $scope.getTutorData = function() {
            console.info("导师名字名称:", $scope.tutorName);
            var res = drawTutorChartsService.getTutorChart('/tutor/',
                $scope.tutorName, $scope.fromDate, $scope.untilDate);
            if (res === "date-error") {
                myTutorChart.setOption(optionTutor);
                myAlertDate.$promise.then(myAlertDate.show);
                console.error("日期格式输入有误");
                return;
            }
            if (res === "name-error") {
                myTutorChart.setOption(optionTutor);
                myAlertPattern.$promise.then(myAlertPattern.show);
                console.error("姓名格式输入错误");
                return;
            }
            res.then(
                function(response) {
                    if (response.message === "nodata") {
                        myTutorChart.setOption(optionTutor);
                        myAlertNoData.$promise.then(myAlertNoData.show);
                        console.warn("导师图表没有数据");
                        return;
                    }
                    myAlertSuc.$promise.then(myAlertSuc.show);
                    // 清空当前实例
                    myTutorChart.clear();
                    // 请求成功
                    var option = {
                        title: {
                            text: '导师学生总时长',
                            bottom: 'bottom'
                        },
                        tooltip: {
                            // showContent: false,
                            trigger: 'axis',
                            axisPointer: { // 坐标轴指示器，坐标轴触发有效
                                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                            }
                        },
                        legend: {
                            data: response.name
                        },
                        xAxis: {
                            type: 'value',
                            name: '总时长 (h)'
                        },
                        yAxis: {
                            type: 'category',
                            data: response.date
                        },
                        series: response.data
                    };

                    myTutorChart.setOption(option);

                    // 有数据展示时展开表格
                    $scope.activePanelsTutor = 0;
                    var tableObj = showLabTable.getLabTable(response.name,
                        response.date, response.metaData, response.late, response.degree);
                    // 设置表格底部, colspan 的数目
                    $scope.tutor_td_length = response.date.length;
                    $scope.tutor = {
                        header: tableObj.header,
                        content: tableObj.content
                    };

                    var dateFormat = function(date) {
                        var month = date.getMonth() + 1;
                        var day = date.getDate();
                        month = ((month < 10) ? '0' : '') + month + '月';
                        day = ((day < 10) ? '0' : '') + day + '日';
                        return [month, day].join("-");
                    }
                    var fileName = dateFormat($scope.fromDate) + "至" + dateFormat($scope.untilDate) + "学生签到";

                    response.metaData.unshift(response.date);
                    $scope.CSVContentTutor = response.metaData;
                    $scope.filenameTutor = fileName;
                });

            // ========================显示实验室表格==============================//
        };
    }
]);
