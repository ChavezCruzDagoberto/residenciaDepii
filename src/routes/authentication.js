const express =require('express');
const router=express.Router();
const passport= require('passport');
const conexion=require('../database');
const {estaLogueado,noEstaLogueado,esAdministrador}=require('../lib/auth');


router.get('/singup', async(req,res)=>{
    const responsables=await conexion.query('SELECT O.cvu_tecnm,nombre,apellido1,apellido2,plantel_adscripcion,rol_proyecto,email,estado FROM participante AS O LEFT JOIN users AS P ON O.cvu_tecnm = P.cvu_tecnm WHERE P.cvu_tecnm IS NULL ');
       if(responsables.length>0){res.render('auth/singup',{responsables}); }
        else{req.flash('message', 'todos los responsables tienen cuenta Agrega nuevo');

        res.redirect('integrantes/add');
   }
    
});



router.post('/singup',passport.authenticate('local.signup',{
        successRedirect: '/',
        failureRedirect: '/singup',
        failureFlash:true
    }));






    router.get('/signin',noEstaLogueado,(re,res)=>{
        res.render('auth/signin') 
        
            });


            router.post('/signin',noEstaLogueado,(req,res,next)=>{

                passport.authenticate('local.signin',{
                    successRedirect:'/',
                    failureRedirect :'/signin',
                    failureFlash:true
                })(req,res,next);
            });

/*
    router.get('/',esAdministrador,(req,res)=>{
//res.send('profile');
res.render('profile');

    });*/

    router.get('/logout',estaLogueado,(req,res)=>{
        req.logOut();  
        res.redirect('/signin');
        
            });

module.exports=router;
