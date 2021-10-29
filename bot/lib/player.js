require("dotenv").config({ path: `${__dirname}/../.env` })

const { Client, Intents } = require("discord.js")
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice")

const discord = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_INTEGRATIONS
] })
let connection,
    isPlaying = false

discord.on("ready", () => {
    console.log("ready to go")
})


discord.on("messageCreate", async (message) => {
    if(message.content.startsWith(">")) {
        if(message.content.substring(1) == "start bot") {
            connection = joinVoiceChannel({
                guildId: message.member.voice.guild.id,
                channelId: message.member.voice.channelId,
                adapterCreator: message.member.voice.guild.voiceAdapterCreator
            })
        }
    }
})


discord.login(process.env.DISCORD_BOT_TOKEN)

function playAudio(filename) {
    if(isPlaying || !connection) return 
    isPlaying = true
    console.log("ran", new Date().toLocaleString())
    const resource = createAudioResource(filename)
    const audio = createAudioPlayer()
    audio.on(AudioPlayerStatus.Idle, () => {
        isPlaying = false
    })
    audio.play(resource)
    const subscription = connection.subscribe(audio)
}


module.exports = { playAudio }