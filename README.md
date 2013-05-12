## stevejobs

Simplistic in-memory job/worker manager with rate limiting and custom worker counts. (Status: experimental, young proj).

This is a small library that aids in executing long-running processes outside of your other events. It has no underlying backing store, so
it's mostly useful for fire-and-forget tasks like updating caches, sending out non-important emails etc.

The plan is to add hooks for you to easily manage how it reads and writes to the queue, so you could use any kind of a backing store you see fit.

It's likely that a module with pre-made backing stores will be added separately, under a corresponding name, like stevejobs-redis etc.

### Running as an HTTP server

There is a server wrapper version of this module called [https://github.com/arnorhs/stevejobs-server](SteveJobs Server) that
wraps this module in an http server listening for /job POST requests, so you could use that to have this running on its own
machine, for instance.

### Install:

    npm install stevejobs

### Usage:
    
```javascript
var steveJobs = require('stevejobs');

var steve = steveJobs({
    delay: 4000, // ms
    workers: 3 // 3 concurrent workers
});

steve.addHandler('do_something', function(done, myvars) {
    // do something here - make sure to call done when your task is done
    done();
});

steve.addJob('do_something', myvar);

steve.start();
```
### Logging:

The module doesn't output anything by default. To log to console, you can hook into the 'log' event:

The object passed in has the following properties: `time` (Date object), `getMessage` (function to get the log message), `level` (number range 0-2 dictating severity)

```javascript
steve.on('log', function(loginfo) {
    console.log(loginfo.time, loginfo.getMessage());
});
```

### Error handling

Not much in terms of error handling as is. The job will be retried a few times, and then if it fails again, this event will be emitted, allowing you to take action..
```javascript
steve.on('job_error', function(err, job) {
    // the job variable has the data, how many times it was retried and its name.
});
```

### Running unit tests:

    mocha test/

### Options:

- `delay`: Time in milliseconds that a worker waits for before starting on the next job.
- `maxRetries`: How often a job will be retried on error before being abandoned.
- `workers`: Number of worker loops that can be executing job handlers concurrently.

### Function reference:

#### SteveJobs#addJob(name, data)
Adds a new job to the queue. The name can be any string/number and the data parameter can be any type, as long as your corresponding handler knows what to do with it. Currently this method does not support multiple parameters, so you're going to have to pass in an array, an object or something like that if you want to pass in multiple vars.

#### SteveJobs#addHandler(name, callback(done, data))
Adds a new job handler for a given name. Adding multiple handlers results in an error. The callback will be given two parameters, a callback you need to call when your handler is done executing, and the data parameter you passed in in the `addJob()` method. If you don't call that callback, the corresponding worker will stop and not continue unless you restart the server.

#### SteveJobs#start()
You call this method to start the worker loop. Until this has been called, no work will be done.

### Todo:

- Adding add-to-queue and read-from-queue hooks for hooking in different types of databases to read from the queue etc.
- I would like to figure out a way to test the concurrency and delays - the only way I've teste is by just running and logging
- Priority?

### pull requests are welcome
That's it..
