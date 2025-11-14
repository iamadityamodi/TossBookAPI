const mysql = require("mysql2/promise");

const mySqlPool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Admin@#123',
    database: 'tossbookapi'
})

module.exports = mySqlPool;