require('dotenv').config()
const SoundCloud = require('soundcloud-scraper')
const fs = require('fs')

const client_id = process.env.CLIENT_ID

if (!client_id) {
  console.log('Please generate client_id')
  process.exit()
}

const Client = new SoundCloud.Client(client_id);

if (!process.argv[2]) {
  console.log('Please add playlist')
  process.exit()
}

const url = process.argv[2]
let folder = url.split('/')
folder = `/home/${process.env.LOGNAME}/Music/` + folder[folder.length - 1]
const songArray = []
let name = ''

if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder, { recursive: true })
}

const playlistParser = process.env.HEROKU_APP + url

fetch(playlistParser)
  .then((response) => response.json())
  .then((playlistObject) => {
    for (track of playlistObject.tracks) {
      songArray.push(track.permalink_url)
    }
    downloadSongs()
  })
  .catch(console.error)

const downloadSongs = async () => {
  if (songArray.length == 0) {
    console.log("All songs downloaded")
    return
  } else {
    Client.getSongInfo(songArray.pop())
      .then(async song => {
        name = `${song.author.name.replace(/\//g, '').replace(/'/g, '').replace(/"/g, '')} - ${song.title.replace(/\//g, '').replace(/'/g, '').replace(/"/g, '')}`
        if (fs.existsSync(folder + '/' + name + '.mp3')) {
          console.log(songArray.length + 1 + " songs left")
          console.log(`'${name}' already exists`)
          downloadSongs()
        } else {
          const stream = await song.downloadProgressive();
          const writer = stream.pipe(fs.createWriteStream(`${folder}/${name}.mp3`));
          writer.on("finish", () => {
            console.log("Finished writing '" + name + "'")
            console.log(songArray.length + 0 + " songs left")
            downloadSongs()
          })
        }
      })
  }
}
