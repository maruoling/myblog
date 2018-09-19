
var express=require('express');
var cookieParser=require("cookie-parser");
var bodyParser=require("body-parser");
var session=require('express-session'); //session模块
var mysql=require("mysql"); //数据库模块
var fs=require('fs'); //文件操作

//引入模板引擎    模板引擎是前端一个划时代的技术点，有了他的存在，我们拼接字符串的枯燥日子，将不复存在
var swig=require("swig");

var app=express(); //创建web应用程序

//session的使用也需要配置
app.use(session({
    secret:'keyboard cat',
    resave:true,
    saveUninitialized:true,
    cookie:{maxAge:1000*60*60}     //最大时间为60s
}));

//配置swig
app.engine("html",swig.renderFile);     //模板引擎的名称，用来强调后缀名    解析模板引擎的方法
app.set("views","./view");      //第一个参数固定，指设置模板引擎的页面在哪       页面位置
app.set("view engine","html");      //注册引擎，可以开始使用了
swig.setDefaults({cache:false});    //关闭缓存

app.use("/public",express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));

var pool=mysql.createPool({     //数据连接池
    host:'127.0.0.1',
    port:3306,
    database:'myblog',
    user:'root',
    password:'a'
});

//路由：考虑
//
//
app.use("/",require("./routers/main"));     //所有主模块的位置
app.use("/admin",require("./routers/admin"));       //所有后台模块的位置
app.use("/api",require("./routers/api"));       //所有前台逻辑模块的位置


app.listen(80,"127.0.0.1",function(err){
    if(err){
        console.log(err);
    }else{
        console.log("服务器启动成功");
    }
});

