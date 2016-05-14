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

    // 模型: 具体某天详细的签到记录
    var Day = require('./models/Nerd').Day;
    // 模型: 个人
    var Person = require('./models/Nerd').Person;
    // 模型: 导师
    var Tutor = require('./models/Nerd').Tutor;
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
            // console.info("查询日期:", req.params.day);
            Day.find({ date: req.params.day }, function(err, data) {
                if (err) throw err;
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
                    // console.info("按时数目:", unlateCount);
                    // console.info("不按时数目:", lateCount);

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
                // 按日期升序排序
            sort({ date: 1 }).
            exec(function(err, data) {
                if (err) throw err;
                var len = data.length;
                if (len === 0) {
                    res.json({ message: "nodata" });
                    return;
                }
                // console.info("个人数据:", data);
                // console.info("日期长度:", len);
                var date_arr = [];
                var time_arr = [];
                var degree;
                data.forEach(function(value, index) {
                        date_arr.push(getWeekDay(value.date));
                        var len2 = value.data.length;
                        for (var i = 0; i < len2; i++) {
                            if (value.data[i].name === name) {
                                time_arr.push(value.data[i].time);
                                degree = JSON.parse(JSON.stringify(value.data[i])).degree;
                                break;
                            }
                        }
                    })
                    // console.info("学位:", degree);
                res.json({ "date": date_arr, "data": time_arr, "degree": degree });
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
                date: { $gte: fromDate, $lte: untilDate }
                //, 'data.lab': lab
            }).
            sort({ date: 1 }).
            exec(function(err, data) {
                if (err) throw err;
                var arrName = [];
                var arrDate = [];
                var arrTime = [];
                var arrDegree = [];
                var arrNotPunctual = [];
                if (data.length === 0) {
                    res.json({ message: "nodata" });
                    return;
                }

                // data存放的是日期范围内所有用户的数据
                data.forEach(function(value, index) {
                    // 存放某个日期的姓名, 时间, 学位数组
                    var name = [];
                    var time = [];
                    var degree = [];
                    var isNotPunctual = [];
                    for (var i = 0, index = len = value.data.length; i < len; i++) {
                        if (value.data[i].lab === lab) {
                            degree.push(JSON.parse(JSON.stringify(value.data[i])).degree);
                            name.push(value.data[i].name);
                            time.push(value.data[i].time);
                            isNotPunctual.push(value.data[i].isNotPunctual);
                            index = i;
                        }
                        // 说明该实验室已经遍历完
                        if (i - index > 1) break;
                    }

                    arrName.push(name);
                    arrTime.push(time);
                    arrNotPunctual.push(isNotPunctual);
                    arrDegree.push(degree);
                    arrDate.push(getWeekDay(value.date));
                });

                // 格式化数据
                var finalName = [];
                var finalTime = [];
                var finalNotPunctual = [];
                var finalDegree = [];
                var viewedName = [];
                // 遍历姓名数组
                for (var i = 0, len = arrName.length; i < len; i++) {
                    // 遍历每天的姓名数组
                    for (var j = 0, LEN = arrName[i].length; j < LEN; j++) {
                        // 存放当前访问的姓名
                        var name = arrName[i][j];
                        var index = viewedName.indexOf(name);
                        // 第一次访问该姓名
                        if (index === -1) {
                            // 存放个人时间
                            var time = new Array();
                            var punctual = new Array();
                            time[i] = arrTime[i][j];
                            punctual[i] = arrNotPunctual[i][j];
                            viewedName.push(name);
                            finalName.push(name);
                            finalDegree.push(arrDegree[i][j]);
                            finalTime.push(time);
                            finalNotPunctual.push(punctual);
                        } else {
                            finalTime[index][i] = arrTime[i][j];
                            finalNotPunctual[index][i] = arrNotPunctual[i][j];
                        }
                    }
                }
                res.json({ "date": arrDate, "name": finalName, "data": finalTime, "late": finalNotPunctual, "degree": finalDegree });
            })
        });

    // 查询某段时间某位导师所带学生的签到记录
    router.route('/tutor/:tutor/:fromDate/:untilDate')
        .get(function(req, res) {
            // 获取传入的参数, 导师名字, 起始日期, 截止日期
            var tutorName = req.params.tutor;
            var fromDate = req.params.fromDate;
            var untilDate = req.params.untilDate;

            // 查询导师带学生
            Tutor.find({
                name: tutorName
            }).
            exec(function(err, data) {
                if (err) throw err;

                // 如果没有查询到该导师信息
                if (data.length === 0) {
                    res.json({ message: "nodata" });
                    return;
                }

                // 存放导师所带学生姓名
                var studentsName = data[0].students;

                // 再次请求数据库, 查询这段时间内个人的签到信息
                Person.find({
                    date: { $gte: fromDate, $lte: untilDate }
                    //, 'data.lab': lab
                }).
                sort({ date: 1 }).
                exec(function(err, data) {
                    if (err) throw err;

                    if (data.length === 0) {
                        res.json({ message: "nodata" });
                        return;
                    }
                    // 分别用来存放日期, 姓名, 时间, 学位
                    var arrDate = [];
                    var arrName = [];
                    var arrTime = [];
                    var arrDegree = [];
                    var arrNotPunctual = [];

                    // data存放的是日期范围内所有用户的数据
                    data.forEach(function(value, index) {
                        // 存放某个日期的姓名, 时间, 学位数组
                        var name = [];
                        var time = [];
                        var degree = [];
                        var isNotPunctual = [];
                        for (var i = 0, len = value.data.length; i < len; i++) {
                            if (studentsName.indexOf(value.data[i].name) != -1) {
                                // console.info("姓名:", value.data[i].name);
                                degree.push(JSON.parse(JSON.stringify(value.data[i])).degree);
                                name.push(value.data[i].name);
                                time.push(value.data[i].time);
                                isNotPunctual.push(value.data[i].isNotPunctual);
                            }
                        }

                        arrName.push(name);
                        arrTime.push(time);
                        arrNotPunctual.push(isNotPunctual);
                        arrDegree.push(degree);
                        arrDate.push(getWeekDay(value.date));

                    });

                    var finalName = [];
                    var finalTime = [];
                    var finalNotPunctual = [];
                    var finalDegree = [];
                    var viewedName = [];
                    // 遍历姓名数组
                    for (var i = 0, len = arrName.length; i < len; i++) {
                        // 遍历每天的姓名数组
                        for (var j = 0, LEN = arrName[i].length; j < LEN; j++) {
                            // 存放当前访问的姓名
                            var name = arrName[i][j];
                            var index = viewedName.indexOf(name);
                            // 第一次访问该姓名
                            if (index === -1) {
                                // 存放个人时间
                                var time = new Array();
                                var punctual = new Array();
                                time[i] = arrTime[i][j];
                                punctual[i] = arrNotPunctual[i][j];
                                viewedName.push(name);
                                finalName.push(name);
                                finalDegree.push(arrDegree[i][j]);
                                finalTime.push(time);
                                finalNotPunctual.push(punctual);
                            } else {
                                finalTime[index][i] = arrTime[i][j];
                                finalNotPunctual[index][i] = arrNotPunctual[i][j];
                            }
                        }
                    }

                    res.json({ "date": arrDate, "name": finalName, "data": finalTime, "late": finalNotPunctual, "degree": finalDegree });

                });

            });
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
