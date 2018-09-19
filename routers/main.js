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

//当加载main.js的时候就必定是首页里面的内容，而首页里面的内容，绝对要有分类
var alltype;
router.use(function (req,res,next) {
    pool.getConnection(function (err,conn) {
        conn.query("select * from type order by tid",function (err,result) {
            conn.release();
            alltype=result;
            //请注意，一定要执行next
            next();     //next指继续往下执行，让程序查完sql语句之后，继续往下运行
        });
    });
});
//第二步：处理请求
router.get("/",function (req,res) {     //分页查找
    var page=Number(req.query.page||1);
    var mytype=Number(req.query.mytype||1);
    pool.getConnection(function (err,conn) {
        conn.query("select * from type order by tid",function (err,result) {
            //注意，这里现在需要同时查两个东西：①。所有的文章类型 ②。所有的文章内容
            //注意：绝对不能在释放连接之后再去查找
            if (mytype==1){
                var sql1="select c.*,t.tname,u.uname from contents c,type t,user u where c.tid=t.tid and c.uid=u.uid";
            } else {
                var sql1="select c.*,t.tname,u.uname from contents c,type t,user u where c.tid=t.tid and c.uid=u.uid and c.tid="+mytype;
            }
            conn.query(sql1,function (err2,result2) {
                //总记录条数
                var count=result2.length;
                //规定一次默认分6条数据
                var size=6;
                //计算总页数
                var pages=Math.ceil(count/size);
                //控制页数
                page=Math.min(page,pages);
                page=Math.max(page,1);
                //开始的条数
                var beginSize=(page-1)*size;

                //开始分页查找
                if (mytype==1){
                    var sql2="select c.*,t.tname,u.uname from contents c,type t,user u where c.tid=t.tid and c.uid=u.uid limit ?,?";
                } else {
                    var sql2="select c.*,t.tname,u.uname from contents c,type t,user u where c.tid=t.tid and c.uid=u.uid and c.tid="+mytype+" limit ?,?";
                }
                conn.query(sql2,[beginSize,size],function(err2,result2){
                        conn.release();
                        //现在数据有了result，如何将这个数据传到网页里面去？
                        //网页路径  传到这个网页的模板引擎的参数
                        res.render("main/index",{
                            types:result,
                            contents:result2,
                            page:page,
                            pages:pages,
                            size:size,
                            count:count,
                            mytype:mytype,
                            userInfo:req.session.userInfo       //取session
                        });
                    });
            });
        });
    });
});

//查看文章详情
router.get("/view",function (req,res) {
    var cid=req.query.cid;
    var mytype=Number(req.query.mytype||1);
    pool.getConnection(function (err,conn) {
        conn.query("select c.*,u.uname from contents c,user u where c.uid=u.uid and c.cid=?",[cid],function (err,result) {
            // console.log(cid);
            // console.log(result);
            if (err){
            console.log(err);
            } else {
            res.render("main/view",{
                types:alltype,
                mytype:mytype,
                content:result[0],
                contents:result,
                userInfo:req.session.userInfo
            });
          }
        });
    });
});
//第三步，将这个支线模块，加载到主模块里面去
module.exports=router;