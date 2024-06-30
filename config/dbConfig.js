var mysql = require("mysql2/promise")
var connection = mysql.createPool({
    host : "ndvirtual7.cafe24.com",
    user : "root",
    password : "ndvirtual7!@34",
    database : "ccri_postech"
})


module.exports = connection;