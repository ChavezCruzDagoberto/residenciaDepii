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
    req.app.locals.notificaciones=notificaciones;
  }else console.log("usuario no existe");



  res.render("../index",{notificaciones:notificaciones});
});

/*
cron.schedule(" * * * * * *", async function (){

  var usuarioActual=req.user.cvu_tecnm;
  var x=await conexion.query('select * from notificaciones where destinatario=? and leido=0',[usuarioActual]);

console.log(x);


});*/



router.get("/notificaciones/list", async(req, res) => {

  let usuarioActual=req.user.cvu_tecnm;
  const notificacionX =await conexion.query('select * from notificaciones where destinatario=? and leido=0',[usuarioActual]);
  req.app.locals.notificaciones=notificacionX;


  res.render("notificaciones/listaNotificaciones",{notificaciones:notificacionX});
});

router.get("/notificaciones/update/:id_notificacion", async(req, res) => {

let {id_notificacion}=req.params;

await conexion.query(
  "UPDATE   notificaciones  set ? WHERE id_notificacion=?",
  [{leido:1}, id_notificacion]
);

res.redirect("/notificaciones/list");

});

module.exports = router;
