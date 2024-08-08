const auth = require('../services/auth.service').default;

async function login(req, res, next) {
    try {
        let login = await auth.login(req.body);
        if (login.length > 0) {
            return res.status(200).json({success: true, message: "Berhasil login!", data: login});
        } else {
            return res.status(400).json({success: false, message: "Login gagal!", data: []});
        }
    } catch (error) {
        return res.status(500).json({success: false, message: error.message, data: []});
    }
}

async function register(req, res, next) {
    try {
        let register = await auth.register(req.body);
        if (register.length > 0) {
            return res.status(200).json({success: true, message: "Berhasil register!", data: login});
        } else {
            return res.status(400).json({success: false, message: "Register gagal!", data: []});
        }
    } catch (error) {
        return res.status(500).json({success: false, message: error.message, data: []});
    }
}

module.exports = {
    login,
    register
}