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


create table partida(
clave_partida int(5) not null,
clave_financiamiento varchar(10) not null,
monto_aprobado int(10)  not null,
FOREIGN KEY (clave_financiamiento) REFERENCES financiamiento(clave_financiamiento),
primary key(clave_partida, clave_financiamiento)
);


describe partida;




create table detalle_partida(
clave_subpartida int(5) not null ,
clave_partida int(5) not null,
descripcion text not null
primary key(clave_partida, clave_subpartida)
);

describe detalle_partida;




CREATE TABLE participante(
cvu_tecnm varchar(10) not null primary key,
nombre varchar(50) not null,
apellido1 varchar(50) not null,
apellido2 varchar(50) not null,
plantel_adscripcion varchar(100) not null,
rol_proyecto varchar(30) not null,
email varchar(100) not null,
estado int(1) not null
);

alter table participante
add column id_proyecto int(10),
FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto);

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
id_proyecto int(10) not null primary key autoincrement,
titulo varchar(500) not null,
modalidad varchar(200) not null,
fecha_sometido timestamp not null,
fecha_dictamen timestamp not null,
clave_financiamiento varchar(10) unique, 
cvu_tecnm varchar(10) not null,
FOREIGN KEY (clave_financiamiento) REFERENCES financiamiento(clave_financiamiento),
id_convocatoria int(5) unique, 
FOREIGN KEY (id_convocatoria) REFERENCES convocatoria(id_convocatoria),
FOREIGN KEY (cvu_tecnm) REFERENCES participante(cvu_tecnm)
);

describe proyecto;



alter table participante
add column id_proyecto int(10),
ADD CONSTRAINT fk_id_proyecto_id_proyecto 
FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto);



create table informe(
id_informe int(5) auto_increment primary key,
no_informe int(1)  not null,
fecha_inicio date not null,
fecha_fin date not null,
id_proyecto int(10) not null,
foreign key (id_proyecto) references proyecto(id_proyecto)

);
describe informe;


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



create table contribucion(
id_contribucion int(6) not null primary key,
tipo_entregable varchar(300) not null,
cantidad int(2) not null,
tipo_contribucion varchar(100) not null,
id_proyecto int(10) not null,
foreign key (id_proyecto) references proyecto(id_proyecto)

);
describe contribucion;