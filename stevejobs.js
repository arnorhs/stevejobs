/*
 * simple job queue that limits to only one thing running at
 * a time.. (there are just too many modules to choose from)
 */
var xtend = require('xtend');

function SteveJobs(options) {
    if (!(this instanceof SteveJobs)) {
        return new SteveJobs(options);
    }
    this.options = xtend({
        delay: 5000,
        maxRetries: 3,
        workers: 2,
        verbose: false,
        errorHandler: function(err, job) {}
    }, options);

    var sj = this;
    this.errorHandler = function(err, job) {
        sj._logger("Max retries reached on:", job.name, job.data);
        sj._logger("Error: ", err);
        sj.options.errorHandler.call(null, err, job);
    }
    this.jobs = [];
    this.handlers = {};
    this.activeWorkers = 0;
}
module.exports = SteveJobs;

SteveJobs.prototype.addJob = function(name, data) {
    this._logger("Job added to queue:", name, data);
    if (!name || typeof data === 'undefined' || data === null) {
        throw new Error("Job called with no data! " + name + " -> data");
    }
    this.jobs.push({name: name, data: data, retries: 0});
};

SteveJobs.prototype.addHandler = function(name, handler) {
    if (this.handlers[name]) {
        // you really shouldn't ever do this.. ignore
        throw new Error("Re-adding the same handler is not possible: " + name);
        return;
    }

    this.handlers[name] = handler;
}

SteveJobs.prototype._work = function(done) {
    var job = this.jobs.shift();
    if (job) {
        try {
            var handler = this.handlers[job.name];
            if (handler) { // no handler defined for this job type.. ignore.. maybe console out?
                handler.call(null, done, job.data);
            } else {
                this._logger("No handler defined for", job.name);
            }
        } catch (err) {
            // need to do this differently.. possibly by calling a
            // independent error handler
            this._logger("Exception when executing job:", job.name, job.data);
            this._logger(err);
            this._logger(err.stack);
            // maybe... idunno
            if (job.retries < this.options.maxRetries) {
                this._logger("Retrying...");
                job.retries++;
                this.jobs.unshift(job);
                done();
            } else {
                this.errorHandler.call(null, err, job);
                done();
            }
        }
    } else {
        done();
    }
}

SteveJobs.prototype.start = function() {
    for (var i = 0; i < this.options.workers; i++) {
        this._run(i);
    }
}

SteveJobs.prototype._run = function(i) {
    var steveJobs = this;
    steveJobs._logger("Worker #" + i + " running...");
    var now = Date.now();
    this._work(function() {
        steveJobs._logger("Worker #" + i + " done in " + (Date.now() - now) + "ms.");
        // maybe it would be better to use process.nextTick() when the delay is 0
        setTimeout(function() {
            steveJobs._run(i);
        }, steveJobs.options.delay);
    });
};

SteveJobs.prototype._logger = function() {
    if (this.options.verbose) {
        arguments[0] = "-> " + arguments[0];
        console.log.apply(console, arguments);
    }
}
