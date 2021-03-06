const express = require('express');
const bodyParser = require("body-parser");
const morgan = require('morgan');
const mysql = require('mysql');
const WebSocketServer = new require('ws');
const ip = require("ip");
const fs = require("fs");
const path = require('path');
const app = express();

const log4js = require('log4js');
log4js.configure({
  appenders: { user: { type: 'file', filename: 'users.log' }, message:  { type: 'file', filename: 'users.log' }},
  categories: { default: { appenders: ['user', 'message'], level: 'info' } }
});
const logger = log4js.getLogger('user');
const loggerMes = log4js.getLogger('message');

const server_config = {
  ip: ip.address(),
  portWs: "8081",
  portFront: "8080"
}
// DB Init
const db_config = {
  host: 'localhost',
  user: 'root',
  password: ''
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config);
  connection.connect(function(err) {              
    if(err) {                                    
      setTimeout(handleDisconnect, 2000); 
    }                                    
  });                                    
  connection.on('error', function(err) {
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      handleDisconnect();                         
    } else {                                 
      throw err;                                  
    }
  });
}

handleDisconnect();

connection.query('CREATE DATABASE IF NOT EXISTS chat', function (err) {
  if (err) throw err;
  connection.query('USE chat', function (err) {
    if (err) throw err;
    connection.query('CREATE TABLE IF NOT EXISTS users('
      + 'id INT NOT NULL AUTO_INCREMENT,'
      + 'PRIMARY KEY(id),'
      + 'firstname VARCHAR(30),'
      + 'lastname VARCHAR(30),'
      + 'age INT(2),'
      + 'login VARCHAR(50),'
      + 'password VARCHAR(50)'
      +  ')', function (err) {
      if (err) throw err;
    });
  });
});

let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static(__dirname + "/public"));


// Routes
app.post("/login", function(req, res) {
 
  let {login, password} = req.body;
  connection.query("SELECT * FROM users WHERE login=?", [login], function(err, rows) {
    if (err) throw err;
    if (!rows.length) return res.send({error: { errorText: "User not found"}});
    if (rows[0].password !== password) return res.send({error: { errorText: "Password is incorrect"}});
    return res.send({success: { successText: "Logged in", user: rows[0]}, redirect: "chat"});
  });
});

app.post("/registration", function(req, res) {
  let {name, surname, age, login, password} = req.body;
  connection.query("SELECT * FROM users WHERE login=?", [login], function(err, rows) {
    if (err) throw err;
    if (rows.length) return res.send({error: { errorText: "User with such login already exists"}});
    connection.query("INSERT INTO users (firstname, lastname, age, login, password) VALUES (?, ?, ?, ?, ?)", [name, surname, age, login, password], function(error, elem) {
     if (error) throw error;

     return res.send({success: { successText: "You registrate"}, redirect: "login"});
   });
  });
});

app.get("/login", function(req, res) {
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/registration", function(req, res) {
  res.sendFile(__dirname + "/public/registration.html");
});

app.get("/chat", function(req, res) {
  res.sendFile(__dirname + "/public/chat.html");
});

let webSocketServer = new WebSocketServer.Server({port: +server_config.portWs});
let users = [];
let arrayMessages = [];

webSocketServer.on('connection', function(ws) {
  console.log("новое соединение");
  let userIndex;
 
  ws.on('message', function(message) {
    let incomingMsg = JSON.parse(message);
    let outgoingMsg = {};

    if (incomingMsg.connecting) {
      let userIsPresent = users.filter(user => user.name === incomingMsg.name).length;
      logger.info('User ' + incomingMsg.name + " logged in");
      if (userIsPresent) {
        users = users.map((user) => {
          if (user.name === incomingMsg.name) {
            user.status = "online";
            userIndex = user.index;
          }
          return user;
        });
      } 
      else {
        let user = {
          name: incomingMsg.name,
          status: "online"
        }
        userIndex = users.push(user);
        userIndex--;
        user.index = userIndex;
      }
      outgoingMsg.users = users;
      outgoingMsg.messages = arrayMessages;
    }

    if (incomingMsg.message) {
      outgoingMsg.message = incomingMsg.message;
      arrayMessages.push(outgoingMsg.message);
      loggerMes.info('получено сообщение "' + outgoingMsg.message.text + '" от ' +  outgoingMsg.message.name + ' в ' + outgoingMsg.message.time);
    }
    console.log('получено сообщение ');

    webSocketServer.clients.forEach(client =>  {
      if (client.readyState !== WebSocketServer.OPEN) return;
      return client.send(JSON.stringify(outgoingMsg));
    });   
  });

  ws.on('close', function(e) {
    users[userIndex].status = "offline";
    logger.info('User ' + users[userIndex].name + " logged out");

    webSocketServer.clients.forEach(client =>  {
      if (client.readyState !== WebSocketServer.OPEN) return;
      return client.send(JSON.stringify({
        users
      }));
    });  
    console.log('соединение закрыто ' + e);
  });
});

app.listen(+server_config.portFront, () => console.log("Server is listening. Ip: " + server_config.ip + ":" + server_config.portFront));


