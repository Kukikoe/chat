const loginBlockElem = document.querySelector(".login-block");
const btnLoginElem = document.querySelector(".login-block__btn_login");
const errorLoginBlockElem = document.querySelector(".login-block__error");


btnLoginElem.addEventListener("click", function() {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', loginBlockElem.dataset.action);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(toJSONString(loginBlockElem));

  xhr.onreadystatechange = function() {
    if (this.readyState != 4) return;

    if (this.status != 200) {
      alert( 'ошибка: ' + (this.status ? this.statusText : 'запрос не удался') );
      return;
    }
    let response = JSON.parse(this.responseText);
    if (response.status === "error") {
      errorLoginBlockElem.innerHTML = response.statusText;
    }
    if (response.status === "success") {

    }
  }
});