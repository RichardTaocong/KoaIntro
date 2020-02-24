const fs = require('fs');

//生成秘钥的长度
const KEY_LEN = 1024;
//循环秘钥的数据
const KEY_COUNT = 2048;
//秘钥中的字符集
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>?/,;.!@#$%^&*()`';

let arr=[];

for (let i = 0; i < KEY_LEN; i++) {
    let key = '';

    for (let j = 0; j < KEY_COUNT; j++) {
        key += CHARS[Math.floor(Math.random()*CHARS.length)];
    }

    arr.push(key);
}

fs.writeFileSync('.keys',arr.join('\n'));
console.log(`We have generated ${KEY_COUNT} keys`);
