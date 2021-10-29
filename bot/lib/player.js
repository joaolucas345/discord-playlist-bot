require("dotenv").config({ path: `${__dirname}/../.env` })

const { Client, Intents } = require("discord.js")
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice")
const { nextTrack, showSong, playlist } = require("./Queues/Playlist")
const { verifyQueue } = require("./Queues/verifyFile")
const request = require("request")
const fs = require("fs")

const discord = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_INTEGRATIONS
] })
let connection,
    isPlaying = false,
    resource, audio

discord.on("ready", () => {
    console.log("ready to go")
})


discord.on("messageCreate", async (message) => {
    if(Array.from(message.attachments).length) {
        for(let i = 0; i < Array.from(message.attachments).length; i++) {
            let [_, { attachment, name }] = Array.from(message.attachments)[i]
            while(name.includes(" ")) name = name.replace(" ", "")
            while(name.includes("_")) name = name.replace("_", "")
            while(name.includes("-")) name = name.replace("-", "")
            await request.get(attachment).pipe(fs.createWriteStream(`${__dirname}/../playlist/${name}`)).on("finish", () => {
                verifyQueue.add({ filename: name })
            })
        }
        message.reply("video saved")
        return
    }
    if(message.content.startsWith(">")) {
        let [command, ...args] = message.content.substring(1).split(" ") 
        if(!command) command = message.content.substring(1)
        if(command == "playsong") {
            connection = joinVoiceChannel({
                guildId: message.member.voice.guild.id,
                channelId: message.member.voice.channelId,
                adapterCreator: message.member.voice.guild.voiceAdapterCreator
            })
            nextTrack(playAudio, message, args[0])
        }
        if(command == "pause") {
            audio?.pause()
        }
        if(command == "play") {
            audio?.unpause()
        }
        if(command == "show") {
            const songs = showSong()
            let messageText = `
These are your songs:

`
            songs.forEach(song => {
                messageText += `${song}\n\n`
            })
            message.channel.send(messageText)
        }
        if(command == "leave") {
            connection?.destroy()
        }

        if(command == "remove") {
            fs.rmSync(`${__dirname}/../playlist/${args[0]}`)
            for(let i = 0; i < playlist._jobs.length; i++) {
                if(playlist._jobs[i].filename == args[0]) { 
                    playlist._jobs.splice(i, 1)
                    if(args[0].includes('%changed%-')) {
                        args[0] = args[0].replace("%changed%-", "")
                        args[0] = args[0].replace(".mp3", "")
                        fs.rmSync(`${__dirname}/../playlist/${args[0]}`)
                    }
                }
            }
            message.reply("removed")
        }
    }
})


discord.login(process.env.DISCORD_BOT_TOKEN)

function playAudio(filename) {
    if(!connection) return 
    const filePath = `${__dirname}/../playlist/${filename}`
    resource = createAudioResource(filePath)
    audio = createAudioPlayer()
    audio.play(resource)
    audio.on(AudioPlayerStatus.Idle, () => {
        isPlaying = false
        nextTrack(playAudio)
    })
    const subscription = connection.subscribe(audio)
}


module.exports = { playAudio }