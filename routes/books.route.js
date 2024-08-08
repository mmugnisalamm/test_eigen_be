const express = require('express');
const router = express.Router();
const books = require('../controllers/books.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', books.get);

module.exports = router;