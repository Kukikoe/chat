const express = require('express');
const bodyParser = require("body-parser");
const morgan = require('morgan');
const mysql = require('mysql');
const WebSocketServer = new require('ws');

const app = express();

// DB Init
const db_config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chat'
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.
  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
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
     return res.send({success: { successText: "You registrate"}});
   });
  });
});

app.get("/login", function(req, res) {
  res.sendfile("public/login.html");
});

app.get("/registration", function(req, res) {
  res.sendfile("public/registration.html");
});

app.get("/chat", function(req, res) {
  res.sendfile("public/index.html");
});

let webSocketServer = new WebSocketServer.Server({port: 8081});

webSocketServer.on('connection', function(ws) {
  console.log("новое соединение");

  ws.on('message', function(message) {
    let obj = JSON.parse(message);
    console.log('получено сообщение ' + obj.message);

    webSocketServer.clients.forEach(client =>  {
      if (client.readyState !== WebSocketServer.OPEN) return;
      client.send(message);
    });   
  });

  ws.on('close', function(e) {
    console.log('соединение закрыто ' + e);
  });

});

app.listen(8080, () => console.log("Server is listening. Ports: 8080, 8081"));
