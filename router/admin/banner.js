const tableModal = require('../../libs/tableModal');

module.exports = tableModal(
    //传入前端的表单中的值
    [   
        {
            title: '图片标题',
            name: 'title',
            type: 'text'
        },
        {
            title: '图片地址',
            name: 'src',
            type: 'file'
        },
        {
            title: '跳转链接',
            name: 'href',
            type: 'text'
        },
        {
            title: '图片序号',
            name: 'serial',
            type: 'number'
        }
    ],
    'banner_table',
    'banner');