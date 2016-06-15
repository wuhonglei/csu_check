angular.module('showRangeDateServie', [])
    .factory('setRangeDateService', function() {
        return {
            setRangeDate: function() {
                var today = new Date();
                var oneDay = 24 * 60 * 60 * 1000;
                var millUntilNow = Date.parse(today);
                var weekDay = today.getDay();
                // 如果是星期天, 为了方便比较我们设置为7
                if (weekDay === 0) weekDay = 7;
                if (weekDay < 5) {
                    // 将日期设置为上星期的星期一至星期天
                    return {
                        fromDate: new Date(millUntilNow - (6 + weekDay) * oneDay),
                        untilDate: new Date(millUntilNow - weekDay * oneDay)
                    }
                }
                if (weekDay >= 5) {
                    // 将日期设置为本周星期一至今天
                    return {
                        fromDate: new Date(millUntilNow - (weekDay - 1) * oneDay),
                        untilDate: new Date(millUntilNow)
                    }
                }
            }
        }
    });
