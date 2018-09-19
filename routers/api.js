var express=require("express");
var mysql=require("mysql");

//配置数据库连接池
var pool=mysql.createPool({
    host:'127.0.0.1',           //IP地址
    port:3306,                  //端口号
    database:'myblog',          //数据库
    user:'root',                //用户名
    password:'a'
});
//路由操作，第一步：需要加载路由
var router=express.Router();

//第二步：处理请求
router.get("/",function (req,res) {
    res.render("admin/index");
});

//第三步，将这个支线模块，加载到主模块里面去
module.exports=router;

//
var resData;
router.use(function (req,res,next) {
    resData={
        code:-1,
        message:""
    };
    next();
});

//注册
router.post("/user/register",function (req,res,next) {
    var uname=req.body.username;
    var pwd=req.body.password;
    pool.getConnection(function (err,conn) {
        if (err){
            resData.code=0;
            resData.message="网络连接失败，请稍后重试";
            res.json(resData);
        } else {
            conn.query("select * from user where uname=?",[uname],function (err,result) {
                if (err){
                    resData.code=0;
                    resData.message="网络连接失败，请稍后重试";
                    res.json(resData);
                } else if (result.length>0){
                    resData.code=1;
                    resData.message="该用户已经注册过";
                    res.json(resData);
                } else {
                    //
                    conn.query("insert into user values(null,?,?,0,0)",[uname,pwd],function (err,result) {
                        conn.release();
                        if (err){
                            resData.code=0;
                            resData.message="网络连接失败，请稍后重试";
                            res.json(resData);
                        }else {
                            resData.code=2;
                            resData.message="注册成功";
                            res.json(resData);
                        }
                    });
                }
            });
        }
    })
});

//登录
router.post("/user/login",function (req,res,next) {
    var uname=req.body.username;
    var pwd=req.body.password;
    pool.getConnection(function (err,conn) {
        if (err){
            resData.code=0;
            resData.message="网络连接失败，请稍后重试";
            res.json(resData);
        } else {
            conn.query("select * from user where uname =? and pwd=?",[uname,pwd],function (err,result) {
                conn.release();
                if (err){
                    resData.code=0;
                    resData.message="网络连接失败，请稍后重试";
                    res.json(resData);
                } else if (result.length<=0){
                    resData.code=1;
                    resData.message="用户名或密码错误，请验证后再试";
                    res.json(resData);
                } else {
                    resData.code=2;
                    resData.message="登录成功";
                    resData.info=result[0];     //传输到前台，好获取用户名

                    //将登陆的用户存到session里面去   不能写在res。json的后面
                    req.session.userInfo=result[0];

                    res.json(resData);
                }
            })
        }
    })
});

//退出
router.post("/user/logout",function (req,res) {
    req.session.userInfo="";
    res.send("0");
});

//
module.exports=router;