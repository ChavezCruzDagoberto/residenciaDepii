const express = require('express');
const router = express.Router();
const conexion = require('../database');
const { estaLogueado, noEstaLogueado, esAdministrador } = require('../lib/auth');

router.get('/add', esAdministrador, async (req, res) => {



  res.render('subpartida/add');

});



router.post('/add', esAdministrador, async (req, res) => {



  const { clave_partida } = req.body;
  const { clave_subpartida } = req.body;
  const { descripcion } = req.body;

  //console.log(req.body);
  try {
    if (Array.isArray(clave_subpartida) && Array.isArray(descripcion)) {
      for (const p in clave_subpartida) {
        const newSubpartida = {
          clave_partida,
          clave_subpartida: clave_subpartida[p],
          descripcion: descripcion[p]
        }
        //insertar
        await conexion.query('INSERT INTO detalle_partida set ?', [newSubpartida]);


      }


    } else {

      const newSubpartida1 = {
        clave_subpartida,
        clave_partida,
        descripcion
      }
      await conexion.query('INSERT INTO detalle_partida set ?', [newSubpartida1]);

    }


    req.flash('success', 'agreado correctamente');

    //res.render("subpartida/add");
    res.redirect("/subpartida");
  } catch (e) {
    req.flash('success', 'ya existe esa subpartida');

    //res.render("subpartida/add");
    res.redirect("/subpartida/add");

  }

});



//listar todas
router.get('/', estaLogueado, async (req, res) => {

  const subpartidas = await conexion.query('SELECT * FROM  detalle_partida ');
  console.log(subpartidas);

  res.render('subpartida/list', { subpartidas });

});


//eliminar
router.get('/delete/:clave_subpartida', esAdministrador, async (req, res) => {


  const { clave_subpartida } = req.params;
  await conexion.query('DELETE FROM  detalle_partida  WHERE  CLAVE_SUBPARTIDA=?', [clave_subpartida]);
  //console.log(req.params.id_convocatoria);
  req.flash('success', ' eliminado  correctamente');
  res.redirect("/subpartida");

});





//editar
router.post('/edit/:clave_subpartida', esAdministrador, async (req, res) => {


  const { clave_subpartida } = req.params;
  const { clave_partida } = req.body;
  const { descripcion } = req.body;

  //console.log(req.body,req.params);
  //res.send('recibido');

  //const {vigencia_inicio,vigencia_fin}= req.body;
  const newSubpartida = {
    clave_subpartida,
    clave_partida,
    descripcion
  };

  await conexion.query('UPDATE   detalle_partida  set ? WHERE CLAVE_SUBPARTIDA=?', [newSubpartida, clave_subpartida]);
  //console.log(newFinanciamiento);
  req.flash('success', 'cambios guardados para ');
  res.redirect('/subpartida');
});


module.exports = router;