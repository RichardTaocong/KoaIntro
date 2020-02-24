const path = require('path');

module.exports = {
    DB_HOST: 'localhost',
    DB_PORT: '3306',
    DB_USER: 'root',
    DB_PASSWORD: '123456',
    DB_DATABASE: 'blog',

    // 管理员的密码在添加后缀之后再经过md5哈希存入json中
    ADMIN_SUFFIX: '_*ja9k2l:-ko',

    HTTP_ROOT: 'http://localhost:8080',
    PORT: '8080',

    //上传文件的目录
    UPLOAD_DIR: path.resolve(__dirname, './static/upload')
}