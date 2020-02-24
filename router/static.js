const static = require('koa-static');

module.exports = function (router, options) {
    options = options || {};
    //后面一个值为默认值
    options.image = options.image || 30;
    options.script = options.script || 1;
    options.styles = options.styles || 30;
    options.html = options.html || 30;
    options.other = options.other || 30;

    router.all(/((\.jpg)|(\.png)|(\.jpeg)|(\.gif))$/i, static('./static', {
        //注意这里的maxage是小写的，区别于session中
        maxage: options.image * 86400 * 1000
    }));

    router.all(/((\.js)|(\.jsx))$/i, static('./static', {
        maxage: options.script * 86400 * 1000
    }));

    router.all(/(\.css)$/i, static('./static', {
        maxage: options.styles * 86400 * 1000
    }));

    router.all(/((\.html)|(\.shtml)|(\.htm))$/i, static('./static', {
        maxage: options.html * 86400 * 1000
    }));

    //剩余的请求
    router.all('*', static('./static', {
        maxage: options.other * 86400 * 1000
    }));
};