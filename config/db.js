const mysql = require("mysql2/promise");

const mySqlPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Admin@#123',
    database: 'tossbookapi'
})

module.exports = mySqlPool;