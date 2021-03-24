//rutas
const express = require("express");
const router = express.Router();
const cron= require('node-cron');
const conexion = require("../database");


//inicio principal
router.get("/", (req, res) => {
  res.render("../index");
});


cron.schedule(" 2 * * * * *", async function (){
const  notificaciones= await conexion.query('select * from historico');
console.log(notificaciones);

})

module.exports = router;
