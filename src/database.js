
const mysql=require ('mysql');
const {promisify}=require('util');

const {database}=  require('./keys');
const pool =mysql.createPool(database);
pool.getConnection((err,connection )=>{
    if(err){
        if(err.code==='PROTOCOL_CONECTION_LOST'){console.error("error de conexion con la base de datos cerrado");}
        if(err.code==='ER_CON_COUNT_ERROR'){console.error("database has to many conexion");}
        if(err.code==='ECONNREFUSED'){console.error("CONEXION RECHAZADA");}
        //console.log("error");

    }
    if(connection)connection.release();
    console.log("database is conected");
    return;

});
//promesas en callbaks
 pool.query= promisify(pool.query);

module.exports=pool;