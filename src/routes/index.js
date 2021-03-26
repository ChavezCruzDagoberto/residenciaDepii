//rutas
const express = require("express");
const router = express.Router();
const cron= require('node-cron');
const conexion = require("../database");
let cronm="";
let estado=0;
//inicio principal
router.get("/", async(req, res) => {
  let notificaciones;
  if(req.user){
  
    notificaciones= await conexion.query('select * from notificaciones where destinatario=? and leido=0 order by id_notificacion desc',[req.user.cvu_tecnm]);
    console.log(notificaciones);
    req.app.locals.notificaciones=notificaciones;
    //.app.locals.cronActivo="activo";
 // if(cronm===""){ejecutarSiempre(req,res);}else{console.log("acax",cronm); cronm.stop();}
 if(estado==0){
 ejecutarSiempre(req,res);
 
  cronm.start();
//console.log("inicio");
 estado=1;}
else{

  console.log("es mas de 0 ",estado);
}
 

  }else{
    if(cronm!==""){
      cronm.stop();
      estado=0;

      //console.log("restablecido",estado);
    }
  }



  res.render("../index",{notificaciones:notificaciones});
});


async function ejecutarSiempre (req,res){
  
  
 cronm=cron.schedule(" 1 * * * * *", async function(){

  
  var usuario= req.user.cvu_tecnm;
  
  var x=await conexion.query('select * from notificaciones where destinatario=? and leido=0 order by id_notificacion desc',[usuario]);

  req.app.locals.notificaciones=x;
  
console.log("contenido",req.app.locals.notificaciones);



},
{
  scheduled:false
});
  
  
}



router.get("/notificaciones/list", async(req, res) => {

  let usuarioActual=req.user.cvu_tecnm;
  const notificacionX =await conexion.query('select * from notificaciones where destinatario=? and leido=0 order by id_notificacion desc',[usuarioActual]);
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
