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

    if (response.error) {
      errorLoginBlockElem.innerHTML = response.error.errorText;
    }
    if (response.success) {
      localStorage.setItem("LoggedInUser", JSON.stringify(response.success.user));
      
      setTimeout(() => {
        document.location.href = response.redirect;
      }, 100);
    }
  }
});


