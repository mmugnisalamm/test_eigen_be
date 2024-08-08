const express = require('express');
const router = express.Router();
const categories = require('../controllers/members.controller');

router.get('/', categories.get);

module.exports = router;