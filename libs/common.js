/**
 * 将管理员的登录信息进行加密
 */
const crypto = require('crypto');
const fs = require('fs');

module.exports = {
    md5(buffer) {
        let obj = crypto.createHash('md5');
        //update方法可以持续向其中追加内容
        obj.update(buffer);

        return obj.digest('hex');
    },

    /**
     * 官方的库有些问题，这里自己写了一个
     * @param {传入删除文件的路径} path 
     */
    unlink(path) {
        return new Promise((resolve, reject) => {
            fs.unlink(path, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}