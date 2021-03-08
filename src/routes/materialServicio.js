const express = require('express');
const router = express.Router();
const conexion = require('../database');
const { estaLogueado, noEstaLogueado, esAdministrador } = require('../lib/auth');


router.get('/add/:id_proyecto', estaLogueado, async (req, res) => {

  const { id_proyecto } = req.params;
//obtiene clave de financiamiento
  const financia= await conexion.query('select clave_financiamiento from proyecto natural join financiamiento where id_proyecto=?',[id_proyecto]);
  var clave_financiamiento=financia[0].clave_financiamiento;
//


//antes de enviar realiza calculo
const solicitados= await conexion.query('select b.clave_partida,a.clave_subpartida,a.monto_solicitado  from material_servicio as a natural join detalle_partida as b where a.id_proyecto=?',[id_proyecto]);
//console.log(solicitados);
const montos=await conexion.query('select distinct(c.clave_partida),d.monto_aprobado from detalle_partida as c natural join financiamiento_partida as d where clave_financiamiento=?',[clave_financiamiento]);
console.log(montos,solicitados);
var dinero_restate=[];
for(var i=0;i<montos.length;i++){
  var restante=montos[i].monto_aprobado;
for(var j =0;j<solicitados.length;j++){
  if(montos[i].clave_partida==solicitados[j].clave_partida){
    restante=restante-solicitados[j].monto_solicitado;
  }
}
const aux={
  clave_partida:montos[i].clave_partida,
  monto_restante:restante
}
dinero_restate.push(aux);

}


console.log(dinero_restate);




  //obtiene la lista seleccionable de la partida tal correspondiente a x proyecto
  const validacion = await conexion.query('select b.clave_partida,b.clave_subpartida,b.descripcion from (select * from  financiamiento_partida natural join detalle_partida where clave_financiamiento=?)as b left join (select * from material_servicio where id_proyecto = ?)as a  on a.clave_subpartida = b.clave_subpartida where a.clave_subpartida is null', [clave_financiamiento,id_proyecto]);
 var subpartidas=[];
  for(var i=0;i<dinero_restate.length;i++){
for(var j =0;j<validacion.length;j++){
  if(validacion[j].clave_partida==dinero_restate[i].clave_partida && dinero_restate[i].monto_restante>0){
subpartidas.push(validacion[j]);
  }
}

console.log(subpartidas);
 }


  res.render('proyecto/materialServicio/add',{subpartidas:subpartidas,id_proyecto,restante:dinero_restate});
});



router.post('/add', estaLogueado, async (req, res) => {
  console.log(req.body);
  
  const { descripcion, clave_subpartida, monto,id_proyecto } = req.body;
  if(Array.isArray(descripcion)){
    for (const p in monto) {
      const newMyS = {
        descripcionms:descripcion[p],
        id_proyecto,
        clave_subpartida:clave_subpartida[p],
        monto_solicitado:monto[p]
      
      }
      console.log(newMyS);
      await conexion.query('INSERT INTO material_servicio set ?', [newMyS]);
    }

  }else{

    const newMySa = {
      descripcionms:descripcion,
      id_proyecto,
      clave_subpartida:clave_subpartida,
      monto_solicitado:monto
    
    }
    console.log(newMySa);
    await conexion.query('INSERT INTO material_servicio set ?', [newMySa]);

  }
  
  
  req.flash('success', 'Materiales y Servicios  agregados correctamente');
  res.redirect("/materialServicio/proyecto/" + id_proyecto);
  
});






/*

  const financia=await conexion.query('select id_proyecto,clave_financiamiento,clave_partida,monto_aprobado from proyecto natural join financiamiento natural join financiamiento_partida where id_proyecto=?',[id_proyecto]);
 
  const agregados=await conexion.query('select id_proyecto,a.clave_subpartida,monto_solicitado,b.clave_partida  from material_servicio as a inner join detalle_partida as b  on a.clave_subpartida=b.clave_subpartida where id_proyecto=?',[id_proyecto]);

  //const envia=await conexion.query('select * from (select clave_partida from proyecto natural join financiamiento_partida where id_proyecto=?)as a natural join detalle_partida',[id_proyecto]);
  var claves = new Map();
  
  var contador=financia.length-1;
  console.log(financia[0],agregados[0])
  
  while(contador>=0){
var resultado=financia[contador].monto_aprobado;
for(i=0;i<agregados.length;i++){
  if(financia[contador].clave_partida==agregados[i].clave_partida){
//console.log(financia[contador].clave_partida,agregados[i].clave_partida);
resultado=resultado-agregados[i].monto_solicitado;
}

  }
  claves.set(financia[contador].clave_partida,resultado);
  //console.log(financia[contador].clave_partida, ":", resultado);  


contador--;
  }
  console.log("claves",claves);
  
  */

//listar de la base de datos
router.get('/proyecto/:id_proyecto', estaLogueado, async (req, res) => {
  const { id_proyecto } = req.params;
  const consulta = await conexion.query('select * from material_servicio inner join detalle_partida on material_servicio.clave_subpartida=detalle_partida.clave_subpartida  where id_proyecto  =? ', [id_proyecto]);
console.log(consulta);
  res.render('proyecto/materialServicio/listarporproyecto', { consulta, id_proyecto });
});



router.post('/edit', async (req, res) => {
  //console.log(req.body);

  const { id_proyecto, monto_solicitado, id_material_servicio ,descripcionms,clave_subpartida} = req.body;
  const updateMyS = {
    id_material_servicio,
    descripcionms,
    id_proyecto,
    clave_subpartida,
    monto_solicitado
  };
  console.log(updateMyS);
  
  await conexion.query('UPDATE   material_servicio  set ? WHERE id_proyecto= ? and id_material_servicio=? ', [updateMyS, id_proyecto, id_material_servicio]);


  req.flash('success', 'cambios guardados satisfactoriamente');
  res.redirect('/materialServicio/proyecto/' + id_proyecto);

});



//ELIMINAR
router.get('/delete/:id_material_servicio/:id_proyecto', async (req, res) => {
  const { id_material_servicio, id_proyecto } = req.params;
  await conexion.query('DELETE FROM  material_servicio  WHERE id_proyecto= ? and id_material_servicio=? ', [id_proyecto, id_material_servicio]);
  req.flash('success', ' eliminado  correctamente');
  res.redirect('/materialServicio/proyecto/' + id_proyecto);

});





module.exports = router;
