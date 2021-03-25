//rutas
const express = require("express");
const router = express.Router();
const cron= require('node-cron');
const conexion = require("../database");


//inicio principal
router.get("/", async(req, res) => {
  let notificaciones;
  if(req.user){
   
    notificaciones= await conexion.query('select * from notificaciones where destinatario=? and leido=0',[req.user.cvu_tecnm]);
    console.log(notificaciones);
  }else console.log("usuario no existe");



  res.render("../index",{notificaciones:notificaciones});
});

/*
cron.schedule(" 5 * * * * *", async function (){
let  notificaciones= await conexion.query('select * from historico');

console.log(notificaciones);

});
*/

module.exports = router;
