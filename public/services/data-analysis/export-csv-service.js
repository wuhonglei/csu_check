// 将数据导出为csv格式 服务
angular.module('export2CSVService', [])
    .service('exportToCSVService', function() {
        this.download = function(name, date, data, degree, fileName) {
            //////////
            // name: ["吴洪磊", "高跃进", "姜旦明"]
            // date: ["星期一", "星期二"] //
            // data: [[3, 4], [4, 5], [6, 7]]
            // degree: ["ms", "ms", "ms"]
            //////////
            // 添加时间总计,是否合格字段
            
            // date.push("时间总计");
            // date.push("是否合格");

            var timeBase = {
                "MS": 48,
                "ms": 48,
                "PhD": 56,
                "phD": 56,
                "phd": 56,
                "PHD": 56
            };

            // 填充时间总计, 是否合格
            // for (var i = 0, len = data.length; i < len; i++) {
            //     // 存放个人的时间总计
            //     var count = 0;
            //     for (var j = 0, LEN = data[i].length; j < LEN; j++) {
            //         count += data[i][j];
            //         // console.info("时间:", count);
            //     }
            //     count = Math.round(count);
            //     data[i].push(count);
            //     var isMeet = (count < timeBase[degree[i]]) ? "不合格" : "合格";
            //     data[i].push(isMeet);
            // }
            
            // 用来存放excel表格中的内容
            var CSVContent = '';
            console.info("表格内容:", CSVContent);
            // 添加excel表头, 姓名
            CSVContent += name.join(",") + "\n";

            // 填充CSVContent, 行存放姓名, 列存放日期(星期几)
            // 如果用来导出数据
            for (var i = 0, len = date.length; i < len; i++) {
                var row = '';
                for (var j = 0, LEN = data.length; j < LEN; j++) {
                    row += data[j][i] + ',';
                }
                // 删掉最后一个多余的逗号
                // row.slice(0, -1);
                CSVContent += date[i] + ',' + row + "\n";
            }
            var uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURI(CSVContent);
            //this trick will generate a temp <a /> tag
            var link = document.createElement("a");
            link.href = uri;

            //set the visibility hidden so it will not effect on your web-layout
            link.style = "visibility:hidden";
            link.download = fileName + ".csv";

            //this part will append the anchor tag and remove it after automatic click
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
