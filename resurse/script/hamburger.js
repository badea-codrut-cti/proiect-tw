window.addEventListener("load", () => {
    const hamburgerMenu = document.getElementById("meniu-hamburger");
    const navMenu = document.getElementById("meniu-navigatie");
    hamburgerMenu.onclick = () => {
        if (navMenu.classList.contains("tranzitie-nav")) 
            navMenu.classList.remove("tranzitie-nav");
        else navMenu.classList.add("tranzitie-nav");
    }
});