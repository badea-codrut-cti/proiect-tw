const alphaNum = (() => {
    let sirAlphaNum = "";

    let v_intervale=[['a','z'],['A', 'Z'],['0', '9']];

    for (let interval of v_intervale) {
        for(let i=interval[0]; i<=interval[1]; i++)
            sirAlphaNum += i;
    }
    return sirAlphaNum;
})();

/**
 * @param {number} len Lungimea token-ului. 
 * @returns {string} Token generat aleator.
 */
function genereazaToken(len) {
    let token="";
    for (let i=0; i<len; i++) {
        token+= alphaNum[Math.floor(Math.random()*alphaNum.length)];
    }
    return token;
}

module.exports = { genereazaToken };