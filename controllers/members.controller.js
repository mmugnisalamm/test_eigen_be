const categories = require('../services/members.service');

async function get(req, res, next) {
    try {
        let dataCategories = await categories.getDataMembers();
        if (dataCategories.rowCount > 0) {
            return res.status(200).json({success: true, message: "Berhasil ambil data!", data: dataCategories.rows});
        } else {
            return res.status(400).json({success: false, message: "Data kosong!", data: []});
        }
    } catch (error) {
        return res.status(500).json({success: false, message: error.message, data: []});
    }
}

module.exports = {
    get,
}