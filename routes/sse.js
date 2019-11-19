var router = require("express").Router();
var sessions = [];
var sse = require("./../libs/sse");

var SseSession = function(sessions, npwp = "") {
  return { npwp, sessions };
};

router.get("/sessions/list", async function(req, res, next) {
  res.jsend.success(sessions);
});

router.put("/sessions", async function(req, res, next) {
  console.log("Create new session");
  let cookie = await sse.getSession();
  let session = sessions.find(e => e.sessions.includes(cookie[0]));
  if (session) res.jsend.success(session);
  else {
    let newSession = SseSession(cookie);
    sessions.push(newSession);
    res.jsend.success(newSession);
  }
});

router.get("/sessions/captcha/:ses", async function(req, res, next) {
  let session = sessions.find(e => e.sessions.includes(req.params.ses));
  if (session) {
    const Path = require("path");
    let filepath = Path.resolve("images/", session.sessions[0] + ".jpg");
    const Fs = require("fs");
    Fs.exists(filepath, exists => {
      if (exists) res.sendFile(filepath);
      else res.sendStatus(404);
    });
  } else {
    res.sendStatus(404);
  }
});

router.post("/sessions/login/:ses", async function(req, res, next) {
  let session = sessions.find(e => e.sessions.includes(req.params.ses));
  if (session) {
    let npwp = req.body.npwp;
    let pin = req.body.pin;
    let captcha = req.body.captcha;
    try {
      let info = await sse.login({
        npwp,
        pin,
        captcha,
        cookies: session.sessions
      });
      res.jsend.success(info);
    } catch (e) {
      res.jsend.error(e);
    }
  } else {
    res.jsend.fail("Session not found");
  }
});

module.exports = router;
