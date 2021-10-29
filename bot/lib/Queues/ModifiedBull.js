class Bull {
    constructor(queueName) {
        this.isRunning = true
        this.callback = null
        this._jobs = []
        return;
    }


    add(data) {
        this._jobs.push(data)
        if(!this.isRunning && this.callback) {
            this.isRunning = true
            this.process(this.callback)
        }
    }

    async process(callback) {
        this.callback = callback
        if(!this._jobs.length) return this.isRunning = false
        let job = this._jobs[0]
        await callback({ data:job })
        this._jobs.shift()
        if(!this._jobs.length) return this.isRunning = false
        this.process(callback)
    }

}

module.exports = Bull