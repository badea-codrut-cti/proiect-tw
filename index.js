
const express = require("express");
const fs      = require("fs");
const path    = require("path");
const sharp   = require('sharp');
const sass    = require('sass');
const ejs     = require('ejs');
const pg      = require("pg");

var client = new pg.Client({
    database: "cti_2024",
    user:     "codrut",
    password: "bobita",
    host:     "localhost",
    port:     5432
}); 

client.connect();

let globalObj = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css/compilat"),
    folderBackup: path.join(__dirname, "backup")
};

const folders = ["temp", "temp1", "backup"];

folders.forEach(folder => {
    if (!fs.existsSync(folder))
        fs.mkdirSync(folder);
})

function initErori() {
    let errors = JSON.parse(fs.readFileSync(path.join(__dirname, "resurse/json/erori.json").toString("utf-8")).toString());
    errors.info_erori.forEach((el, i) => {
        errors.info_erori[i].imagine = path.join(errors.cale_baza, errors.info_erori[i].imagine);
    });
    errors.eroare_default.imagine = path.join(errors.cale_baza, errors.eroare_default.imagine);
    globalObj.obErori = errors;
}

/**
 * @param {Response} res 
 * @param {number} cod 
 * @param {string} titlu 
 * @param {string} text 
 * @param {string} imagine Calea catre imagine
 */
function handleErrorPage(res, cod, titlu, text, imagine) {
    let err;
    if (cod == null)
        err = globalObj.obErori.eroare_default;
    else 
        err = globalObj.obErori.info_erori.find(el => el.cod == cod) || globalObj.obErori.eroare_default;
    
    err = {
        cod: cod != null ? cod : err.cod,
        status: err.status == true,
        imagine: imagine || err.imagine,
        text: text || err.text,
        titlu: titlu || err.titlu
    };

    if(err.status)
        res.status(err.cod);

    res.render("pagini/eroare", err);
}

/**
 * @param {string} scssPath Path of scss file.
 * @param {string} cssPath Full path of css file.
 */
function compileScss(scssPath, cssPath) {       
    if(!cssPath) {       
        let numeFisExt = path.basename(scssPath);        
        let numeFis = numeFisExt.split(".")[0];      
        cssPath=numeFis+".css";    
    }        
    
    if (!path.isAbsolute(scssPath))        
        scssPath=path.join(globalObj.folderScss, scssPath);

    if (!path.isAbsolute(cssPath))        
        cssPath=path.join(globalObj.folderCss,cssPath);

    let caleBackup=path.join(globalObj.folderBackup, "resurse/css");    
    if (!fs.existsSync(caleBackup)) {        
        fs.mkdirSync(caleBackup, { recursive:true });   
    }        
  
    let numeFisCss=path.basename(cssPath, ".css");
    if (fs.existsSync(cssPath)) {        
        fs.copyFileSync(cssPath, path.join(globalObj.folderBackup, "resurse/css",`${numeFisCss}${Date.now()}.css`));    
    }    

    rez=sass.compile(scssPath, { sourceMap:true });   
    fs.writeFileSync(cssPath,rez.css);    
}

fs.readdirSync(globalObj.folderScss).forEach(el => compileScss(el))
let vFisiere = fs.readdirSync(globalObj.folderScss);

vFisiere.forEach(numeFis => {
    if (path.extname(numeFis) == ".scss") {
        compileScss(numeFis);
    }
});

fs.watch(globalObj.folderScss, function(eveniment, numeFis) {      
    if (eveniment=="change" || eveniment=="rename") {
        let caleCompleta=path.join(globalObj.folderScss, numeFis);        
        if (fs.existsSync(caleCompleta)) {            
            compileScss(caleCompleta);        
        }    
    }
});

function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    globalObj.obImagini=JSON.parse(continut);
    let vImagini=globalObj.obImagini.imagini;

    let caleAbs=path.join(__dirname,globalObj.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,globalObj.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    for (let imag of vImagini) {
        [numeFis, ext]=imag.cale_imagine.split(".");
        let caleFisAbs=path.join(caleAbs, imag.cale_imagine);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/", globalObj.obImagini.cale_galerie, "mediu",numeFis+".webp");
        imag.fisier=path.join("/", globalObj.obImagini.cale_galerie, imag.cale_imagine);
    }
}
initImagini();

initErori();
let app = express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());
 
app.set("view engine","ejs");

app.use(async (req, res, next) => {
    let categorii = await client.query("select * from unnest(enum_range(null::categorie_produs))");
    res.locals["categorie_produs"] = categorii.rows.map(el => el["unnest"]);
    next();
});

app.get(/.*\.ejs$/, (req, res) => {
    handleErrorPage(res, 400, null, "Nu poti solicita cai cu extensia ejs");
})

app.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname+'/resurse/favicon/favicon.ico');
});

app.use("/resurse", express.static(__dirname+"/resurse"));

app.use("/node_modules", express.static(__dirname+"/node_modules"));

app.get(["/", "/index", "/home"], function(req, res) {
    let nrImaginiGalerieAnimata = 7;
    res.render("pagini/index", {
        ipAddress: req.socket.remoteAddress,
        imagini: globalObj.obImagini.imagini.filter(el => {
            let sfert = Math.floor(new Date().getMinutes()/15) + 1;
            return el.sfert_ora == sfert;
        }).filter((_,i) => i < 10),
        galerieAnimata: globalObj.obImagini.imagini.filter((_, i) => i % 2 == 1).filter((_, i) => i < nrImaginiGalerieAnimata)
    });
})

app.get("/produs/:id", (req, res) => {
    if (!isAlphaNum(req.params.id) || isNaN(parseInt(req.params.id)))
        return handleErrorPage(res, 400);

    client.query(`select * from produse where id=${req.params.id}`, function(err, rez){
        if (err) 
            return handleErrorPage(res, 503);

        if (rez.rows.length < 1)
            return handleErrorPage(res, 404, "Produs invalid", "Produsul respectiv nu exista.");    
        
        res.render("pagini/produs", {produs: rez.rows[0]});
    });
});

/**
 * @param {string} str 
 * @returns {boolean} Returns whether the string is purely alphanumerical or not.
 */
function isAlphaNum(str) {
    var regExp = /^[A-Za-z0-9]+$/;
    return regExp.test(str);
}

const pageSize = 9;
/**
 * @param {number} pagina Indicele paginii, incepe de la 0.
 * @param {{[char: string]: any}?} filtre 
 */
async function getProduse(pagina, filtre) {
    if (!filtre)
        filtre = {};

    const offset = pagina * pageSize;
    const columns = (await client.query(`
    SELECT column_name, udt_name, (
        CASE WHEN starts_with(udt_name::text, '_')
        THEN (
            SELECT array_agg(enumlabel)
            FROM pg_enum 
            JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
            WHERE typname = SUBSTR(udt_name, 2, LENGTH(udt_name::text))
        )
        ELSE (
            SELECT array_agg(enumlabel)
            FROM pg_enum 
            JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
            WHERE typname = udt_name
        )
        END
    )::text[] enum_values
    FROM information_schema.columns 
    WHERE table_name = 'produse'`)).rows;

    const filters = Object.keys(filtre)
        .filter(key => 
            columns.find(col => {
                return [key, key.split("-max")[0], key.split("-min")[0]].find(parsedKey => parsedKey == col.column_name) != null
            }) != null
            && isAlphaNum(filtre[key]))
        .map(key => {
            if (key.endsWith("-max")) 
                return `${key.split("-max")[0]} <= '${filtre[key]}'`;
            else if (key.endsWith("-min")) 
                return `${key.split("-min")[0]} >= '${filtre[key]}'`;
            
            return `LOWER(${key}::text) LIKE '%${filtre[key].toLowerCase()}%'`;
        })
        .join(" AND ");
    
    if (!columns.find(el => (filtre["sort-col0"] || "id") == el.column_name) || !columns.find(el => (filtre["sort-col1"] || "id") == el.column_name)) {
        res.write(JSON.stringify({success: false, error: "Invalid sorting columns."}));
        res.statusCode = 400;
        res.end();
        return;
    }

    let quer = (await client.query( `
        SELECT * 
        FROM produse
        ${filters ? `WHERE ${filters}` : ""}
        ORDER BY ${filtre["sort-col0"] || "id"}, ${filtre["sort-col1"] || "nume"} ${(filtre["sort"] || "asc") == "asc" ? "asc" : "desc"}
        LIMIT ${pageSize} OFFSET ${offset}`)).rows;

    columns.forEach(col => {
        if (!col.enum_values || !col.udt_name.startsWith("_"))
            return;

        quer = quer.map(row => {
            let val = row[col.column_name];
            row[col.column_name] = val.substring(1, val.length-1).split(",");
            return row;
        });
    });
    
    const count = (await client.query(`SELECT COUNT(1) AS cnt FROM produse ${filters ? `WHERE ${filters}` : ""}`)).rows[0]["cnt"];
    return {
        produse: quer,
        pagina: pagina,
        nr_pagini: Math.ceil(count / pageSize),
        filtre: await Promise.all(await columns.map(async col => {
            if (!col["udt_name"].includes("int"))
                return col;
            const minMax = (await client.query(`SELECT MIN(${col["column_name"]}) minval, MAX(${col["column_name"]}) maxval FROM produse`)).rows[0];
            return {...col, minValue: minMax["minval"], maxValue: minMax["maxval"]};
        }))
    };
}


app.get("/api/produse", async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 0;

        if (page == NaN) {
            res.write(JSON.stringify({success: false, error: "Invalid sorting columns."}));
            res.statusCode = 400;
            res.end();
            return;
        }

        res.write(JSON.stringify(await getProduse(page, req.query)));
        res.end();
    } catch(err) {
        console.log(err);
        return handleErrorPage(res, 503);
    }
});

app.get("/produse/:categorie?", async(req, res) => {
    if (!isAlphaNum(req.params.categorie))
        return handleErrorPage(res, 400);

    let categorie = req.params.categorie;
    let rezultat = await getProduse(0, categorie ? {categorie} : null);
    res.render("pagini/produse", { 
        produse: rezultat.produse, 
        cosmetizareString: (txt) => {
            return `${txt.charAt(0).toUpperCase()}${txt.slice(1)}`.replaceAll("_", " ");
        } 
    });
});

// trimiterea unui mesaj fix
app.get("/cerere", function(req, res){
    res.send("<b>Hello</b> <span style='color:red'>world!</span>");
})

//trimiterea unui mesaj dinamic
app.get("/data", function(req, res, next){
    res.write("Data: ");
    next();
});
app.get("/data", function(req, res){
    res.write(`${Date.now()}`);
    res.end();

});


app.get("/suma/:a/:b", function(req, res){
    var suma=parseInt(req.params.a)+parseInt(req.params.b);
    res.send(`${suma}`);
}); 
 
  
app.get("/*", function(req, res) {
    if (req.url.endsWith("/"))
        return handleErrorPage(res, 403);
    try {
        res.render(path.join("pagini", req.url), (err, html) => {
            if (err && err.message.startsWith("Failed to lookup view"))
                handleErrorPage(res, 404);
            else if (err)
                handleErrorPage(res);
            
            res.send(html);
        });
    } catch(e) {
        handleErrorPage(res, 404);
    }
});
 
app.listen(8080);
console.log("Serverul a pornit");