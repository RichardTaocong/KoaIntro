const crypto = require('crypto');


/**
 * 1.// 123456_richardTao 46c8c27de6722a5c11cfbb13b2c3d8cc
 * 2.// abcd_user  4f140252aa663e814499008602ac1047
 */
let obj = crypto.createHash('md5');
//update方法可以持续向其中追加内容
obj.update('123456_richardTao');

console.log(obj.digest('hex'));
