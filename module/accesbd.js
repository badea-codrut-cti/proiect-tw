const { Client, Pool } = require("pg");


class AccesBD {
    /**
     * @type {AccesBD}
     */
    static #instanta = null;

    /**
     * @type {Client}
     */
    client = null;

    constructor() {
        if(AccesBD.#instanta) {
            throw new Error("Deja a fost instantiat");
        }
    }

    initLocal() {
        this.client = new Client({
            database: "cti_2024",
            user:     "codrut",
            password: "bobita",
            host:     "localhost",
            port:     5432
        });

        return this.client.connect();
    }

    getClient() {
        if(!AccesBD.#instanta) 
            throw new Error("Nu a fost instantiata clasa");
        
        return this.client;
    }

    /**
     * @typedef {object} ObiectConexiune Obiect primit de functiile care realizeaza un query.
     * @property {("init" | "render")} init Tipul de conexiune.
     * /

    /**
     * Returneaza instanta unica a clasei
     *
     * @param {ObiectConexiune} init Un obiect cu datele pentru query.
     * @returns {AccesBD}
     */
    static getInstanta({init="local"}={}) {
        if (!this.#instanta) {
            this.#instanta = new AccesBD();

            switch(init) {
                case "local": {
                    this.#instanta.initLocal(); 
                    break;
                }
                default: {
                    throw new Error("Modul de initializare specificat este invalid.");
                }
            }

        }
        return this.#instanta;
    }


    /**
     * @typedef {object} ConditieQuery
     * @property {string[]} conditii 
     * @property {('AND' | 'OR')} operator 
     */

    /**
     * @callback QueryCallBack
     * @param {Error} err Eventuala eroare in urma operatiei.
     * @param {Object} res Rezultatul query-ului.
     */

    /**
     * @param {ConditieQuery[] | null} cond Lista de conditii.
     * @returns {string} Componenta de cerere `WHERE`.
     */
    conditiiToString(cond) {
        if (!cond || cond.length < 1)
            return "";
        return "WHERE " + cond.map(el => el.conditii.join(el.operator + " ")).join("AND ");
    }

    /**
     * @typedef {object} SelectQuery
     * @property {string} tabel Numele tabelului pe care se face selectia.
     * @property {string []} coloane O lista cu numele coloanelor afisate de query (sau '*').
     * @property {ConditieQuery[]} conditii Lista de conditii pentru selectie.
     */


    /**
     * Selecteaza inregistrari din baza de date.
     * @param {SelectQuery} qSel 
     * @param {QueryCallBack} callback
     */
    select (qSel, callback) {
        let comanda=`SELECT ${qSel.coloane.join(",")} FROM ${qSel.tabel} ${this.conditiiToString(qSel.conditii)}`;
        this.client.query(comanda, callback);
    }

    /**
     * @param {SelectQuery} qSel 
     * @returns {Promise<Object | Error>}
     */
    selectAsync(qSel) {
        return new Promise((res, rej) => {
            this.select(qSel, (err, rows) => {
                if (err)
                    rej(err);
                else res(rows);
            });
        })
    }

    /**
     * @typedef {object} InsertQuery
     * @property {string} tabel
     * @property {object[]} valori Cheile corespund coloanelor.
     */

    /**
     * @param {InsertQuery} qIns
     * @param {QueryCallBack} callback 
     */
    insert(qIns, callback) {
        let cols = new Set();
        qIns.valori.forEach(el => {
            Object.keys(el).forEach(key => cols.add(key)); 
        });

        let comanda = `INSERT INTO ${qIns.tabel} (${Array.from(cols).join(",")}) 
        VALUES ${qIns.valori.map(el => 
            '(' + Array.from(cols).map(col => `'${(el[col] + "").replaceAll("'", "''")}'` || "NULL").join(",") + ')'
        ).join(",")}`;

        this.client.query(comanda, callback);
    }

    /**
     * @typedef {object} UpdateQuery
     * @property {string} tabel
     * @property {object} valori Cheile corespund unor coloane, valorile sunt cele suprascrise.
     * @property {ConditieQuery} conditii
     */


    /**
     * @param {UpdateQuery} qUp 
     * @param {QueryCallBack} callback 
     */
    update(qUp, callback) {
        let comanda = `UPDATE ${qUp.tabel} 
        SET ${Object.keys(qUp.valori).map(key => 
           `${key}='${(qUp.valori[key] + "").replaceAll("'", "''")}'`
        )} ${this.conditiiToString(qUp.conditii)}`;

        this.client.query(comanda, callback);
    }

    /**
     * @typedef {object} DeleteQuery
     * @property {string} tabel
     * @property {ConditieQuery} conditii
     */
    
    /**
     * @param {DeleteQuery} qDel 
     * @param {QueryCallBack} callback 
     */
    delete(qDel, callback) {
        let comanda = `DELETE FROM ${qDel.tabel} ${this.conditiiToString(qDel.conditii)}`;
        this.client.query(comanda,callback);
    }

    query(comanda, callback){
        this.client.query(comanda,callback);
    }
}

module.exports = AccesBD;