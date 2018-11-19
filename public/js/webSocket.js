if (!window.WebSocket) {
	document.body.innerHTML = 'WebSocket в этом браузере не поддерживается.';
}
let socket = new WebSocket("ws://localhost:8081");
const btnExetElem = document.querySelector(".chat-block__exit-btn");
const statusBlockElem = document.querySelector(".main-block__status");
const chatBlockInputElem = document.querySelector(".chat-block__input");
const sendMessageBtnElem = document.querySelector(".chat-block__send-msg");

socket.addEventListener('open', function(){
	let name = getPersonName();
	let obj = {
		name, 
		connecting: true
	}
	console.log(obj)
	socket.send(JSON.stringify(obj));
});

/*socket.addEventListener('close', function(e){

	//setStatus("Offline");
	//document.location.href = "/login";
});*/

socket.addEventListener('message', function(e){
	let obj = JSON.parse(e.data);
	let name = getPersonName();
	console.log(obj)
	
	if(obj.users) {
		statusBlockElem.innerHTML = "";
		for (let i = 0; i < obj.users.length; i++) {
			if(name === obj.users[i].name) continue;
			addPersonInStatusBlock(obj.users[i].name, obj.users[i].status);
		}
		return;
	}
	
	if(name === obj.message.name) {
		showMessage(obj.message.text, obj.message.name, obj.message.time, "chat-block__message"); 
		return;
	}
	showMessage(obj.message.text, obj.message.name, obj.message.time, "chat-block__incoming-message");
});

sendMessageBtnElem.addEventListener("click", function() {
  var outgoingMessage = chatBlockInputElem.value;
  chatBlockInputElem.value = "";
	let user = JSON.parse(localStorage.getItem("LoggedInUser"));
	let userName = user.firstname + " " + user.lastname;
	let now = new Date();
	let time = now.getHours() + ":" + now.getMinutes();
	let obj = {
		message: {
			name: userName,
			text: outgoingMessage,
			time
		}
	}
	socket.send(JSON.stringify(obj));
});

btnExetElem.addEventListener("click", function() {
  if (socket.readyState !== 1) return; // If not OPEN 
  socket.close();
});


function getPersonName() {
	let currentUser = JSON.parse(localStorage.getItem("LoggedInUser"));
	let name = currentUser.firstname + " " + currentUser.lastname;
	return name;
}

function addPersonInStatusBlock(name, status) {
	let personElem = document.createElement('div');
	personElem.className = "person";

	let photoElem = document.createElement('div');
	photoElem.className = "person__photo";

	let personInfoElem = document.createElement('div');
	personInfoElem.className = "person__info";

	let personNameElem = document.createElement('div');
	personNameElem.className = "person__name";
	personNameElem.innerHTML = name;

	let statusTextElem = document.createElement('div');
	statusTextElem.className = "person__status";
	statusTextElem.innerHTML = status;


	personElem.appendChild(photoElem);
	personInfoElem.appendChild(personNameElem);
	personInfoElem.appendChild(statusTextElem);
	personElem.appendChild(personInfoElem);
	statusBlockElem.appendChild(personElem);
}

function showMessage(message, name, time, className) {
	let messageElem = document.createElement('div');
	messageElem.className = className;
	let nameElem = document.createElement('div');
	nameElem.className = "chat-block__name-of-user";
	nameElem.innerHTML = name;
	let timeElem = document.createElement('div');
	timeElem.className = "chat-block__time";
	timeElem.innerHTML = time;
	messageElem.appendChild(nameElem);
	messageElem.appendChild(document.createTextNode(message));
	messageElem.appendChild(timeElem);
	document.getElementById('subscribe').appendChild(messageElem);
}