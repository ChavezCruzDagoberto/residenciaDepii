const express = require('express');
const router = express.Router();
const conexion = require('../database');
const { esAdministrador } = require('../lib/auth');
//validacion con expressValidator
const { check, validationResult } = require('express-validator');


router.get('/add', async (req, res) => {

  const financiamientos = await conexion.query('select * from financiamiento');
  const partidas = await conexion.query('select * from detalle_partida');
  res.render('partida/add', { financiamientos, partidas })


});

router.get('/add/:clave_financiamiento', async (req, res) => {
  const { clave_financiamiento } = req.params;
  const partidas = await conexion.query('select a.clave_partida from (select distinct clave_partida from detalle_partida)as a left join(select clave_partida from financiamiento_partida where clave_financiamiento = ? )as b on a.clave_partida=b.clave_partida where b.clave_partida is null', [clave_financiamiento]);
 // console.log('partidas', partidas.length);
  if (partidas.length > 0) {
    res.render('partida/add_financiamiento', { partidas: partidas, clave: clave_financiamiento })
  } else {
    req.flash('message', 'ha agregado las partidas existentes');
    res.redirect('/financiamiento/partidas/' + clave_financiamiento);
  }

});


router.post('/add/a', async (req, res) => {
  const { clave_financiamiento, clave_partida, monto_aprobado } = req.body;
  //console.log(req.body);

  if (clave_partida != null && monto_aprobado != null) {
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



  }

  req.flash('success', 'agreado correctamente');

  res.redirect("/financiamiento/partidas/" + clave_financiamiento);



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

  //console.log(partidas);
  res.render('partida/list', { partidas });
});


//eliminar
router.get('/delete/:clave_financiamiento/:clave_partida', esAdministrador, async (req, res) => {

  const { clave_financiamiento } = req.params;
  const { clave_partida } = req.params;
  await conexion.query('DELETE FROM  financiamiento_partida  WHERE CLAVE_FINANCIAMIENTO=? && CLAVE_PARTIDA=?', [clave_financiamiento, clave_partida]);
  //console.log(req.params.id_convocatoria);
  req.flash('success', ' eliminado  correctamente');
  res.redirect("/financiamiento/partidas/" + clave_financiamiento);

});





//editar
router.post('/edit/:clave_financiamiento/:clave_partida',
  [

    check('clave_partida').notEmpty().withMessage('no se acepta vacio'),
    check('monto_aprobado').notEmpty().isNumeric().withMessage('valores enteros'),

  ], esAdministrador, async (req, res) => {
    const errores = validationResult(req);
    //console.log(errores.array());
    if (errores.array().length > 0) {

      return res.status(400).json({ errores: errores.array() });

    } else {

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
      res.redirect('/financiamiento/partidas/' + clave_financiamiento);

    }
  });


module.exports = router;