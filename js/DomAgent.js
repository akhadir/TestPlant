(function () {
    window.DomAgent = {
        reqIndex: 0,
        loopFlag: true,
        requestQueue: {},
        pollString: "POLL_RES",
        init: function (pollString) {
            if (pollString) {
                this.pollString = pollString;
            }
        },
        process: function (request) {
            var id, out;
            if (this.size(this.requestQueue) === 0) {
                 this.reqIndex = 1;
                 id = 0;
            } else {
                id = this.reqIndex++;
            }
            this.requestQueue[id] = request;
            out = this.clone(request);
            out.id = id;
            delete out.callback;
            this.run(out);
        },
        run: function (options) {
            var self = this,
                resOptions = {type: self.pollString},
                reqQ = this.requestQueue;
            chrome.runtime.sendMessage(options, function (res) {
                var i, key;
                if (res) {
                    if (self.pollString === "POLL_RES") {
                        for (i in res) {
                            if (res.hasOwnProperty(i)) {
                                key = res[i].sid;
                                if (reqQ[key]) {
                                    reqQ[key].callback(res[i].data);
                                    delete reqQ[key];
                                }
                            }
                        }
                    } else {
                        for (key in reqQ) {
                            if (reqQ.hasOwnProperty(key)) {
                                if (reqQ[key].type == 'POLL_REQ') {
                                    reqQ[key].callback(res);
                                    delete reqQ[key];
                                    break;
                                }
                            }
                        }
                    }
                }
                if (self.loopFlag && self.size(reqQ)) {
                    self.loopFlag = false;
                    setTimeout(function () {
                        self.loopFlag = true;
                        self.run(resOptions);
                    }, 1000);
                }
            });
        },
        reset: function () {
            this.requestQueue = {};
            this.reqIndex = 0;
        },
        size: function (obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    size++;
                }
            }
            return size;
        },
        clone: function (obj) {
            var out = {},
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    out[key] = obj[key];
                }
            }
            return out;
        }
    };
})();
