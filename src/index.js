const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
//middleware para mensajes
const flash = require('connect-flash');
//nesetita una sesion

const session = require("express-session");
const mysqlstore = require('express-mysql-session');

const { database } = require('./keys')
const passport = require('passport');
//inicializando 
const app = express();
require('./lib/passport');

//settings configuraciones
app.set('port', process.env.PORT || 4000);
//decirle anode donde esta views
app.set('views', path.join(__dirname, 'views'))
//config hbs

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: 'hbs',
  helpers: require('./lib/handelbars')
}));
//

app.set('view engine', '.hbs');


//middelwares

app.use(session({
  secret: 'proyectoresinodesql',
  resave: false,
  saveUninitialized: false,
  store: new mysqlstore(database)

}));

app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use(passport.initialize());
app.use(passport.session());


//variables globales

app.use((req, res, next) => {
  app.locals.success = req.flash('success');
  app.locals.message = req.flash('message');
  app.locals.user = req.user;
  app.locals.menu = req.flash('menu');
  app.locals.proyectodisponible ;
  app.locals.lider;
  app.locals.admin;
  app.locals.notificaciones;

  next()
});


//rutas URL

app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/integrantes', require('./routes/integrantes'));
app.use('/convocatoria', require('./routes/convocatoria'));
app.use('/financiamiento', require('./routes/financiamiento'));
app.use('/partida', require('./routes/partida'));
app.use('/subpartida', require('./routes/subpartida'));
app.use('/proyecto', require('./routes/proyecto'));
app.use('/informe', require('./routes/informe'));
app.use('/entregable', require('./routes/entregable'));
app.use('/materialServicio', require('./routes/materialServicio'));
app.use('/protocolo', require('./routes/protocolo'));
app.use('/reporte', require('./routes/reportes'));
//app.use('/login',require('./routes/'));
//app.use('/ajax',require('./routes/ajax'));



//archivos publicos
//lo que se envia al navegador
app.use(express.static(path.join(__dirname, 'public')));


//iniciar el servidor
app.listen(app.get('port'), () => {
  console.log('servidor en el puerto ', app.get('port'));
});