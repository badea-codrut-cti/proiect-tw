const AccesBD=require('./accesbd.js');
const parole=require('./parole.js');

const { RolFactory, Rol } =require('./roluri.js');
const crypto=require("crypto");
const nodemailer=require("nodemailer");

const fs = require("fs");
const path = require("path");

class Utilizator {
    static tipConexiune = "local";
    static tabel = "utilizatori";
    static emailServer = process.env.EMAIL_ADDRESS;
    static lungimeCod = 80;
    static numeDomeniu = process.env.DOMAIN_NAME;

    /**
     * @typedef {object} ParametriUtilizator
     * @property {number} id
     * @property {string} username
     * @property {string} nume
     * @property {string} prenume
     * @property {string} email
     * @property {string} parola Parola hashed si salted.
     * @property {string} culoare_chat Cod HEX fara hashtag al culorii in chat.
     * @property {string} ocupatie
     * @property {Date} data_nasterii
     * @property {string} cod_confirmare Folosit la verificarea adresei e-mail.
     * @property {("comun" | "moderator" | "admin") | Rol} rol
     * @property {string} poza Calea catre poza.
     */

    /**
     * @param {ParametriUtilizator} user 
     */
    constructor(user = {}) {
        this.id = user.id;

        if(this.checkUsername(user.username))
            this.username = user.username;
        else 
            throw new Error("Username incorect.");

        for(let prop in user) {
            this[prop] = user[prop];
        }

        if(this.rol)
            this.rol = this.rol.cod ? RolFactory.creeazaRol(this.rol.cod) : 
            RolFactory.creeazaRol(this.rol);
    }

    /**
     * Verifica daca numele este formatat corect.
     * @param {string} nume 
     * @returns {boolean}
     */
    checkName(nume) {
        return nume != "" && nume.match(new RegExp("^[A-Z][a-z]+$"));
    }

    /**
     * @param {string} nume
     */
    set setareNume(nume) {
        if (this.checkName(nume)) 
            this.nume = nume;
        else
            throw new Error("Nume gresit.");
    }

    /*
    * Folosit doar la inregistrare si modificare profil.
    */
    set setareUsername(username) {
        if (this.checkUsername(username)) 
            this.username=username;
        else 
            throw new Error("Username gresit");
    }

    /**
     * @param {string} username 
     * @returns {boolean}
     */
    checkUsername(username) {
        return username != "" && username.match(new RegExp("^[A-Za-z0-9#_./]+$")) ;
    }

    /**
     * @param {string} password
     * @param {string} salt
     * @returns {string} SHA256 hash
     */
    static hashSaltPassword(password, salt) {
        const saltedPassword = salt + password + salt;
        return crypto.createHash('sha256').update(saltedPassword).digest('hex');
    }

    /**
     * @param {ParametriUtilizator} param 
     * @param {(err: Error?) => void} callback
     */
    modifica(param, callback) {
        Utilizator.getByUsername(this.username, (err, usr) => {
            if (err)
                callback(err);

            AccesBD.getInstanta(Utilizator.tipConexiune).update({
                tabel: Utilizator.tabel,
                valori: param,
                conditii: [
                    {
                        conditii: `username='${this.username}'`
                    }
                ]
            }, (err, res) => {
                if (err) {
                    callback(err);
                    return;
                }

                if (res.rowCount == 0) {
                    callback(new Error("Nu a fost modificat utilizatorul."));
                    return;
                }

                for(let prop in parm) {
                    this[prop] = param[prop];
                }
        
                if(this.rol)
                    this.rol = this.rol.cod ? RolFactory.creeazaRol(this.rol.cod) : 
                    RolFactory.creeazaRol(this.rol);
                
                callback(null);
            });
        });
    }

    /**
     * Sterge utilizatorul curent din baza de date.
     * @param {(err: Error?) => void} callback 
     */
    sterge(callback) {
        AccesBD.getInstanta(Utilizator.tipConexiune).delete({
            tabel: Utilizator.tabel,
            conditii: [
                {
                    conditii: [ `username='${this.username}'` ],
                    operator: "AND"
                }
            ]
        }, (err, res) => {
            if (err) {
                return callback(err);
            }
            try {
                fs.rmSync(path.join(path.dirname(require.main.filename), "poze_uploadate", this.username), {
                    recursive: true
                });
            } catch(e) {
                // In caz ca directorul nu exista.
            }
            return callback(null);
        });
    }

    /**
     * Cauta un utilizator cu proprietati egale cu cele precizate.
     * @param {ParametriUtilizator} param 
     * @param {((err: Error, usr: null) => void) | ((err: null, usr: Utilizator[]) => void)} callback 
     */
    static cauta(param, callback) {
        AccesBD.getInstanta(Utilizator.tipConexiune).select({
            tabel: Utilizator.tabel,
            coloane: ["*"],
            conditii: [
                {
                    conditii: Object.keys(param).map(key => `${key}='${param[key]}'`),
                    operator: "AND"
                }
            ]
        }, (err, rows) => {
            if (err) {
                return callback(err, null);
            }

            callback(null, rows.rows.map(el => new Utilizator(el)));
        })
    }

    /**
     * @param {ParametriUtilizator} param 
     * @returns {Promise<Error | Utilizator[]>}
     */
    static cautaAsync(param) {
        return new Promise((res, rej) => {
            Utilizator.cauta(param, (err, usr) => {
                if (err) {
                    rej(err);
                    return;
                }

                res(usr);
            })
        });
    }

    salvareUtilizator() {
        let hashParola = Utilizator.hashSaltPassword(this.parola, this.username);
        let utiliz = this;
        let token = parole.genereazaToken(Utilizator.lungimeCod);
        AccesBD.getInstanta(Utilizator.tipConexiune).insert({
            tabel:Utilizator.tabel,
            valori: [
                {
                    username: this.username,
                    nume: this.nume,
                    prenume: this.prenume,
                    parola: hashParola,
                    email: this.email,
                    cod_confirmare: token,
                    culoare_chat: this.culoare_chat,
                    data_nasterii: this.data_nasterii
                }
            ]
        }, function(err, rez) {
            if (err) {
                console.log(err);
                return;
            }

            let now = new Date();
            let token1 = `${now.getFullYear()}${now.getMonth()}${now.getDay()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;

            utiliz.trimiteMail(
                "Mesaj inregistrare",
                `Pe Lighthosting ai numele ${utiliz.username}`,
                `
                <p>Pe Lighthosting ai username-ul ${utiliz.username}, incepand de azi, 
                <span style='color: purple; text-decoration: underline'>${new Date().toLocaleDateString("ro-RO")}</span></p> 
                <p>
                    <a href='http://${Utilizator.numeDomeniu}/confirmare_mail/${token1}/${utiliz.username}/${token}'>
                        Click aici pentru confirmare
                    </a>
                </p>`,
            );
        });
    }

    /**
     * Trimite un e-mail catre adresa utilizatorului.
     * @param {string} subiect 
     * @param {string} mesajText 
     * @param {string} mesajHtml 
     * @param {string[]} atasamente 
     */
    async trimiteMail(subiect, mesajText, mesajHtml, atasamente=[]) {
        var transp = nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth:{
                user: Utilizator.emailServer,
                pass: process.env.EMAIL_PASSWORD
            },
            tls:{
                rejectUnauthorized:false
            }
        });

        await transp.sendMail({
            from: Utilizator.emailServer,
            to: this.email, 
            subject: subiect,
            text: mesajText, 
            html: mesajHtml,
            attachments: atasamente
        });
    }
   
    /**
     * @param {string} username 
     * @returns {Promise<Utilizator | null>}
     */
    static async getByUsernameAsync(username) {
        if (!username) 
            return null;

        return new Promise((res, rej) => {
            this.getByUsername(username, (err, usr) => {
                res(usr);
            })
        });
    }

    /**
     * @param {string} username 
     * @param {(err: Error, usr: null) => void | (err: null, usr: Utilizator) => void} callback 
     * @returns {void}
     */
    static getByUsername(username, callback) {
        if (!username) 
            return null;
        
        AccesBD.getInstanta(Utilizator.tipConexiune).select({
            tabel: Utilizator.tabel,
            coloane: ['*'],
            conditii: [
                {
                    conditii: [`username='${username}'`],
                    operator: "AND"
                }
            ]
        }, (err, rezSelect) => {
            if (rezSelect.rowCount != 0) {
                let user = new Utilizator(rezSelect.rows[0]);
                callback(null, user);
            } else callback(err || new Error("Nu a fost gasit utilizatorul."), null);
        });
    }

    areDreptul(drept) {
        return this.rol.areDreptul(drept);
    }
}
module.exports = Utilizator;