const express = require('express');
const moment = require('moment');
const router = express.Router();
const conexion = require('../database');

const { estaLogueado, noEstaLogueado, esAdministrador } = require('../lib/auth');

router.get('/add', esAdministrador,async (req, res) => {


    var consulta = await conexion.query('select distinct clave_partida from detalle_partida');
    console.log(consulta);
    res.render('financiamiento/add', {partidas:consulta});
});


//agrega el financiamiento junto con las partidas que le corresponen al financiamiento
//las partidas existentes son extraidos de detalle_partida
router.post('/add', esAdministrador, async (req, res) => {

    console.log(req.body);
    
    const { clave_financiamiento, vigencia_inicio, vigencia_fin ,clave_partida,monto_aprobado} = req.body;
    const newFinanciamiento = {
        clave_financiamiento,
        vigencia_inicio,
        vigencia_fin
    };
   
    
    await conexion.query('INSERT INTO financiamiento set ?', [newFinanciamiento]);

    if(clave_partida!=null && monto_aprobado!=null)
    {
        if (Array.isArray(clave_partida) && Array.isArray(monto_aprobado)) {
       

            for (const p in clave_partida) {
                const newPartida = {
                  clave_financiamiento,
                  clave_partida: clave_partida[p],
          
                  monto_aprobado: monto_aprobado[p],
          
          
                }   
                //insertar
                await conexion.query('INSERT INTO financiamiento_partida set ?', [newPartida]);
          
          
              }
    
        }else{
    
            const newPartida1 = {
                clave_financiamiento,
                clave_partida,
                monto_aprobado
              }
              await conexion.query('INSERT INTO financiamiento_partida set ?', [newPartida1]);
          
        }



    }


    req.flash('success', 'agreado correctamente');

    res.redirect("/financiamiento");


});


//listar un financiamiento especifico con sus partidas correspondientes

router.get('/partidas/:clave_financiamiento', esAdministrador, async (req, res) => {
const {clave_financiamiento}=req.params;
    const fin_partidas = await conexion.query('select * from financiamiento natural join  financiamiento_partida where clave_financiamiento=?',[clave_financiamiento]);
res.render('partida/list',{partidas:fin_partidas,financiamiento:clave_financiamiento});
console.log(fin_partidas);
});



//listar de la base de datos
router.get('/', esAdministrador, async (req, res) => {

    const financiamiento = await conexion.query('SELECT * FROM  financiamiento ');


    let financiamiento_editado = [];
    let actual = moment();
    for (const p in financiamiento) {
        let i = moment(financiamiento[p].vigencia_inicio);
        let f = moment(financiamiento[p].vigencia_fin);
        let vigencia_inicio = i.format('dddd DD-MM-YYYY');
        let vigencia_fin = f.format(' dddd  DD-MM-YYYY');

        const a = {
            clave_financiamiento: financiamiento[p].clave_financiamiento,
            vigencia_inicio,
            vigencia_fin

        };
        financiamiento_editado.push(a);

    }
    res.render('financiamiento/list', { financiamiento: financiamiento_editado });
});



//ELIMINAR
router.get('/delete/:clave_financiamiento', esAdministrador, async (req, res) => {

    const { clave_financiamiento } = req.params;
    await conexion.query('DELETE FROM  financiamiento  WHERE CLAVE_FINANCIAMIENTO=?', [clave_financiamiento]);
    //console.log(req.params.id_convocatoria);
    req.flash('success', clave_financiamiento + ' eliminado  correctamente');
    res.redirect("/financiamiento");

});



router.get('/edit/:clave_financiamiento', esAdministrador, async (req, res) => {

    const { clave_financiamiento } = req.params;

    const nuevo = await conexion.query('SELECT * FROM  financiamiento  WHERE CLAVE_FINANCIAMIENTO=?', [clave_financiamiento]);
    console.log(nuevo[0]);



    res.render('financiamiento/edit', { financiamiento: nuevo[0] });
    //res.send("recibido");
});


router.post('/edit/:clave_financiamiento', esAdministrador, async (req, res) => {

    const { clave_financiamiento } = req.params;

    const { vigencia_inicio, vigencia_fin } = req.body;
    const newFinanciamiento = {
        vigencia_inicio,
        vigencia_fin
    };

    await conexion.query('UPDATE   financiamiento  set ? WHERE CLAVE_FINANCIAMIENTO= ? ', [newFinanciamiento, clave_financiamiento]);
    //console.log(newFinanciamiento);
    req.flash('success', 'cambios guardados para ' + clave_financiamiento);
    res.redirect('/financiamiento');
});




function findsubstr(str) {

    var substring = str.substr(0, 6); s

    console.log(substring);
}

module.exports = router;