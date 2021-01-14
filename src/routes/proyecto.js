const express =require('express');
const router=express.Router();
const conexion= require('../database');
const {estaLogueado,noEstaLogueado,esAdministrador}=require('../lib/auth');



router.get('/add',estaLogueado, async(req,res)=>{
   const cvu_tecnm=req.user.cvu_tecnm;
    console.log(req.user);
    const valida=await conexion.query('select * from proyecto where cvu_tecnm=?',[cvu_tecnm]);
    const convocatorias=await  conexion.query(  'select * from convocatoria');
    if(valida.length<0){

     
    res.render('proyecto/add',{convocatorias});
    }else{
      for ( const p in valida) {
        if(valida[p].estado==0){
          req.flash('message','tiene 1 proyecto activo no puede dar de alta otro');
          res.redirect('/');}
        
       }
      
    res.render('proyecto/add',{convocatorias});


    }
    

});



router.post('/add',estaLogueado, async(req,res)=>{
      const clave_financiamiento=req.body.clave_financiamiento;
    let estado=0;
  const validacion=await conexion.query('select * from financiamiento WHERE  CLAVE_FINANCIAMIENTO=?',[clave_financiamiento]);
   
  if(validacion.length>0){
    const cvu_tecnm=req.user.cvu_tecnm;
    const fecha_sometido=req.body.fecha_sometido+' '+ req.body.hora_s + ':00';
    const fecha_dictamen=req.body.fecha_dictamen+' '+ req.body.hora_d + ':00';
   
    const {titulo,modalidad,id_convocatoria}=req.body;

    const newProyecto={
      titulo,
      modalidad,
      fecha_sometido,
      fecha_dictamen,
      clave_financiamiento,
      cvu_tecnm,
      id_convocatoria,
      estado
  };
  
  await  conexion.query(  'INSERT INTO proyecto set ?',[newProyecto]);
  // res.send('recibido');
 req.flash('success','agreado correctamente');
  
  res.render("proyecto/add");
  
  }else{
    req.flash('message',' no existe registro');
    console.log('no exixts registro');
    res.redirect("/proyecto/add");
    }
  
    
});




//listar de la base de datos
router.get('/' ,estaLogueado,async (req,res)=>{
console.log(req.user);
    if(req.user.rol_sistema=='Administrador'){
        res.redirect('proyecto/listartodo');
    }else{
const cvu_tecnm=req.user.cvu_tecnm;
    console.log(req.user.cvu_tecnm);
    const proyectos= await  conexion.query(  
       ' select * from (select proyecto.id_proyecto,nombre,proyecto.cvu_tecnm from  proyecto inner join participante where proyecto.cvu_tecnm=participante.cvu_tecnm)as a inner join(select titulo,modalidad,fecha_sometido,fecha_dictamen,clave_financiamiento,cvu_tecnm,convocatoria.nombre_convocatoria from proyecto inner join convocatoria where proyecto.id_convocatoria=convocatoria.id_convocatoria )as b where a.cvu_tecnm=b.cvu_tecnm and  a.cvu_tecnm=?',[cvu_tecnm]);
   
        console.log(proyectos);
     res.render('proyecto/list',{proyectos});
    }
 });




 //listar de la base de datos para modo Administrador
router.get('/listartodo' ,esAdministrador,estaLogueado,async (req,res)=>{
    const cvu_tecnm=req.user.cvu_tecnm;
        console.log(req.user.cvu_tecnm);
        const proyectos= await  conexion.query(  
           ' select * from (select  proyecto.id_proyecto,nombre,proyecto.cvu_tecnm from  proyecto inner join participante where proyecto.cvu_tecnm=participante.cvu_tecnm)as a inner join(select titulo,modalidad,fecha_sometido,fecha_dictamen,clave_financiamiento,cvu_tecnm,convocatoria.nombre_convocatoria from proyecto inner join convocatoria where proyecto.id_convocatoria=convocatoria.id_convocatoria )as b where a.cvu_tecnm=b.cvu_tecnm ');
       
            console.log(proyectos);
         res.render('proyecto/list',{proyectos});
     });



//ELIMINAR
router.get('/delete/:id_proyecto' ,esAdministrador,async (req,res)=>{
    
    const {id_proyecto}=req.params;
    await  conexion.query(  'DELETE FROM  proyecto  WHERE ID_PROYECTO=?',[id_proyecto]);
    // console.log(req.params.id_convocatoria);
     req.flash('success',id_proyecto +' eliminado  correctamente');
     res.redirect("/proyecto");

 });






 router.get('/edit/:id_proyecto',estaLogueado ,async (req,res)=>{
    
    const {id_proyecto}=req.params;
    
   const nuevo= await  conexion.query(  'SELECT * FROM  proyecto  WHERE id_proyecto=?',[id_proyecto]);
   const convocatoria=await conexion.query('select * from convocatoria ');

 console.log(nuevo[0]);

    

      res.render('proyecto/edit',{proyecto: nuevo[0],convocatoria});
      //res.send("recibido");
 });





 router.post('/edit/:id_proyecto' ,esAdministrador,async (req,res)=>{
   const {id_proyecto}=req.params;
    estado=0;

    const {titulo,modalidad,fecha_sometido,hora_s,fecha_dictamen,hora_d,id_convocatoria,clave_financiamiento,cvu_tecnm}=req.body;

    const newProyecto={
      titulo,
      modalidad,
      fecha_sometido:fecha_sometido+' '+hora_s,
      fecha_dictamen:fecha_dictamen+' '+hora_d,
      clave_financiamiento,
      cvu_tecnm,
      id_convocatoria,
      estado
      
  };


  await  conexion.query(  'UPDATE   proyecto  set ? WHERE id_proyecto= ? ',[newProyecto,id_proyecto]);
  //console.log(newFinanciamiento);
req.flash('success','cambios guardados para '+ titulo);
   res.redirect ('/proyecto');

 });


/*

 router.get('/detalle/:id_proyecto',estaLogueado ,async (req,res)=>{
    
  const {id_proyecto}=req.params;
  
 const proyecto= await  conexion.query(  'SELECT * FROM  proyecto  WHERE id_proyecto=?',[id_proyecto]);
 

console.log(proyecto[0]);

  

    res.render('layouts/proyecto',{proyecto: proyecto[0]});
    //res.send("recibido");
});

*/


router.get('/detalle/:id_proyecto',estaLogueado ,async (req,res)=>{
  
  const {id_proyecto}=req.params;

  
 const proyecto= await  conexion.query(  'SELECT * FROM  proyecto  WHERE id_proyecto=?',[id_proyecto]);
 



const usuario=req.user.rol_sistema;
console.log(usuario);

if(usuario=='Administrador'){
  res.render('layouts/proyecto',{proyecto: proyecto[0]});
}else{
  
   res.render('layouts/proyecto_responsable',{proyecto: proyecto[0]});
}
    //res.send("recibido");
});




router.get('/p', function (req, res, next) {
  res.render('layouts/proyecto_responsable');
});







module.exports=router;
