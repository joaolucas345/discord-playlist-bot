const Bull = require("./ModifiedBull")

const playlist = new Bull("playlistQueue")

const nextTrack = (playAudio, message, song) => {
    let firstNode = { filename: "" }, playListLength = playlist._jobs.length, timesRan = 0
    if(song) {
        while(firstNode.filename !== song && playListLength > timesRan - 1) {
            timesRan += 1
            firstNode = playlist._jobs[0]
            playlist._jobs.push(firstNode)
            playlist._jobs.shift()
        } 
        if(playListLength < timesRan) {
            message.reply(`song "${song}" not found`)
            return
        } else {
            message.reply(`playing ${song} for you`)
        }
    } else {
        firstNode = playlist._jobs[0]
        playlist._jobs.push(firstNode)
        playlist._jobs.shift()
    }
    playAudio(firstNode.filename, message)
}

// playlist.process(({ data }) => {
//     setTimeout(() => {
//         const { filename } = data
//         if(!filename) return
//         playAudio(filename)
//         playlist.add({ filename })
//     }, 2000)
// })

function showSong() {
    return playlist._jobs.map(job => job.filename)
}

module.exports = { playlist, nextTrack, showSong }