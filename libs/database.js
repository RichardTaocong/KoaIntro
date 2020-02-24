const mysql = require('mysql');
const co = require('co-mysql');
const config = require('../config');

let conn = mysql.createPool({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE
});

module.exports = co(conn);