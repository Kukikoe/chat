const registrationBlockElem = document.querySelector(".registration-block");
const registrationBtnElem = document.querySelector(".registration-btn");
const registrationErrorBlockElem = document.querySelector(".registration-block__error");
const confirmPasswordElem = document.querySelector(".confirmPasswordReg");
const passwordElem = document.querySelector(".passwordReg");

registrationBtnElem.addEventListener("click", function() {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', registrationBlockElem.dataset.action);

  if (confirmPasswordElem.value !== passwordElem.value) {
  	registrationErrorBlockElem.innerHTML = "You have incorrectly confirmed the password";
  	return;
  }
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.send(toJSONString(registrationBlockElem));

  xhr.onreadystatechange = function() {
  	if (this.readyState != 4) return;

  	if (this.status != 200) {
  		alert( 'ошибка: ' + (this.status ? this.statusText : 'запрос не удался') );
  		return;
  	}
  	let response = JSON.parse(this.responseText);
  	if (response.error) {
  		registrationErrorBlockElem.innerHTML = response.error.errorText;
  	}
  	if (response.success) {
  		document.location.href = response.redirect;
  	}
  }
});
