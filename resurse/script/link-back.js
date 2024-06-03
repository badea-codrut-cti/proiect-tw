window.addEventListener("load", () => {
    let penultimaPagina = getCookie("penultima_pagina");
    if (penultimaPagina) {
        document.getElementById("last-page").setAttribute("href", penultimaPagina);
    }
});