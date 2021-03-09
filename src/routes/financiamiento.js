const express = require('express');
const moment = require('moment');
const router = express.Router();
const conexion = require('../database');

//validacion con expressValidator
const { check, validationResult } = require('express-validator');


const { estaLogueado, noEstaLogueado, esAdministrador } = require('../lib/auth');

router.get('/add', esAdministrador,async (req, res) => {


    var consulta = await conexion.query('select distinct clave_partida from detalle_partida');
    console.log(consulta);
    res.render('financiamiento/add', {partidas:consulta});
});


//agrega el financiamiento junto con las partidas que le corresponen al financiamiento
//las partidas existentes son extraidos de detalle_partida
router.post('/add', esAdministrador,  [
    check('clave_financiamiento').notEmpty().isAlphanumeric().toUpperCase(),
    check('clave_partida').notEmpty().withMessage('no se acepta vacio'),
    check('monto_aprobado').notEmpty().withMessage('no se acepta vacio'),
    check('vigencia_fin').notEmpty().withMessage("formato de fecha"),
    check('vigencia_inicio').notEmpty().isDate().withMessage("formato de fecha"),
],async (req, res) => {
    const errores = validationResult(req);
        console.log(errores.array());
        if (errores.array().length > 0) {

            return res.status(400).json({ errores: errores.array() });

        } else {
    console.log(req.body);
    const { clave_financiamiento, vigencia_inicio, vigencia_fin ,clave_partida,monto_aprobado} = req.body;
    var final= vigencia_fin.substring(6,10)+"-"+vigencia_fin.substring(3,5)+"-"+vigencia_fin.substring(0,2);
    //console.log(final);
    const validacion=await conexion.query('select * from financiamiento where clave_financiamiento= ?',[clave_financiamiento]);
    if(validacion.length>0){
        req.flash('message','ya existe un financiamiento con esa clave intente con una nueva');
        res.redirect('/financiamiento/add');
    }else{
    
    const newFinanciamiento = {
        clave_financiamiento,
        vigencia_inicio,
        vigencia_fin:final
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
    }
        }
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
    try {

            
        
    
    await conexion.query('DELETE FROM  financiamiento  WHERE CLAVE_FINANCIAMIENTO=?', [clave_financiamiento]);
    //console.log(req.params.id_convocatoria);
    req.flash('success', clave_financiamiento + ' eliminado  correctamente');
    res.redirect("/financiamiento");
} catch (error) {
        
    req.flash('message', clave_financiamiento + ' esta asociado a un proyecto no se puede eliminar');
    res.redirect("/financiamiento");
}
});



router.get('/edit/:clave_financiamiento', esAdministrador, async (req, res) => {

    const { clave_financiamiento } = req.params;

    let validacion=await conexion.query('select * from proyecto where clave_financiamiento=?',[clave_financiamiento]);
    if(validacion.length<=0){
    const nuevo = await conexion.query('SELECT * FROM  financiamiento  WHERE CLAVE_FINANCIAMIENTO=?', [clave_financiamiento]);
    
    console.log(nuevo[0]);
    var f_i=moment(nuevo[0].vigencia_inicio).format('YYYY-MM-DD');
    var f_f=moment(nuevo[0].vigencia_fin).format('YYYY-MM-DD');

    console.log(f_i,f_f);
const aux={
    clave_financiamiento:nuevo[0].clave_financiamiento,
    vigencia_inicio:f_i,
    vigencia_fin:f_f
}



    res.render('financiamiento/edit', { financiamiento: aux });
    }else{
        req.flash('message', 'ya no se puede realizar modificaciones ya tiene asignado un proyecto' );
    res.redirect('/financiamiento');
        
    }
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