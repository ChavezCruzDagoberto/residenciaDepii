const express = require('express');
const router = express.Router();
const conexion = require('../database');
const path = require('path');
//const { esAdministrador } = require('../lib/auth');
const fs = require("fs");

const multer = require('multer');
const { createSecretKey } = require('crypto');
const { body } = require('express-validator');
let nombre = '';




const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, './archivos')
    },
    filename: (req, file, cb) => {

        if (file.mimetype !== 'application/pdf') {
            // return cb(null,false );

            cb(new Error('solo pdfs son permitidos'))
            //return cb(null,)

        }
        else {
            cb(null, nombre + '_protocolo' + path.extname(file.originalname))
        }
    }
});




const upload = multer({ storage });




router.get('/add/:id_proyecto', async (req, res) => {
    const cvu_tecnm = req.user.cvu_tecnm;
    const { id_proyecto } = req.params;
    nombre = await conexion.query('select titulo from proyecto where id_proyecto=? and cvu_tecnm=?', [id_proyecto, cvu_tecnm]);


    if (nombre.length > 0) {

        nombre = nombre[0].titulo;

        console.log(nombre);
        res.render('proyecto/protocolo/subirprotocolo', { id_proyecto });
    }
    else {
        req.flash('message', "no hay");
        res.redirect('/');
    }
});


//insertar a la base un link
router.post('/add/:id_proyecto', upload.single('archivo'), async (req, res) => {

    const { id_proyecto } = req.params;

    console.log(req.file);
    const { filename, path, } = req.file;

    const newProtocolo = {
        nombre_archivo: filename,
        url_archivo: path,
        anotaciones: '',
        id_proyecto
    };

    await conexion.query('INSERT INTO protocolo set ?', [newProtocolo]);


    res.redirect('/proyecto/detalle/' + id_proyecto);

});



router.get('/:id_proyecto', async (req, res) => {
    const { id_proyecto } = req.params;


    const resultado = await conexion.query('select * from protocolo where id_proyecto= ?', [id_proyecto]);
    console.log(resultado[0]);
    res.render('proyecto/protocolo/verProtocolo', { protocolo: resultado[0] });
    //res.send('enviado')
});


router.get('/leer/:id_proyecto', async (req, res) => {
    const { id_proyecto } = req.params;
    console.log(id_proyecto);

    const resultado = await conexion.query('select url_archivo from protocolo where id_proyecto= ?', [id_proyecto]);
    console.log(resultado.length);
    if (resultado.length >= 1) {
        var url = urlCorrecto(resultado[0].url_archivo);
        url = './' + url;
        console.log(url);

        //var archivo=fs.readFileSync(url,'UTF-8');

        //console.log(archivo.length);

        var data = fs.readFileSync(url);
        res.contentType("application/pdf");
        res.send(data);


    } else { res.send('no hay'); }

    //res.render('proyecto/protocolo/lectura');

});



function urlCorrecto(ubicacion) {

    const c = 92;
    //console.log(ubicacion.replace(String.fromCharCode(c),"/"));
    return ubicacion.replace(String.fromCharCode(c), "/");
}

module.exports = router;