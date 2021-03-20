const express = require('express');
const router = express.Router();
const conexion = require('../database');
const { estaLogueado, noEstaLogueado, esAdministrador } = require('../lib/auth');



router.get('/p/:id_proyecto', estaLogueado, async (req, res) => {

  res.render('proyecto/entregable/p');
});

router.get('/add/:id_proyecto', estaLogueado, async (req, res) => {

  const { id_proyecto } = req.params;
  const validaprotocolo = await conexion.query('select * from protocolo where id_proyecto=?', [id_proyecto]);
  if (validaprotocolo.length > 0) {
  const validacion = await conexion.query('select entregable.id_entregable,nombre,contribucion from entregable left join (select * from proyecto_entregable where id_proyecto=?)as a on entregable.id_entregable =a.id_entregable where a.id_entregable is null ', [id_proyecto]);
  res.render('proyecto/entregable/add', { entregables: validacion, id_proyecto });
  //console.log(validacion);
  }else{
    
    req.flash('message','Primero debe subir su protocolo');
    res.redirect('/protocolo/add/' + id_proyecto);
  }
});



router.post('/add', estaLogueado, async (req, res) => {


  //console.log(req.body);
  
  const { id_entregable, cantidad, id_proyecto } = req.body;
  for (const p in id_entregable) {
    const newProyecto_entregable = {
      id_proyecto,
      id_entregable: id_entregable[p],
      cantidad: cantidad[p]

    }
    console.log(newProyecto_entregable);
    await conexion.query('INSERT INTO proyecto_entregable set ?', [newProyecto_entregable]);
  }
  req.flash('success', 'entregables agregados correctamente');
  res.redirect("/entregable/proyecto/" + id_proyecto);
  
});




//listar de la base de datos
router.get('/proyecto/:id_proyecto', estaLogueado, async (req, res) => {
  const { id_proyecto } = req.params;
  const consulta = await conexion.query('select * from entregable natural join proyecto_entregable  where id_proyecto=?', [id_proyecto]);

  res.render('proyecto/entregable/listarporproyecto', { consulta, id_proyecto });
});



router.post('/edit', async (req, res) => {

  const { id_proyecto, id_entregable, cantidad } = req.body;
  const updateEntregable = {
    id_proyecto,
    id_entregable,
    cantidad
  };
  await conexion.query('UPDATE   proyecto_entregable  set ? WHERE id_proyecto= ? and id_entregable=? ', [updateEntregable, id_proyecto, id_entregable]);


  req.flash('success', 'cambios guardados satisfactoriamente');
  res.redirect('/entregable/proyecto/' + id_proyecto);

});



//ELIMINAR
router.get('/delete/:id_entregable/:id_proyecto', async (req, res) => {
  const { id_entregable, id_proyecto } = req.params;
  await conexion.query('DELETE FROM  proyecto_entregable  WHERE id_proyecto= ? and id_entregable=? ', [id_proyecto, id_entregable]);
  req.flash('success', ' eliminado  correctamente');
  res.redirect('/entregable/proyecto/' + id_proyecto);

});





module.exports = router;
