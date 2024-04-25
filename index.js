
const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp=require('sharp');
const sass=require('sass');
const ejs=require('ejs');

const Client = require('pg').Client;

var client= new Client({
    database:"cti_2024",
    user:"codrut",
    password:"bobita",
    host:"localhost",
    port:5432
});

client.connect();

let obGlobal = {
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
    let erori = JSON.parse(fs.readFileSync(path.join(__dirname, "resurse/json/erori.json").toString("utf-8")).toString());
    erori.info_erori.forEach((el, i) => {
        erori.info_erori[i].imagine = path.join(erori.cale_baza, erori.info_erori[i].imagine);
    });
    erori.eroare_default.imagine = path.join(erori.cale_baza, erori.eroare_default.imagine);
    obGlobal.obErori = erori;
}

function afisareEroare(res, cod, titlu, text, imagine) {
    let eroare;
    if (cod == null)
        eroare = obGlobal.obErori.eroare_default;
    else 
        eroare = obGlobal.obErori.info_erori.find(el => el.cod == cod) || obGlobal.obErori.eroare_default;
    
    eroare = {
        cod: cod != null ? cod : eroare.cod,
        status: eroare.status == true,
        imagine: imagine || eroare.imagine,
        text: text || eroare.text,
        titlu: titlu || eroare.titlu
    };

    if(eroare.status)
        res.status(eroare.cod);

    res.render("pagini/eroare", eroare);
}

function compileazaScss(caleScss, caleCss) {       
    if(!caleCss) {       
        let numeFisExt = path.basename(caleScss);        
        let numeFis = numeFisExt.split(".")[0];      
        caleCss=numeFis+".css";    
    }        
    
    if (!path.isAbsolute(caleScss))        
        caleScss=path.join(obGlobal.folderScss, caleScss);

    if (!path.isAbsolute(caleCss))        
        caleCss=path.join(obGlobal.folderCss,caleCss);

    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");    
    if (!fs.existsSync(caleBackup)) {        
        fs.mkdirSync(caleBackup, { recursive:true });   
    }        
  
    let numeFisCss=path.basename(caleCss, ".css");
    if (fs.existsSync(caleCss)) {        
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",`${numeFisCss}${Date.now()}.css`));    
    }    
    rez=sass.compile(caleScss, { sourceMap:true });   
    fs.writeFileSync(caleCss,rez.css);    
}

fs.readdirSync(obGlobal.folderScss).forEach(el => compileazaScss(el))
vFisiere=fs.readdirSync(obGlobal.folderScss);

for( let numeFis of vFisiere ){    
    if (path.extname(numeFis)==".scss") {        
        compileazaScss(numeFis);    
    }
}

fs.watch(obGlobal.folderScss, function(eveniment, numeFis) {      
    if (eveniment=="change" || eveniment=="rename") {
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);        
        if (fs.existsSync(caleCompleta)) {            
            compileazaScss(caleCompleta);        
        }    
    }
});

function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    for (let imag of vImagini) {
        [numeFis, ext]=imag.cale_imagine.split(".");
        let caleFisAbs=path.join(caleAbs, imag.cale_imagine);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.cale_imagine )
        
    }
}
initImagini();

initErori();
app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());
 
app.set("view engine","ejs");

app.get(/.*\.ejs$/, (req, res) => {
    afisareEroare(res, 400, null, "Nu poti solicita cai cu extensia ejs");
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
        imagini: obGlobal.obImagini.imagini.filter(el => {
            let sfert = Math.floor(new Date().getMinutes()/15) + 1;
            return el.sfert_ora == sfert;
        }).filter((_,i) => i < 10),
        galerieAnimata: obGlobal.obImagini.imagini.filter((_, i) => i % 2 == 1).filter((_, i) => i < nrImaginiGalerieAnimata)
    });
})

app.get("/produs/:id", function(req, res) {
    client.query(`select * from produse where id=${req.params.id}`, function(err, rez){
        if (err){
            console.log(err);
            return afisareEroare(res, 503);
        }
        
        res.render("pagini/produs", {produs: rez.rows[0]});
    });
});

app.get("/produse", function(req, res){
    client.query("select * from unnest(enum_range(null::categorie_produs))", function(err, categorii) {
        client.query("select * from unnest(enum_range(null::centru_date))", function(err, centreDate) {
            client.query(`select * from produse`, function(err, rez) {
                if (err) { 
                    console.log(err);
                    return afisareEroare(res, 2);
                }
                let preturi = rez.rows.map(el => parseInt(el["pret"]));
                res.render("pagini/produse", {
                    produse: rez.rows, 
                    categorii: categorii.rows.map(el => el["unnest"]), 
                    pretMaxim: Math.max(...preturi),
                    pretMinim: Math.min(...preturi),
                    centreDate: centreDate.rows.map(el => el["unnest"]),
                });
            });
        });
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
    res.write(""+new Date());
    res.end();

});


app.get("/suma/:a/:b", function(req, res){
    var suma=parseInt(req.params.a)+parseInt(req.params.b)
    res.send(""+suma);
}); 
 
  
app.get("/*", function(req, res) {
    if (req.url.endsWith("/"))
        return afisareEroare(res, 403);
    try {
        res.render(path.join("pagini", req.url), (err, html) => {
            if (err && err.message.startsWith("Failed to lookup view"))
                afisareEroare(res, 404);
            else if (err)
                afisareEroare(res);
            
            res.send(html);
        });
    } catch(e) {
        afisareEroare(res, 404);
    }
});
 
app.listen(8080);
console.log("Serverul a pornit");