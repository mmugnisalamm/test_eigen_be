const Pool = require('pg').Pool;
const config = require('../configs/db.config');
const pool = new Pool(config);

pool.connect((err) => {
    if (err) {
        console.error('Gagal terkoneksi dengan database:', err);
    } else {
        console.log('Koneksi database berhasil!');
    }
});

async function getDataMembers() {
    const client = await pool.connect();
    try {
        return new Promise((resolve, reject) => {
            client.query('SELECT * FROM members ORDER BY id ASC', (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results);
            });
        });
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    getDataMembers,
};