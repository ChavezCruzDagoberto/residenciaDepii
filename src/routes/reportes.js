const express = require("express");
const router = express.Router();
const conexion = require("../database");
const {
  estaLogueado,
  noEstaLogueado,
  esAdministrador,
} = require("../lib/auth");
const helpers = require("../lib/helpers");

const moment = require("moment");

moment.locale("es");

router.get("/integrantes", async (req, res) => {
  const integrantes = await conexion.query("select * from participante");
  res.render("reportes/integrantes", { integrantes: integrantes });
});
router.get("/proyectos", async (req, res) => {
  const proyectos = await conexion.query(
    "select id_proyecto, cvu_tecnm,nombre,plantel_adscripcion,titulo,fecha_dictamen,clave_financiamiento,rol_proyecto from proyecto natural join proyecto_participante natural join participante"
  );

  //console.log(proyectos);
  const final = formatearFechas(proyectos);
  //console.log(final);
  res.render("reportes/proyectos", { proyectos: final });
});

function formatearFechas(proyecto) {
  const formato = "YYYY-MM-DD ";
  const formato1 = "LLL";
  let editado = [];
  for (const p in proyecto) {
    // let f = moment(proyecto[p].fecha_sometido);
    let g = moment(proyecto[p].fecha_dictamen);

    let fecha_dictamen = g.format("YYYY");
    const a = {
      id_proyecto: proyecto[p].id_proyecto,
      cvu_tecnm: proyecto[p].cvu_tecnm,
      nombre: proyecto[p].nombre,
      plantel_adscripcion: proyecto[p].plantel_adscripcion,
      rol_proyecto: proyecto[p].rol_proyecto,
      titulo: proyecto[p].titulo,
      año: fecha_dictamen,
      clave_financiamiento: proyecto[p].clave_financiamiento,
    };
    editado.push(a);
  }
  return editado;
}

module.exports = router;
