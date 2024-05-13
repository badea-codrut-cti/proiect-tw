function resetareFiltre() {
    let filtre = document.querySelectorAll('[id^="inp-"]');
    filtre.forEach(el => {
        switch(true) {
            case (el.type === "checkbox"):
                el.checked = true;
                break;
            case (el.id.endsWith("-min") && el.type === "range"):
                el.value = el.min;
                break;
            case (el.id.endsWith("-max") && el.type === "range"):
                el.value = el.max;
                break;
            case (el.tagName === "SELECT"):
                el.value = "oricare";
                break;
            default:
                el.value = "";
                break;
        }
    });
    aplicaFiltrare();
}

/**
 * Returneaza textul fara diacritice, lowercase si cu trim
 * @param {string} text 
 * @returns {string}
 */
function remDiacritice(text) {
    let diacritice = "ăîâșț".split("");
    let rezultat = "aiast".split("");
    text = text.toLocaleLowerCase("ro-RO").trim();
    diacritice.forEach((_, i) => {
        text = text.replaceAll(diacritice[i], rezultat[i]);
    });
    return text;
}

function getValoriFiltre() {
    let values = {};
    document.querySelectorAll('[id^="inp-"]').forEach(element => {
        if (["-min", "-max"].find(key => element.id.endsWith(key))) {
            let vkey = element.id.substring(4, element.id.length-4);
            if (!values[vkey])
                values[vkey] = {};

            if (element.id.endsWith("-min"))
                return values[vkey].minValue = element.value;

            return values[vkey].maxValue = element.value;
        }

        let vkey = element.id.substring(4);
        let val = element.type == "checkbox" ? element.checked : remDiacritice(element.value);
        if (element.tagName == "SELECT") {
            if (element.hasAttribute("multiple")) {
                values[vkey] = {
                    isMultiselect: true,
                    value: Array.from(element.selectedOptions).map(el => el.value)
                }
            } else values[vkey] = {
                isSelect: true,
                value: val
            };
        }
        else values[vkey] = {value: val};
    });

    let radCategorie = document.getElementsByName("categorie");

    values["categorie"] = {
        isSelect: true
    };

    for (let rad of radCategorie) {
        if (rad.checked) {
            values["categorie"].value = rad.value;
            break;
        }
    }

    return values;
}

function updateNrProduse() {
    document.getElementById("nr-produse").innerHTML = 
    Array.from(document.getElementById("lista-produse").children).filter(el => el.style.display != "none").length;
}

/**
 * @param {HTMLElement} element 
 * @param {string} key 
 * @returns {string}
 */
function getProdusVal(element, key) {
    var className = ".val-" + key;
    var foundElement = element.querySelector(className);
    return foundElement ? foundElement.innerHTML : null;
}

function aplicaFiltrare() {
    let produse = document.getElementById("lista-produse").children; 
    let values = getValoriFiltre();
    let wasFound = false;

    for (let produs of produse) {
        let hasInvKey = Object.keys(values).find(key => {
            let aVal = remDiacritice(getProdusVal(produs, key));
            
            if (values[key].minValue !== undefined) {
                return parseFloat(aVal) < values[key].minValue || parseFloat(aVal) > values[key].maxValue;
            }

            if (values[key].isSelect) {
                return aVal != values[key].value && values[key].value != "oricare";
            }

            if (values[key].isMultiselect) {
                return !values[key].value.find(el => aVal.split("<br>").includes(el));
            }

            if (typeof values[key].value == "boolean") {
                return (aVal == "da") != values[key].value;
            }

            if (key == "nume") {
                let impart = (values[key].value || "").split("*");
                return !aVal.startsWith(impart[0]) || !aVal.endsWith(impart[1] || "");
            }

            return !aVal.includes(values[key].value) && !values[key].value.includes(aVal);
        });

        if (!hasInvKey) {
            produs.style.removeProperty("display");
            wasFound = true;
            continue;
        }

        produs.style.display = "none";
    }

    document.getElementById("mesaj-noproduse").style.display = wasFound ? "none" : "block";
    updateNrProduse();
}

/**
 * @param {boolean} ascend Daca sortarea va fi ascendenta.
 * @param {string} col1 Primul parametru de sortare.
 * @param {string} col2 Al doilea parametru de sortare.
 */
function sortareProduse(ascend, col1, col2) {
    var lista = document.getElementById("lista-produse");
    var produse = Array.from(lista.children);
    produse = produse.sort(function(a, b) {
        var fCol1 = remDiacritice(getProdusVal(a, col1));
        var sCol1 = remDiacritice(getProdusVal(b, col1));

        var fCol2 = remDiacritice(getProdusVal(a, col2));
        var sCol2 = remDiacritice(getProdusVal(b, col2));

        if (![fCol1, sCol1].find(el => isNaN(el))) {
            fCol1 = parseFloat(fCol1);
            sCol1 = parseFloat(sCol1);
        }

        if (![fCol2, sCol2].find(el => isNaN(el))) {
            fCol2 = parseFloat(fCol2);
            sCol2 = parseFloat(sCol2);
        }

        if (fCol1 < sCol1) {
            return ascend ? -1 : 1;
        }
        if (fCol1 > sCol1) {
            return ascend ? 1 : -1;
        }
        if (fCol1 === sCol1) {
            if (fCol2 < sCol2) {
                return ascend ? -1 : 1;
            }
            if (fCol2 > sCol2) {
                return ascend ? 1 : -1;
            }
        }
        return 0;
    });

    while (lista.firstChild) {
        lista.removeChild(lista.firstChild);
    }

    produse.forEach(produs => {
        lista.appendChild(produs);
    });
}

function calculAfisare() {
    if (document.getElementsByClassName("popup-calcul").length > 0)
        return;
    var products = document.getElementById("lista-produse").children;
    var preturi = [];
    for (var i = 0; i < products.length; i++) {
        var pret = parseInt(getProdusVal(products[i], "pret").replace(" RON", ""));
        preturi.push(pret);
    }

    var medie = Math.floor(preturi.reduce((a, b) => a + b, 0) / preturi.length);

    var rezultatDiv = document.createElement("div");
    rezultatDiv.classList = "popup-calcul";
    rezultatDiv.innerHTML = `Pret mediu: ${medie} RON`;
    document.body.appendChild(rezultatDiv);

    setTimeout(() => {
        rezultatDiv.remove();
    }, 2000);
}

/**
 * Genereaza doua inputuri de tip range pentru minim si maxim pentru o cheie anume.
 * @param {string} key 
 * @param {number} minVal
 * @param {number} maxVal
 * @return {string}
 */
function generareCodRange(key, minVal, maxVal) {
    return [true, false].map(el => {
        return `
        <div>
            <label for="inp-${key}-${el ? "min" : "max"}">${cosmetizareString(key)} ${el ? "minim" : "maxim"}</label>
            <br>
            <span>${minVal}</span>
            <input class="form-range" type="range" id="inp-${key}-${el ? "min" : "max"}" name="inp-${key}-${el ? "min" : "max"}" value="${el ? minVal : maxVal}" min="${minVal}" max="${maxVal}">
            <span>${maxVal} (<span id="val-${key}-${el ? "min" : "max"}">${el ? minVal : maxVal}</span>)</span>
        </div>
        `;
    }).join("\n");
}

/**
 * @param {string} txt 
 * @returns {string}
 */
function cosmetizareString(txt) {
    let text = txt.replaceAll("_", " ").trim();
    return `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase()}`;
}

/**
 * @param {*} filtru 
 * @param {string[]?} valori
 * @returns {string}
 */
function genereazaInput(filtru, valori) {
    if (filtru.enum_values) {
        let isMultiselect = filtru.udt_name.startsWith("_");
        return `
            <select name="inp-${filtru.column_name}" ${isMultiselect ? "multiple" : ""} id="inp-${filtru.column_name}">
                ${isMultiselect ? '' : '<option selected value="oricare">Oricare</option>'}
                ${filtru.enum_values.map(val => {
                    return `<option value="${val}" ${isMultiselect ? "selected" : ""}>${cosmetizareString(val)}</option>`;
                }).join("\n")}
            </select>
        `;
    }

    switch(filtru.udt_name) {
        case "_text": {
            return `
                <input id="inp-${filtru.column_name}" name="inp-${filtru.column_name}" list="values-${filtru.column_name}"/>
                <datalist id="values-${filtru.column_name}">
                    ${valori.map(el => {
                        return `<option value=${el}></option>`
                    })}
                </datalist>
            `;
        }

        case "bool": {
            return `
                <input class="form-check-input" type="checkbox" id='inp-${filtru.column_name}' checked>
            `;
        }

        default: {
            return `<input type="text" name="inp-${filtru.column_name}" id="inp-${filtru.column_name}"/>`;
        }
    }
}

/**
 * @param {{column_name: string, udt_name: string, minValue: number?, maxValue: number?, enum_values: string[]?}[]} filtre
 * @param {{[char: string]: any}[]} produse
 */
function generareFiltre(filtre, produse) {
    const isRange = (el) => el.udt_name.includes("int") && !['id', 'nr_imagini'].includes(el.column_name);
    let docFiltre = document.getElementById("filtre");
    docFiltre.innerHTML += `
        <div class="btn-group btn-group-toggle" data-toggle="buttons">
            ${filtre.find(el => el.column_name == "categorie").enum_values.map(el => 
                `<label class="btn buton-categorie">
                    <input class="form-check-input" type="radio" name="categorie" value="${el}"> ${cosmetizareString(el)}
                </label>`
            ).join("\n")}
            <label class="btn buton-categorie">
                <input class="form-check-input" type="radio" name="categorie" value="oricare" checked> Oricare
            </label>
        </div>
        <div class='container display-inline-block'>
            <div class='row'>
                <div class='col-xl-4'>
                    ${filtre.filter(isRange).
                    map(el => generareCodRange(el.column_name, el.minValue, el.maxValue)).join("\n")}
                </div>
                <div class='col-xl-7'>
                    ${filtre.filter(el => {
                        return !el.udt_name.includes("int") && !['descriere', 'data_adaugare', 'imagine', 'categorie'].includes(el.column_name)
                    }).map(filtru => `
                        <label for="inp-${filtru.column_name}">${cosmetizareString(filtru.column_name)}</label><br>` + 
                        genereazaInput(filtru, produse.map(el => el[filtru.column_name]).flat())).join("<br>")}
                    <div class="form-floating w-50">
                        <textarea class="form-control" placeholder="Leave a comment here" id="inp-descriere"></textarea>
                        <label for="inp-descriere">Descriere</label>
                        <div class="invalid-feedback">
                            Descrierea nu poate contine caractere speciale.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <h1>Sortare</h1>
            ${[0,1].map(ind => 
                `
                <select name="sort-${ind}" id="sort-${ind}">
                    ${filtre.filter(filtru => !['data_adaugare', 'imagine', 'categorie', 'specificatii', 'id'].includes(filtru.column_name)).map(filtru => 
                        `<option value="${filtru.column_name}" ${filtru.column_name == ['id', 'nume'][ind] ? "selected" : ""}>${cosmetizareString(filtru.column_name)}</option>`
                    ).join("\n")}
                </select>
                `
            ).join("\n")}
            <label>
                <input class="form-check-input" type="checkbox" id='sort-directie' checked> Ascendent
            </label>
        </div>
    `;
    filtre.filter(isRange).forEach(el => {
        ['min', 'max'].forEach(key => {
            const inpPret = document.getElementById(`inp-${el.column_name}-${key}`);
            const valPret = document.getElementById(`val-${el.column_name}-${key}`);
            inpPret.oninput = () => {
                valPret.innerHTML = inpPret.value;
            }
        });
    });
}

function generareCatalog(produse) {
    let listaProduse = document.getElementById("lista-produse");
    listaProduse.innerHTML = produse.map(produs => {
        produs.data_adaugare = new Date(produs.data_adaugare);
        return `
        <article class="${produs.categorie}" title="${produs.descriere}" id="art-${produs.id}">
            <h4 class="val-nume">${produs.nume}</h4>
            <p class="val-categorie">${cosmetizareString(produs.categorie)}</p>
            <img src="/resurse/imagini/produse/${produs.imagine}.png"/>
            <div class="accordion" id="acordeon-<%= produs.id %>">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#descriere-<%= produs.id %>" aria-expanded="true" aria-controls="descriere-<%= produs.id %>">
                            Descriere
                        </button>
                    </h2>
                    <div id="descriere-<%= produs.id %>" class="accordion-collapse collapse show" data-bs-parent="#acordeon-<%= produs.id %>">
                        <div class="accordion-body">
                            <span class='val-descriere'>${produs.descriere}</span>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#specs-<%= produs.id %>" aria-expanded="true" aria-controls="specs-<%= produs.id %>">
                            Specificatii
                        </button>
                    </h2>
                    <div id="specs-<%= produs.id %>" class="accordion-collapse collapse show" data-bs-parent="#acordeon-<%= produs.id %>">
                        <div class="accordion-body">
                            <table>
                                <tr>
                                    <td>Pret</td>
                                    <td><span class="val-pret">${produs.pret}</span> RON</td>
                                </tr>
                                <tr>
                                    <td>Pret configurare</td>
                                    <td><span class="val-pret_configurare">${produs.pret_configurare}</span> RON</td>
                                </tr>
                                <tr>
                                    <td>Datacenter</td>
                                    <td class="val-datacenter">${produs.datacenter}</td>
                                </tr>
                                <tr>
                                    <td>Disponibil</td>
                                    <td class="val-disponibil">${produs.disponibil ? "Da" : "Nu" }</td>
                                </tr>
                                <tr>
                                    <td>Data adaugare</td>
                                    <td>
                                        <time>
                                            ${produs.data_adaugare.getUTCDate()}/${produs.data_adaugare.toLocaleDateString("ro-RO", {month: "long"})}/${produs.data_adaugare.getUTCFullYear()} 
                                            (${produs.data_adaugare.toLocaleDateString("ro-RO", {weekday: "long"})})
                                        </time>
                                    </td>
                                </tr>
                                ${produs.specificatii.length > 0 ? 
                                `<tr>
                                    <td>Specificatii</td>
                                    <td class="val-specificatii">
                                        ${produs.specificatii.map(spec => spec.substring(1, spec.length - 1)).join("<br>")}
                                    </td>
                                </tr>
                                ` : ""}
                                <tr>
                                    <td>Abonamente</td>
                                    <td class="val-abonamente">${produs.abonamente.map(ab => cosmetizareString(ab)).join("<br>")}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </article>
        `;
    }).join("\n");
    document.getElementById("mesaj-noproduse").style.display = produse.length > 0 ? "none" : "block";
}

/**
 * Pentru task-ul cu invalidarea descrierii. Daca descrierea contine caractere speciale devine invalida.
 * @returns {boolean} Returneaza true daca textul este invalid.
 */
function invalidareDescriere() {
    let descriere = document.getElementById("inp-descriere");
    if ("#+_'`[]{}".split("").find(char => descriere.value.includes(char))) {
        descriere.classList.add("is-invalid");
        return true;
    } else 
        descriere.classList.remove("is-invalid");
    return false;
}

/**
 * Pentru task-ul cu mesaj la filtrare cu inputuri invalide. 
 * @returns {boolean} Returneaza true daca exista input range de minim cu valoare mai mare decat de maxim pentru aceeasi coloana.
 */
function invalidareRange() {
    let elements = Array.from(document.querySelectorAll('[id^="inp-"]')).filter(el => el.id.endsWith('-min'));
    let wasFound = false;
    for (let i = 0; i < elements.length; i++) {
        let id = elements[i].id;
        if (elements[i].value > document.getElementById(id.substring(0, id.length - 4) + "-max").value) {
            wasFound = true;
        }
    }

    return wasFound;
}

/**
 * @param {number} pagina Indicele paginii curente, incepe de la 0.
 * @param {number} nrPagini Numarul de pagini.
 */
function generareListaPagini(pagina, nrPagini) {
    let pagini = document.getElementById("pagini-produse");
    pagini.innerHTML = "<button type='button' class='btn-pagina btn btn-primary btn-lg'>1</button>";
    if (pagina > 1)
        pagini.innerHTML += `<button type='button' class='btn-pagina btn btn-primary btn-lg'>${pagina}</button>`;
    if (pagina > 0 && pagini < nrPagini - 1)
        pagini.innerHTML += `<button type='button' class='btn-pagina btn btn-primary btn-lg'>${pagina+1}</button>`;
    if (pagina + 1 < nrPagini - 1)
        pagini.innerHTML += `<button type='button' class='btn-pagina btn btn-primary btn-lg'>${pagina+2}</button>`;
    if (nrPagini > 1)
        pagini.innerHTML += `<button type='button' class='btn-pagina btn btn-primary btn-lg'>${nrPagini}</button>`;
    Array.from(pagini.getElementsByClassName("btn-pagina")).forEach(element => {
        element.onclick = () => {fetchFiltrat(parseInt(element.innerHTML) - 1)};
    });
}

/**
 * @param {number?} pagina Indicele paginii dupa filtrare, incepe de la 0.
 */
async function fetchFiltrat(pagina) {
    let values = {};
    document.querySelectorAll('[id^="inp-"]').forEach(element => {
        let val = element.type == "checkbox" ? (element.checked ? "true" : "false") : remDiacritice(element.value);

        if (element.tagName == "SELECT" && element.hasAttribute("multiple")) {
            let selected = Array.from(element.selectedOptions).map(el => el.value);
            if (selected.length > 0)
                values[element.id.substring(4)] = selected;
        }
        else if ((element.tagName != "SELECT" && val != "") || (element.tagName == "SELECT" && element.value != "oricare"))
            values[element.id.substring(4)] = val;
    });

    let radCategorie = document.getElementsByName("categorie");
    for (let rad of radCategorie) {
        if (rad.checked) {
            if (rad.value != "oricare")
                values["categorie"] = rad.value;
            break;
        }
    }
    [0,1].forEach(ind => {
        values[`sort-col${ind}`] = document.getElementById(`sort-${ind}`).value;
    });

    if (pagina !== undefined)
        values["page"] = pagina;
    let data = await (await fetch(`/api/produse?${new URLSearchParams(values).toString()}`)).json();
    generareCatalog(data.produse);
    generareListaPagini(data.pagina, data.nr_pagini);
    updateNrProduse();
}

window.addEventListener("load", async () => {
    let data = await (await fetch("/api/produse")).json();
    generareFiltre(data.filtre, data.produse);
    generareListaPagini(data.pagina, data.nr_pagini);

    [...document.querySelectorAll('[id^="inp-"]'), ...document.querySelectorAll('[name="categorie"]')].forEach(el => el.onchange = aplicaFiltrare);
    
    document.getElementById("filtrare").onclick = () => {
        if (invalidareDescriere() || invalidareRange()) {
            alert("Exista filtre cu valori invalide.");
            return;
        }

        fetchFiltrat();
    };
    document.getElementById("resetare").onclick = () => {
        if (confirm("Sunteti sigur ca doriti sa resetati filtrele?") == true)
            resetareFiltre();
    }
    document.getElementById("calcul").onclick = calculAfisare;
    document.getElementById("sortare").onclick = () => {
        let directie = document.getElementById("sort-directie").checked;
        let sort1 = document.getElementById("sort-0").value;
        let sort2 = document.getElementById("sort-1").value;
        sortareProduse(directie, sort1, sort2);
    };
    document.getElementById("inp-descriere").oninput = invalidareDescriere;
});