const express = require('express');
const router = express.Router();
const conexion = require('../database');
const { estaLogueado, noEstaLogueado, esAdministrador } = require('../lib/auth');



const moment = require('moment');

moment.locale('es');



router.get('/add', estaLogueado, async (req, res) => {
  let cvu_tecnm = req.user.cvu_tecnm;
  console.log(cvu_tecnm);
  let proyecto;
  //if(req.user.rol_sistema="Administrador"){}else{}

  //res.render();

  proyecto = await conexion.query('SELECT * FROM proyecto natural join proyecto_participante where CVU_TECNM= ? and ESTADO=1 ', [cvu_tecnm]);

  

  console.log(proyecto);
  if (proyecto.length > 0) {
    var no_informe=await conexion.query('select * from informe where id_proyecto=?',[proyecto[0].id_proyecto]);
    if(no_informe.length>0){
      req.flash("message",'ya tiene informes agregados');
    res.redirect('/informe/mostrar/'+proyecto[0].id_proyecto);
    }else{
    req.flash("message",'solo 1 vez puede agregar sus fechas de informe');
    res.render('proyecto/informe/add', { proyecto ,message: req.flash("message")});
    }
  } else { res.send('usted no tiene ningun proyecto activo'); }


});



router.post('/add', estaLogueado, async (req, res) => {


  console.log(req.body);

  
  const { id_proyecto,no_informe,fecha_inicio,fecha_fin } = req.body;

  




  if (Array.isArray(no_informe) && Array.isArray(fecha_inicio)) {
    for (const p in no_informe) {
      const newInforme = {
        no_informe: no_informe[p],
        fecha_inicio: fecha_inicio[p],
        fecha_fin: fecha_fin[p],
        id_proyecto

      }
      //insertar
      await conexion.query('INSERT INTO informe set ?', [newInforme]);


    }


  } else {

    const newInforme1 = {
      no_informe,
      fecha_inicio,
      fecha_fin,
      id_proyecto
    }
    await conexion.query('INSERT INTO informe set ?', [newInforme1]);

  }


  req.flash('success', 'agreado correctamente');

  //res.render("subpartida/add");
  res.redirect("/informe/mostrar/"+id_proyecto);





});




//listar de la base de datos
router.get('/', estaLogueado, async (req, res) => {
  var admin = req.user.rol_sistema;
  var proyecto;
  console.log(admin);
  var cvu_tecnm = req.user.cvu_tecnm;
  if (admin == "Administrador") {

    proyecto = await conexion.query('select * from proyecto where  ESTADO=1 ');
  } else {
    proyecto = await conexion.query('SELECT * FROM proyecto natural join proyecto_participante where CVU_TECNM=? and ESTADO=1 ', [cvu_tecnm]);


  }

  console.log(proyecto);
  res.render('proyecto/informe/list', { proyecto });


});




router.post('/listarinforme', estaLogueado, async (req, res) => {
  let { id_proyecto } = req.body;
  console.log(id_proyecto);
  let consulta = await conexion.query('select * from informe where ID_PROYECTO=?', [id_proyecto]);


  res.render('proyecto/informe/listarporproyecto', { consulta,id_proyecto:id_proyecto });


  console.log(consulta);

});


router.get('/mostrar/:id_proyecto', estaLogueado, async (req, res) => {
  let { id_proyecto } = req.params;
  console.log(id_proyecto);
  let consulta = await conexion.query('select * from informe where ID_PROYECTO=?', [id_proyecto]);
//console.log(consulta);
  let editado = [];
  for (const p in consulta) {
    let f = moment(consulta[p].fecha_inicio);
    let g = moment(consulta[p].fecha_fin);
    //let fecha_inicio=f.format('LLL');
    //let fecha_fin=g.format('LLL');
    let fecha_inicio = f.format('YYYY-MM-DD');
    let fecha_fin = g.format('YYYY-MM-DD');
    const a = {
      id_informe: consulta[p].id_informe,
      no_informe: consulta[p].no_informe,
      fecha_inicio,
      fecha_fin,
      id_proyecto:consulta[p].id_proyecto

    };
    editado.push(a);

  }


if(req.user.rol_sistema=="Administrador"){

  res.render('proyecto/informe/listarporproyecto', { consulta: editado});
}else{
  res.render('proyecto/informe/listarProyectoResponsable', { consulta: editado});
}
 // console.log(editado);

});







//ELIMINAR
router.get('/delete/:id_informe'  , async (req, res) => {

  const { id_informe } = req.params;
  //console.log(id_informe);
  valor= await conexion.query('select * from informe where id_informe= ?',[id_informe]);
  await conexion.query('DELETE FROM  informe  WHERE ID_INFORME=?', [id_informe]);
  //console.log(req.params.id_convocatoria);
  req.flash('success', id_informe + ' eliminado  correctamente');
  res.redirect("/informe/mostrar/"+valor[0].id_proyecto);

});





/*
 router.get('/edit/:id_informe',estaLogueado ,async (req,res)=>{
    
    const {id_informe}=req.params;
    
   const nuevo= await  conexion.query(  'SELECT * FROM  informe  WHERE id_proyecto=?',[id_proyecto]);
 console.log(nuevo[0]);

    

      res.render('proyecto/edit',{proyecto: nuevo[0]});
      //res.send("recibido");
 });
 */


router.post('/edit/:id_informe', async (req, res) => {

  const {id_informe}=req.params;
  console.log(req.params, req.body);
  

  const {no_informe,fecha_inicio,fecha_fin,id_proyecto}= req.body;
  
  const newInforme ={
     no_informe,
     fecha_inicio,
     fecha_fin
      };

 await  conexion.query(  'UPDATE   informe  set ? WHERE id_informe = ? ',[newInforme,id_informe]);
 // console.log(cvu_tecnm);

 req.flash('success','cambios guardados ');
    res.redirect ('/informe/mostrar/'+id_proyecto);
    
});




function findsubstr(str) {

  var substring = str.substr(0, 6); s

  console.log(substring);
}



module.exports = router;
