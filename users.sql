CREATE DATABASE Users;

USE Users;

CREATE TABLE MyUser (id INT(6) AUTO_INCREMENT,
firstname VARCHAR(30),
lastname VARCHAR(30),
passwords VARCHAR(50),
login VARCHAR(50),
age INT(2),
PRIMARY KEY (id)
);

INSERT INTO MyUser (firstname,lastname,passwords,login,age) VALUES('Vova','Plaksii','admin','Vova',22);

INSERT INTO MyUser (firstname,lastname,passwords,login,age) VALUES('Yana','Quaser','admin2','Yana',00);

INSERT INTO MyUser (firstname,lastname,passwords,login,age) VALUES('Julia','Vilians','admin3','Julia',00);

INSERT INTO MyUser (firstname,lastname,passwords,login,age) VALUES('Vetal','Vetal','admin4','Vetal',00);

SELECT * FROM MyUser;

DROP DATABASE Users;