const axios = require("axios");
const Fs = require("fs");
const Path = require("path");
const Parser = require("node-html-parser");
let url = "https://sse3.pajak.go.id/loginPage";
let captcha = "https://sse3.pajak.go.id/captcha-image";

function getSession() {
  let cookies;
  return axios
    .get(captcha, {
      responseType: "stream"
    })
    .then(response => {
      cookies = response.headers["set-cookie"].map(c => c.split(";")[0]);
      const path = Path.resolve("images", cookies[0] + ".jpg");
      const writer = Fs.createWriteStream(path);
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    })
    .then(() => {
      console.log(cookies);
      return cookies;
    });
}

function login(input) {
  return axios
    .post(
      "https://sse3.pajak.go.id/loginExe",
      {
        npwp: input.npwp,
        password: input.pin,
        login_status: input.captcha
      },
      {
        headers: {
          Cookie: input.cookies.join(";")
        }
      }
    )
    .then(response => {
      console.log("Status", response.status);
      return axios.get("https://sse3.pajak.go.id/profil", {
        headers: {
          Cookie: input.cookies.join(";")
        }
      });
    })
    .then(response => {
      let html = Parser.parse(response.data);
      let npwp = html.querySelector("#npwp").attributes["value"];
      let nama = html.querySelector("#nama").attributes["value"];
      let email = html.querySelector("#email").attributes["value"];
      if (npwp) return { npwp, nama, email };
      else throw Error("Cannot login.");
    })
    .catch(error => {
      console.log(error.message, error.stack);
      throw error;
    });
}

module.exports = { login, getSession };
