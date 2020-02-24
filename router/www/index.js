const Router = require('koa-router');

let router = new Router();

router.get('', async ctx => {
    //可以按照序号来顺序排列地取出表中数据
    let bannersRow = await ctx.db.query('select * from banner_table order by serial ASC');
    let catalogsRow = await ctx.db.query('select * from catalog_table');
    let articlesRow = await ctx.db.query(
        `
    SELECT
        *,
        article_table.title AS art_title,
        catalog_table.title AS cat_title,
        article_table.ID AS art_ID,
        catalog_table.ID AS cat_ID 
    FROM
        article_table
        LEFT JOIN catalog_table ON article_table.catalog_ID = catalog_table.ID 
    ORDER BY
	    article_table.created_time DESC 
	LIMIT 10
        `
    );

    function toDou(n) {
        return n < 10 ? `0${n}` : '' + n;
    }

    articlesRow.forEach(element => {
        let oDate = new Date(element.created_time * 1000);
        element.created_time = `${oDate.getFullYear()}-${toDou(oDate.getMonth()+1)}-${toDou(oDate.getDate())}`;
    });

    const {
        HTTP_ROOT
    } = ctx.config;

    await ctx.render('www/index', {
        bannersRow,
        catalogsRow,
        articlesRow,
        HTTP_ROOT
    });
});

router.get('list/:id', async ctx => {

    const {
        HTTP_ROOT
    } = ctx.config;

    let {
        id
    } = ctx.params;
    let rows = await ctx.db.query('select * from catalog_table where ID=?', [id]);

    let articlesRow = await ctx.db.query(
        `
    SELECT
        *,
        article_table.title AS art_title,
        catalog_table.title AS cat_title,
        article_table.ID AS art_ID,
        catalog_table.ID AS cat_ID 
    FROM
        article_table
        LEFT JOIN catalog_table ON article_table.catalog_ID = catalog_table.ID
    WHERE
        article_table.catalog_ID = ${id}
    ORDER BY
	    article_table.created_time DESC 
	LIMIT 10
        `
    );

    function toDou(n) {
        return n < 10 ? `0${n}` : '' + n;
    }

    articlesRow.forEach(element => {
        let oDate = new Date(element.created_time * 1000);
        element.created_time = `${oDate.getFullYear()}-${toDou(oDate.getMonth()+1)}-${toDou(oDate.getDate())}`;
    });

    await ctx.render('www/list', {
        HTTP_ROOT,
        catalog_title: rows[0].title,
        articlesRow
    });
});

router.get('article/:id', async ctx => {
    const {
        HTTP_ROOT
    } = ctx.config;

    let {
        id
    } = ctx.params;

    let rows = await ctx.db.query('select * from article_table where ID=?', [id]);
    let article = rows[0];

    function toDou(n) {
        return n < 10 ? `0${n}` : '' + n;
    };

    let oDate = new Date(article.created_time * 1000);
    article.created_time = `${oDate.getFullYear()}-${toDou(oDate.getMonth()+1)}-${toDou(oDate.getDate())}`;

    await ctx.render('www/article', {
        HTTP_ROOT,
        article
    });
});

module.exports = router.routes();