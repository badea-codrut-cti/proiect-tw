
/**
 * @typedef Drepturi
 * @type {Object}
 * @property {Symbol} vizualizareUtilizatori Dreptul de a intra pe pagina cu tabelul de utilizatori.
 * @property {Symbol} stergereUtilizatori Dreptul de a sterge un utilizator.
 * @property {Symbol} cumparareProduse Dreptul de a cumpara produse.
 * @property {Symbol} adaugareProduse Dreptul de a adauga produse.
 * @property {Symbol} stergereProduse Dreptul de a sterge produse.
 * @property {Symbol} vizualizareGrafice Dreptul de a vizualiza graficele de vanzari.
 * @property {Symbol} vizualizareComenzi Dreptul de a vizualiza lista de comenzi.
 */


/**
 * @name module.exports.Drepturi
 * @type Drepturi
 */
const Drepturi = {
	vizualizareUtilizatori: Symbol("vizualizareUtilizatori"),
	stergereUtilizatori: Symbol("stergereUtilizatori"),
	cumparareProduse: Symbol("cumparareProduse"),
	adaugareProduse: Symbol("adaugareProduse"),
	stergereProduse: Symbol("stergereProduse"),
	vizualizareGrafice: Symbol("vizualizareGrafice"),
	vizualizareComenzi: Symbol("vizualizareComenzi")
};

module.exports = Drepturi;