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
describe("DomAgent Tests For POLL_REQ", function() {
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
        domAgent.init("ABC");
        expect(domAgent.pollString, "Checking for PollString").to.equal("ABC");
    });

    it("Test Process", function(done) {
        this.timeout(10000);
        var inp1, inp2, inp3, count;
        domAgent.init("POLL_REQ");
        expect(domAgent.pollString, "Checking for PollString").to.equal("POLL_REQ");
        count = 0;
        global.chrome.runtime.sendMessage = function () {
            count++;
            arguments[1].call();
        }
        inp1 = {type: "POLL_REQ", data: {}, callback: function () {

        }};
        domAgent.process(inp1);
        expect(domAgent.requestQueue).to.eql({0: inp1});
        inp2 = {type: "POLL_REQ", data: {}, callback: function () {

        }};
        domAgent.process(inp2);
        expect(domAgent.requestQueue).to.eql({0: inp1,1: inp2});
        expect(domAgent.requestQueue).to.eql({0: inp1,1: inp2});
        inp3 = {type: "POLL_REQ", data: {}, callback: function () {

        }};
        domAgent.process(inp3);
        expect(count).to.equal(3);
        setTimeout(function () {
            expect(count).to.within(6,7);
            expect(domAgent.requestQueue).to.eql({0: inp1,1: inp2, 2: inp3});
            done();
        }, 4000);
    });

    it("Test Process with response for POLL_REQ and reset", function(done) {
        this.timeout(10000);
        var inp1, inp2, inp3, count;
        domAgent.init("POLL_REQ");
        count = 0;
        global.chrome.runtime.sendMessage = function () {
            count++;
            arguments[1].call();
        }
        inp1 = {type: "POLL_REQ", data: {}, callback: function () {

        }};
        domAgent.process(inp1);
        expect(domAgent.requestQueue).to.eql({0: inp1});
        inp2 = {type: "POLL_REQ", data: {}, callback: function () {

        }};
        global.chrome.runtime.sendMessage = function () {
            count++;
            arguments[1].call(this, ["abc", "bcd"]);
        }
        domAgent.process(inp2);
        expect(domAgent.requestQueue).to.eql({1: inp2});
        expect(domAgent.requestQueue).to.eql({1: inp2});
        global.chrome.runtime.sendMessage = function () {
            count++;
            arguments[1].call();
        }
        inp3 = {type: "POLL_REQ", data: {}, callback: function () {

        }};
        domAgent.process(inp3);
        expect(count).to.equal(3);
        setTimeout(function () {
            expect(count).to.within(6,7);
            expect(domAgent.requestQueue).to.eql({1: inp2, 2: inp3});
            done();
        }, 4000);
    });

    it("Test Process with response for POLL_REQ", function(done) {
        this.timeout(10000);
        var inp1, inp2, inp3, count;
        domAgent.init("POLL_REQ");
        count = 0;
        global.chrome.runtime.sendMessage = function () {
            count++;
            arguments[1].call();
        }
        inp1 = {type: "POLL_REQ", data: {}, callback: function () {

        }};
        domAgent.process(inp1);
        expect(domAgent.requestQueue).to.eql({0: inp1});
        inp2 = {type: "POLL_REQ", data: {}, callback: function () {

        }};
        global.chrome.runtime.sendMessage = function () {
            count++;
            arguments[1].call(this, ["abc", "bcd"]);
        }
        domAgent.process(inp2);
        expect(domAgent.requestQueue).to.eql({1: inp2});
        expect(domAgent.requestQueue).to.eql({1: inp2});
        inp3 = {type: "POLL_REQ", data: {}, callback: function () {

        }};
        domAgent.process(inp3);
        expect(count).to.equal(3);
        setTimeout(function () {
            expect(count).to.equal(4);
            expect(domAgent.requestQueue).to.eql({});
            global.chrome.runtime.sendMessage = function () {
                arguments[1].call();
            }
            domAgent.process(inp1);
            expect(domAgent.requestQueue).to.eql({0: inp1});
            done();
        }, 6000);
    });
});