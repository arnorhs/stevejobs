/*
 * simple job queue that limits to only one thing running at
 * a time.. (there are just too many modules to choose from)
 */
var xtend = require('xtend'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

var logLevel = {
    low: 0,
    medium: 1,
    high: 2
};

function SteveJobs(options) {
    if (!(this instanceof SteveJobs)) {
        return new SteveJobs(options);
    }
    EventEmitter.call(this);
    this.options = xtend({
        delay: 5000,
        maxRetries: 3,
        workers: 2
    }, options);

    this.jobs = [];
    this.handlers = {};
}
module.exports = SteveJobs;
util.inherits(SteveJobs, EventEmitter);

SteveJobs.prototype.addJob = function(name, data) {
    if (!name) {
        throw new Error("Job added with no name!");
    }
    this._logger(logLevel.low, function() {
        return "Job added to queue:" + name + ", data: " + JSON.stringify(data);
    });
    this.jobs.push({name: name, data: data, retries: 0});
};

SteveJobs.prototype.addHandler = function(name, handler) {
    // if set again, will override last one
    this.handlers[name] = handler;
}

SteveJobs.prototype._work = function(done) {
    var job = this.jobs.shift();
    if (!job) {
        return done();
    }

    var handler = this.handlers[job.name];
    if (!handler) { // no handler defined for this job type.. ignore.. maybe console out?
        this._logger(logLevel.low, "No handler defined for: " + job.name);
        return done();
    }

    // Wrap the call to the handler in a try catch block to catch any exception
    // and call the error handler if there is one
    try {
        handler.call(null, done, job.data);
    } catch (err) {
        // we'll retry this job maxRetries times
        if (job.retries < this.options.maxRetries) {
            this._logger(logLevel.medium, "Error in executing job, adding to end of queue...");
            job.retries++;
            this.jobs.push(job);
        } else {
            this._logger(logLevel.high, "Error in executing job, max retries reached");
            this.emit('job_error', err, job);
        }
        done();
    }
};

SteveJobs.prototype.start = function() {
    this.running = true;
    this.timers = {};
    for (var i = 0; i < this.options.workers; i++) {
        this._run(i);
    }
}

SteveJobs.prototype._run = function(i) {
    var steveJobs = this;
    steveJobs._logger(logLevel.low, "Worker #" + i + " running | remaining jobs: " + steveJobs.jobs.length);
    var now = Date.now();
    this._work(function() {
        steveJobs._logger(logLevel.low, "Worker #" + i + " done in " + (Date.now() - now) + "ms.");
        if (!steveJobs.running) return;
        // maybe it would be better to use process.nextTick() when the delay is 0
        steveJobs.timers[i] = setTimeout(function() {
            steveJobs._run(i);
        }, steveJobs.options.delay);
    });
};

/*
 * Stops all workers by cancelling timers and setting a boolean to false.
 *
 * Right now this function is pretty dumb, since there could be an async job going on
 * and once it finishes, it will just check the boolean. So it might finish after the
 * stop() method has finished, where you'd probably want to know, so we'd prefer
 * if there was a callback that would get called...  TODO
 */
SteveJobs.prototype.stop = function() {
    this.running = false;
    for (var key in this.timers) {
        clearTimeout(this.timers[key]);
    }
    this.timers = {};
}

SteveJobs.prototype._logger = function(logLevel, str) {
    this.emit('log', {
        time: new Date(),
        getMessage: function() {
            // we do it this way, so that if the logging event requires any
            // messy business, it will be more efficient, like when it needs
            // to stringify an object
            if (typeof str === 'function') {
                return str();
            }
            return str;
        },
        level: logLevel
    });
}

