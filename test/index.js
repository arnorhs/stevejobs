var assert = require('assert');
var SteveJobs = require('../stevejobs.js');

var options = {
    delay: 20, // ms
    workers: 3 // 3 concurrent workers
};

beforeEach(function() {
    steve = SteveJobs(options);
});

// technically doesn't use the beforeEach, but whatever
describe('instantiating without new', function() {
    it('should be an instance of SteveJobs', function(done) {
        var steve = SteveJobs();
        assert(steve instanceof SteveJobs, "assigned variable is not an instance of steve jobs");
        done();
    });
});

describe('after adding a job the queue', function() {
    var customString = "Custom string",
        jobName = 'do_something';
    beforeEach(function() {
        steve.addJob(jobName, customString);
    });
    it('should contain one item', function(done) {
        assert(steve.jobs.length === 1, "Job queue does not contain one item after adding");
        done();
    });
    describe('the data', function() {
        it('should contain the same variable that was inserted', function(done) {
            assert(steve.jobs[0].data === customString, "The right data variable was not passed in");
            done();
        });
        it('should contain 0 retries', function(done) {
            assert(steve.jobs[0].retries === 0, "Retries are not 0");
            done();
        });
        it('should contain the same name as was inserted', function(done) {
            assert(steve.jobs[0].name === jobName, "The same name was not inserted");
            done();
        });
    });
});

describe('after adding a handler', function() {
    var jobName = 'do_something',
        handler = function(done, myVar) {
            // do something here
            done();
        };
    beforeEach(function() {
        steve.addHandler(jobName, handler);
    });
    describe('the handler', function() {
        it('should be under the same key', function(done) {
            assert(!!steve.handlers[jobName], "There is nothing under the same key as was added");
            done();
        });
        it('should be the same', function(done) {
            assert(steve.handlers[jobName] === handler, "The function added as a handler is not the same");
            done();
        });
    });
});

describe('after running the jobs', function() {
    var jobName = 'do_something',
        customString = "Custom string",
        handler = function(handlerDone, myVar) {
            // this is a bit ugly.. not sure how to handle
            describe('when the handler gets called', function() {
                it('the variable passed in', function(done) {
                    assert(myVar === customString, "Variable passed to the handler is not the same as was added");
                    done();
                });
            });
            handlerDone();
        };
    beforeEach(function() {
        steve.addJob(jobName, customString);
        steve.addHandler(jobName, handler);
        steve.start();
    });
    describe('the queue', function() {
        it('Should be empty', function(done) {
            setTimeout(function() {
                assert(steve.jobs.length === 0, "The job queue was not empty");
                done();
            },50);
        });
    });
});

