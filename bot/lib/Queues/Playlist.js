const Bull = require("./ModifiedBull")
const { playAudio } = require("../player")

const playlist = new Bull("playlistQueue")

const nextTrack = () => {
    const firstNode = playlist._jobs[0]
    playAudio(firstNode.filename)
    playlist._jobs.push(firstNode)
    playlist._jobs.shift()
}

playlist.process(({ data }) => {
    setTimeout(() => {
        const { filename } = data
        if(!filename) return
        playAudio(filename)
        playlist.add({ filename })
    }, 2000)
})

module.exports = { playlist, nextTrack }