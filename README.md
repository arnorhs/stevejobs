## stevejobs

Simplistic in-memory job/worker manager with rate limiting and custom worker counts. (Status: experimental, young proj)

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
    // do something here
    done();
});

steve.addJob('do_something', myvar);

steve.start();
```
### SteveJobs server

If you want to run a simple http server to receive job requests, you can use the [https://github.com/arnorhs/stevejobs-server](SteveJobs Server) wrapper to take care of those annoyances.

### Running unit tests:

    mocha test/

### Todo:

- It would be nice to have a callback get called when the queue is empty.
- I would like to figure out a way to test the concurrency and delays - the only way I've teste is by just running and logging
- Priority?

### pull requests are welcome
That's it..
