var express = require('express');
var router = express.Router();
var PeraturanRoute = require("./peraturan");

/* GET users listing. */
router.use('/peraturan', PeraturanRoute);

module.exports = router;