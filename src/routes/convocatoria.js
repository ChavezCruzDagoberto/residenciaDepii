const express = require('express');
const router = express.Router();
const conexion = require('../database');
const { estaLogueado, noEstaLogueado, esAdministrador } = require('../lib/auth');

const moment = require('moment');

//validacion con expressValidator
const { check, validationResult } = require('express-validator');

//fecha en español
moment.locale('es');

router.get('/add', esAdministrador, (req, res) => {
    console.log(req.user);
    res.render('convocatoria/add');

});



router.post('/add', esAdministrador, [
    check('nombre_convocatoria').notEmpty().isString().toUpperCase(),
    check('anio').notEmpty().isNumeric().withMessage("dato de un año "),
    check('fecha').notEmpty().isDate().withMessage("formato de fecha"),
],
    async (req, res) => {
        const errores = validationResult(req);
        console.log(errores.array());
        if (errores.array().length > 0) {

            return res.status(400).json({ errores: errores.array() });

        } else {
            const fecha_cierre = req.body.fecha;
            const { nombre_convocatoria, anio } = req.body;

            const newConvocatoria = {
                nombre_convocatoria,
                anio,
                fecha_cierre
            };


            await conexion.query('INSERT INTO convocatoria set ?', [newConvocatoria]);
            // res.send('recibido');
            req.flash('success', 'agreado correctamente');


            res.redirect("/convocatoria");
        }
    });




//listar de la base de datos
router.get('/', async (req, res) => {

    let convocatorias = await conexion.query('SELECT * FROM  convocatoria ');
    let con_editado = [];
    for (const p in convocatorias) {
        let f = moment(convocatorias[p].fecha_cierre);
        let fecha_cierre = f.format('YYYY-MM-DD  HH:mm:ss');
        const a = {
            id_convocatoria: convocatorias[p].id_convocatoria,
            nombre_convocatoria: convocatorias[p].nombre_convocatoria,
            anio: convocatorias[p].anio,
            fecha_cierre

        };
        con_editado.push(a);

    }
    console.log(con_editado)
    //convocatorias=con_editado;
    res.render('convocatoria/list', { convocatorias: con_editado });
});



//ELIMINAR
router.get('/delete/:id_convocatoria', esAdministrador, async (req, res) => {

    const { id_convocatoria } = req.params;
    await conexion.query('DELETE FROM  convocatoria  WHERE ID_CONVOCATORIA=?', [id_convocatoria]);
    console.log(req.params.id_convocatoria);
    req.flash('success', id_convocatoria + ' eliminado  correctamente');
    res.redirect("/convocatoria");

});






router.get('/edit/:id_convocatoria', esAdministrador, async (req, res) => {

    const { id_convocatoria } = req.params;

    const nuevo = await conexion.query('SELECT * FROM  convocatoria  WHERE ID_CONVOCATORIA=?', [id_convocatoria]);
    console.log(nuevo[0]);


    const fecha = moment(nuevo[0].fecha_cierre);
    var fecha_cierre = fecha.format('YYYY-MM-DD  HH:mm:ss');
    const editado = {
        id_convocatoria: nuevo[0].id_convocatoria,
        nombre_convocatoria: nuevo[0].nombre_convocatoria,
        anio: nuevo[0].anio,
        fecha_cierre

    };
    //console.log(editado);

    res.render('convocatoria/edit', { convocatoria: editado });
    //res.send("recibido");
});


router.post('/edit/:id_convocatoria', esAdministrador,
    [
        check('nombre_convocatoria').notEmpty().isString().toUpperCase(),
        check('anio').notEmpty().isNumeric().withMessage("dato de un año "),
        check('fecha_cierre').notEmpty().withMessage("formato de fecha"),
    ], async (req, res) => {

        const errores = validationResult(req);
        console.log(errores.array());
        if (errores.array().length > 0) {

            return res.status(400).json({ errores: errores.array() });

        } else {

            const { id_convocatoria } = req.params;

            const { nombre_convocatoria, anio, fecha_cierre } = req.body;
            const newConvocatoria = {
                nombre_convocatoria,
                fecha_cierre,
                anio
            };

            await conexion.query('UPDATE   convocatoria  set ? WHERE ID_CONVOCATORIA= ? ', [newConvocatoria, id_convocatoria]);
            // console.log(cvu_tecnm);

            req.flash('success', 'cambios guardados para ' + id_convocatoria);
            res.redirect('/convocatoria');
        }
    });




function findsubstr(str) {

    var substring = str.substr(0, 6); s

    console.log(substring);
}

module.exports = router;