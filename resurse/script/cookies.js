function setCookie(nume, val, timpExpirare) {
    let d = new Date();   
    d.setTime(d.getTime() + timpExpirare);
    document.cookie = `${nume}=${val}; expires=${d.toUTCString()}`;
}

function getCookie(nume){
    let vectorParametri = document.cookie.split(";");
    for (let param of vectorParametri) {
        if (param.trim().startsWith(nume+"="))
            return param.split("=")[1];
    }
    return null;
}

function deleteCookie(nume) {
    document.cookie = `${nume}=0; expires=${(new Date()).toUTCString()}`;
}

function deleteAllCookies() {
    let vectorParametri = document.cookie.split(";");
    for (let param of vectorParametri) {
        let key = param.trim().split("=")[0];
        deleteCookie(key);
    }
}

window.addEventListener("load", () => {
    if (getCookie("acceptat_banner")) {
        document.getElementById("banner-cookies").style.display = "none";
    }

    this.document.getElementById("ok_cookies").onclick = () => {
        setCookie("acceptat_banner",true,60000);
        document.getElementById("banner-cookies").style.display = "none";
    }
})