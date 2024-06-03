const consoane = "bcdfghjklmnpqrstvwxyz";

/**
 * @param {number} len Lungimea token-ului. 
 * @returns {string} Token generat aleator.
 */
function genereazaToken(len) {
    let token="";
    for (let i=0; i<len; i++) {
        token+= consoane[Math.floor(Math.random()*consoane.length)];
    }
    return token;
}

module.exports = { genereazaToken };