const fs = require('fs');
const SoundCloud = require('soundcloud-scraper');
const { keygen } = SoundCloud;

let data = fs.readFileSync(".env", {encoding:'utf8'}).split('=');

keygen()
  .then((key) => {
    data[1] = key;
    fs.writeFileSync(".env", data.join("="))
  })
