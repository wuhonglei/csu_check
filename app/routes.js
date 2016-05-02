module.exports = function(router) {

    // server routes ===========================================================
    // handle things like api calls
    // authentication routes


    // middleware to use for all requests
    router.use(function(req, res, next) {
        // do logging
        console.log('something is happening.');
        // 允许跨域请求
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        // make sure we go to the next routes and don't stop here
        next();
    });

    // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
    router.get('/', function(req, res) {
        res.json({ "message": "welcome to our api" });
    });


    var Day = require('./models/Nerd').Day;
    // 模型: 个人
    var Person = require('./models/Nerd').Person;
    // 获取某个日期是星期几
    var getWeekDay = function(detailDate) {
        var weekday = new Array(7);
        weekday[0] = "星期天";
        weekday[1] = "星期一";
        weekday[2] = "星期二";
        weekday[3] = "星期三";
        weekday[4] = "星期四";
        weekday[5] = "星期五";
        weekday[6] = "星期六";
        return weekday[detailDate.getDay()];
    };
    // 查询某天 详细签到情况
    router.route('/detail/:day')
        .get(function(req, res) {
            console.info("查询日期:", req.params.day);
            Day.find({ date: req.params.day }, function(err, data) {
                if (err) throw err;
                // console.info(data)
                // var data_json = JSON.parse(data);
                // console.info("类型:", data);
                res.json(data[0].data);
            });
        });
    // 查询理论研究所某段时间的按时到勤率
    router.route('/compute/:fromDate/:untilDate')
        .get(function(req, res) {
            // 起始日期, 截止日期
            var fromDate = req.params.fromDate;
            var untilDate = req.params.untilDate;

            Day.find({
                date: {
                    $gte: fromDate,
                    $lte: untilDate
                }
            }).sort({ date: 1 }).
            exec(function(err, data) {
                if (err) throw err;

                var arrDate = [];
                var arrData = [];
                // 遍历不同日期
                data.forEach(function(value, idnex) {
                    // 统计按时与不按时的数目
                    var unlateCount = 0;
                    var lateCount = 0;

                    // 数据项长度
                    var len = value.data.length;
                    var items = value.data;
                    // 便利具体某天
                    for (var i = 0; i < len; i++) {
                        if (items[i][10] === "按时") unlateCount++;
                        if (items[i][10] === "未按时") lateCount++;
                    }
                    console.info("按时数目:", unlateCount);
                    console.info("不按时数目:", lateCount);

                    var rate = Math.round(unlateCount / (unlateCount + lateCount) * 100);
                    arrDate.push(getWeekDay(value.date));
                    arrData.push(rate);
                })
                res.json({ "date": arrDate, "data": arrData });
            });
        });
    // 查询某段时间个人的签到记录
    router.route('/personal/:person/:fromDate/:untilDate')
        .get(function(req, res) {
            var name = req.params.person;
            var fromDate = req.params.fromDate;
            var untilDate = req.params.untilDate;

            Person.find({
                date: { $gte: fromDate, $lte: untilDate },
                'data.name': name
            }).
            sort({ date: 1 }).
            exec(function(err, data) {
                // console.info(data);
                var len = data.length;
                console.info("日期长度:", len);
                var date_arr = [];
                var time_arr = [];

                data.forEach(function(value, index) {
                    date_arr.push(getWeekDay(value.date));
                    var len2 = value.data.length;
                    for (var i = 0; i < len2; i++) {
                        if (value.data[i].name === name) {
                            time_arr.push(value.data[i].time);
                            break;
                        }
                    }
                    // res.json(value.data);
                })
                res.json({ "date": date_arr, "data": time_arr });
            })
        });
    // 查询某段时间实验室的签到记录
    router.route('/lab/:lab/:fromDate/:untilDate')
        .get(function(req, res) {
            // 获取传入的参数,实验室名, 起始日期, 结束日期
            var lab = req.params.lab;
            var fromDate = req.params.fromDate;
            var untilDate = req.params.untilDate;

            Person.find({
                date: { $gte: fromDate, $lte: untilDate },
                'data.lab': lab
            }).
            sort({ date: 1 }).
            exec(function(err, data) {
                // console.info(data);
                var len = data.length;
                console.info("日期长度:", len);
                // res.json(data);
                // return;
                var name_arr = [];
                var date_arr = [];
                var time_arr = new Array();

                data.forEach(function(value, index) {
                    date_arr.push(getWeekDay(value.date));
                    var len2 = value.data.length;
                    // 某个实验室最多有30人, 减少查询次数
                    var index = len2;
                    for (var i = 0; i < len2; i++) {
                        if (value.data[i].lab === lab) {
                            name_arr.push(value.data[i].name);
                            time_arr.push(value.data[i].time);
                            index = i;
                        }
                        // 说明该实验室已经遍历完
                        if (i - index > 1) break;
                    }
                    // res.json(value.data);
                });
                var len3 = name_arr.length;
                // console.info("实验室人员:", name_arr);
                var increase;
                // 判断该实验室人数
                if (len === 1) {
                    // 如果查询日期只有一天
                    increase = name_arr.length;
                } else {
                    increase = name_arr.indexOf(name_arr[0], 1);
                }
                name_arr = name_arr.slice(0, increase);
                // console.info("实验室人数:", increase);
                // 用来存放实验室每个人某段时间的签到时间
                var totalTime = [];
                // 初始化数组
                for (var i = 0, len = increase; i < increase; i++) {
                    totalTime.push(new Array());
                }
                for (var i = 0, len = len3; i < len; i++) {
                    totalTime[i % increase].push(time_arr[i]);
                }

                res.json({ "date": date_arr, "name": name_arr, "data": totalTime });
            })
        });
    // frontend routes =========================================================
    // route to handle all angular requests
    router.get('*', function(req, res) {
        res.sendfile(__dirname + '/public/index.html');
    });


};

////////////////////////////////////////////////////////////////////////
///////////////////////                                               //
//                                                                    //
//  后台存在的问题:                                                          //
//      1. 如何获取请求的参数                                                  //
//           get请求参数的获取 req.query                                     //
//           post请求参数的获取:                                             //
//                    1.POST type = application/x-www-form-urlencoded //
//                    2.req.body.variable_name                        //
//           RESTFul 请求参数的获取 req.params.<variable_name>
//      2. 数据库如何存数据
//          在使用mongoose.model('modelname', schama_boject, collection_name);
//          model_instance.save();
//      3. scheme模式                                                   //
//         var Schema = mongoose.Schema;
//         var shemaName = new Schema({})         
//
//                                                                    //
///////////////////////                                               //
////////////////////////////////////////////////////////////////////////
