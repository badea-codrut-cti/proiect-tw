const express    = require("express");
const fs         = require("fs");
const path       = require("path");
const sharp      = require('sharp');
const sass       = require('sass');
const ejs        = require('ejs');
const pg         = require("pg");
const session    = require("express-session");
const formidable = require("formidable");

require('dotenv').config();

const Utilizator = require("./module/utilizator");
const AccesBD = require("./module/accesbd");
const { RolFactory } = require("./module/roluri");
const Drepturi = require("./module/drepturi");

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
    folderBackup: path.join(__dirname, "backup"),
    nrImaginiGalerieAnimata: 4
};

const folders = ["temp", "temp1", "backup", "poze_uploadate"];

const intervalDeleteBackup = 1000 * 3600 * 24 * 7;

function deleteOldBackups(dir) {
    const currentTime = Date.now();
    let files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        let stats = fs.statSync(filePath);

        if (stats.isDirectory()) 
            return deleteOldBackups(filePath);
    
        let unds = filePath.split(path.extname(filePath))[0].split("_");
        const backupTime = parseInt(unds[unds.length-1]);

        if (currentTime - backupTime > intervalDeleteBackup) {
            fs.unlinkSync(filePath);
        }
    });
}

setInterval(() => {
    const backupFolder = './backup/';
    deleteOldBackups(backupFolder);
}, intervalDeleteBackup);

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
        fs.copyFileSync(cssPath, path.join(globalObj.folderBackup, "resurse/css",`${numeFisCss}_${Date.now()}.css`));    
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

app.use(
    session({
        secret: process.env.EXPRESS_SESSION_SECRET,
        resave: true,
        saveUninitialized: false
    })
);

app.use("/*",function(req, res, next){
    if (req.session.utilizator) {
        req.utilizator = res.locals.utilizator = new Utilizator(req.session.utilizator);
    }    
    res.locals.mesajSignup = req.session.mesajSignup || "";
    res.locals.mesajProfil = req.session.mesajProfil || "";
    next();
});

/**
 * Verifica daca un fisier, conform extensiei, este o imagine.
 * @param {string} imagePath
 * @returns {boolean}
 */
function validateImage(imagePath) {
    let photoExt = path.extname(imagePath);
    return [".png", ".jpg", ".jpeg", ".webm"].includes(photoExt);
}

app.post("/inregistrare", async (req, res) => {    
    var username;
    var formular = new formidable.IncomingForm();    
    formular.parse(req, async function(err, campuriText, campuriFisier) {    
        var eroare="";    
        let props = ["nume", "username", "email", "parola", "culoare_chat", "data_nasterii"];
        
        if (props.find(el => campuriText[el].length < 1)) {
            return handleErrorPage(res, 400);
        } 

        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(campuriText.email[0])) {
            res.render("pagini/inregistrare", { err: "Eroare: Adresa e-mail invalida." });
            return;
        }


        let utilizNou = new Utilizator({
            nume: campuriText.nume[0],
            prenume: campuriText.prenume[0],
            username: campuriText.username[0],
            email: campuriText.email[0],
            parola: campuriText.parola[0],
            culoare_chat: campuriText.culoare_chat[0].substring(1),
            data_nasterii: campuriText.data_nasterii[0],
            ocupatie: campuriText.ocupatie[0]
        });

        try {                              
            let usr = await Utilizator.getByUsernameAsync(campuriText.username[0]);
            if (!usr) {
                utilizNou.salvareUtilizator();
                res.redirect("/index");
            } else {
                req.session.mesajSignup = "Eroare: Username-ul a fost luat deja.";
                res.redirect("/inregistrare");
            }        
        } catch(e) {              
            req.session.mesajSignup = "Eroare: Eroare interna.";
            res.redirect("/inregistrare");
        }       
    });    

    formular.on("field", (nume, val) => {               
        if(nume=="username")            
            username=val;    
    });

    formular.on("fileBegin", function(nume, fisier) {        
        if (fisier.originalFilename == "")
            return;

        var folderUser = path.join(__dirname, "poze_uploadate", username);  

        if (!fs.existsSync(folderUser)) {
            fs.mkdirSync(folderUser);
        }             
        if (!validateImage(fisier.originalFilename)) {
            req.session.mesajSignup = "Eroare: Fisier invalid.";
            res.redirect("/inregistrare");
            return;
        }

        fisier.filepath = path.join(folderUser, fisier.originalFilename);
    });

    formular.on("file", async(nume, fisier) => {
        try {
            if (!validateImage(fisier.originalFilename)) {
                return;
            }
            await sharp(fisier.filepath).toFile(path.join(path.dirname(fisier.filepath), "pfp.png"));
            fs.rmSync(fisier.filepath);
        } catch(e) {
            req.session.mesajSignup = "Eroare: Imagine invalida.";
            res.redirect("/inregistrare");
            return;
        }
    });
});

app.get(["/inregistrare", "/profil"], async (req, res) => {
    let props = await AccesBD.getInstanta().selectAsync({
        coloane: ["*"],
        tabel: "unnest(enum_range(null::ocupatii))"
    });

    res.render(`pagini/${req.path.substring(1)}`, {
        ocupatii: props.rows.map(el => el["unnest"])
    });
});

app.post("/profil", function(req, res){
    if (!req.session.utilizator) {
        return handleErrorPage(res, 403, "Nu sunteti logat.", "Trebuie sa fiti autentificat pentru a va vizualiza profilul.");
    }

    let username;
    var formular= new formidable.IncomingForm();
    formular.parse(req, (err, campuriText, campuriFile) => {
        let parolaCriptata = Utilizator.hashSaltPassword(campuriText.parola[0], campuriText.username[0]);
        AccesBD.getInstanta().update({
            tabel:"utilizatori",
            valori: {
                nume: campuriText.nume[0],
                prenume: campuriText.prenume[0],
                email: campuriText.email[0],
                culoare_chat: campuriText.culoare_chat[0].substring(1),
                data_nasterii: campuriText.data_nasterii[0],
                ocupatie: campuriText.ocupatie[0]
            },
            conditii: [
                {
                    conditii: [
                        `parola='${parolaCriptata}'`,
                        `username='${campuriText.username[0]}'`
                    ],
                    operator: "AND"
                }
            ]
                
        },          
        (err, rez) => {
            if(err) {
                console.log(err);
                return handleErrorPage(res, 503);
            }

            if (rez.rowCount==0) {
                res.redirect("/profil");
                req.session.mesajProfil = "Update-ul nu s-a realizat. Verificati parola introdusa.";
                return;
            } else {            
                req.session.utilizator.nume = campuriText.nume[0];
                req.session.utilizator.prenume = campuriText.prenume[0];
                req.session.utilizator.email = campuriText.email[0];
                req.session.utilizator.culoare_chat = campuriText.culoare_chat[0].substring(1);
                res.locals.utilizator = req.session.utilizator;
            }
            res.redirect("/profil");
            req.session.mesajProfil = "Update-ul s-a realizat cu succes.";
        });
    });

    formular.on("field", (nume, val) => {               
        if(nume=="username")            
            username=val;    
    });

    formular.on("fileBegin", function(nume, fisier) {    
        if (fisier.originalFilename == "")
            return;
        
        var folderUser = path.join(__dirname, "poze_uploadate", username);  

        if (!fs.existsSync(folderUser)) {
            fs.mkdirSync(folderUser);
        }             


        if (!validateImage(fisier.originalFilename)) {
            res.redirect("/profil");
            req.session.mesajProfil = "Eroare: fisier invalid.";
            return;
        }

        fisier.filepath = path.join(folderUser, fisier.originalFilename);
    });

    formular.on("file", async(nume, fisier) => {
        try {
            if (!validateImage(fisier.originalFilename)) {
                return;
            }
            await sharp(fisier.filepath).toFile(path.join(path.dirname(fisier.filepath), "pfp.png"));
            fs.rmSync(fisier.filepath);
        } catch(e) {
            res.redirect("/profil");
            req.session.mesajProfil = "Eroare: imagine invalida.";
            return;
        }
    });
});

app.post("/sterge_cont", (req, res) => {
    if (!req.session.utilizator) {
        return handleErrorPage(res, 400);
    }

    var formular= new formidable.IncomingForm();
    formular.parse(req, (err, campuriText, campuriFile) => {
        let username = req.session.utilizator.username;
        let parolaCriptata = Utilizator.hashSaltPassword(campuriText.parola[0], username);

        if (parolaCriptata != req.session.utilizator.parola) {
            res.render("pagini/sterge_cont", {
                mesaj:"Parola introdusa este gresita. Contul nu a fost sters."
            });
        }
        
        let usr = new Utilizator(req.session.utilizator);
        usr.sterge((err) => {
            if (err) {
                console.log(err);
                res.render("pagini/sterge_cont", {
                    mesaj:"Eroare la stergerea contului."
                });
                return;
            }

            let usr = new Utilizator(req.session.utilizator);
            usr.trimiteMail("La revedere.", "Ne pare rau ca ati plecat.", "Ne pare rau ca ati renuntat la serviciile <b>Lighthosting</b>.");
            req.session.destroy();
            res.locals.utilizator = null;
            res.render("pagini/cont_sters");
        });
    });
});

app.get("/cod/:username/:token", (req,res) => {
    AccesBD.getInstanta().update(
        {
            tabel: "utilizatori",
            valori: {
                confirmat_email: true
            },
            conditii: [
                {
                    conditii: [
                        `username='${req.params.username}'`,
                        `cod_confirmare='${req.params.token}'`
                    ],
                    operator: "AND"
                }
            ]
        },
        (err, rezUpdate) => {
            if(err) {
                console.log(err);
                return handleErrorPage(res, 503);
            }

            if (rezUpdate.rowCount == 0)
                return handleErrorPage(res, 404);

            res.render("pagini/confirmare.ejs");
        }
    );
});

app.get("/useri", (req, res) => {
    if (!req.session.utilizator) {
        return handleErrorPage(res, 403);
    }

    let usr = new Utilizator(req.session.utilizator);
    if (usr.rol.cod != "admin") {
        return handleErrorPage(res, 403);
    }

    AccesBD.getInstanta().select({
        tabel: "utilizatori",
        coloane: ["*"]
    }, (err, rows) => {
        if (err) {
            return handleErrorPage(res, 503);
        }
        res.render("pagini/useri.ejs", {
            useri: rows.rows
        });
    });
});

app.get("/api/sterge_user/:id", (req, res) => {
    if (!req.params.id || isNaN(parseInt(req.params.id))) {
        return res.end("{error: 'Invalid ID'}");
    }

    if (!req.session) {
        return res.end("{error: 'Invalid credentials.'}");
    }

    let rol = RolFactory.creeazaRol(req.session.utilizator.rol.cod);
    if (!rol.areDreptul(Drepturi.stergereUtilizatori)) {
        return res.end("{error: 'Invalid credentials.'}");
    }

    Utilizator.cauta({
        id: req.params.id
    }, (err, usrs) => {
        if (err) {
            console.log(err);
            return res.end("{error: 'Internal server error.'}");
        }

        if (usrs.length < 1) {
            return res.end("{error: 'Invalid uid'}");
        }

        if (usrs[0].rol.cod == "admin") {
            return res.end("{error: 'Invalid permissions'}");
        }

        usrs[0].sterge((err) => {
            if (err) {
                return res.end("{error: 'Internal server error.'}");
            }

            usrs[0].trimiteMail("Ati fost sters.", "Cu sinceră părere de rău, vă anunțăm că ați fost șters! Adio.");
            res.end("{success: true}");
        });
    });
});

app.post("/login", async (req, res) => {
    var username;
    var formular= new formidable.IncomingForm();

    formular.parse(req, async(err, campuriText, campuriFisier) => {
        let usr = await Utilizator.getByUsernameAsync(campuriText.username[0]);
        if (!usr) {
            req.session.mesajLogin = "Date logare incorecte";
            res.redirect("/index");
            return;
        }
        if (usr.parola != Utilizator.hashSaltPassword(campuriText.parola[0], campuriText.username[0])) {
            req.session.mesajLogin = "Date logare incorecte";
            res.redirect("/index");
            return;
        }
        if (!usr.confirmat_email) {
            req.session.mesajLogin = "Mail neconfirmat.";
            res.redirect("/index");
            return;
        }

        usr.poza = usr.poza ? path.join("poze_uploadate", usr.username, "pfp.png") : "";
        req.session.utilizator = usr;               
        res.redirect("/index");
    });
});

app.get("/logout", function(req, res){
    req.session.destroy();
    res.locals.utilizator = null;
    res.render("pagini/logout");
});

app.get("/resurse/css/compilat/galerie_animata.css",function(req, res) {
    var sirScss = fs.readFileSync(path.join(__dirname,"resurse/scss_ejs/galerie_animata.scss")).toString("utf8");
    rezScss = ejs.render(sirScss,{nr_imagini: globalObj.nrImaginiGalerieAnimata});
    var caleScss = path.join(__dirname,"temp/galerie_animata.scss");
    fs.writeFileSync(caleScss,rezScss);

    try {
        rezCompilare = sass.compile(caleScss,{sourceMap:true});
        
        var caleCss = path.join(__dirname,"temp/galerie_animata.css");
        fs.writeFileSync(caleCss,rezCompilare.css);
        res.setHeader("Content-Type","text/css");
        res.sendFile(caleCss);
    }
    catch (err) {
        console.log(err);
        res.send("Eroare");
    }
});

app.get(/.*\.ejs$/, (req, res) => {
    handleErrorPage(res, 400, null, "Nu poti solicita cai cu extensia ejs");
})

app.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname+'/resurse/favicon/favicon.ico');
});

app.use("/resurse", express.static(__dirname+"/resurse"));
app.use("/poze_uploadate", express.static(__dirname+"/poze_uploadate"));
app.use("/node_modules", express.static(__dirname+"/node_modules"));

app.get(["/", "/index", "/home"], function(req, res) {
    globalObj.nrImaginiGalerieAnimata = Math.min(Math.floor(Math.random() * (globalObj.obImagini.imagini.length / 2 - 5)) + 5, 11);
    res.render("pagini/index", {
        ipAddress: req.socket.remoteAddress,
        imagini: globalObj.obImagini.imagini.filter(el => {
            let sfert = Math.floor(new Date().getMinutes()/15) + 1;
            return el.sfert_ora == sfert;
        }).filter((_,i) => i < 10),
        galerieAnimata: globalObj.obImagini.imagini.filter((_, i) => i % 2 == 1).filter((_, i) => i < globalObj.nrImaginiGalerieAnimata)
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

            let col = columns.find(el => el.column_name == key);
            if (col && col.udt_name.startsWith("_") && col.enum_values) {
                let vals = filtre[key].split(",").filter(el => col.enum_values.includes(el)).map(el => `'${el}'`);
                return `${key}::text[] && ARRAY[${vals.join(",")}]`;
            }
            
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
            else if (err) {
                handleErrorPage(res);
                console.log(err);
            }
            
            res.send(html);
        });
    } catch(e) {
        handleErrorPage(res, 404);
    }
});
 
app.listen(8080);
console.log("Serverul a pornit");