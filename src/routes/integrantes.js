const express =require('express');
const router=express.Router();

const pool=require('../database');
const {estaLogueado,noEstaLogueado,esAdministrador}=require('../lib/auth');

//agregar un Responsable
router.get('/add',(req,res)=>{

    //res.send('Form');
    res.render('integrante/add');
});





//insertar a la base un link
router.post('/add' ,async (req,res)=>{
    const estado=1;
    const {cvu_tecnm,nombre,apellido1,apellido2,plantel_adscripcion,email,rol_proyecto}=req.body;
    const newIntegrante={
        cvu_tecnm,
        nombre,
        apellido1,
        apellido2,
        plantel_adscripcion,
        email,
        rol_proyecto,
        estado
    };
   // console.log(newIntegrante);
   //console.log(req.body);
  await  pool.query(  'INSERT INTO participante set ?',[newIntegrante]);
   // res.send('recibido');
  req.flash('success','agreado correctamente');
   
   //res.render("integrante/add");
   res.redirect("/integrantes");

});



//agregar colaboradores a un proyecto especifico
router.get('/addColaborador/:id_proyecto',(req,res)=>{


    const {id_proyecto}=req.params;
    //res.send('Form');
    res.render('integrante/add_integrante_p',{id_proyecto});
});

router.post('/addColaborador',(req,res)=>{


    console.log(req.params,req.body);
    //res.send('Form');
   
});


//listar de la base de datos
router.get('/' ,esAdministrador,async (req,res)=>{
    
   const integrantes= await  pool.query(  'SELECT * FROM  participante  ');
   // console.log(integrantes);
    //res.send("listas tontas");
    //ruta de la vista//+ la lista de datos a pasar
    res.render('integrante/list',{integrantes});
});

router.get('/activos' ,esAdministrador,async (req,res)=>{
    
    const integrantes= await  pool.query(  'SELECT * FROM  participante where estado="1" ');

    // console.log(integrantes);
     //res.send("listas tontas");
     //ruta de la vista//+ la lista de datos a pasar
     res.render('integrante/list',{integrantes});
 });

 router.get('/inactivos' ,esAdministrador,async (req,res)=>{
    
    const integrantes= await  pool.query(  'SELECT * FROM  participante where estado="0" ');
    
    // console.log(integrantes);
     //res.send("listas tontas");
     //ruta de la vista//+ la lista de datos a pasar
     res.render('integrante/list',{integrantes});
 });

//ELIMINAR
router.get('/delete/:cvu_tecnm',esAdministrador ,async (req,res)=>{
    
    const {cvu_tecnm}=req.params;


    await  pool.query(  'DELETE FROM  participante  WHERE CVU_TECNM=?',[cvu_tecnm]);
     console.log(req.params.cvu_tecnm);
     req.flash('success',cvu_tecnm +' eliminado  correctamente');
     res.redirect("/integrantes");

     //ruta de la vista//+ la lista de datos a pasar
     // res.render('links/list',{links});
 });



 router.get('/desactivar/:cvu_tecnm',esAdministrador ,async (req,res)=>{
    
    const {cvu_tecnm}=req.params;


    await  pool.query(  'UPDATE participante SET estado=0 WHERE CVU_TECNM=?',[cvu_tecnm]);
     console.log(req.params.cvu_tecnm);
     req.flash('success',cvu_tecnm +' eliminado  correctamente');
     res.redirect("/integrantes/inactivos");

     //ruta de la vista//+ la lista de datos a pasar
     // res.render('links/list',{links});
 });


 //editar
router.get('/edit/:cvu_tecnm',esAdministrador ,async (req,res)=>{
    
    const {cvu_tecnm}=req.params;
    
   const nuevo= await  pool.query(  'SELECT * FROM  participante  WHERE CVU_TECNM=?',[cvu_tecnm]);
 console.log(nuevo[0]);
    // res.redirect("/links");
    //res.send("recibido");
     //ruta de la vista//+ la lista de datos a pasar
      res.render('integrante/edit',{integrante: nuevo[0]});
 });


 router.post('/edit/:cvu_tecnm',esAdministrador ,async (req,res)=>{
    
    const {cvu_tecnm}=req.params;

    const {nombre,apellido1,apellido2,plantel_adscripcion,email,rol_proyecto}= req.body;
    const newIntegrante ={
        nombre,
        apellido1,
        apellido2,
        plantel_adscripcion,
        email,
        rol_proyecto
        };

   await  pool.query(  'UPDATE   participante  set ? WHERE CVU_TECNM= ? ',[newIntegrante,cvu_tecnm]);
    console.log(cvu_tecnm);

   req.flash('success','cambios guardados para '+ cvu_tecnm);
      res.redirect ('/integrantes');
 });

module.exports=router;
