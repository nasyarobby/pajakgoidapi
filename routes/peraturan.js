var express = require('express');
var router = express.Router();
var Pajak = require("./../libs/Pajakgoid");

/* GET users listing. */
router.get('/:page?', async function (req, res, next) {
    let page = req.params.page ? req.params.page : 1;
    let peraturan = await Pajak.getRegulations(page);
    res.jsend.success(peraturan);
});

module.exports = router;