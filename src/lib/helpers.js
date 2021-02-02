const helpers = {};
const bcrypt = require('bcryptjs');
const passport = require('passport');

helpers.encriptarPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashcifrado = await bcrypt.hash(password, salt);
    return hashcifrado;
};


helpers.comparePaswsorwd = async (password, savedPassword) => {
    try {
        return await bcrypt.compare(password, savedPassword);
    } catch (e) { console.log(e); }
};

module.exports = helpers;
