const books = require('../services/books.service');

async function get(req, res, next) {
    try {
        let dataBooks = await books.getDataBooks(req);
        if (dataBooks.rowCount > 0) {
            return res.status(200).json({success: true, message: "Berhasil ambil data!", data: dataBooks.rows});
        } else {
            return res.status(400).json({success: false, message: "Data kosong!", data: []});
        }
    } catch (error) {
        return res.status(500).json({success: false, message: error.message, data: []});
    }
}

async function post(req, res, next) {
    try {
        let dataBooks = await books.postDataBooks(req);
        console.log(req.body);
        return res.status(200).json({success: true, message: "Berhasil menambah data!", data: dataBooks});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message, data: []});
    }
}

async function patch(req, res, next) {
    try {
        let dataBooks = await books.editDataBooks(req.params.id, req);
        return res.status(200).json({success: true, message: "Berhasil mengubah data!", data: dataBooks});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message, data: []});
    }
}

async function deletes(req, res, next) {
    try {
        let dataBooks = await books.deleteDataBooks(req.params.id);
        return res.status(200).json({success: true, message: "Berhasil menghapus data!", data: dataBooks});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message, data: []});
    }
}

module.exports = {
    get,
}