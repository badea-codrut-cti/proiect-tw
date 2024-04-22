window.addEventListener("load", () => {
    document.getElementById("filtrare").onclick = () => {
        let inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();
        let produse = document.getElementsByClassName("produs");

        let radioType = document.getElementsByName("gr_rad");
        let inpCateg;
        for (let rad of radioType) {
            if (rad.checked) {
                inpCateg = rad.value;
                break;
            }
        }

        for (let produs of produse) {
            let valNume = produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();

            if (!inpNume.includes(valNume) && !valNume.includes(inpNume)) {
                produs.style.display = "unset";
            }

            produs.style.display = "none";
        }
    }
});