function resetareFiltre() {
    document.getElementById("inp-nume").value = '';
    document.getElementById("inp-disp").checked = true;
    document.getElementById("inp-centru-date").value = "Oricare";
    var radios = document.getElementsByName("categorie");
    for(var i = 0; i < radios.length; i++){
        if(radios[i].value == 'toate'){
            radios[i].checked = true;
        }
    };

    let minRange = document.getElementById("inp-pret-min");
    let maxRange = document.getElementById("inp-pret-max");
    minRange.value = minRange.min;
    maxRange.value = maxRange.max;
    [minRange, maxRange].forEach(el => el.oninput());
    aplicaFiltrare();
}

/**
 * Returneaza textul fara diacritice, lowercase si cu trim
 * @param {string} text 
 * @returns {string}
 */
function prelucrareText(text) {
    let diacritice = "ăîâșț".split("");
    let rezultat = "aiast".split("");
    text = text.toLocaleLowerCase("ro-RO").trim();
    diacritice.forEach((_, i) => {
        text = text.replaceAll(diacritice[i], rezultat[i]);
    });
    return text;
}

function aplicaFiltrare() {
    let inpNume = prelucrareText(document.getElementById("inp-nume").value);
    let produse = document.getElementById("lista-produse").children;
    let disp = document.getElementById("inp-disp").checked;
    let pretMin = document.getElementById("inp-pret-min").value;
    let pretMax = document.getElementById("inp-pret-max").value;
    let centruDate = document.getElementById("inp-centru-date").value;
    let radCategorie = document.getElementsByName("categorie");
    let inpDesc = prelucrareText(document.getElementById("inp-desc").value);
    let wasFound = false;

    let categ;
    for (let rad of radCategorie) {
        if (rad.checked) {
            categ = rad.value;
            break;
        }
    }
    
    for (let produs of produse) {
        let valNume = prelucrareText(produs.getElementsByClassName("val-nume")[0].innerHTML);
        let valCateg = produs.getElementsByClassName("val-categ")[0].innerHTML.toLowerCase();
        let valDisp = produs.getElementsByClassName("val-disp")[0].innerHTML == "Da";
        let valPret = parseInt(produs.getElementsByClassName("val-pret")[0].innerHTML.replace(" RON", ""));
        let valCentruDate = produs.getElementsByClassName("val-datacenter")[0].innerHTML;
        let valDesc = prelucrareText(produs.getElementsByClassName("val-desc")[0].innerHTML);

        let isMatchValid = inpNume.includes(valNume) || valNume.includes(inpNume);
        let isStarValid = inpNume.includes("*") && valNume.startsWith(inpNume.split("*")[0]) && valNume.endsWith(inpNume.split("*")[1]);

        let isDesc = inpDesc.includes(valDesc) || valDesc.includes(inpDesc);

        if ((isMatchValid || isStarValid) && isDesc &&
        (valCateg == categ || categ == "toate") 
        && disp == valDisp
        && valPret >= pretMin && valPret <= pretMax
        && (centruDate == "Oricare" || valCentruDate == centruDate)) {
            produs.style.removeProperty("display");
            wasFound = true;
            continue;
        }

        produs.style.display = "none";
    }

    document.getElementById("mesaj-noproduse").style.display = wasFound ? "none" : "block";
    
}

/**
 * @param {boolean} ascend Daca sortarea va fi ascendenta.
 */
function sortareProduse(ascend) {
    var lista = document.getElementById("lista-produse");
    var produse = Array.from(lista.children);
    produse.sort(function(a, b) {
        var numeA = a.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();
        var numeB = b.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();
        if (numeA < numeB) {
            return ascend ? -1 : 1;
        }
        if (numeA > numeB) {
            return ascend ? 1 : -1;
        }
        return 0;
    });

    while (lista.firstChild) {
        lista.removeChild(lista.firstChild);
    }

    produse.forEach(function(produs) {
        lista.appendChild(produs);
    });
}

function calculAfisare() {
    var products = document.getElementById("lista-produse").children;
    var preturi = [];
    for (var i = 0; i < products.length; i++) {
        var pret = parseInt(products[i].getElementsByClassName("val-pret")[0].innerHTML.replace(" RON", ""));
        preturi.push(pret);
    }

    var medie = Math.floor(preturi.reduce((a, b) => a + b, 0) / preturi.length);


    var rezultatDiv = document.createElement("div");
    rezultatDiv.classList = "popup-calcul";
    rezultatDiv.innerHTML = `Pret mediu: ${medie} RON`;
    document.body.appendChild(rezultatDiv);

    setTimeout(function() {
        rezultatDiv.remove();
    }, 2000);
}

window.addEventListener("load", () => {
    ["pret-min", "pret-max"].forEach(el => {
        const inpPret = document.getElementById(`inp-${el}`);
        const valPret = document.getElementById(`val-${el}`);
        inpPret.oninput = () => {
            valPret.innerHTML = inpPret.value;
        }
    });

    [...document.querySelectorAll('[id^="inp-"]'), ...document.querySelectorAll('[name="categorie"]')].forEach(el => el.onchange = el.oninput = aplicaFiltrare);
    document.getElementById("filtrare").onclick = aplicaFiltrare;

    document.getElementById("resetare").onclick = resetareFiltre;
    document.getElementById("calcul").onclick = calculAfisare;
});