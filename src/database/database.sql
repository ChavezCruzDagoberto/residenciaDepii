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
apellido2 varchar(50) ,
plantel_adscripcion varchar(100) not null,
email varchar(100) not null unique
);

create table users(
id_usuario int(5)  auto_increment primary key,
username varchar(60) not null unique,
  password  varchar(200) not null unique,
  cvu_tecnm varchar(10) unique,
  rol_sistema varchar(15) ,
  estado int(1) not null,
 foreign key (cvu_tecnm) references participante(cvu_tecnm)
);

describe users;

create table proyecto(
id_proyecto int(10) not null primary key auto_increment,
titulo varchar(500) not null,
fecha_sometido timestamp not null,
fecha_dictamen timestamp not null,
clave_financiamiento varchar(10) unique, 
FOREIGN KEY (clave_financiamiento) REFERENCES financiamiento(clave_financiamiento),
estado int(1) not null,
creado date not null
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
('Tesis concluidas de licenciatura','Formacion de recursos humanos'),
('Tesis concluidas de doctorado','Formacion de recursos humanos'),
('Tesis en desarrollo de doctorado','Formacion de recursos humanos'),
('Incorporacion de alumnos de licenciatura','Formacion de recursos humanos'),
('Alumnos residentes participantes en el proyecto','Formacion de recursos humanos'),
('Articulos cientificos enviados en revistas arbitrarias','Productividad academica'),
('Articulos en memoria de congreso enviados','Productividad academica');

create table proyecto_entregable(
id_proyecto int(10) not null,
id_entregable int not null,
cantidad int not null,
FOREIGN KEY (id_entregable) REFERENCES entregable(id_entregable),
FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto),
primary key(id_proyecto,id_entregable)
);

create table material_servicio (
id_material_servicio int not null  auto_increment primary key,
descripcionms varchar(500)  not null,
id_proyecto int(10) not null,
clave_subpartida int(5) not null ,
monto_solicitado int(8) not null,
FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto)
);

insert into detalle_partida (clave_partida,clave_subpartida,descripcion) values
(21701,21101,"Materiales y útiles de oficina"),
(21701,21201,"Materiales y útiles de impresión y reproducción"),
(21701,21301,"Material estadístico y geográfico"),
(21701,21401,"Materiales y útiles consumibles para el procesamiento en equipos y bienes informáticos."),
(21701,21501,"Material de apoyo informativo"),
(21701,22201,"Productos alimenticios para animales"),
(21701,23101,"Productos alimenticios, agropecuarios y forestales adquiridos como materia prima"),
(21701,23301,"Productos de papel, cartón e impresos adquiridos como materia prima"),
(21701,23401,"Combustibles, lubricantes, aditivos, carbón y sus derivados adquiridos como materia prima"),
(21701,23501,"Productos químicos, farmacéuticos y de laboratorio adquiridos como materia prima"),
(21701,23601,"Productos metálicos y a base de minerales no metálicos adquiridos como materia prima"),
(21701,23701,"Productos de cuero, piel, plástico y hule adquiridos como materia prima"),
(21701,23901,"Otros productos adquiridos como materia prima"),
(21701,23902,"Petróleo, gas y sus derivados adquiridos como materia prima"),
(21701,24501,"Vidrio y productos de vidrio"),
(21701,24601,"Material eléctrico y electrónico"),
(21701,24701,"Artículos metálicos para la construcción"),
(21701,24901,"Otros materiales y artículos de construcción y reparación"),
(21701,25101,"Productos químicos básicos"),
(21701,25201,"Plaguicidas, abonos y fertilizantes"),
(21701,25301,"Medicinas y productos farmacéuticos"),
(21701,25401,"Materiales, accesorios y suministros médicos"),
(21701,25501,"Materiales, accesorios y suministros de laboratorio"),
(21701,25901,"Otros productos químicos"),
(21701,26105,"Combustibles, lubricantes y aditivos para maquinaria, equipo de producción y servicios administrativos"),
(21701,29101,"Herramientas menores"),
(21701,29401,"Refacciones y accesorios para equipo de cómputo y telecomunicaciones"),
(21701,29501,"Refacciones y accesorios menores de equipo e instrumental médico y de laboratorio"),
(21701,29801,"Refacciones y accesorios menores de maquinaria y otros equipos"),
(31903,33301,"Servicios de desarrollo de aplicaciones informáticas"),
(31903,33304,"Servicios de mantenimiento de aplicaciones informáticas"),
(31903,33601,"Servicios relacionados con traducciones"),
(31903,33901,"Subcontratación de servicios con terceros"),
(31903,35301,"Mantenimiento y conservación de bienes informáticos"),
(31903,35401,"Instalación, reparación y mantenimiento de equipo e instrumental médico y de laboratorio"),
(31903,35702,"Mantenimiento y conservación de plantas e instalaciones productivas"); 

create table protocolo (
id_protocolo int not null auto_increment primary key,
nombre_archivo varchar(500) not null,
url_archivo varchar(700) not null,
anotaciones text ,
id_proyecto int(10) not null,
FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto),
revisiones int(1) not null
);

/*integridad referencial*/

ALTER TABLE `residenciap_depi`.`users` 
DROP FOREIGN KEY `users_ibfk_1`;
ALTER TABLE `residenciap_depi`.`users` 
ADD CONSTRAINT `users_ibfk_1`
  FOREIGN KEY (`cvu_tecnm`)
  REFERENCES `residenciap_depi`.`participante` (`cvu_tecnm`)
  ON UPDATE CASCADE;

ALTER TABLE `residenciap_depi`.`proyecto_participante` 
ADD CONSTRAINT `proyecto_participante_ibfk`
  FOREIGN KEY (`cvu_tecnm`)
  REFERENCES `residenciap_depi`.`participante` (`cvu_tecnm`)
  ON UPDATE CASCADE;
  
  ALTER TABLE `residenciap_depi`.`proyecto_participante` 
DROP FOREIGN KEY `proyecto_participante_ibfk_2`;
ALTER TABLE `residenciap_depi`.`proyecto_participante` 
ADD CONSTRAINT `proyecto_participante_ibfk_2`
  FOREIGN KEY (`id_proyecto`)
  REFERENCES `residenciap_depi`.`proyecto` (`id_proyecto`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
  
    create table archivo_informes(
  id_proyecto int(10) not null,
  id_informe int(5) not null,
  url_archivo varchar(500) not null,
  anotaciones text,
  revisiones int(1) not null,
  FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto),
  FOREIGN KEY (id_informe) REFERENCES informe(id_informe),
  primary key(id_proyecto,id_informe)
  );
 
  ALTER TABLE protocolo
ADD intentos int(1) not null; 

alter table archivo_informes
add intentos int(1) not null;

create table historico(
 clave_financiamiento varchar(10) not null primary key,
  titulo varchar(500) not null,
  responsable varchar(200) not null,
  anio int(4) not null,
  url_archivo varchar(700) not null
  );
   create table notificaciones(
id_notificacion int not null auto_increment primary key,
 destinatario varchar(10) not null,
 mensaje varchar(800) not null,
 leido int(1) not null
);