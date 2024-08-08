const express = require('express');
const router = express.Router();
const books = require('../controllers/books.controller');

router.get('/', books.get);

module.exports = router;