const express = require('express');
const router = express.Router();
const conexion = require('../database');
const { esAdministrador } = require('../lib/auth');


router.get('/add', async (req, res) => {

  const financiamientos = await conexion.query('select * from financiamiento');
  const partidas = await conexion.query('select * from detalle_partida');
  res.render('partida/add', { financiamientos, partidas })

});



router.post('/add', async (req, res) => {


  const { clave_financiamiento } = req.body;
  const { clave_partida } = req.body;
  const { monto_aprobado } = req.body;


  if (Array.isArray(clave_partida) && Array.isArray(monto_aprobado)) {
    for (const p in clave_partida) {
      const newPartida = {
        clave_financiamiento,
        clave_partida: clave_partida[p],

        monto_aprobado: monto_aprobado[p],


      }
      //insertar
      await conexion.query('INSERT INTO financiamiento_partida set ?', [newPartida]);


    }


  } else {

    const newPartida1 = {
      clave_financiamiento,
      clave_partida,
      monto_aprobado
    }
    await conexion.query('INSERT INTO financiamiento_partida set ?', [newPartida1]);

  }


  req.flash('success', 'agreado correctamente');

  //res.render("integrante/add");
  res.redirect("/partida");

});



//listar todas
router.get('/', esAdministrador, async (req, res) => {

  const partidas = await conexion.query('SELECT * FROM  financiamiento_partida ');

  console.log(partidas);
  res.render('partida/list', { partidas });
});


//eliminar
router.get('/delete/:clave_financiamiento/:clave_partida', esAdministrador, async (req, res) => {

  const { clave_financiamiento } = req.params;
  const { clave_partida } = req.params;
  await conexion.query('DELETE FROM  financiamiento_partida  WHERE CLAVE_FINANCIAMIENTO=? && CLAVE_PARTIDA=?', [clave_financiamiento, clave_partida]);
  //console.log(req.params.id_convocatoria);
  req.flash('success', ' eliminado  correctamente');
  res.redirect("/partida");

});





//editar
router.post('/edit/:clave_financiamiento/:clave_partida', esAdministrador, async (req, res) => {

  const { clave_financiamiento } = req.params;
  const { clave_partida } = req.params;
  const { monto_aprobado } = req.body;

  //res.send('recibido');

  //const {vigencia_inicio,vigencia_fin}= req.body;
  const newPartida = {
    clave_financiamiento,
    clave_partida,
    monto_aprobado
  };

  await conexion.query('UPDATE   financiamiento_partida  set ? WHERE CLAVE_FINANCIAMIENTO= ?  && CLAVE_PARTIDA=?', [newPartida, clave_financiamiento, clave_partida]);
  //console.log(newFinanciamiento);
  req.flash('success', 'cambios guardados para ');
  res.redirect('/partida');
});


module.exports = router;