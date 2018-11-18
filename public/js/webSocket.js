if (!window.WebSocket) {
	document.body.innerHTML = 'WebSocket в этом браузере не поддерживается.';
}
var socket = new WebSocket("ws://localhost:8081");

socket.addEventListener('open', function(e){
	setStatus("Online");
});

socket.addEventListener('close', function(e){
  setStatus("Offline");
});

socket.addEventListener('message', function(e){
	var obj = JSON.parse(e.data);
	let currentUser = JSON.parse(localStorage.getItem("LoggedInUser"));
	let name = currentUser.firstname + " " + currentUser.lastname;
	if(name === obj.name) {
		showMessage(obj.message, obj.name, "chat-block__message"); 
		return;
	}
	showMessage(obj.message, obj.name, "chat-block__incoming-message");
});


document.forms.publish.addEventListener("submit", function(e) {
  e.preventDefault();
  
  var outgoingMessage = this.message.value;
  this.message.value = "";
	let user = JSON.parse(localStorage.getItem("LoggedInUser"));
	let userName = user.firstname + " " + user.lastname;
	let obj = {
		name: userName,
		message: outgoingMessage
	}
  socket.send(JSON.stringify(obj));
});

const btnExetElem = document.querySelector(".chat-block__exit-btn");

btnExetElem.addEventListener("click", function(e) {
  if (socket.readyState !== 1) return; // If not OPEN 
  socket.close();
});


function showMessage(message, name, className) {
  let messageElem = document.createElement('div');
  messageElem.className = className;
  let nameElem = document.createElement('div');
  nameElem.className = "chat-block__name-of-user";
  nameElem.innerHTML = name;
  messageElem.appendChild(nameElem);
  messageElem.appendChild(document.createTextNode(message));
  document.getElementById('subscribe').appendChild(messageElem);
}

function setStatus(status) {
	document.getElementById('status-text').innerHTML = status;
}
