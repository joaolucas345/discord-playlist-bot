const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const Bull = require("./ModifiedBull")
const path = require("path")
const FFmpeg  = require("fluent-ffmpeg")
FFmpeg.setFfmpegPath(ffmpegPath)
const { playlist } = require("./Playlist")

const verifyQueue = new Bull("verifyFileQueue")
const filesPath = `${__dirname}/../../playlist`

function convertFileToMp3(filename) {
    const editor = FFmpeg({ source: `${filesPath}/${filename}` })
    editor.withNoVideo()
    const pathToSave = `${filesPath}/%changed%-${filename}.mp3`
    editor.saveToFile(pathToSave)
    return pathToSave
}


verifyQueue.process(({ data }) => {
    let filename = data.filename
    if(!filename) return
    if(path.extname(data.filename) !== "mp3") filename = convertFileToMp3(filename)
    playlist.add({ filename })
})


module.exports = { verifyQueue }