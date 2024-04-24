window.addEventListener("load", () => {
    document.getElementById("filtrare").onclick = () => {
        let inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();
        let produse = document.getElementById("lista-produse").children;
        let disp = document.getElementById("inp-disp").checked;
        let pretMin = document.getElementById("inp-pret-min").value;
        let pretMax = document.getElementById("inp-pret-max").value;
        let centruDate = document.getElementById("inp-centru-date").value;
        let radCategorie = document.getElementsByName("categorie");

        let categ;
        for (let rad of radCategorie) {
            if (rad.checked) {
                categ = rad.value;
                break;
            }
        }
        
        for (let produs of produse) {
            let valNume = produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();
            let valCateg = produs.getElementsByClassName("val-categ")[0].innerHTML.toLowerCase();
            let valDisp = produs.getElementsByClassName("val-disp")[0].innerHTML == "Da";
            let valPret = parseInt(produs.getElementsByClassName("val-pret")[0].innerHTML.replace(" RON", ""));
            let valCentruDate = produs.getElementsByClassName("val-datacenter")[0].innerHTML;

            let isMatchValid = inpNume.includes(valNume) || valNume.includes(inpNume);
            let isStarValid = inpNume.includes("*") && valNume.startsWith(inpNume.split("*")[0]) && valNume.endsWith(inpNume.split("*")[1]);

            if ((isMatchValid || isStarValid) && 
            (valCateg == categ || categ == "toate") 
            && disp == valDisp
            && valPret >= pretMin && valPret <= pretMax
            && (centruDate == "Oricare" || valCentruDate == centruDate)) {
                produs.style.removeProperty("display");
                continue;
            }

            produs.style.display = "none";
        }
    };

    ["pret-min", "pret-max"].forEach(el => {
        const inpPret = document.getElementById(`inp-${el}`);
        const valPret = document.getElementById(`val-${el}`);
        inpPret.oninput = () => {
            valPret.innerHTML = inpPret.value;
        }
    });
});