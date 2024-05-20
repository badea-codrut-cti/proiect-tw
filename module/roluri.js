const Drepturi = require('./drepturi.js');

class Rol {
    static get tip() { return "generic"; }

    /**
     * @returns {Symbol[]} Lista cu drepturile rolului.
     */
    static get drepturi() { return []; }

    constructor () {
        this.cod = this.constructor.tip;
    }

    /**
     * @param {Symbol} drept 
     * @returns boolean
     */
    areDreptul(drept) { 
        return this.constructor.drepturi.includes(drept); 
    }
}

class RolAdmin extends Rol {
    static get tip() {
        return "admin";
    }

    constructor() {
        super();
    }

    areDreptul() {
        return true; 
    }
};

class RolModerator extends Rol {
    static get tip() {
        return "moderator";
    }

    static get drepturi() { 
        return [
            Drepturi.vizualizareUtilizatori,
            Drepturi.stergereUtilizatori
        ];
    }

    constructor (){
        super()
    }
};

class RolClient extends Rol {
    static get tip() { 
        return "comun"; 
    }

    static get drepturi() { 
        return [
            Drepturi.cumparareProduse
        ];
    }

    constructor () {
        super();
    }
};

class RolFactory {
    /**
     * @param {string} tip 
     * @returns {Rol | null}
     */
    static creeazaRol(tip) {
        switch(tip) {
            case RolAdmin.tip : return new RolAdmin();
            case RolModerator.tip : return new RolModerator();
            case RolClient.tip : return new RolClient();
        }
        return null;
    }
};


module.exports = {
    RolFactory, RolAdmin, RolModerator, RolClient, Rol
};