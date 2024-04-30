window.addEventListener("load", () => {
    let tema = localStorage.getItem("tema") || "dark";
    let selectTema = document.getElementById("select-tema");
    selectTema.value = tema;
    document.body.classList.add(tema);
    selectTema.onchange = () => {
        document.body.classList.remove(tema);
        document.body.classList.add(tema = selectTema.value);
        localStorage.setItem("tema", tema);
    }
});