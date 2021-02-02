const express = require('express');
const router = express.Router();
const conexion = require('../database');
const { estaLogueado, noEstaLogueado, esAdministrador } = require('../lib/auth');


const moment = require('moment');

moment.locale('es');


router.get('/add', estaLogueado, async (req, res) => {
  const cvu_tecnm = req.user.cvu_tecnm;
  console.log(req.user);
  const valida = await conexion.query('select * from proyecto_participante where cvu_tecnm=?', [cvu_tecnm]);
  //const proyecto_activo=await conexion.query('select * from proyecto_participante where cvu_tecnm=?',[cvu_tecnm]);
  const convocatorias = await conexion.query('select * from convocatoria');
  //if(valida.length<0){


  res.render('proyecto/add', { convocatorias });
  // }else{
  // for ( const p in valida) {
  // if(valida[p].estado==0){
  // req.flash('message','tiene 1 proyecto activo no puede dar de alta otro');
  //res.redirect('/');}

  //}

  // res.render('proyecto/add',{convocatorias});


  //}


});



router.post('/add', estaLogueado, async (req, res) => {


  //validar si ese usuario tiene un proyecto activo
  const activo = await conexion.query('select * from proyecto natural join proyecto_participante natural join participante where rol_proyecto="Responsable" and cvu_tecnm= ? and estado!=0', [req.user.cvu_tecnm]);
  if (activo.length == 0) {

    const clave_financiamiento = req.body.clave_financiamiento;
    //estados del proyecto o=terminado, 1=creado,2=en tiempo,3=atrasado,4=cancelado
    let estado = 1;
    const validacion = await conexion.query('select * from financiamiento WHERE  CLAVE_FINANCIAMIENTO=?', [clave_financiamiento]);
    const validaconvocatoria = await conexion.query('select * from proyecto WHERE  id_convocatoria=?', [req.body.id_convocatoria]);
    if (validacion.length > 0 && validaconvocatoria.length == 0) {
      const cvu_tecnm = req.user.cvu_tecnm;
      const fecha_sometido = req.body.fecha_sometido + ' ' + req.body.hora_s + ':00';
      const fecha_dictamen = req.body.fecha_dictamen + ' ' + req.body.hora_d + ':00';

      const { titulo, modalidad, id_convocatoria } = req.body;

      const newProyecto = {
        titulo,
        modalidad,
        fecha_sometido,
        fecha_dictamen,
        clave_financiamiento,
        id_convocatoria,
        estado
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
      req.flash('message', ' no pudo ser creado el proyecto verfique la convocatoria y la clave  financiamiento');
      //console.log('no existe registro');
      res.redirect("/proyecto/add");
    }
  }
  else {

    req.flash('message', ' tiene un proyecto activo no puede tener control de 2 proyectos a la vez');
    res.redirect("/proyecto/add");
  }


});








//listar de la base de datos
router.get('/', estaLogueado, async (req, res) => {
  console.log(req.user);
  if (req.user.rol_sistema == 'Administrador') {
    res.redirect('proyecto/listartodo');
  } else {
    const cvu_tecnm = req.user.cvu_tecnm;
    //  console.log(req.user.cvu_tecnm);
    // const proyectos= await  conexion.query(  ' select * from (select proyecto.id_proyecto,nombre,proyecto.cvu_tecnm from  proyecto inner join participante where proyecto.cvu_tecnm=participante.cvu_tecnm)as a inner join(select titulo,modalidad,fecha_sometido,fecha_dictamen,clave_financiamiento,cvu_tecnm,convocatoria.nombre_convocatoria from proyecto inner join convocatoria where proyecto.id_convocatoria=convocatoria.id_convocatoria )as b where a.cvu_tecnm=b.cvu_tecnm and  a.cvu_tecnm=?',[cvu_tecnm]);
    const proyectos = await conexion.query('select * from  (select * from convocatoria natural join proyecto natural join proyecto_participante natural join participante)as a  where cvu_tecnm=? and rol_proyecto="Responsable" ', [cvu_tecnm]);

    const final = formatearFechas(proyectos);

    //console.log(final);

    //    console.log(proyectos);
    res.render('proyecto/list', { proyectos: final });
  }
});




//listar de la base de datos para modo Administrador
router.get('/listartodo', esAdministrador, estaLogueado, async (req, res) => {
  const cvu_tecnm = req.user.cvu_tecnm;
  //console.log(req.user.cvu_tecnm);
  const proyectos = await conexion.query(
    'select * from (select * from convocatoria natural join proyecto natural join proyecto_participante natural join participante)as a  where rol_proyecto="Responsable"'
  );
  const final = formatearFechas(proyectos);
  // console.log(proyectos);
  res.render('proyecto/list', { proyectos: final });
});



//ELIMINAR
router.get('/delete/:id_proyecto', esAdministrador, async (req, res) => {
  try {
    const { id_proyecto } = req.params;
    await conexion.query('DELETE FROM  proyecto  WHERE ID_PROYECTO=?', [id_proyecto]);
    // console.log(req.params.id_convocatoria);
    req.flash('success', id_proyecto + ' eliminado  correctamente');
    res.redirect("/proyecto");

  } catch (error) {
    req.flash('message', ' el proyecto no puede ser eliminado ya que tiene datos asociados');
    res.redirect("/proyecto");
  }

});






router.get('/edit/:id_proyecto', estaLogueado, async (req, res) => {

  const { id_proyecto } = req.params;

  const nuevo = await conexion.query('SELECT * FROM  proyecto  WHERE id_proyecto=?', [id_proyecto]);
  const convocatoria = await conexion.query('select * from convocatoria ');

  console.log(nuevo[0]);



  res.render('proyecto/edit', { proyecto: nuevo[0], convocatoria });
  //res.send("recibido");
});





router.post('/edit/:id_proyecto', estaLogueado, async (req, res) => {
  const { id_proyecto } = req.params;
  estado = 1;

  const { titulo, modalidad, fecha_sometido, hora_s, fecha_dictamen, hora_d, id_convocatoria, clave_financiamiento } = req.body;

  const newProyecto = {
    titulo,
    modalidad,
    fecha_sometido: fecha_sometido + ' ' + hora_s,
    fecha_dictamen: fecha_dictamen + ' ' + hora_d,
    clave_financiamiento,
    id_convocatoria,
    estado

  };

  try {
    await conexion.query('UPDATE   proyecto  set ? WHERE id_proyecto= ? ', [newProyecto, id_proyecto]);


    req.flash('success', 'cambios guardados para ' + titulo);
    res.redirect('/proyecto');



  } catch (error) {
    console.log(req.user.rol_sistema);
    if (error.code == 'ER_DUP_ENTRY') {
      req.flash('message', ' No se pudo actualizar los datos ya existe un registro con esta convocatoria');
      res.redirect('/proyecto');
    }

  }


});


/*

 router.get('/detalle/:id_proyecto',estaLogueado ,async (req,res)=>{
    
  const {id_proyecto}=req.params;
  
 const proyecto= await  conexion.query(  'SELECT * FROM  proyecto  WHERE id_proyecto=?',[id_proyecto]);
 

console.log(proyecto[0]);

  

    res.render('layouts/proyecto',{proyecto: proyecto[0]});
    //res.send("recibido");
});

*/


router.get('/detalle/:id_proyecto', estaLogueado, async (req, res) => {

  const { id_proyecto } = req.params;


  const proyecto = await conexion.query('SELECT * FROM  proyecto  WHERE id_proyecto=?', [id_proyecto]);

  const usuario = req.user.rol_sistema;
  //console.log(usuario);

  if (usuario == 'Administrador') {
    res.render('layouts/proyecto', { proyecto: proyecto[0] });
  } else {

    res.render('layouts/proyecto_responsable', { proyecto: proyecto[0] });
  }
  //res.send("recibido");
});



function formatearFechas(proyecto) {
  const formato = 'YYYY-MM-DD  HH:mm:ss';
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
