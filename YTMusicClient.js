const fetch = require('node-fetch')
const fs = require("fs")


fs.readFile("settings.json", (err,settings) => {
    settings = JSON.parse(settings)
    if (process.argv[2] == "skip") {
        console.log("Skipping")
        fetch("http://localhost:" + settings.port + "/skip")
            .then(data => { })
            .catch(err => {
                const server = require("./YTMusicServer")
                console.log("Restarting server")
                server.restart()
            })
    } else if (process.argv[2] == "playpause") {
        console.log("PlayPause")
        fetch("http://localhost:" + settings.port + "/playpause")
            .then(data => { })
            .catch(err => {
                const server = require("./YTMusicServer")
                console.log("Restarting server")
                server.restart()
            })
    } else {
        console.log("Invalid Argument")
    }
})


