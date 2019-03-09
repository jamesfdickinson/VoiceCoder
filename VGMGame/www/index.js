function openGame() {
    var input = document.getElementById("accessCode");
    var accessCode = input.value;
    if (accessCode) accessCode = accessCode.toUpperCase();
    //check if access code exist
    var rand = Math.floor(Math.random() * 100000000000);
    var url = 'data/' + accessCode + '?random=' + rand;
    var xhr = new XMLHttpRequest();
    xhr.onload = xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log(xhr.responseText);
                forwardUrl(accessCode);
            } else {
                console.error(xhr.statusText);
                error();
            }
        }
    };
    xhr.onerror = error;
    xhr.open('get', url, true);
    xhr.send();
}
function forwardUrl(accessCode) {
    if (typeof (Storage) !== "undefined") {
        localStorage.setItem("accessCode", accessCode);
    }
    window.location = "game.html?id=" + accessCode;

}
function error() {
    if (typeof (Storage) !== "undefined") {
        localStorage.setItem("accessCode", "");
    }
    var error = document.getElementById("error");
    error.innerHTML = "Access Code not found.";
    var input = document.getElementById("accessCode");
    input.value = "";
}
window.onload = function (e) {
    if (typeof (Storage) !== "undefined") {
        var accessCode = localStorage.getItem("accessCode");;
        if (accessCode) {
            var input = document.getElementById("accessCode");
            input.value = accessCode;
        }
    }
}
