const fs = require("fs")
const { verifyQueue } = require("./Queues/verifyFile")
const path = require("path")

const filenames = fs.readdirSync(`${__dirname}/../playlist`)

const init = async () => {
    for(let y = 0; y < filenames.length; y++) {
        const filename = filenames[y]
        if(!filename.includes("%changed%-")) {
            verifyQueue.add({ filename })
        } else {
            fs.rmSync(`${__dirname}/../playlist/${filename}`)
        }
    }
    require("./player")
}

init()