## stevejobs

Simplistic in-memory job/worker manager with rate limiting and custom worker counts

### Warning: raw - this thing is just fresh and there are big things missing:

- Handling errors with an error handler
- Writing the actual tests

### Install:

    npm install stevejobs

### Usage:
    
    var SteveJobs = require('stevejobs');

    var steve = new SteveJobs({
        delay: 4000, // ms
        workers: 3 // 3 concurrent workers
    });

    steve.addHandler('do_something', function(done, myvars) {
        // do something here
        done();
    });

    steve.addJob('do_something', myvar);

    steve.start();

That's it..
