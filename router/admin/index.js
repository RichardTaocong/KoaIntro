const Router = require('koa-router');
const fs = require('await-fs');
const path = require('path');
const common = require('../../libs/common');
const session = require('koa-session');

let router = new Router();

/**
 * 提交数据走get接口，
 * 而处理则采用post接口
 * 
 * 这就是restful风格——不同方式、同名方法，但又不是一个处理
 */
router.get('/login', async ctx => {
    await ctx.render('admin/login', {
        HTTP_ROOT: ctx.config.HTTP_ROOT,
        // 将错误信息放到query中，因此从其中取出
        errmsg: ctx.query.errmsg
    });
});

router.post('/login', async ctx => {
    const {
        HTTP_ROOT
    } = ctx.config;

    /**
     * 取到前台通过表单提交的信息
     */
    let {
        username,
        password
    } = ctx.request.fields;

    let admins = JSON.parse((
        await fs.readFile(path.resolve(__dirname, '../../admins.json'))).toString());

    // console.log(admins);
    function findAdmin(user) {
        let data = null;
        admins.forEach(admin => {
            if (admin.username == user) {
                data = admin;
            }
        });
        return data;
    };

    /**
     * 下面对于这些信息处理 
     */
    let admin = findAdmin(username);

    // console.log(username,password);
    // console.log(admin);
    
    if (!admin) {
        //1.若是不存在该用户
        ctx.redirect(`${HTTP_ROOT}/admin/login?errmsg=${encodeURIComponent('用户名不存在')}`);
    } else if (admin.password != common.md5(password + ctx.config.ADMIN_SUFFIX)) {
        //2.若是密码不正确
        ctx.redirect(`${HTTP_ROOT}/admin/login?errmsg=${encodeURIComponent('密码不正确')}`);
    } else{
        //3.登录成功，将用户信息存入session中
        ctx.session['admin'] = username;
        ctx.redirect(`${HTTP_ROOT}/admin/`);
    }

});

/**
 * 对于非管理员登录用户通过url的形式访问，进行拦截
 * 起到过滤用户的作用
 * 至于登录则不能拦截
 */
router.all('*',async (ctx,next)=>{
    let {HTTP_ROOT} = ctx.config;

    if (ctx.session['admin']) {
        //如果session中有登录信息，则可以继续执行
        await next();
    } else {
        //否则跳转到登录页面
        ctx.redirect(`${HTTP_ROOT}/admin/login`);
    }
});

router.get('/',async ctx=>{
    const {HTTP_ROOT} = ctx.config;

    ctx.redirect(`${HTTP_ROOT}/admin/banner`);
});

router.use('/banner',require('./banner'));
router.use('/catalog',require('./catalog'));
router.use('/article',require('./article'));

module.exports = router.routes();