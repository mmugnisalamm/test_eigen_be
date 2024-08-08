const Pool = require("pg").Pool;
const config = require("../configs/db.config");
const pool = new Pool(config);
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token tidak ditemukan.' });
    }

    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
        if (err) {
            console.log(token);
            console.log(decoded);
            console.log(process.env.SECRET_KEY);
            console.error('Gagal memverifikasi token:', err);
            return res.status(401).json({ success: false, message: 'Token tidak valid.' });
        }

        try {
            const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);

            if (result.rows.length > 0) {
                req.user = result.rows[0];
                next();
            } else {
                res.status(401).json({ success: false, message: 'Data pengguna tidak ditemukan di database.' });
            }
        } catch (error) {
            console.error('Gagal memeriksa data pengguna di database:', error);
            res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memeriksa data pengguna.' });
        }
    });
}

module.exports = {
    verifyToken
}