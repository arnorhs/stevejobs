## stevejobs

Simplistic in-memory job/worker manager with rate limiting and custom worker counts

### Warning: raw - this thing is just fresh and there are big things missing:

- Handling errors with an error handler

### Install:

    npm install stevejobs

### Usage:
    
    ```javascript
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
    ```

### Running unit tests:

    mocha test/

### Todo:

- It would be nice to add a generic error handler
- It would be nice to have a callback get called when the queue is empty.
- I would like to figure out a way to test the concurrency and delays - the only way I've teste is by just running and logging

### pull requests are welcome
That's it..
