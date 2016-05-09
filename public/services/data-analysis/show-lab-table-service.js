// 将数据导出为csv格式 服务
angular.module('showLabTableDetail', [])
    .service('showLabTable', function() {
        this.getLabTable = function(name, date, data, degree) {
            //////////
            // name: ["吴洪磊", "高跃进", "姜旦明"]
            // date: ["星期一", "星期二"] //
            // data: [[3, 4], [4, 5], [6, 7]]
            // degree: ["ms", "ms", "ms"]
            //////////
            // console.info("日期:", date);
            // console.info("数据:", data);
            // 添加时间总计,是否合格字段

            var dateLen = date.length;
            console.info("日期长度:", dateLen);

            date.push("时间总计");
            date.push("是否合格");

            // ms: 6.86 h 
            // phd: 8.00 h
            var degreeRegExp = /ms/i;

            // 用来显示表格头部, 第一个单元格用空格
            date.unshift("日期");
            var tableHeader = date;
            // 存放表格内容
            var tableContent = [];
            // 填充时间总计, 是否合格
            for (var i = 0, len = data.length; i < len; i++) {
                // 存放个人的时间总计
                var count = 0;
                for (var j = 0, LEN = data[i].length; j < LEN; j++) {
                    count += data[i][j];
                    // console.info("时间:", count);
                }
                count = Math.round(count);
                data[i][dateLen] = count;
                // 判断总时间是否符合要求
                
                var isMeet = (count < (degreeRegExp.test(degree[i]) ? 48 : 56)) ? "不合格" : "合格";
                data[i].push(isMeet);
                data[i].unshift(name[i]);
                tableContent.push(data[i]);
            }
            // console.info("表头:" ,tableHeader);
            // console.info("内容:", tableContent);
            return { header: tableHeader, content: tableContent };
        }
    });
