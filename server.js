const Koa = require('koa');
const Router = require('koa-router');
const static = require('./router/static');
const chalk = require('chalk');
const body = require('koa-better-body');
const session = require('koa-session');
const fs = require('fs');
const path = require('path');
const ejs = require('koa-ejs');
const config = require('./config');

let app = new Koa();
app.listen(config.PORT, () => {
    console.log(chalk.yellowBright(`Server is running at port ${config.PORT}`));
});

/**
 * 1.使用中间件
 */
//设置处理文件后的上传目录
app.use(body({
    //最好使用绝对路径
    uploadDir: config.UPLOAD_DIR
}));

/**
 * 2.数据库
 */
app.context.db = require('./libs/database');

//将http_root这个地址加入到ctx对象中
app.context.config = config;

/**
 * 3.ejs模板渲染
 */
ejs(app, {
    root: path.resolve(__dirname, 'template'),
    //一般都要设置为false
    layout: false,
    viewExt: 'ejs',
    cache: false,
    debug: false
});


//4.引入keys
app.keys = fs.readFileSync('.keys').toString().split('\n');

/**
 * 5.session
 */
app.use(session({
    maxAge: 20 * 60 * 1000,
    renew: true
}, app));

/**
 * 统一处理错误，跳转到404页面
 */
app.use(async (ctx,next)=>{
    let {HTTP_ROOT} = ctx.config;

    try {
        await next();
        //若此时仍然为空，则同样跳转到404
        if(!ctx.body){
            await ctx.render('www/404',{
                HTTP_ROOT
            });
        }
    } catch (error) {
        await ctx.render('www/404',{
            HTTP_ROOT
        });
    }
});

/**
 * 6.使用路由，路径有
 *  1.为管理员访问
 *  2.外部接口
 *  3.根目录
 */
let router = new Router();


/**
 * 统一处理错误
 */
// router.use(async (ctx,next)=>{
//     try {
//         await next();
//     } catch (error) {
//         ctx.throw(500,'aO-O :Internal Server Error');
//         console.log(error);
//     }
// });

//在router中编写路由的具体信息，在此处只需引入即可-会自动寻找index.js
router.use('/admin', require('./router/admin'));

//外部接口的router
router.use('/api', require('./router/api'));

//router本质就是字符串拼接，故根目录使用空字符串以便于后续的路由正常拼接
router.use('/', require('./router/www'));

/**
 * 7.静态文件
 */
static(router);


app.use(router.routes());