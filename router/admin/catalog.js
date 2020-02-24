const tableModal = require('../../libs/tableModal');

module.exports = tableModal(
    //传入前端的表单中的值
    [{
        title: 'Title',
        name: 'title',
        type: 'text'
    }],
    'catalog_table',
    'catalog');