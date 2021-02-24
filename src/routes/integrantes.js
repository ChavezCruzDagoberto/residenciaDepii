const express = require('express');
const router = express.Router();

const pool = require('../database');
const { estaLogueado, noEstaLogueado, esAdministrador, esLider, tienePermiso } = require('../lib/auth');

//validacion con expressValidator
const { check, validationResult } = require('express-validator');

//agregar un Responsable

router.get('/add', esAdministrador, (req, res) => {


    //res.send('Form');
    res.render('integrante/add');
});



//insertar a la base un integrante nuevo

router.post('/add', esAdministrador,
    [//validacion de los datos que entran del formulario
        check('cvu_tecnm').notEmpty().isAlphanumeric().toUpperCase().isLength({ max: 10 }).withMessage('Solo Alphanumerico con maximo de 10 caracteres'),
        check('nombre').notEmpty().toUpperCase().isLength({ max: 50 }).withMessage('solo Letras'),
        check('apellido1').notEmpty().isAlpha().toUpperCase().isLength({ max: 50 }).withMessage('solo Letras'),
        check('plantel_adscripcion').notEmpty().toUpperCase().isLength({ max: 100 }).withMessage('solo Alphanumerico'),
        check('email').notEmpty().isEmail().toLowerCase().isLength({ max: 100 }).withMessage('verificar dato email  example@algo.com'),
    ]
    , async (req, res) => {
        const errores = validationResult(req);
        console.log(errores.array());
        if (errores.array().length > 0) {

            return res.status(400).json({ errores: errores.array() });

        } else {



            const { cvu_tecnm, nombre, apellido1, apellido2, plantel_adscripcion, email } = req.body;
            const validacion = await pool.query('select * from participante where cvu_tecnm=?', [cvu_tecnm]);
            const validacion1 = await pool.query('select * from participante where email=?', [email]);

            console.log(validacion, validacion1);
            if (validacion.length > 0) {
                req.flash('message', ' No se pudo registar ya existe el usuario verifique los datos en caso de ser necesario editelo');


                res.redirect("/integrantes/add");

                return false;


            } else {
                if (validacion1.length > 0) {
                    req.flash('message', ' No se pudo registar el correo electronico esta asociado a otro integrante ');


                    res.redirect("/integrantes/add");

                } else {

                    const newIntegrante = {
                        cvu_tecnm,
                        nombre,
                        apellido1,
                        apellido2,
                        plantel_adscripcion,
                        email
                    };

                    await pool.query('INSERT INTO participante set ?', [newIntegrante]);
                    req.flash('success', 'agreado correctamente');
                    res.redirect("/integrantes");


                }



            }

        }


    });



//agregar colaboradores a un proyecto especifico
router.get('/addColaborador/:id_proyecto', esLider, (req, res) => {


    const { id_proyecto } = req.params;
    //res.send('Form');
    res.render('integrante/add_integrante_p', { id_proyecto });
});

router.post('/addColaborador',
    [//validacion de los datos que entran del formulario
        check('cvu_tecnm').notEmpty().isAlphanumeric().toUpperCase().isLength({ max: 10 }).withMessage('Solo Alphanumerico con maximo de 10 caracteres'),
        check('nombre').notEmpty().toUpperCase().isLength({ max: 50 }).withMessage('solo Letras'),
        check('apellido1').notEmpty().isAlpha().toUpperCase().isLength({ max: 50 }).withMessage('solo Letras'),
        check('plantel_adscripcion').notEmpty().toUpperCase().isLength({ max: 100 }).withMessage('solo Alphanumerico'),
        check('email').notEmpty().isEmail().toLowerCase().isLength({ max: 100 }).withMessage('verificar dato email  example@algo.com'),
        check('rol_proyecto').notEmpty().isAlpha().withMessage('solo Letras'),
        check('id_proyecto').notEmpty().isNumeric().withMessage('Solo campo numerico'),
    ],
    async (req, res) => {
        const errores = validationResult(req);
        console.log(errores.array());
        if (errores.array().length > 0) {

            return res.status(400).json({ errores: errores.array() });

        } else {



            const { cvu_tecnm, id_proyecto, nombre, apellido1, apellido2, plantel_adscripcion, rol_proyecto, email } = req.body;

            const valida = await pool.query('select * from participante where cvu_tecnm=?', [cvu_tecnm]);
            if (valida.length <= 0) {
                const nuevoIntegrante = {
                    cvu_tecnm,
                    nombre,
                    apellido1,
                    apellido2,
                    plantel_adscripcion,
                    email
                };

                await pool.query('insert into participante set ?', [nuevoIntegrante]);

            }
            const nuevoInt_proyecto = {
                id_proyecto,
                cvu_tecnm,
                rol_proyecto
            }
            await pool.query('insert into proyecto_participante set ?', [nuevoInt_proyecto]);
            req.flash('success', 'se añadio un nuevo participante a tu proyecto');
            res.redirect('/integrantes/proyecto/' + id_proyecto);

        }

    });

//listar pro proyecto

router.get('/proyecto/:id_proyecto', estaLogueado, async (req, res) => {
    const { id_proyecto } = req.params;
    // console.log(req.params);

    const integrantes = await pool.query('select * from participante natural join proyecto_participante where id_proyecto= ?', [id_proyecto]);
    //console.log(integrantes);
    //res.send("listas tontas");
    //ruta de la vista//+ la lista de datos a pasar
    res.render('integrante/integrantes_proyecto', { integrantes });
});



//eliminar un participante de un proyecto

router.get('/proyecto/delete/:cvu_tecnm/:id_proyecto', estaLogueado, async (req, res) => {
    const { cvu_tecnm, id_proyecto } = req.params;


    const valida = await pool.query('select * from proyecto_participante where cvu_tecnm= ? and id_proyecto= ?', [cvu_tecnm, id_proyecto]);
    //console.log(valida[0].rol_proyecto);
    if (valida[0].rol_proyecto == 'Responsable') {
        req.flash('message', 'usted no se puede eliminar es el responsable del proyecto');
        res.redirect('/integrantes/proyecto/' + id_proyecto);
    } else {
        // console.log(req.params,req.body);

        await pool.query('delete   from  proyecto_participante where cvu_tecnm= ? and id_proyecto= ?', [cvu_tecnm, id_proyecto]);
        //console.log(integrantes);
        //res.send("listas tontas");
        //ruta de la vista//+ la lista de datos a pasar
        res.redirect('/integrantes/proyecto/' + id_proyecto);
    }
});




//listar de la base de datos
router.get('/', esAdministrador, async (req, res) => {

    const integrantes = await pool.query('SELECT * FROM  participante  ');
    // console.log(integrantes);
    //res.send("listas tontas");
    //ruta de la vista//+ la lista de datos a pasar
    res.render('integrante/list', { integrantes });
});

router.get('/activos', esAdministrador, async (req, res) => {

    const integrantes = await pool.query('SELECT * FROM  participante where estado="1" ');

    // console.log(integrantes);
    //res.send("listas tontas");
    //ruta de la vista//+ la lista de datos a pasar
    res.render('integrante/list', { integrantes });
});

router.get('/inactivos', esAdministrador, async (req, res) => {

    const integrantes = await pool.query('SELECT * FROM  participante where estado="0" ');

    // console.log(integrantes);
    //res.send("listas tontas");
    //ruta de la vista//+ la lista de datos a pasar
    res.render('integrante/list', { integrantes });
});

//ELIMINAR
router.get('/delete/:cvu_tecnm', async (req, res) => {

    const { cvu_tecnm } = req.params;

    if (cvu_tecnm != req.user.cvu_tecnm) {
        try {


            await pool.query('DELETE FROM  participante  WHERE CVU_TECNM=?', [cvu_tecnm]);
            console.log(req.params.cvu_tecnm);
            req.flash('success', cvu_tecnm + ' eliminado  correctamente');
            res.redirect("/integrantes");
        } catch (error) {
            req.flash('message', ' no se ha podido eliminar tiene relacion con otros datos importantes');
            res.redirect("/integrantes");

        }
    } else {
        req.flash('message', 'no puede eliminarse esta activo');
        res.redirect("/integrantes");

    }
    //ruta de la vista//+ la lista de datos a pasar
    // res.render('links/list',{links});
});



router.get('/desactivar/:cvu_tecnm', esAdministrador, async (req, res) => {

    const { cvu_tecnm } = req.params;


    await pool.query('UPDATE participante SET estado=0 WHERE CVU_TECNM=?', [cvu_tecnm]);
    console.log(req.params.cvu_tecnm);
    req.flash('success', cvu_tecnm + ' eliminado  correctamente');
    res.redirect("/integrantes/inactivos");

    //ruta de la vista//+ la lista de datos a pasar
    // res.render('links/list',{links});
});


//editar
router.get('/edit/:cvu_tecnm', async (req, res) => {



    const { cvu_tecnm } = req.params;

    const nuevo = await pool.query('SELECT * FROM  participante  WHERE CVU_TECNM=?', [cvu_tecnm]);
    console.log(nuevo[0]);
    // res.redirect("/links");
    //res.send("recibido");
    //ruta de la vista//+ la lista de datos a pasar
    res.render('integrante/edit', { integrante: nuevo[0] });
});


router.post('/edit/:cvu_tecnm',
    [//validacion de los datos que entran del formulario
        check('cvu_tecnm1').notEmpty().isAlphanumeric().toUpperCase().isLength({ max: 10 }).withMessage('Solo Alphanumerico con maximo de 10 caracteres'),
        check('nombre').notEmpty().toUpperCase().isLength({ max: 50 }).withMessage('solo Letras'),
        check('apellido1').notEmpty().isAlpha().toUpperCase().isLength({ max: 50 }).withMessage('solo Letras'),
        check('plantel_adscripcion').notEmpty().toUpperCase().isLength({ max: 100 }).withMessage('solo Alphanumerico'),
        check('email').notEmpty().isEmail().toLowerCase().isLength({ max: 100 }).withMessage('verificar dato email  example@algo.com'),
    ]
    , async (req, res) => {

        const errores = validationResult(req);
        console.log(errores.array().length);
        if (errores.array().length > 0) {

            return res.status(400).json({ errores: errores.array() });

        } else {

            const { cvu_tecnm } = req.params;

            const { cvu_tecnm1, nombre, apellido1, apellido2, plantel_adscripcion, email } = req.body;
            const newIntegrante = {
                cvu_tecnm: cvu_tecnm1,
                nombre,
                apellido1,
                apellido2,
                plantel_adscripcion,
                email,

            };

            await pool.query('UPDATE   participante  set ? WHERE CVU_TECNM= ? ', [newIntegrante, cvu_tecnm]);
            console.log(cvu_tecnm);

            req.flash('success', 'cambios guardados para ' + cvu_tecnm1);
            res.redirect('/integrantes');

        }
    });

module.exports = router;
