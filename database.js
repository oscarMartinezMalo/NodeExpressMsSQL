import sql from 'mssql';
import dotenv from 'dotenv';

// dotenv CONFIG TO USED ENVIRONMENT VARIABLES
dotenv.config();

    const poolPromise = new sql.ConnectionPool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_NAME
    }).connect().then(pool => {
        console.log("Database connected");
        return pool;
    }).catch(err => {
      console.log(`Database connection error: ${err}`);
    });

module.exports = { sql, poolPromise };