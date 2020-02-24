const Router = require('koa-router');

let router = new Router();

router.get('/api', async ctx=>{
    ctx.body = 'this is a News request';
});

module.exports = router.routes();