const express = require('express');
const router = express.Router();
const passport = require('passport');
const conexion = require('../database');
const { estaLogueado, noEstaLogueado, esAdministrador } = require('../lib/auth');
const helpers = require('../lib/helpers');
const { check, validationResult } = require('express-validator');

const rateLimit=require('express-rate-limit');
const intentos=rateLimit({
    windowMs: 10*60*1000,
    max:3,
    message:"se estan recibiendo muchos intentos de esta IP reintente en 10 min"
});
const intentos1=rateLimit({
    windowMs: 10*60*1000,
    max:3,
    message:"se estan recibiendo muchos intentos de esta IP reintente en 10 min"
});

router.get('/singup', async (req, res) => {

    const responsables = await conexion.query('SELECT O.cvu_tecnm,nombre,apellido1,apellido2,plantel_adscripcion,email FROM participante AS O LEFT JOIN users AS P ON O.cvu_tecnm = P.cvu_tecnm WHERE P.cvu_tecnm IS NULL ');
   console.log(responsables);
    if (responsables.length > 0) { res.render('auth/singup', { responsables }); }
    else {
        req.flash('message', 'Todos  tienen cuenta agregue un nuevo participante');

        res.redirect('integrantes/add');
    }

});

router.get('/addcapturista', async (req, res) => {
    res.render('auth/singup_capturista'); 

});

router.post('/singup',
[//validacion de los datos que entran del formulario
    check('cvu_tecnm').notEmpty().isAlphanumeric().toUpperCase().isLength({ max: 10 }).withMessage('Solo Alphanumerico con maximo de 10 caracteres'),
    check('password').notEmpty().isLength({ min:6,max: 20 }).withMessage('tamaño minimo de 6 a 50 caracteres maximo'),
    check('username').notEmpty().isEmail().isLength({ min:6, max: 100 }).trim().withMessage('tamaño de 6 a 100 caracteres'),
]

,(req,res,next)=>{
    const errores = validationResult(req);
    console.log(errores.array());
    if (errores.array().length > 0) {

        return res.status(400).json({ errores: errores.array() });

    } else {

    passport.authenticate('local.signup', {
        successRedirect: '/cuentas',
        failureRedirect: '/singup',
        failureFlash: true
    })(req, res, next);
}
});

router.get('/signin',noEstaLogueado, (re, res) => {
    res.render('auth/signin')

});

router.post('/signin',noEstaLogueado,intentos, (req, res, next) => {

    passport.authenticate('local.signin', {
        successRedirect: '/',   
        failureRedirect: '/signin',
        failureFlash: true
    })(req, res, next);

});

router.get('/logout', estaLogueado, (req, res) => {
    req.app.locals.lider=null;
    req.app.locals.admin=null;
    req.app.locals.proyectodisponible=null;
    req.logOut();
    res.redirect('/signin');

});

router.get('/reset',estaLogueado, async (req, res) => {

    const user = req.user;
    res.render('auth/resetCuenta', { user });

});

router.post('/resetPassword', estaLogueado ,
[//validacion de los datos que entran del formulario
    check('username').notEmpty().withMessage('El dato username no puede estar vacio'),
    check('password_now')
    .notEmpty()
    .withMessage('ERROR EN EL FORMATO DE PASSWORD   ')
    .isLength({min: 6}).withMessage('TAMAÑO MINIMO 6'),
],async (req, res) => {

    const errores =validationResult(req);

    if(!errores.notEmpty){
        console.log(errores );
      return res.status(400).json({errors:errores.array()});
       // res.send("algo ha salido mal");
    }else{
    const user = req.user;
    const { username, password, password_now } = req.body;
    const validPassword = await helpers.comparePaswsorwd(password, user.password);
    if (validPassword) {
        const contraseña = await helpers.encriptarPassword(password_now);
        const newDatosUser = {
            username,
            password: contraseña,
            cvu_tecnm: user.cvu_tecnm,
            rol_sistema: user.rol_sistema

        }

        await conexion.query('UPDATE   users  set ? WHERE id_usuario= ? ', [newDatosUser, user.id_usuario]);
        // console.log(cvu_tecnm);

        req.flash('success', 'Cambios guardados para ' + user.id_usuario);
        req.logOut();
        res.redirect('/signin');

    } else {
        req.flash('message', 'Algo ha salido mal intente de nuevo ');
        res.redirect('/reset');
        //res.render('auth/resetCuenta', { user :req.user});

    }
}

});

router.get('/cuentas', esAdministrador,async (req, res) => {

    const users=await conexion.query('select * from users');
    res.render('auth/list', { users });

});
router.get('/deleteuser/:cvu_tecnm',esAdministrador, async (req, res) => {
    const { cvu_tecnm } = req.params;
    if(cvu_tecnm!=req.user.cvu_tecnm){

    await conexion.query('DELETE FROM  users  WHERE CVU_TECNM=?', [cvu_tecnm]);
    req.flash('success', cvu_tecnm + ' Eliminado  correctamente');
    res.redirect("/cuentas");
    }else{
        req.flash('message', ' No puede autoeliminarse esta activo');
    res.redirect("/cuentas");
    }

});

router.get('/cambiarestado/:cvu_tecnm',esAdministrador, async (req, res) => {
    const { cvu_tecnm } = req.params;
    if(cvu_tecnm!=req.user.cvu_tecnm){
    const actualiza= await conexion.query('select * from users where cvu_tecnm=?',[cvu_tecnm]);
    
    if(actualiza[0].estado==1){

        await conexion.query('UPDATE users SET estado = 0 WHERE cvu_tecnm=?' ,[ cvu_tecnm]);
    }else{
        await conexion.query('UPDATE users SET estado = 1 WHERE cvu_tecnm=?' ,[ cvu_tecnm]);

    }
    req.flash('success', ' Se modificó el estado de '+cvu_tecnm);
    res.redirect("/cuentas");
    }else{
        req.flash('message', ' No esta permitido para este usuario ya que no podra accesar despues');
    res.redirect("/cuentas");
    }

});
module.exports = router;