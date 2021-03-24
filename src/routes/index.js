//rutas
const express = require("express");
const router = express.Router();
const cron= require('node-cron');
const conexion = require("../database");


//inicio principal
router.get("/", (req, res) => {
  res.render("../index");
});


cron.schedule(" 5 * * * * *", async function (){
let  notificaciones= await conexion.query('select * from historico');

console.log(notificaciones);

});

module.exports = router;
