angular.module('ShowTableFilter', [])
    .filter('tableFilter', function() {
        /**
         * @param  {[数组]} tableItems 包含很多数组元素的数组
         * @param  {[对象]}	待搜索的规则
         * @return {[array]}	符合搜索规则的数组
         */
        return function(tableItems, search) {
            var out = [];
            var NAME_PATTERN = /^[\u4e00-\u9fa5]+/i;
            var LAB_PATTERN = /(^[\u4e00-\u9fa5]+\-?[\d]*|^\d+\-?\d+$)/i;
            var PUNCTUAL_PATTERN = /(^按时|^未按时)/i;
            /**
             * [isNameValid description]
             * @type {Boolean}
             * @return {[Boolean]} [字符串满足匹配规则返回true]
             */
            var isNameValid = NAME_PATTERN.test(search.name);
            var isLabValid = LAB_PATTERN.test(search.lab);
            var isPunctual = PUNCTUAL_PATTERN.test(search.isPunctual);

            // 如果三种条件都为真， 那只有数组中的元素同时满足这三种条件才能返回该元素
            angular.forEach(tableItems, function(item, key) {
                // 寻找匹配的下标
                var indexName = item[1].search(search.name);
                var indexLab = item[0].search(search.lab);
                var indexPunctual = item[10].search(search.isPunctual);

                // 判断合法的组合
                var isNameMeet = (!isNameValid || isNameValid && indexName != -1);
                var isLabMeet = (!isLabValid || isLabValid && indexLab != -1);
                var isPunctualMeet = (!isPunctual || isPunctual && indexPunctual == 0);
                if (isNameMeet && isLabMeet && isPunctualMeet) {
                    // 将最后一列, 在线时长格式化为 数字型
                    out.push(item);
                }
            });
            return out;
        }
    });
