/*
 * Unit test for calling the error handler
 *
 * todo:
 * - test handling other kinds of errors (also requires code to do that) 
 *
 */

var assert = require('assert');
var SteveJobs = require('../stevejobs.js');

describe('an unhandled exception in a handler', function() {
    it('should call the error handler after 3 retries', function(done) {
        var jobName = 'do_something',
            customString = "Custom string",
            handler = function(done, myVar) {
                // this is a bit ugly.. not sure how to handle
                throw new Error("Error in handler");
                done();
            },
            steve = SteveJobs({
                delay: 20,
                workers: 1,
                errorHandler: function(err, job) {
                    // it's done handler, to be clear
                    done();
                }
            });
        steve.addJob(jobName, customString);
        steve.addHandler(jobName, handler);
        steve.start();
    });
});

describe('adding a job', function() {
    var steve;
    beforeEach(function() {
        steve = SteveJobs();
    });
    it('should throw an error when you pass in no name', function(done) {
        try {
            steve.addJob('', {});
        } catch (err) {
            return done();
        }
        assert(false, "No error thrown!");
    });
});

