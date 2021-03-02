const express = require('express');
const router = express.Router();
const conexion = require('../database');
const { estaLogueado, noEstaLogueado, esAdministrador, esLider } = require('../lib/auth');


const moment = require('moment');

moment.locale('es');
/*

router.get('/add', esLider, async (req, res) => {
  const cvu_tecnm = req.user.cvu_tecnm;
  console.log(req.user);
  const valida = await conexion.query('select * from proyecto_participante where cvu_tecnm=?', [cvu_tecnm]);
  const convocatorias = await conexion.query(  'select a.id_convocatoria,a.nombre_convocatoria from convocatoria as a left join proyecto as b on a.id_convocatoria=b.id_convocatoria where b.id_convocatoria is null');
 

  res.render('proyecto/add', { convocatorias });
 
});*/
router.get('/add', esLider, async (req, res) => {
  const cvu_tecnm = req.user.cvu_tecnm;
  console.log(req.user);
  const valida = await conexion.query('select * from proyecto_participante where cvu_tecnm=?', [cvu_tecnm]);
 

  res.render('proyecto/add');
 
});



router.post('/add', esLider, async (req, res) => {


  //validar si ese usuario tiene un proyecto activo
  const activo = await conexion.query('select * from proyecto natural join proyecto_participante natural join participante where rol_proyecto="Responsable" and cvu_tecnm= ? and estado!=0', [req.user.cvu_tecnm]);
  if (activo.length == 0) {

    const clave_financiamiento = req.body.clave_financiamiento;
    //estados del proyecto o=terminado, 1=creado,2=en tiempo,3=atrasado,4=cancelado
    let estado = 1;
    const validacion = await conexion.query('select * from proyecto WHERE  CLAVE_FINANCIAMIENTO=?', [clave_financiamiento]);
    const validacion1 = await conexion.query('select * from financiamiento WHERE  CLAVE_FINANCIAMIENTO=?', [clave_financiamiento]);
    //const validaconvocatoria = await conexion.query('select * from proyecto WHERE  id_convocatoria=?', [req.body.id_convocatoria]);
    console.log(validacion.length,validacion1.length);
    //console.log(validaconvocatoria.length);
  if (validacion.length == 0  && validacion1.length>0) {
      const cvu_tecnm = req.user.cvu_tecnm;
      const fecha_sometido = req.body.fecha_sometido ;
      const fecha_dictamen = req.body.fecha_dictamen ;

      const { titulo, modalidad } = req.body;
      var creado = moment().format('YYYY-MM-DD');
      
      const newProyecto = {
        titulo,
        modalidad,
        fecha_sometido,
        fecha_dictamen,
        clave_financiamiento,
        estado,
        creado
      };


      await conexion.query('INSERT INTO proyecto set ?', [newProyecto]);

      const p = await conexion.query('select * from proyecto where titulo=?', [titulo]);

      const newProyecto_participante = {
        id_proyecto: p[0].id_proyecto,
        cvu_tecnm,
        rol_proyecto: 'Responsable'
      };
      await conexion.query('INSERT INTO proyecto_participante set ?', [newProyecto_participante]);

      req.flash('success', 'proyecto agreado correctamente');

      res.redirect("/proyecto");

    } else {
      req.flash('message', ' no pudo ser creado el proyecto verfique la clave  financiamiento');
      //console.log('no existe registro');
      res.redirect("/proyecto/add");
    }
  }
  else {

    req.flash('message', ' tiene un proyecto activo no puede tener control de 2 proyectos a la vez');
    res.redirect("/proyecto/add");
  }


});










/*
router.post('/add', esLider, async (req, res) => {


  //validar si ese usuario tiene un proyecto activo
  const activo = await conexion.query('select * from proyecto natural join proyecto_participante natural join participante where rol_proyecto="Responsable" and cvu_tecnm= ? and estado!=0', [req.user.cvu_tecnm]);
  if (activo.length == 0) {

    const clave_financiamiento = req.body.clave_financiamiento;
    //estados del proyecto o=terminado, 1=creado,2=en tiempo,3=atrasado,4=cancelado
    let estado = 1;
    const validacion = await conexion.query('select * from proyecto WHERE  CLAVE_FINANCIAMIENTO=?', [clave_financiamiento]);
    //const validaconvocatoria = await conexion.query('select * from proyecto WHERE  id_convocatoria=?', [req.body.id_convocatoria]);
    console.log(validacion.length);
    //console.log(validaconvocatoria.length);
  if (validacion.length == 0 ) {
      const cvu_tecnm = req.user.cvu_tecnm;
      const fecha_sometido = req.body.fecha_sometido ;
      const fecha_dictamen = req.body.fecha_dictamen ;

      const { titulo, modalidad, id_convocatoria } = req.body;
      var creado = moment().format('YYYY-MM-DD');
      
      const newProyecto = {
        titulo,
        modalidad,
        fecha_sometido,
        fecha_dictamen,
        clave_financiamiento,
        id_convocatoria,
        estado,
        creado
      };


      await conexion.query('INSERT INTO proyecto set ?', [newProyecto]);

      const p = await conexion.query('select * from proyecto where titulo=?', [titulo]);

      const newProyecto_participante = {
        id_proyecto: p[0].id_proyecto,
        cvu_tecnm,
        rol_proyecto: 'Responsable'
      };
      await conexion.query('INSERT INTO proyecto_participante set ?', [newProyecto_participante]);

      req.flash('success', 'proyecto agreado correctamente');

      res.redirect("/proyecto");

    } else {
      req.flash('message', ' no pudo ser creado el proyecto verfique la clave  financiamiento');
      //console.log('no existe registro');
      res.redirect("/proyecto/add");
    }
  }
  else {

    req.flash('message', ' tiene un proyecto activo no puede tener control de 2 proyectos a la vez');
    res.redirect("/proyecto/add");
  }


});
*/








//listar de la base de datos
router.get('/', estaLogueado, async (req, res) => {
  
req.app.locals.proyectodisponible=null;
  
   

  //console.log(req.user);
  if (req.user.rol_sistema == 'Administrador') {
    res.redirect('proyecto/listartodo');
  } else {

    const cvu_tecnm = req.user.cvu_tecnm;
    const proyectos = await conexion.query('select * from  (select * from  proyecto natural join proyecto_participante natural join participante)as a  where cvu_tecnm=? and rol_proyecto="Responsable" and estado=1 ', [cvu_tecnm]);

    console.log('p',proyectos.length);
if(proyectos.length>0){
    var fecha1 = moment() ;
  var fecha2 = moment(proyectos[0].creado);
   var temporal=fecha1.diff(fecha2, 'days');
   if(temporal<10){
    req.flash('message',"tiene "+(10- temporal)+ " dias para editar su proyecto Actual");
   }else{
    req.flash('message',"ya no puede realizar cambios en su proyecto agoto los dias dara modificar");
   }
  
    const final = formatearFechas(proyectos);
    res.render('proyecto/list', { proyectos: final ,message:req.flash('message')});
}else{
  res.render('proyecto/list');
}
    
  }
});




//listar de la base de datos para modo Administrador
router.get('/listartodo', esAdministrador, estaLogueado, async (req, res) => {
  const cvu_tecnm = req.user.cvu_tecnm;
    const proyectos = await conexion.query(
    'select * from (select * from  proyecto natural join proyecto_participante natural join participante)as a  where rol_proyecto="Responsable"'
  );
  const final = formatearFechas(proyectos);
  res.render('proyecto/list', { proyectos: final });
});



//ELIMINAR
router.get('/delete/:id_proyecto', esAdministrador, async (req, res) => {

  try {
    const { id_proyecto } = req.params;
    await conexion.query('DELETE FROM  proyecto  WHERE ID_PROYECTO=?', [id_proyecto]);
    req.flash('success', id_proyecto + ' eliminado  correctamente');
    res.redirect("/proyecto");



  } catch (error) {
    req.flash('message', ' el proyecto no puede ser eliminado ya que tiene datos asociados');
    res.redirect("/proyecto");
  }

});






router.get('/edit/:id_proyecto', esLider, async (req, res) => {
try {
  
  const { id_proyecto } = req.params;

  const nuevo = await conexion.query('SELECT * FROM  proyecto  WHERE id_proyecto=?', [id_proyecto]);
  
 
 

if(nuevo.length>0){
  //const convocatoria   = await conexion.query(  'select a.id_convocatoria,a.nombre_convocatoria from convocatoria as a left join proyecto as b on a.id_convocatoria=b.id_convocatoria where b.id_convocatoria is null');
  //const con_actual=await conexion.query('select * from convocatoria where id_convocatoria= ?',[nuevo[0].id_convocatoria]);

  //convocatoria.push(con_actual[0]);

  var fecha1 = moment() ;
  var fecha2 = moment(nuevo[0].creado);
   var temporal=fecha1.diff(fecha2, 'days');
   if(temporal<10){
    req.flash('message',"Recuerde que solo le quedan "+(10-temporal) +" dias para editar ");

    res.render('proyecto/edit', { proyecto: nuevo[0],message:req.flash('message')});
   }else{
    req.flash('message',"ya no puede realizar cambios en su proyecto agoto los dias dara modificar");
    res.redirect('/proyecto');
   }
}

  
} catch (error) {
  
  req.flash('message','Algo ha salido mal intente de nuevo')
  res.redirect('/proyecto');
}
  
  
});





router.post('/edit/:id_proyecto', esLider, async (req, res) => {
  try {
  const { id_proyecto } = req.params;
  estado = 1;

  const { titulo, modalidad, fecha_sometido, fecha_dictamen,  clave_financiamiento } = req.body;

  const newProyecto = {
    titulo,
    modalidad,
    fecha_sometido ,
    fecha_dictamen,
    clave_financiamiento,
    estado

  };

  
    await conexion.query('UPDATE   proyecto  set ? WHERE id_proyecto= ? ', [newProyecto, id_proyecto]);


    req.flash('success', 'cambios guardados para ' + titulo);
    res.redirect('/proyecto');



  } catch (error) {
    console.log(req.user.rol_sistema);
    if (error) {
      req.flash('message', ' Algo ha salido mal');
      res.redirect('/proyecto');
    }

  }


});




router.get('/detalle/:id_proyecto', estaLogueado, 
async (req, res) => {

  const { id_proyecto } = req.params;

 

  const proyecto = await conexion.query('SELECT * FROM  proyecto  WHERE id_proyecto=?', [id_proyecto]);
  req.app.locals.proyectodisponible=proyecto[0];

  const usuario = req.user.rol_sistema;
 
console.log(req.app.locals);

    res.render('layouts/proyecto_responsable', { proyecto: proyecto[0] });
  
    
  
  //res.send("recibido");
  });




  router.get('/regresar', esLider, async (req, res) => {
   req.app.locals.proyectodisponible=null;

    res.redirect('/' );
   
  });




function formatearFechas(proyecto) {
  const formato = 'YYYY-MM-DD ';
  const formato1 = 'LLL';
  let editado = [];
  for (const p in proyecto) {
    let f = moment(proyecto[p].fecha_sometido);
    let g = moment(proyecto[p].fecha_dictamen);

    //let fecha_inicio=f.format('LLL');
    //let fecha_fin=g.format('LLL');
    let fecha_sometido = f.format(formato1);
    let fecha_dictamen = g.format(formato1);
    const a = {
      id_proyecto: proyecto[p].id_proyecto,
      titulo: proyecto[p].titulo,
      modalidad: proyecto[p].modalidad,
      fecha_sometido,
      fecha_dictamen,
      clave_financiamiento: proyecto[p].clave_financiamiento,
      nombre: proyecto[p].nombre,
      nombre_convocatoria: proyecto[p].nombre_convocatoria

    };
    editado.push(a);

  }
  return editado;

}


module.exports = router;
