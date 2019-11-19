var express = require("express");
var router = express.Router();
var PeraturanRoute = require("./peraturan");
var SseRoute = require("./sse.js");

/* GET users listing. */
router.use("/peraturan", PeraturanRoute);
router.use("/sse", SseRoute);

module.exports = router;
