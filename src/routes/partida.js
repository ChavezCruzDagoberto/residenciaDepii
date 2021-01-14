const express =require('express');
const router=express.Router();
const conexion=require('../database');
const { esAdministrador } = require('../lib/auth');


router.get('/add',esAdministrador, async(req,res)=>{

const financiamientos=await conexion.query('select * from financiamiento');

res.render('partida/add',{financiamientos})

});



router.post('/add',esAdministrador, async(req,res)=>{

   
    const {clave_financiamiento}=req.body;
    const {clave_partida}=req.body;
    const {monto_aprobado}=req.body;
    

   if(Array.isArray(clave_partida) && Array.isArray(monto_aprobado)){
    for ( const p in clave_partida) {  
      const newPartida={
        clave_partida:clave_partida[p],
        clave_financiamiento,
       monto_aprobado:  monto_aprobado[p],


      }
      //insertar
      await  conexion.query(  'INSERT INTO partida set ?',[newPartida]);
    

    }

   
    }else{

      const newPartida1={
        clave_partida,
        clave_financiamiento,
       monto_aprobado }
       await  conexion.query(  'INSERT INTO partida set ?',[newPartida1]);

    }


    req.flash('success','agreado correctamente');
      
      //res.render("integrante/add");
     res.redirect("/partida");
    
    });
    


//listar todas
    router.get('/',esAdministrador ,async (req,res)=>{
    
      const partidas= await  conexion.query(  'SELECT * FROM  partida ');
     
       res.render('partida/list',{partidas});
   });


//eliminar
   router.get('/delete/:clave_financiamiento/:clave_partida' ,esAdministrador,async (req,res)=>{
    
    const {clave_financiamiento}=req.params;
    const {clave_partida}=req.params;
    await  conexion.query(  'DELETE FROM  partida  WHERE CLAVE_FINANCIAMIENTO=? && CLAVE_PARTIDA=?',[clave_financiamiento,clave_partida]);
     //console.log(req.params.id_convocatoria);
     req.flash('success',' eliminado  correctamente');
     res.redirect("/partida");

 });





 //editar
 router.post('/edit/:clave_financiamiento/:clave_partida' ,esAdministrador,async (req,res)=>{
    
  const {clave_financiamiento}=req.params;
  const {clave_partida}=req.params;
  const {monto_aprobado}=req.body;
  
  //res.send('recibido');

  //const {vigencia_inicio,vigencia_fin}= req.body;
  const newPartida ={
     clave_financiamiento,
     clave_partida,
     monto_aprobado
      };

 await  conexion.query(  'UPDATE   partida  set ? WHERE CLAVE_FINANCIAMIENTO= ?  && CLAVE_PARTIDA=?',[newPartida,clave_financiamiento,clave_partida]);
  //console.log(newFinanciamiento);
req.flash('success','cambios guardados para ');
   res.redirect ('/partida');
});


module.exports=router;