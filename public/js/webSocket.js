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
  var incomingMessage = e.data;
  showMessage(incomingMessage); 
});


document.forms.publish.addEventListener("submit", function(e) {
  e.preventDefault();
  
  var outgoingMessage = this.message.value;
  this.message.value = "";

  socket.send(outgoingMessage);
});

document.forms.publish.exit.addEventListener("click", function(e) {
  if (socket.readyState !== 1) return; // If not OPEN 
  socket.close();
});


function showMessage(message) {
  var messageElem = document.createElement('div');
  messageElem.appendChild(document.createTextNode(message));
  document.getElementById('subscribe').appendChild(messageElem);
}

function setStatus(status) {
	document.getElementById('status-text').innerHTML = status;
}
