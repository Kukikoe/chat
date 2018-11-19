function toJSONString(form) {
  var obj = {};
  var elements = form.querySelectorAll("input, select, textarea");

  for( var i = 0; i < elements.length; ++i ) {
    var element = elements[i];
    var inputName = element.name;
    if (inputName === "password") {
      var value = b64EncodeUnicode(element.value);
    }
    else {
      var value = element.value;
    }

    if( inputName ) {
      obj[ inputName ] = value;
    }
  }
  console.log(obj)
  return JSON.stringify( obj );
}


function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}