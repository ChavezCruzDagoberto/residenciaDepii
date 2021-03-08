const express = require('express');
const router = express.Router();
const conexion = require('../database');
const { estaLogueado, noEstaLogueado, esAdministrador } = require('../lib/auth');



const moment = require('moment');

moment.locale('es');


const path = require('path');
const multer = require('multer');
let nombre = '';

const fs = require("fs");



const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, './archivosInforme')
    },
    filename: (req, file, cb) => {

        if (file.mimetype !== 'application/pdf') {
             //return cb(null,false );

            cb(new Error('solo pdfs son permitidos'))
            //return cb(null,)

        }
        else {

           // const valida=
           

            cb(null, nombre  + path.extname(file.originalname))
        }
    }
});




const upload = multer({ storage });



router.get('/add', estaLogueado, async (req, res) => {
  let cvu_tecnm = req.user.cvu_tecnm;
  console.log(cvu_tecnm);
  let proyecto;
  //if(req.user.rol_sistema="Administrador"){}else{}

  //res.render();

  proyecto = await conexion.query('SELECT * FROM proyecto natural join proyecto_participante where CVU_TECNM= ? and ESTADO<=1  ', [cvu_tecnm]);

  

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

    proyecto = await conexion.query('select * from proyecto where  ESTADO>=1');
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

  console.log(consulta);
  
  let ids_informes = [];
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
    ids_informes.push(consulta[p].id_informe);
    editado.push(a);

  }
  console.log(ids_informes);

  let archivos=[];
  for(const aux in ids_informes){
    var temporal= await conexion.query('select * from archivo_informes where id_informe=? and id_proyecto=?',[ids_informes[aux],id_proyecto] );
    console.log(temporal);
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





router.get('/cargar/:id_informe',async(req,res)=>{

  const {id_informe}=req.params;



 try {
   

  var extraerProyecto= await conexion.query('select * from informe where id_informe=? ',[id_informe]);
 var no_informe=extraerProyecto[0].no_informe;
  //console.log("extra",extraerProyecto);
  var id_pro= extraerProyecto[0].id_proyecto;
  extraerProyecto=await conexion.query('select * from proyecto where id_proyecto=?',[id_pro]);

  const verenArchivos= await conexion.query('select * from archivo_informes where id_informe=? and id_proyecto=?',[id_informe,id_pro]);
  console.log("existe?",verenArchivos,id_informe,id_pro);
  nombre=extraerProyecto[0].titulo+"_informe"+no_informe;
  console.log(nombre);
  res.render('proyecto/informe/cargarArchivoInformes',{id_informe:id_informe ,resultado:verenArchivos[0]});

 } catch (error) {
   
 }


});


router.post('/cargar/:id_informe',upload.single('archivo'),async(req,res)=>{

  const {id_informe}=req.params;
  const { filename, path, } = req.file;
  try {
    var consulta= await conexion.query('select * from informe where id_informe=?',[id_informe]);
    if(consulta.length>0){
      var id_proyecto=consulta[0].id_proyecto;
  
      var existe_base=await conexion.query('select * from archivo_informes where id_informe=? and id_proyecto=?',[id_informe,id_proyecto] );
  if(existe_base.length>0){

    console.log(existe_base);
    if(existe_base[0].revisiones<2){

      var rev=(existe_base[0].revisiones)+1;
      const newInforme1 = {
        id_proyecto: id_proyecto,
        id_informe: id_informe,
        url_archivo:path,
        anotaciones: '',
        revisiones: rev
    };

      await conexion.query('UPDATE   archivo_informes  set ? WHERE id_informe=? and  id_proyecto= ? ', [newInforme1,id_informe, id_proyecto]);
     req.flash("success","correcto");
      res.redirect('/informe/verInforme/'+id_informe+ '/' + id_proyecto);

  }else{
      req.flash('message',"ya no es permitido");
      res.redirect('/informe/mostrar/'+ id_proyecto);
  }
  }else{

    const newInforme = {
      id_proyecto: id_proyecto,
      id_informe: id_informe,
      url_archivo:path,
      anotaciones: '',
      revisiones: 0
  };

  await conexion.query('INSERT INTO archivo_informes set ?', [newInforme]);
  await conexion.query('UPDATE   proyecto  set ? WHERE id_proyecto= ? ', [{estado:3},id_proyecto]);
  res.redirect('/informe/verInforme/'+id_informe+ '/' + id_proyecto);
  
  } 
     

    }

  } catch (error) {
    
  }


  //console.log("sijajaj");

});



router.get('/verInforme/:id_informe/:id_proyecto', async (req, res) => {
  const { id_informe,id_proyecto } = req.params;


  const resultado = await conexion.query('select * from archivo_informes where id_informe=? and  id_proyecto= ?', [id_informe ,id_proyecto]);
  console.log(resultado[0]);
  res.render('proyecto/informe/verArchivoInforme', { informe: resultado[0] ,id_proyecto});
  //res.send('enviado')
});


router.get('/leerInforme/:id_proyecto/:id_informe', async (req, res) => {
  const { id_proyecto,id_informe } = req.params;
  

  const resultado = await conexion.query('select url_archivo from archivo_informes where id_proyecto= ? and id_informe=?', [id_proyecto,id_informe]);
  console.log(resultado);
  
  if (resultado.length >= 1) {
      var url = urlCorrecto(resultado[0].url_archivo);
      url = './' + url;
      console.log(url);

      //var archivo=fs.readFileSync(url,'UTF-8');

      //console.log(archivo.length);

      var data = fs.readFileSync(url);
      res.contentType("application/pdf");
      res.send(data);


  } else { res.send('no hay'); }

  //res.render('proyecto/protocolo/lectura');
});



function urlCorrecto(ubicacion) {

  const c = 92;
  //console.log(ubicacion.replace(String.fromCharCode(c),"/"));
  return ubicacion.replace(String.fromCharCode(c), "/");
}


module.exports = router;
