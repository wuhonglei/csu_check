var request = require("request");
var cheerio = require('cheerio');
var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/cs_stu_check');
// var db = mongoose.connect;

var Schema = mongoose.Schema;

//////////////////////
//Schema:  每天的详细签到  //
//////////////////////
var userSchema = new Schema({
    date: Date,
    data: Array
});

//////
// Schema 个人信息 //
//////
var persSchema = new Schema({
    date: Date,
    data: [{
        name: String,
        time: Number,
        lab: String,
        degree: String,
        isNotPunctual: { type: Number, default: 0 },
        Tutor: { type: String, default: "" }
    }]
});
// the schema is useless so far 
// we need to create a model using it 
var DayDetail = mongoose.model('DayDetail', userSchema, 'detail_attendancy');
var PersonOneDay = mongoose.model('PersonOneDay', persSchema, 'person');
var updateMongoDB = function(url, day) {
    request(url, function(error, response, html) {
        if (!error && response.statusCode == 200) {
            // console.log(html) // Show the HTML for the Google homepage.
            $ = cheerio.load(html, {
                normalizeWhitespace: true,
                xmlMode: true,
                decodeEntities: true
            });

            // 提取表头
            var arr_key = [];
            $("th").each(function(index, th_value) {
                arr_key.push($(th_value).text());
            });
            var len1 = arr_key.length;
            arr_key[len1 - 1] = arr_key[len1 - 1].split("(分钟)")[0] + "(小时)";
            for (var i = 5; i <= 9; i = i + 2) {
                arr_key[i] = "离开时间";
            }

            // 用来存放每天每个人的详细签到数据
            var date_arr = [];
            // 用来存放每天 个人时长, 相关信息
            var person_data = [];

            date_arr.push(arr_key);

            // 提取日在线时长字符串中的数字, 转化为Number
            var tranferHour = function(str) {
                var res = str.split(/小时|分/);
                var h = res[0];
                var m = Math.round(res[1] / 60 * 10);
                if (m == 10) {
                    h++;
                    m = 0;
                }
                return [h, m].join(".");
            }

            // 判断是否按时, 不按时记为1, 按时记为0, 星期六, 星期天, 不作记录
            var isNotPunctual = function(punctual) {
                var today = new Date(day);
                var weekDay = today.getDay();
                if (punctual === "未按时" && weekDay != 0 && weekDay != 6) {
                    return 1;
                } else {
                    return 0;
                }
            };

            $("tr").each(function(index_out, each_tr) {
                var per_arr = [];
                $($(each_tr).children("td")).each(function(index_in, each_td) {
                    // 提取td包含的内容
                    var text = $(each_td).text();

                    // 截取到达时间, 离开时间字符串中的字串
                    if (index_in >= 4 && index_in <= 9 && text != "null") {
                        text = text.substr(11, 8);;
                        // console.info(text);
                    }
                    per_arr.push(text);
                });
                // 如果提取的表格存在内容
                if (per_arr[0]) {
                    var len = per_arr.length;
                    per_arr[len - 1] = Number(tranferHour(per_arr[len - 1]));
                    var person_obj = {};
                    person_obj.lab = per_arr[0];
                    person_obj.name = per_arr[1];
                    person_obj.degree = per_arr[3];
                    person_obj.time = per_arr[11];
                    person_obj.isNotPunctual = isNotPunctual(per_arr[10]);
                    person_data.push(person_obj);
                    date_arr.push(per_arr);
                }
            });

            // console.info(JSON.stringify(date_arr));
            // var detail_doc = new DayDetail({
            //     date: new Date(day),
            //     data: date_arr
            // });

            // var person_doc = new PersonOneDay({
            //     date: new Date(day),
            //     data: person_data
            // });

            // ==============在数据库中查找特定日期的documents, 如果存在则更新, 不存在则创建新的documents=====================
            var query = { date: new Date(day) };
            // console.info("查询日期:", query);
            DayDetail.update(query, {
                date: new Date(day),
                data: date_arr
            }, {
                upsert: true
            }).exec();

            PersonOneDay.update(query, {
                date: new Date(day),
                data: person_data
            }, {
                upsert: true
            }).exec();
            // ==================================================
        }
    });
};


// 每半小时从网页上抓取一次数据
var Interval = 0.1 * 60 * 60 * 1000;
var url = "http://202.197.61.249:8080/2.05/Show2.jsp?day=";


var grabPage = function() {
    // var startDate = Date.parse(new Date("2016-03-01"));
    // var endDate = Date.parse(new Date("2016-05-09"));
    // var oneDay = 24 * 60 * 60 * 1000;
    // for (var i = startDate; i <= endDate; i += oneDay) {
    // }
    setInterval(function() {
        var cur_d = new Date();
        var y = cur_d.getFullYear();
        var m = cur_d.getMonth() + 1;
        var d = cur_d.getDate();
        if (m < 10) { m = '0' + m; }
        if (d < 10) { d = '0' + d; }
        var setDate = [y, m, d].join("-");
        var newURL = url + [y, m, d].join("");
        updateMongoDB(newURL, setDate);
    }, Interval);
};
module.exports = grabPage;
