const express = require('express');
const router = express.Router();
const conexion = require('../database');
const { estaLogueado, noEstaLogueado, esAdministrador } = require('../lib/auth');


router.get('/add/:id_proyecto', estaLogueado, async (req, res) => {

  const { id_proyecto } = req.params;
  //const envia=await conexion.query('select * from (select clave_partida from proyecto natural join financiamiento_partida where id_proyecto=?)as a natural join detalle_partida',[id_proyecto]);
  const validacion = await conexion.query('select detalle_partida.clave_partida,detalle_partida.clave_subpartida,detalle_partida.descripcion from detalle_partida left join (select * from material_servicio where id_proyecto = ?)as a on a.clave_subpartida = detalle_partida.clave_subpartida where a.clave_subpartida is null; ', [id_proyecto]);
 //console.log(envia);
  res.render('proyecto/materialServicio/add',{subpartidas:validacion,id_proyecto});
});



router.post('/add', estaLogueado, async (req, res) => {
  console.log(req.body);
  
  const { descripcion, clave_subpartida, monto,id_proyecto } = req.body;
  if(Array.isArray(descripcion)){
    for (const p in monto) {
      const newMyS = {
        descripcionms:descripcion[p],
        id_proyecto,
        clave_subpartida:clave_subpartida[p],
        monto_solicitado:monto[p]
      
      }
      console.log(newMyS);
      await conexion.query('INSERT INTO material_servicio set ?', [newMyS]);
    }

  }else{

    const newMySa = {
      descripcionms:descripcion,
      id_proyecto,
      clave_subpartida:clave_subpartida,
      monto_solicitado:monto
    
    }
    console.log(newMySa);
    await conexion.query('INSERT INTO material_servicio set ?', [newMySa]);

  }
  
  
  req.flash('success', 'Materiales y Servicios  agregados correctamente');
  res.redirect("/materialServicio/proyecto/" + id_proyecto);
  
});




//listar de la base de datos
router.get('/proyecto/:id_proyecto', estaLogueado, async (req, res) => {
  const { id_proyecto } = req.params;
  const consulta = await conexion.query('select * from material_servicio inner join detalle_partida on material_servicio.clave_subpartida=detalle_partida.clave_subpartida  where id_proyecto  =? ', [id_proyecto]);
console.log(consulta);
  res.render('proyecto/materialServicio/listarporproyecto', { consulta, id_proyecto });
});



router.post('/edit', async (req, res) => {
  //console.log(req.body);

  const { id_proyecto, monto_solicitado, id_material_servicio ,descripcionms,clave_subpartida} = req.body;
  const updateMyS = {
    id_material_servicio,
    descripcionms,
    id_proyecto,
    clave_subpartida,
    monto_solicitado
  };
  console.log(updateMyS);
  
  await conexion.query('UPDATE   material_servicio  set ? WHERE id_proyecto= ? and id_material_servicio=? ', [updateMyS, id_proyecto, id_material_servicio]);


  req.flash('success', 'cambios guardados satisfactoriamente');
  res.redirect('/materialServicio/proyecto/' + id_proyecto);

});



//ELIMINAR
router.get('/delete/:id_material_servicio/:id_proyecto', async (req, res) => {
  const { id_material_servicio, id_proyecto } = req.params;
  await conexion.query('DELETE FROM  material_servicio  WHERE id_proyecto= ? and id_material_servicio=? ', [id_proyecto, id_material_servicio]);
  req.flash('success', ' eliminado  correctamente');
  res.redirect('/materialServicio/proyecto/' + id_proyecto);

});





module.exports = router;
