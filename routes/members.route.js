const express = require('express');
const router = express.Router();
const members = require('../controllers/members.controller');

router.get('/', members.get);

module.exports = router;