
CREATE DATABASE residenciap_depi;
USE residenciap_depi;

create table convocatoria(
id_convocatoria int(5) auto_increment primary key,
nombre_convocatoria varchar(200) not null,
anio int(4) not null,
fecha_cierre timestamp
);

create table financiamiento(
clave_financiamiento varchar(10)  primary key,
vigencia_inicio date not null,
vigencia_fin date not null
);
create table detalle_partida(
clave_partida int(5) not null,
clave_subpartida int(5) not null ,
descripcion text not null,
primary key(clave_partida, clave_subpartida)
);

describe detalle_partida;




create table financiamiento_partida(
clave_financiamiento varchar(10) not null,
clave_partida int(5) not null,
monto_aprobado int(8) not null,
FOREIGN KEY (clave_financiamiento) REFERENCES financiamiento(clave_financiamiento),
FOREIGN KEY (clave_partida) REFERENCES detalle_partida(clave_partida),
primary key(clave_financiamiento,clave_partida)
);




CREATE TABLE participante(
cvu_tecnm varchar(10) not null primary key,
nombre varchar(50) not null,
apellido1 varchar(50) not null,
apellido2 varchar(50) not null,
plantel_adscripcion varchar(100) not null,
email varchar(100) not null
);



create table users(
id_usuario int(5)  auto_increment primary key,
username varchar(20) not null,
  password  varchar(200) not null,
  cvu_tecnm varchar(10) unique,
  rol_sistema varchar(15) ,
 foreign key (cvu_tecnm) references participante(cvu_tecnm)
);

describe users;

-- para eliminacion de un participante con su usuario si ya existe--
ALTER TABLE users 
ADD  CONSTRAINT FK_cvu_tecnm_cvu_tecnm FOREIGN KEY(cvu_tecnm)
REFERENCES participante (cvu_tecnm) 
ON DELETE CASCADE;




create table proyecto(
id_proyecto int(10) not null primary key auto_increment,
titulo varchar(500) not null,
modalidad varchar(200) not null,
fecha_sometido timestamp not null,
fecha_dictamen timestamp not null,
clave_financiamiento varchar(10) unique, 
FOREIGN KEY (clave_financiamiento) REFERENCES financiamiento(clave_financiamiento),
id_convocatoria int(5) unique, 
FOREIGN KEY (id_convocatoria) REFERENCES convocatoria(id_convocatoria),
estado int(1) not null
);

describe proyecto;


create table proyecto_participante (
id_proyecto int(10) not null,
cvu_tecnm varchar(10) not null,
FOREIGN KEY (cvu_tecnm) REFERENCES participante(cvu_tecnm),
FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto),
rol_proyecto varchar(30) not null,
primary key(id_proyecto,cvu_tecnm)
);

create table informe(
id_informe int(5) auto_increment primary key,
no_informe int(1)  not null,
fecha_inicio date not null	 	,
fecha_fin date not null,
id_proyecto int(10) not null,
foreign key (id_proyecto) references proyecto(id_proyecto)

);
describe informe;



create table entregable (
id_entregable int not null auto_increment primary key,
nombre varchar(500) not null,
contribucion varchar(100) not null
);
insert into entregable (nombre,contribucion) values 
('tesis concluidas de licenciatura','formacion de recursos humanos'),
('tesis concluidas de doctorado','formacion de recursos humanos'),
('tesis en desarrollo de doctorado','formacion de recursos humanos'),
('incorporacion de alumnos de licenciatura','formacion de recursos humanos'),
('alumnos residentes participantes en el proyecto','formacion de recursos humanos'),
('articulos cientificos enviados en revistas arbitrarias','productividad academica'),
('articulos en memoria de congreso enviados','productividad academica');



create table proyecto_entregable(
id_proyecto int(10) not null,
id_entregable int not null,
FOREIGN KEY (id_entregable) REFERENCES entregable(id_entregable),
FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto),
primary key(id_proyecto,id_entregable)
);











create table protocolo(
id_archivo int(5) not null primary key,
nombre_archivo varchar(10) ,
url_archivo varchar(200) not null unique,
anotaciones text ,
id_proyecto int(10) not null ,
foreign key (id_proyecto) references proyecto(id_proyecto)

);
describe protocolo;




create table archivo(
id_archivo int(5) not null primary key,
nombre_archivo varchar(10) ,
url_archivo varchar(200) not null unique,
anotaciones text ,
id_informe int(5) ,
foreign key (id_informe) references informe(id_informe)

);
describe archivo;


create table materiales_servicios(
idservicio int(5) auto_increment not null primary key,
monto int(10) not null,
clave_subpartida int(5) not null,
id_proyecto int(10) not null,
foreign key (id_proyecto) references proyecto(id_proyecto),
foreign key (clave_subpartida) references detalle_partida(clave_subpartida)

);
describe materiales_servicios;



