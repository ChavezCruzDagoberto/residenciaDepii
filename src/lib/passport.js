const passport = require('passport');
const pool = require('../database');
const LocalStrategy = require('passport-local').Strategy;
const conexion = require('../database');
const helpers = require('../lib/helpers');




const nodemailer = require('nodemailer');
const { google } = require('googleapis');
//980602366636-us5ua45c6tkc4g026tttqumvo0qd5pgp.apps.googleusercontent.com
//U9C9_JU1KK3JgXde-9DNtyAZ
//redirect uri igual
//1//04VMe3hye_DOBCgYIARAAGAQSNwF-L9Irvb39nTswbjW66P59MQdfVZ4S7p2t6Oye0jFgWPITXCXC2pGQ-JmjyEZfct5Act8TWXs
const CLIENT_ID = '135738644377-er9vtm9gt58qnro6cpf9gki6fd38cus6.apps.googleusercontent.com';
const CLIENT_SECRET = 'SlT6ErA9ohfMEe_rWAHRYVo8';

const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//047JOlUIQDoVcCgYIARAAGAQSNwF-L9Ir0OYWeqJ-3B8ruFzEMAsfJJ-8hE_ul8tnH_KVEjHcN4Y24KE8uFoqVPod3q4NoNNSKk0';
                       

const oauth2client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2client.setCredentials({ refresh_token: REFRESH_TOKEN });




passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true //para pásar otro dato extra



}, async (req, username, password, done) => {

    const rows = await conexion.query('select * from users where username =? and estado=1', [username]);

    if (rows.length > 0) {

        const user = rows[0];
        //console.log(password,user.password);
        const validPassword = await helpers.comparePaswsorwd(password, user.password);
        if (validPassword) {
            
            //console.log("usuario",user);
            if(user.rol_sistema=='Responsable'){ req.app.locals.lider=user.rol_sistema;}
            if(user.rol_sistema=='Administrador'){req.app.locals.admin=user.rol_sistema;}
            done(null, user, req.flash('success', 'Bienvenido  ' + user.username));

        } else {

            done(null, false, req.flash('message', 'Contraseña incorrecta'));

        }

    } else {

        return done(null, false, req.flash('message', 'Cuenta de usuario no existe o esta desactivado comuniquese con el Administrador'));
    }
}));





passport.use('local.signup', new LocalStrategy({
    //nombre // nomnre del campo de la vista donde recibo el dato
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true

}, async (req, username, password, done) => {

    const { cvu_tecnm } = req.body;
    const valida = await conexion.query('select * from users WHERE CVU_TECNM=?', [cvu_tecnm]);
    const validacion1 = await conexion.query('select * from users WHERE username=?', [username]);
    //const validacion2 = await conexion.query('select * from users WHERE password=?', [password]);
    //console.log(validacion1.length);
    if (valida.length > 0) {
        return done(null, false, req.flash('message', '  usuario ya tiene cuenta'));
    }

    else {
        if (validacion1.length > 0) {


            return done(null, false, req.flash('message', '  usuario ya existe intente con uno nuevo'));

        } else {



            const { rol_sistema } = req.body;
            //console.log(rol_sistema);
            var estado = 1;
            const newUser = {
                username,
                password,
                cvu_tecnm,
                rol_sistema,
                estado
            };
            newUser.password = await helpers.encriptarPassword(password);



            const result = await conexion.query('insert into users set?', [newUser]);
            newUser.id_usuario = (result.insertId);

            // if(rol_sistema=="Administrador"||rol_sistema=="Responsable"){}

            const correo = await conexion.query('select email from participante where CVU_TECNM=?', [cvu_tecnm]);
            const subject = 'Bienvendo a la plataforma de posgrado TecNM campus oaxaca';

            const mensaje = 'Acceso a la plataforma posgrado TecNM Oaxaca'
                ;
            contentHTML = `<h5> Control de acceso Depi</h5>
        <p>${mensaje}</p>
        <ul>
        <li>username: ${username}</li>
        <li>password: ${password}</li>
        
        </ul>    
       `;



            //const text='tu usuario es '+username +' tu contraseña es '+password;
            sendMail(correo[0].email, subject, contentHTML)
                .then((result) => console.log(result))
                .catch((error) => console.log(error.message));

            return done(null, req.user, req.flash('success', ' Agregado con exito'));// done(null, newUser);
        }
    }



}

));

passport.serializeUser((user, done) => {
    done(null, user.id_usuario);
});

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('select * from users where id_usuario=?', [id]);
    //req.sesion.reset();
    done(null, rows[0]);

});





//envio de correos

async function sendMail(destino, subject, contentHTML) {

    try {
        const accessToke = await oauth2client.getAccessToken();
        //console.log(accessToke);
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "gestion.proyectostecoaxaca@gmail.com",
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToke
            }
        });






        //console.log(transport);
        const mailOptions = {
            from: 'gestion.proyectostecoaxaca@gmail.com',
            to: destino,
            subject: subject,
            //text:text
            html: contentHTML

        };

        // console.log(destino,subject,text);
        const result = await transport.sendMail(mailOptions);
        return result;


        //return transport;


    } catch (e) { return e; }
}



