const express = require("express");
const router = express.Router();
const conexion = require("../database");
const {
  estaLogueado,
  noEstaLogueado,
  esAdministrador,
} = require("../lib/auth");

router.get("/add/:id_proyecto", estaLogueado, async (req, res) => {
  const { id_proyecto } = req.params;
  const validaprotocolo = await conexion.query(
    "select * from protocolo where id_proyecto=?",
    [id_proyecto]
  );
  if (validaprotocolo.length > 0) {
    //obtiene clave de financiamiento
    const financia = await conexion.query(
      "select clave_financiamiento from proyecto natural join financiamiento where id_proyecto=?",
      [id_proyecto]
    );
    var clave_financiamiento = financia[0].clave_financiamiento;
    //

    //antes de enviar realiza calculo
    const solicitados = await conexion.query(
      "select b.clave_partida,a.clave_subpartida,a.monto_solicitado  from material_servicio as a natural join detalle_partida as b where a.id_proyecto=?",
      [id_proyecto]
    );
    //console.log(solicitados);
    const montos = await conexion.query(
      "select distinct(c.clave_partida),d.monto_aprobado from detalle_partida as c natural join financiamiento_partida as d where clave_financiamiento=?",
      [clave_financiamiento]
    );
    //console.log(montos, solicitados);
    var dinero_restate = [];
    for (var i = 0; i < montos.length; i++) {
      var restante = montos[i].monto_aprobado;
      for (var j = 0; j < solicitados.length; j++) {
        if (montos[i].clave_partida == solicitados[j].clave_partida) {
          restante = restante - solicitados[j].monto_solicitado;
        }
      }
      const aux = {
        clave_partida: montos[i].clave_partida,
        monto_restante: restante,
      };
      dinero_restate.push(aux);
    }

    // console.log(dinero_restate);

    //obtiene la lista seleccionable de la partida tal correspondiente a x proyecto
    const validacion = await conexion.query(
      "select b.clave_partida,b.clave_subpartida,b.descripcion from (select * from  financiamiento_partida natural join detalle_partida where clave_financiamiento=?)as b left join (select * from material_servicio where id_proyecto = ?)as a  on a.clave_subpartida = b.clave_subpartida where a.clave_subpartida is null",
      [clave_financiamiento, id_proyecto]
    );
    var subpartidas = [];
    for (var i = 0; i < dinero_restate.length; i++) {
      for (var j = 0; j < validacion.length; j++) {
        if (
          validacion[j].clave_partida == dinero_restate[i].clave_partida &&
          dinero_restate[i].monto_restante > 0
        ) {
          subpartidas.push(validacion[j]);
        }
      }

      // console.log(subpartidas);
    }

    res.render("proyecto/materialServicio/add", {
      subpartidas: subpartidas,
      id_proyecto,
      restante: dinero_restate,
    });
  } else {
    req.flash("message", "Primero debe subir su protocolo");
    res.redirect("/protocolo/add/" + id_proyecto);
  }
});

router.post("/add", estaLogueado, async (req, res) => {
  // console.log(req.body);

  const { descripcion, clave_subpartida, monto, id_proyecto } = req.body;
  const mysv = await conexion.query(
    "select * from material_servicio where id_proyecto=?",
    [id_proyecto]
  );
  if (Array.isArray(descripcion)) {
    for (const p in monto) {
      const newMyS = {
        descripcionms: descripcion[p],
        id_proyecto,
        clave_subpartida: clave_subpartida[p],
        monto_solicitado: monto[p],
      };
      //  console.log(newMyS);
      if (mysv.length == 0) {
        await conexion.query("UPDATE   proyecto  set ? WHERE id_proyecto= ? ", [
          { estado: 3 },
          id_proyecto,
        ]);
      }
      await conexion.query("INSERT INTO material_servicio set ?", [newMyS]);
    }
  } else {
    const newMySa = {
      descripcionms: descripcion,
      id_proyecto,
      clave_subpartida: clave_subpartida,
      monto_solicitado: monto,
    };
    // console.log(newMySa);
    if (mysv.length == 0) {
      await conexion.query("UPDATE   proyecto  set ? WHERE id_proyecto= ? ", [
        { estado: 3 },
        id_proyecto,
      ]);
    }
    await conexion.query("INSERT INTO material_servicio set ?", [newMySa]);
  }


  const admins= await conexion.query('select * from users where rol_sistema="Administrador"');
      for(z=0;z<admins.length;z++){
        let noti={
          destinatario:admins[z].cvu_tecnm,
          mensaje:"Se creo la lista de materiales y servicios del proyecto de "+req.user.cvu_tecnm,
          leido:0
        };
        await conexion.query("INSERT INTO notificaciones set ?", [noti]);
      }

  req.flash("success", "Materiales y servicios agregados correctamente");
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
router.get("/proyecto/:id_proyecto", estaLogueado, async (req, res) => {
  const { id_proyecto } = req.params;
  const proyecto = await conexion.query('select titulo from proyecto where id_proyecto=?',[id_proyecto]);
  const consulta = await conexion.query(
    "select * from material_servicio inner join detalle_partida on material_servicio.clave_subpartida=detalle_partida.clave_subpartida  where id_proyecto  =? ",
    [id_proyecto]
  );
  //console.log(consulta);
  let total = 0;
  for (const i in consulta) {
    total = total + consulta[i].monto_solicitado;
  }
  //console.log(consulta,total);
  //res.render("proyecto/materialServicio/listarporproyecto", {consulta, id_proyecto, total: total, });
  res.render("reportes/reporteMyS", { reporte:consulta ,titulo:proyecto[0],total:total});
});

router.post("/edit", async (req, res) => {
  //console.log(req.body);

  const {
    id_proyecto,
    monto_solicitado,
    id_material_servicio,
    descripcionms,
    clave_subpartida,
  } = req.body;
  const updateMyS = {
    id_material_servicio,
    descripcionms,
    id_proyecto,
    clave_subpartida,
    monto_solicitado,
  };
  // console.log(updateMyS);

  await conexion.query(
    "UPDATE   material_servicio  set ? WHERE id_proyecto= ? and id_material_servicio=? ",
    [updateMyS, id_proyecto, id_material_servicio]
  );

  req.flash("success", "Cambios guardados satisfactoriamente");
  res.redirect("/materialServicio/proyecto/" + id_proyecto);
});

//ELIMINAR
router.get("/delete/:id_material_servicio/:id_proyecto", async (req, res) => {
  const { id_material_servicio, id_proyecto } = req.params;
  await conexion.query(
    "DELETE FROM  material_servicio  WHERE id_proyecto= ? and id_material_servicio=? ",
    [id_proyecto, id_material_servicio]
  );
  req.flash("success", "Eliminado  correctamente");
  res.redirect("/materialServicio/proyecto/" + id_proyecto);
});



router.get("/reporte/:id_proyecto", estaLogueado, async (req, res) => {
const {id_proyecto}=req.params;
try {
  

const proyecto = await conexion.query('select titulo from proyecto where id_proyecto=?',[id_proyecto]);
  const gastos= await conexion.query('select * from material_servicio where id_proyecto=?',[id_proyecto]);
  res.render("reportes/reporteMyS", { reporte:gastos ,titulo:proyecto[0]});

  console.log(gastos);
} catch (error) {
  
  req.flash("message", "no tiene creado la informacion para el reporte");
  res.redirect("/proyecto/detalle/" + id_proyecto);
}
});

module.exports = router;
