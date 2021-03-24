const express = require("express");
const router = express.Router();
const conexion = require("../database");
const {
  estaLogueado,
  noEstaLogueado,
  esAdministrador,
  esLider,
} = require("../lib/auth");

const moment = require("moment");

moment.locale("es");



const path = require("path");
const multer = require("multer");


const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./historico");
  },
  filename: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      //return cb(null,false );

      cb(new Error("solo pdfs son permitidos"));
      //return cb(null,)
    } else {
      // const valida=
        console.log(req.body);
        var nombre= req.body.titulo+req.body.anio;
      cb(null, nombre + path.extname(file.originalname));
    }
  },
});

const upload = multer({ storage });


/*

router.get('/add', esLider, async (req, res) => {
  const cvu_tecnm = req.user.cvu_tecnm;
  console.log(req.user);
  const valida = await conexion.query('select * from proyecto_participante where cvu_tecnm=?', [cvu_tecnm]);
  const convocatorias = await conexion.query(  'select a.id_convocatoria,a.nombre_convocatoria from convocatoria as a left join proyecto as b on a.id_convocatoria=b.id_convocatoria where b.id_convocatoria is null');
 
  res.render('proyecto/add', { convocatorias });
 
});*/
router.get("/add", esLider, async (req, res) => {
  const cvu_tecnm = req.user.cvu_tecnm;
  // console.log(req.user);
  const valida = await conexion.query(
    "select * from proyecto_participante where cvu_tecnm=?",
    [cvu_tecnm]
  );

  res.render("proyecto/add");
});

router.post("/add", esLider, async (req, res) => {
  //validar si ese usuario tiene un proyecto activo
  const activo = await conexion.query(
    'select * from proyecto natural join proyecto_participante natural join participante where rol_proyecto="Responsable" and cvu_tecnm= ? and estado!=0',
    [req.user.cvu_tecnm]
  );
  if (activo.length == 0) {
    const clave_financiamiento = req.body.clave_financiamiento;
    //estados del proyecto o=terminado, 1=creado,2=en tiempo,3=atrasado,4=cancelado
    let estado = 1;
    const validacion = await conexion.query(
      "select * from proyecto WHERE  CLAVE_FINANCIAMIENTO=?",
      [clave_financiamiento]
    );
    const validacion1 = await conexion.query(
      "select * from financiamiento WHERE  CLAVE_FINANCIAMIENTO=?",
      [clave_financiamiento]
    );
    //const validaconvocatoria = await conexion.query('select * from proyecto WHERE  id_convocatoria=?', [req.body.id_convocatoria]);
    //console.log(validacion.length, validacion1.length);
    //console.log(validaconvocatoria.length);
    if (validacion.length == 0 && validacion1.length > 0) {
      const cvu_tecnm = req.user.cvu_tecnm;
      const fecha_sometido = req.body.fecha_sometido;
      const fecha_dictamen = req.body.fecha_dictamen;

      const { titulo } = req.body;
      var creado = moment().format("YYYY-MM-DD");

      const newProyecto = {
        titulo,
        fecha_sometido,
        fecha_dictamen,
        clave_financiamiento,
        estado,
        creado,
      };

      await conexion.query("INSERT INTO proyecto set ?", [newProyecto]);

      const p = await conexion.query("select * from proyecto where titulo=?", [
        titulo,
      ]);

      const newProyecto_participante = {
        id_proyecto: p[0].id_proyecto,
        cvu_tecnm,
        rol_proyecto: "Responsable",
      };
      await conexion.query("INSERT INTO proyecto_participante set ?", [
        newProyecto_participante,
      ]);

      //agregar informes dinamicamente
      var fecha_inicio = moment(validacion1[0].vigencia_inicio);
      // console.log("inicio",fecha_inicio);
      var i = 0;
      var a = fecha_inicio;
      var informes = [];
      var sem_an = [];
      while (i < 4) {
        if (i < 3) {
          var c = a.add(3, "month").format("YYYY-MM-DD");
          informes.push(c);
          var x = moment(informes[i]);
          sem_an.push(x.subtract(1, "week").format("YYYY-MM-DD"));
        } else {
          var c = a.add(4, "month").format("YYYY-MM-DD");
          informes.push(c);
          var x = moment(informes[i]);
          sem_an.push(x.subtract(1, "month").format("YYYY-MM-DD"));
        }
        // console.log((i+1),sem_an[i],informes[i],p[0].id_proyecto);
        const newInforme = {
          no_informe: i + 1,
          fecha_inicio: sem_an[i],
          fecha_fin: informes[i],
          id_proyecto: p[0].id_proyecto,
        };
        await conexion.query("INSERT INTO informe set ?", [newInforme]);

        i++;
      }
      ///////////////////////////////////////
      req.flash("success", "Proyecto agreado correctamente");

      res.redirect("/proyecto");
    } else {
      req.flash(
        "message",
        "No pudo ser creado el proyecto verfique la clave  financiamiento"
      );
      //console.log('no existe registro');
      res.redirect("/proyecto/add");
    }
  } else {
    req.flash(
      "message",
      "Tiene un proyecto activo no puede tener control de 2 proyectos a la vez"
    );
    res.redirect("/proyecto/add");
  }
});



//listar de la base de datos
router.get("/", estaLogueado, async (req, res) => {
  req.app.locals.proyectodisponible = null;

  //console.log(req.user);
  if (req.user.rol_sistema == "Administrador") {
    res.redirect("proyecto/listartodo1");
  } else {
    const cvu_tecnm = req.user.cvu_tecnm;
    const proyectos = await conexion.query(
      'select * from  (select * from  proyecto natural join proyecto_participante natural join participante)as a  where cvu_tecnm=? and rol_proyecto="Responsable" and estado>=1 and estado<8 ',
      [cvu_tecnm]
    );

    //console.log('p', proyectos.length);
    if (proyectos.length > 0) {
      var fecha1 = moment();
      var fecha2 = moment(proyectos[0].creado);
      var temporal = fecha1.diff(fecha2, "days");
      if (temporal < 10) {
        req.flash(
          "message",
          "Tiene " + (10 - temporal) + " dias para editar su proyecto Actual"
        );
      } else {
        req.flash(
          "message",
          "Ya no puede realizar cambios en su proyecto agoto los dias dara modificar"
        );
      }

      const final = formatearFechas(proyectos);
      res.render("proyecto/list", {
        proyectos: final,
        message: req.flash("message"),
      });
    } else {
      res.render("proyecto/list");
    }
  }
});

//listar de la base de datos para modo Administrador
router.get("/listartodo", esAdministrador, estaLogueado, async (req, res) => {
  const cvu_tecnm = req.user.cvu_tecnm;
  const proyectos = await conexion.query(
    'select * from (select * from  proyecto natural join proyecto_participante natural join participante)as a  where rol_proyecto="Responsable"'
  );
  const final = formatearFechas(proyectos);
  //console.log(final);
  res.render("proyecto/list", { proyectos: final });
});

//ELIMINAR
router.get("/delete/:id_proyecto", esAdministrador, async (req, res) => {
  try {
    const { id_proyecto } = req.params;
    await conexion.query("DELETE FROM  proyecto  WHERE ID_PROYECTO=?", [
      id_proyecto,
    ]);
    req.flash("success", id_proyecto + " Eliminado  correctamente");
    res.redirect("/proyecto");
  } catch (error) {
    req.flash(
      "message",
      " El proyecto no puede ser eliminado ya que tiene datos asociados"
    );
    res.redirect("/proyecto");
  }
});

router.get("/edit/:id_proyecto", esLider, async (req, res) => {
  try {
    const { id_proyecto } = req.params;

    const nuevo = await conexion.query(
      "SELECT * FROM  proyecto  WHERE id_proyecto=?",
      [id_proyecto]
    );

    if (nuevo.length > 0) {
      //const convocatoria   = await conexion.query(  'select a.id_convocatoria,a.nombre_convocatoria from convocatoria as a left join proyecto as b on a.id_convocatoria=b.id_convocatoria where b.id_convocatoria is null');
      //const con_actual=await conexion.query('select * from convocatoria where id_convocatoria= ?',[nuevo[0].id_convocatoria]);

      //convocatoria.push(con_actual[0]);

      var fecha1 = moment();
      var fecha2 = moment(nuevo[0].creado);
      var temporal = fecha1.diff(fecha2, "days");
      if (temporal < 10) {
        req.flash(
          "message",
          "Recuerde que solo le quedan " +
            (10 - temporal) +
            " dias para editar "
        );

        res.render("proyecto/edit", {
          proyecto: nuevo[0],
          message: req.flash("message"),
        });
      } else {
        req.flash(
          "message",
          "Ya no puede realizar cambios en su proyecto agoto los dias dara modificar"
        );
        res.redirect("/proyecto");
      }
    }
  } catch (error) {
    req.flash("message", "Algo ha salido mal intente de nuevo");
    res.redirect("/proyecto");
  }
});

router.post("/edit/:id_proyecto", esLider, async (req, res) => {
  try {
    const { id_proyecto } = req.params;
    estado = 1;

    const {
      titulo,
      fecha_sometido,
      fecha_dictamen,
      clave_financiamiento,
    } = req.body;

    const newProyecto = {
      titulo,
      fecha_sometido,
      fecha_dictamen,
      clave_financiamiento,
      estado,
    };

    await conexion.query("UPDATE   proyecto  set ? WHERE id_proyecto= ? ", [
      newProyecto,
      id_proyecto,
    ]);

    req.flash("success", "Cambios guardados para " + titulo);
    res.redirect("/proyecto");
  } catch (error) {
    //console.log(req.user.rol_sistema);
    if (error) {
      req.flash("message", " Algo ha salido mal");
      res.redirect("/proyecto");
    }
  }
});

/*
  Avance
  1: proyecto creado
  2:se cargo protocolo 1 mes despues de crear financiamiento
  3:la lista de gastos posibles  2 meses despues
  4: se cargo primer informe
  5:se cargo 2 informe
  6:se cargo 3 informe
  7: se cargo informe final
  8: se autorizo final del proyecto a tiempo
  9: cancelacion del proyecto 
  */

/**
Estados
1:Todo en tiempo y activo
2: activo pero atrasado
3: terminado 

 */

router.get("/detalle/:id_proyecto", estaLogueado, async (req, res) => {
  const { id_proyecto } = req.params;

  const proyecto = await conexion.query(
    "SELECT * FROM  proyecto natural join financiamiento  WHERE id_proyecto=?",
    [id_proyecto]
  );
  req.app.locals.proyectodisponible = proyecto[0];

  const usuario = req.user.rol_sistema;

  const protocolo = await conexion.query(
    "SELECT * FROM  protocolo   WHERE id_proyecto=?",
    [id_proyecto]
  );
  const mys = await conexion.query(
    "SELECT * FROM  material_servicio   WHERE id_proyecto=?",
    [id_proyecto]
  );
  const inf = await conexion.query(
    "select id_proyecto,id_informe,id_proyecto,no_informe,fecha_fin,fecha_fin from informe natural join archivo_informes where id_proyecto=? order by no_informe asc",
    [id_proyecto]
  );
  const fechas_inf = await conexion.query(
    "select * from informe where id_proyecto=? order by no_informe asc",
    [id_proyecto]
  );

  var avance = proyecto[0].estado;
  var estado = 1;

  let fechaActual = moment();
  let fechaInicio = moment(proyecto[0].vigencia_inicio);

  switch (avance) {
    case 1:
      if (fechaActual.diff(fechaInicio, "month") > 0) estado = 2;

      break;

    case 2: //protocolo
      if (fechaActual.diff(fechaInicio, "month") > 1) estado = 2;

      break;
    case 3: //material y servicio
      let inf1_f = moment(fechas_inf[0].fecha_fin);
      if (fechaActual.isAfter(inf1_f)) estado = 2;

      break;
    case 4:
      let inf2_f = moment(fechas_inf[1].fecha_fin);
      if (fechaActual.isAfter(inf2_f)) estado = 2;
      break;
    case 5:
      let inf3_f = moment(fechas_inf[2].fecha_fin);
      if (fechaActual.isAfter(inf3_f)) estado = 2;

      break;
    case 6:
      let inff_f = moment(fechas_inf[3].fecha_fin);
      if (fechaActual.isAfter(inff_f)) estado = 2;

      break;
    case 7:
      estado = 1;

      break;
    case 8:
      estado = 3;
      break;
    case 9:
      estado = 2;
      break;
    default:
      break;
  }

  //console.log(proyecto, protocolo, mys, inf, fechaActual, fechaInicio);

  res.render("layouts/proyecto_responsable", {
    proyecto: proyecto[0],
    avance: avance,
    estado: estado,
  });
  //res.render('proyecto/seguimiento');

  //res.send("recibido");
});

router.get("/listartodo1", esAdministrador, estaLogueado, async (req, res) => {
  const cvu_tecnm = req.user.cvu_tecnm;
  const proyectos = await conexion.query(
    'select * from (select * from  proyecto natural join proyecto_participante natural join participante)as a  where rol_proyecto="Responsable"'
  );

  for (i = 0; i < proyectos.length; i++) {
    let avanceActual = proyectos[i].estado;
    let estadoActual = 1;
    let fechaActual = moment();
    let fechaInicio = moment(proyectos[i].vigencia_inicio);

    let id_proyecto = proyectos[i].id_proyecto;
    let fechas_inf = await conexion.query(
      "select * from informe where id_proyecto=? order by no_informe asc",
      [id_proyecto]
    );

    switch (avanceActual) {
      case 1:
        if (fechaActual.diff(fechaInicio, "month") > 0) estadoActual = 2;

        break;

      case 2: //protocolo
        if (fechaActual.diff(fechaInicio, "month") > 1) estadoActual = 2;

        break;
      case 3: //material y servicio
        let inf1_f = moment(fechas_inf[0].fecha_fin);
        if (fechaActual.isAfter(inf1_f)) estadoActual = 2;

        break;
      case 4:
        let inf2_f = moment(fechas_inf[1].fecha_fin);
        if (fechaActual.isAfter(inf2_f)) estadoActual = 2;
        break;
      case 5:
        let inf3_f = moment(fechas_inf[2].fecha_fin);
        if (fechaActual.isAfter(inf3_f)) estadoActual = 2;

        break;
      case 6:
        let inff_f = moment(fechas_inf[3].fecha_fin);
        if (fechaActual.isAfter(inff_f)) estadoActual = 2;

        break;
      case 7:
        estadoActual = 1;

        break;
      case 8:
        estadoActual = 3;
        break;
      case 9:
        estadoActual = 4;
        break;
      default:
        break;
    }

    proyectos[i].tiempo = estadoActual;
  }
  var final = formatearFechas1(proyectos);
  res.render("proyecto/listStatus", { proyectos: final });
});

function formatearFechas1(proyecto) {
  const formato = "YYYY-MM-DD ";
  const formato1 = "dddd DD [de] MMMM YYYY";
  let editado = [];
  for (const p in proyecto) {
    let f = moment(proyecto[p].fecha_sometido);
    let g = moment(proyecto[p].fecha_dictamen);

    //let fecha_inicio=f.format('LLL');
    //let fecha_fin=g.format('LLL');
    let fecha_sometido = f.format(formato1);
    let fecha_dictamen = g.format(formato1);
    const a = {
      id_proyecto: proyecto[p].id_proyecto,
      titulo: proyecto[p].titulo,
      modalidad: proyecto[p].modalidad,
      fecha_sometido,
      fecha_dictamen,
      clave_financiamiento: proyecto[p].clave_financiamiento,
      nombre: proyecto[p].nombre,
      avance: proyecto[p].estado,
      estado: proyecto[p].tiempo,
    };
    editado.push(a);
  }
  return editado;
}

router.get("/regresar", esLider, async (req, res) => {
  req.app.locals.proyectodisponible = null;

  res.redirect("/");
});

function formatearFechas(proyecto) {
  const formato = "YYYY-MM-DD ";
  const formato1 = "dddd DD [de] MMMM YYYY";
  let editado = [];
  for (const p in proyecto) {
    let f = moment(proyecto[p].fecha_sometido);
    let g = moment(proyecto[p].fecha_dictamen);

    //let fecha_inicio=f.format('LLL');
    //let fecha_fin=g.format('LLL');
    let fecha_sometido = f.format(formato1);
    let fecha_dictamen = g.format(formato1);
    const a = {
      id_proyecto: proyecto[p].id_proyecto,
      titulo: proyecto[p].titulo,
      modalidad: proyecto[p].modalidad,
      fecha_sometido,
      fecha_dictamen,
      clave_financiamiento: proyecto[p].clave_financiamiento,
      nombre: proyecto[p].nombre,
      estado: proyecto[p].estado,
    };
    editado.push(a);
  }
  return editado;
}

router.get("/terminar/:id_proyecto", async (req, res) => {
  const { id_proyecto } = req.params;
  const buscar = await conexion.query(
    "select * from proyecto where id_proyecto=?",
    [id_proyecto]
  );
  let estado = buscar[0].estado;
  if (estado == 7 || estado == 8) {
    await conexion.query("UPDATE   proyecto  set ? WHERE id_proyecto= ? ", [
      { estado: 8 },
      id_proyecto,
    ]);
  } else {
    await conexion.query("UPDATE   proyecto  set ? WHERE id_proyecto= ? ", [
      { estado: 9 },
      id_proyecto,
    ]);
  }
  res.redirect("/proyecto/detalle/" + id_proyecto);
});

router.get("/x", async (req, res) => {
  res.render("proyecto/seguimiento");
});

//datos historicos para el sistema
router.get("/historico/add", async (req, res) => {
  res.render("proyecto/historicoadd");
});


router.post("/historico/add",upload.single("archivo"), async (req, res) => {
console.log(req.body,req.file);
const {clave_financiamiento,titulo,responsable,anio}=req.body;
try {
  

const valida= await conexion.query('select * from historico where clave_financiamiento=?',[clave_financiamiento]);
if(valida.length>0){
  req.flash("message","Ya existe un proyecto con la misma clave de financiamiento");
  res.redirect('/proyecto/historico/add');
}else{
const {path}= req.file;


const newhistorico={
  clave_financiamiento,
  titulo,
  responsable,
  anio,
  url_archivo:path
};
await conexion.query("INSERT INTO historico set ?", [newhistorico]);
   res.redirect("/proyecto/listarHistorico");
}
} catch (error) {
  req.flash("message","Lo sentimos algo ha salido mal intente de nuevo");
 res.redirect('/proyecto/historico/add'); 
}
}
      
);
router.get("/listarHistorico", async (req, res) => {
  const proyectos=await conexion.query('select * from historico');
  res.render("proyecto/historico",{proyectos});
});



router.get("/historico/:clave_financiamiento", async (req, res) => {
  const { clave_financiamiento } = req.params;
  console.log(clave_financiamiento);

  const resultado = await conexion.query(
    "select url_archivo from historico where clave_financiamiento= ?",
    [clave_financiamiento]
  );
  //console.log(resultado.length);
  if (resultado.length >= 1) {
    var url = urlCorrecto(resultado[0].url_archivo);
    url = "./" + url;
    // console.log(url);

    //var archivo=fs.readFileSync(url,'UTF-8');

    //console.log(archivo.length);

    var data = fs.readFileSync(url);
    res.contentType("application/pdf");
    res.send(data);
  } else {
    res.send("no hay");
  }

  //res.render('proyecto/protocolo/lectura');
});

function urlCorrecto(ubicacion) {
  const c = 92;
  //console.log(ubicacion.replace(String.fromCharCode(c),"/"));
  return ubicacion.replace(String.fromCharCode(c), "/");
}
module.exports = router;
