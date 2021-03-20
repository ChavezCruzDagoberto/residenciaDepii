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
             //return cb(null,false );

            cb(new Error('solo pdfs son permitidos'))
            //return cb(null,)

        }
        else {

           // const valida=
           

            cb(null, nombre + '_protocolo' + path.extname(file.originalname))
        }
    }
});




const upload = multer({ storage });




router.get('/add/:id_proyecto', async (req, res) => {
    
    
    const { id_proyecto } = req.params;
    const resultado = await conexion.query('select * from protocolo where id_proyecto= ?', [id_proyecto])
    nombre = await conexion.query('select titulo from proyecto where id_proyecto=? ', [id_proyecto]);

    if (nombre.length > 0) {

        nombre = nombre[0].titulo;

        //console.log(resultado);
        res.render('proyecto/protocolo/subirprotocolo', { id_proyecto:id_proyecto ,resultado:resultado[0]});
    }
    else {
        req.flash('message', "no hay");
        res.redirect('/');
    }
});


//insertar a la base un link
router.post('/add/:id_proyecto',upload.single('archivo'),async (req, res) => {

   // console.log( "hola",upload);


    const { id_proyecto } = req.params;
    const { filename, path, } = req.file;

            const verifica= await conexion.query('select * from protocolo where id_proyecto=?',[id_proyecto]);
            
            if(verifica.length>0){
                if(verifica[0].intentos<2){

                    var int=(verifica[0].intentos)+1;
                    const newProtocolo1 = {
                        nombre_archivo: filename,
                        url_archivo: path,
                        anotaciones: '',
                        id_proyecto,
                        intentos:int

                    };

                    await conexion.query('UPDATE   protocolo  set ? WHERE id_proyecto= ? ', [newProtocolo1,id_proyecto]);
                    //await conexion.query('UPDATE   proyecto  set ? WHERE id_proyecto= ? ', [{estado:2},id_proyecto]);
                    req.flash("success","correcto");
                    res.redirect('/protocolo/' + id_proyecto);

                }else{
                    req.flash('message',"ya no es permitido");
                    res.redirect('/protocolo/add/' + id_proyecto);
                }

            }else{
    //console.log(req.file,req.params,req.body);

    
    

    const newProtocolo = {
        nombre_archivo: filename,
        url_archivo: path,
        anotaciones: '',
        id_proyecto,
        revisiones: 0,
        intentos: 1
    };
    
    await conexion.query('INSERT INTO protocolo set ?', [newProtocolo]);
    await conexion.query('UPDATE   proyecto  set ? WHERE id_proyecto= ? ', [{estado:2},id_proyecto]);
    res.redirect('/protocolo/' + id_proyecto);
    }

    
    
});



router.get('/:id_proyecto', async (req, res) => {
    const { id_proyecto } = req.params;


    const resultado = await conexion.query('select * from protocolo where id_proyecto= ?', [id_proyecto]);
   // console.log(resultado[0]);
    res.render('proyecto/protocolo/verProtocolo', { protocolo: resultado[0] ,id_proyecto});
    //res.send('enviado')
});


router.get('/leer/:id_proyecto', async (req, res) => {
    const { id_proyecto } = req.params;
    //console.log(id_proyecto);

    const resultado = await conexion.query('select url_archivo from protocolo where id_proyecto= ?', [id_proyecto]);
    //console.log(resultado.length);
    if (resultado.length >= 1) {
        var url = urlCorrecto(resultado[0].url_archivo);
        url = './' + url;
       // console.log(url);

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


router.get('/observaciones/:id_proyecto',async(req,res)=>{
    var {id_proyecto}=req.params;
    var validacion=await conexion.query('select * from protocolo where id_proyecto=?',[id_proyecto]);
    
    res.render('proyecto/protocolo/observaciones',{id_proyecto,validacion:validacion[0]});
//console.log(validacion);

});


router.post('/observaciones/:id_proyecto',async(req,res)=>{

//console.log("post",req.body,req.params);


const {anotaciones}=req.body;
const {id_proyecto}=req.params;
var consulta= await conexion.query('select * from protocolo where id_proyecto=? ',[id_proyecto]);
if(consulta.length>0){
var int=(consulta[0].revisiones)+1;
const aux={
    anotaciones:anotaciones,
    revisiones:int

}

    await conexion.query('UPDATE   protocolo  set ? WHERE id_proyecto=?', [aux, id_proyecto]);

    res.redirect('/protocolo/'+id_proyecto);
}

})

module.exports = router;