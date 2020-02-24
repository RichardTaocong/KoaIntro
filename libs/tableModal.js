const Router = require('koa-router');
const fs = require('await-fs');
const path = require('path');
const common = require('./common');

/**
 * 1.fields: 页面所包含的元素
 *  包含：title-标题，name-元素名称，type-元素类型
 * 
 * 2.table：所需要操作的数据库表
 * 
 * 3.page_type：页面正在进行操作的类型
 */
module.exports = function (fields, table, page_type) {
    let router = new Router();

    const page_types = {
        'banner': '轮播图管理',
        'catalog': '类目管理',
        'article': '文章管理'
    }

    router.get('/', async ctx => {
        const {
            HTTP_ROOT
        } = ctx.config;

        //处理下拉框的数据
        fields.forEach(async field => {
            if (field.type == 'select') {
                //执行在fields中from中存储的sql语句
                field.items = await ctx.db.query(field.from);
            }
        });

        let datas = await ctx.db.query(`select * from ${table}`);

        await ctx.render('admin/table', {
            HTTP_ROOT,
            datas,
            page_type,
            page_types,
            fields
        });
    });

    /**
     * 这样，这就是一个通用的处理接口
     */
    router.post('/', async ctx => {
        // ctx.body = 'success';
        const {
            HTTP_ROOT
        } = ctx.config;

        //分别存储表单中的键、值
        let keys = [],
            vals = [];

        fields.forEach(ele => {
            const {
                name,
                type
            } = ele;
            keys.push(name);

            //对file类型的数据进行单独处理
            if (type == 'file') {
                vals.push(path.basename(ctx.request.fields[name][0].path));
            } else if (type == 'date') {
                vals.push(Math.floor(new Date(ctx.request.fields[name]).getTime() / 1000));
            } else {
                vals.push(ctx.request.fields[name]);
            }
        });

        // src = path.basename(src[0].path);

        //向数据库中插入数据，这里的数据是按照数据库表动态生成的
        await ctx.db.query(`insert into ${table} (${keys.join(',')}) values(${keys.map(key=>'?').join(',')})`,
            vals
        );

        ctx.redirect(`${HTTP_ROOT}/admin/${page_type}`);
    });

    router.get('/delete/:id/', async ctx => {
        let {
            id
        } = ctx.params;
        let {
            UPLOAD_DIR,
            HTTP_ROOT
        } = ctx.config;

        //从数据库中查出指定id的数据信息
        let data = await ctx.db.query(`select * from ${table} where ID=?`, [id]);

        ctx.assert(data.length, 400, 'No Data')

        //取出第一行的数据
        let row = data[0];

        //对于文件数据进行单独处理,特别是针对于多个文件
        fields.forEach(async ele => {
            let {
                type,
                name
            } = ele;
            if (type == 'file') {
                await common.unlink(path.resolve(UPLOAD_DIR, row[name]));
            }
        });

        await ctx.db.query(`delete from ${table} where ID=?`, [id]);
        ctx.redirect(`${HTTP_ROOT}/admin/${page_type}`);

    });

    // router.get('/modify/:id/',async ctx=>{
    //     let {
    //         id
    //     } = ctx.params;
    //     let {
    //         HTTP_ROOT
    //     } = ctx.config;

    //     console.log('id');

    //      //从数据库中查出指定id的数据信息
    //      let data = await ctx.db.query('select * from banner_table where ID=?', [id]);

    //      //判断取出数据的长度是否为0
    //      ctx.assert(data.length,400,'No Data');

    //      let row = data[0];

    //      await ctx.render('admin/table',{
    //          HTTP_ROOT,
    //          type: 'modify',
    //          old_data: row,
    //          fields,
    //          action: `${HTTP_ROOT}/banner/modify/${id}`
    //      });
    // });

    /**
     * 使用前台处理的方式
     */
    router.get('/get/:id', async ctx => {
        let {
            id
        } = ctx.params;
        let rows = await ctx.db.query(`select * from ${table} where id=?`, [id]);

        // console.log(rows);

        if (rows.length == 0) {
            //如果对应的数据不存在，则发送错误信息
            ctx.body = {
                err: 1,
                msg: 'no this data'
            };
        } else {
            ctx.body = {
                err: 0,
                msg: 'success',
                data: rows[0]
            };
        }

    });

    /**
     * 对修改请求进行处理
     */
    router.post('/modify/:id/', async ctx => {
        const post = ctx.request.fields;
        let {
            HTTP_ROOT,
            UPLOAD_DIR
        } = ctx.config;
        let {
            id
        } = ctx.params;

        //获取原来数据库中的数据
        let rows = await ctx.db.query(`select * from ${table} where ID=?`, [id]);
        ctx.assert(rows.length, 400, 'Error:No this data');

        // let oldSrc = rows[0].src;
        /**
         * 需要对图片文件进行统一处理，且能够处理多个
         */
        //存储旧文件的存储位置信息
        let paths = {};
        fields.forEach(({
            name,
            type
        }) => {
            if (type == 'file') {
                paths[name] = rows[0][name];
            }
        });

        //分别存储键与值，以及判断文件是否修改过的标志
        let keys = [],
            vals = [],
            src_changed = {};
        fields.forEach(({
            name,
            type
        }) => {
            if (type == 'file') {
                if (post[name] && post[name].length && post[name][0].size) {
                    //只有满足这些条件的时候才证明确实有文件数据
                    src_changed[name] = true;

                    keys.push(name);
                    vals.push(path.basename(post[name][0].path));
                }
            } else if (type == 'date') {
                //处理日期类型的数据
                keys.push(name);
                vals.push(Math.floor(new Date(post[name]).getTime() / 1000));
            } else {
                //普通数据
                keys.push(name);
                vals.push(post[name]);
            }
        });

        await ctx.db.query(`update ${table} set ${
        keys.map(key=>(`${key}=?`)).join(',')
    } where ID=?`, [...vals, id]);


        fields.forEach(async ({
            name,
            type
        }) => {
            if (type == 'file' && src_changed[name] == true) {
                await common.unlink(path.resolve(UPLOAD_DIR, paths[name]));
            }
        });

        ctx.redirect(`${HTTP_ROOT}/admin/${page_type}`);
    });

    return router.routes();
};