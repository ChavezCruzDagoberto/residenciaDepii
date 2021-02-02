const express = require('express');
const moment = require('moment');
const router = express.Router();
const conexion = require('../database');

const { estaLogueado, noEstaLogueado, esAdministrador } = require('../lib/auth');

router.get('/add', esAdministrador, (req, res) => {

    console.log(req.user);
    res.render('financiamiento/add');
});



router.post('/add', esAdministrador, async (req, res) => {

    const { clave_financiamiento, vigencia_inicio, vigencia_fin } = req.body;
    const newFinanciamiento = {
        clave_financiamiento,
        vigencia_inicio,
        vigencia_fin
    };


    await conexion.query('INSERT INTO financiamiento set ?', [newFinanciamiento]);
    // res.send('recibido');
    req.flash('success', 'agreado correctamente');

    res.render("financiamiento/add");
    // res.redirect("/integrantes");

});




//listar de la base de datos
router.get('/', esAdministrador, async (req, res) => {

    const financiamiento = await conexion.query('SELECT * FROM  financiamiento ');


    let financiamiento_editado = [];
    let actual = moment();
    for (const p in financiamiento) {
        let i = moment(financiamiento[p].vigencia_inicio);
        let f = moment(financiamiento[p].vigencia_fin);
        let vigencia_inicio = i.format('dddd DD-MM-YYYY');
        let vigencia_fin = f.format(' dddd  DD-MM-YYYY');

        const a = {
            clave_financiamiento: financiamiento[p].clave_financiamiento,
            vigencia_inicio,
            vigencia_fin

        };
        financiamiento_editado.push(a);

    }
    res.render('financiamiento/list', { financiamiento: financiamiento_editado });
});



//ELIMINAR
router.get('/delete/:clave_financiamiento', esAdministrador, async (req, res) => {

    const { clave_financiamiento } = req.params;
    await conexion.query('DELETE FROM  financiamiento  WHERE CLAVE_FINANCIAMIENTO=?', [clave_financiamiento]);
    //console.log(req.params.id_convocatoria);
    req.flash('success', clave_financiamiento + ' eliminado  correctamente');
    res.redirect("/financiamiento");

});



router.get('/edit/:clave_financiamiento', esAdministrador, async (req, res) => {

    const { clave_financiamiento } = req.params;

    const nuevo = await conexion.query('SELECT * FROM  financiamiento  WHERE CLAVE_FINANCIAMIENTO=?', [clave_financiamiento]);
    console.log(nuevo[0]);



    res.render('financiamiento/edit', { financiamiento: nuevo[0] });
    //res.send("recibido");
});


router.post('/edit/:clave_financiamiento', esAdministrador, async (req, res) => {

    const { clave_financiamiento } = req.params;

    const { vigencia_inicio, vigencia_fin } = req.body;
    const newFinanciamiento = {
        vigencia_inicio,
        vigencia_fin
    };

    await conexion.query('UPDATE   financiamiento  set ? WHERE CLAVE_FINANCIAMIENTO= ? ', [newFinanciamiento, clave_financiamiento]);
    //console.log(newFinanciamiento);
    req.flash('success', 'cambios guardados para ' + clave_financiamiento);
    res.redirect('/financiamiento');
});




function findsubstr(str) {

    var substring = str.substr(0, 6); s

    console.log(substring);
}

module.exports = router;