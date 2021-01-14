const express =require('express');
const router=express.Router();
const conexion= require('../database');
const {estaLogueado,noEstaLogueado,esAdministrador}=require('../lib/auth');



router.get('/add',estaLogueado, async(req,res)=>{
    let cvu_tecnm=req.user.cvu_tecnm;
    console.log(req.user);
    let proyecto;
    if(req.user.rol_sistema="Administrador"){}else{}
        
        //res.render();
    
     proyecto= await conexion.query('select * from proyecto where CVU_TECNM=? and ESTADO=0 ',[cvu_tecnm]);
    
    
        console.log(proyecto);
        if(proyecto.length>0){ 
   res.render('proyecto/informe/add',{proyecto });
    }else{res.send('usted no tiene ningun proyecto activo');}
  

});



router.post('/add',estaLogueado, async(req,res)=>{
   

   const  {id_proyecto}=req.body;
   const {no_informe}=req.body;
   const {fecha_inicio}=req.body;
   const {fecha_fin}=req.body;




   if(Array.isArray(no_informe) && Array.isArray(fecha_inicio) ){
    for ( const p in no_informe) {  
      const newInforme={
          no_informe:no_informe[p],
          fecha_inicio:fecha_inicio[p],
          fecha_fin:fecha_fin[p],
          id_proyecto
        
      }
      //insertar
      await  conexion.query(  'INSERT INTO informe set ?',[newInforme]);
    

    }

   
    }else{

      const newInforme1={
        no_informe,
        fecha_inicio,
        fecha_fin,
        id_proyecto }
       await  conexion.query(  'INSERT INTO informe set ?',[newInforme1]);

    }


    req.flash('success','agreado correctamente');
      
    //res.render("subpartida/add");
   res.redirect("/informe");





    
});




//listar de la base de datos
router.get('/' ,estaLogueado,async (req,res)=>{
    var admin=req.user.rol_sistema;
    var proyecto;
    console.log(admin);
    var cvu_tecnm=req.user.cvu_tecnm;
    if(admin=="Administrador"){

    proyecto= await conexion.query('select * from proyecto where  ESTADO=0 ');
    }else{
    proyecto= await conexion.query('select * from proyecto where CVU_TECNM=? and ESTADO=0 ',[cvu_tecnm]);
   
        
    }
    
    console.log(proyecto);
     res.render('proyecto/informe/list',{proyecto});
    

 });




 router.post('/listarinforme' ,estaLogueado,async (req,res)=>{
    let {id_proyecto}=req.body;
    console.log(id_proyecto);
    let consulta=await conexion.query('select * from informe where ID_PROYECTO=?',[id_proyecto]);

    
    res.render('proyecto/informe/listarporproyecto',{consulta});


    console.log(consulta);
    
 });


 router.get('/mostrar/:id_proyecto' ,estaLogueado,async (req,res)=>{
    let {id_proyecto}=req.params;
    console.log(id_proyecto);
    let consulta=await conexion.query('select * from informe where ID_PROYECTO=?',[id_proyecto]);

    
    res.render('proyecto/informe/listarporproyecto',{consulta});


    console.log(consulta);
    
 });



 



//ELIMINAR
router.get('/delete/:id_informe' ,esAdministrador,async (req,res)=>{
    
    const {id_informe}=req.params;
    //console.log(id_informe);
    await  conexion.query(  'DELETE FROM  informe  WHERE ID_INFORME=?',[id_informe]);
     //console.log(req.params.id_convocatoria);
     req.flash('success',id_informe +' eliminado  correctamente');
     res.redirect("/informe");

 });





/*
 router.get('/edit/:id_informe',estaLogueado ,async (req,res)=>{
    
    const {id_informe}=req.params;
    
   const nuevo= await  conexion.query(  'SELECT * FROM  informe  WHERE id_proyecto=?',[id_proyecto]);
 console.log(nuevo[0]);

    

      res.render('proyecto/edit',{proyecto: nuevo[0]});
      //res.send("recibido");
 });
 */


 router.post('/edit/:id_informe' ,async (req,res)=>{
    
    //const {id_informe}=req.params;
    console.log(req.params,req.body);

    //const {no_informe,fecha_inicio,fecha_fin}= req.body;
    /*
    const newConvocatoria ={
       nombre_convocatoria,
       anio
        };

   await  conexion.query(  'UPDATE   convocatoria  set ? WHERE ID_CONVOCATORIA= ? ',[newConvocatoria,id_convocatoria]);
   // console.log(cvu_tecnm);

   req.flash('success','cambios guardados para '+ id_convocatoria);
      res.redirect ('/convocatoria');
      */
 });



 
function findsubstr(str) { 
  
    var substring = str.substr(0, 6); s
      
    console.log(substring); 
} 



module.exports=router;
