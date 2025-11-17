require("dotenv").config();
const mysql = require("mysql2/promise");

const mySqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

module.exports = mySqlPool;


// https://www.youtube.com/watch?v=z0z7Yn4P8Po&t=209s