const dotenv = require("dotenv");
const {Client} = require('pg')

dotenv.config({
    path:'./.env'
});

const db = new Client({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USERNAME,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE_LOCAL_DBNAME,
    port: process.env.DATABASE_PORT,
    connectionLimit: 500,
    insecureAuth: true,
    timezone: 'UTC',
});

db.connect(function(err) {
    if (err){ console.log(err,"err")
    throw err};
    
    console.log("database connected successfully");
  });

module.exports.pool = db;