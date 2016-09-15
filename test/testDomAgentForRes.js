var expect, domAgent;
function setMessageCallback (callback) {
    global.chrome.runtime.sendMessage = callback;
}
function setMessageTimer () {
    global._messageCount = 0;
    global.chrome.runtime.sendMessage = function () {
        global._messageCount++;
    }
}
describe("DomAgent Tests For POLL_RES", function() {
    before(function() {
        global.window = {};
        global.chrome = {runtime: {
            sendMessage: function () {
                arguments[1].call();
            }
        }}
        require('../js/DomAgent.js');
        expect = require('chai').expect;
        domAgent = global.window.DomAgent;
    });

    after(function() {
        //console.log('after');
    });

    beforeEach(function() {
        //console.log('before each');
    });

    afterEach(function(done) {
        domAgent.reset();
        setTimeout(function () {
            done();
        }, 1500);
    });
    
    it("Test Init", function() {
        expect(domAgent.pollString, "Checking for PollString").to.equal("POLL_RES");
    });

    it("Test Process", function(done) {
        this.timeout(10000);
        var inp1, inp2, inp3, count;
        expect(domAgent.pollString, "Checking for PollString").to.equal("POLL_RES");
        count = 0;
        global.chrome.runtime.sendMessage = function () {
            count++;
            arguments[1].call();
        }
        inp1 = {type: "ABC", data: {}, callback: function () {

        }};
        domAgent.process(inp1);
        expect(domAgent.requestQueue).to.eql({0: inp1});
        inp2 = {type: "BCD", data: {}, callback: function () {

        }};
        domAgent.process(inp2);
        expect(domAgent.requestQueue).to.eql({0: inp1,1: inp2});
        expect(domAgent.requestQueue).to.eql({0: inp1,1: inp2});
        inp3 = {type: "GGG", data: {}, callback: function () {

        }};
        domAgent.process(inp3);
        expect(count).to.equal(3);
        setTimeout(function () {
            expect(count).to.within(6,7);
            expect(domAgent.requestQueue).to.eql({0: inp1,1: inp2, 2: inp3});
            done();
        }, 4000);
    });

    it("Test Process with response for POLL_RES and Reset", function(done) {
        this.timeout(10000);
        var inp1, inp2, count;
        expect(domAgent.pollString, "Checking for PollString").to.equal("POLL_RES");
        count = 0;
        global.chrome.runtime.sendMessage = function () {
            count++;
            arguments[1].call();
        }
        inp1 = {type: "ABC", data: {}, callback: function () {

        }};
        domAgent.process(inp1);
        expect(domAgent.requestQueue).to.eql({0: inp1});
        inp2 = {type: "BCD", data: {}, callback: function () {

        }};
        domAgent.process(inp2);
        expect(domAgent.requestQueue).to.eql({0: inp1,1: inp2});
        expect(count).to.equal(2);
        setTimeout(function () {
            expect(count).to.within(6,7);
            global.chrome.runtime.sendMessage = function () {
                count++;
                arguments[1].call(this, [{sid: 1, type: "BCD", data: "fsfsdfsfdsfsd"}]);
                global.chrome.runtime.sendMessage = function () {
                    count++;
                }
            }
            setTimeout(function () {
                expect(domAgent.requestQueue).to.eql({0: inp1});
                expect(count).to.within(7,8);
                domAgent.process(inp1);
                expect(domAgent.requestQueue).to.eql({0: inp1,2: inp1});
                done();
            }, 1200);
        }, 5000);
    });
    
    it("Test Process with response for POLL_RES", function(done) {
        this.timeout(10000);
        var inp1, inp2, count;
        expect(domAgent.pollString, "Checking for PollString").to.equal("POLL_RES");
        count = 0;
        global.chrome.runtime.sendMessage = function () {
            count++;
            arguments[1].call();
        }
        inp1 = {type: "ABC", data: {}, callback: function () {

        }};
        domAgent.process(inp1);
        expect(domAgent.requestQueue).to.eql({0: inp1});
        inp2 = {type: "BCD", data: {}, callback: function () {

        }};
        domAgent.process(inp2);
        expect(domAgent.requestQueue).to.eql({0: inp1,1: inp2});
        expect(count).to.equal(2);
        setTimeout(function () {
            expect(count).to.within(6,7);
            global.chrome.runtime.sendMessage = function () {
                count++;
                arguments[1].call(this, [{sid: 1, type: "BCD", data: "fsfsdfsfdsfsd"}, {sid: 0, type: "ABC", data: "fsfsdfsfdsfsd"}]);
                global.chrome.runtime.sendMessage = function () {
                    count++;
                }
            }
            setTimeout(function () {
                expect(domAgent.requestQueue).to.eql({});
                expect(count).to.within(7,8);
                done();
            }, 4000);
        }, 5000);
    });
});