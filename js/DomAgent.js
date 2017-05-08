(function () {
    var ajaxCalls = {};
    var DomWorker = {
        getSelector: function (req) {
            var data = {},
                code = "getSelector($0)";
            if (req.root) {
                code = "getSelector($0, '" + req.root + "')";
            }
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result, isException) {
                if (!isException) {
                    data.selector = result;
                    if (req.callback) {
                        req.callback(result);
                    }
                } else {
                    console.log("Exception" + isException);
                }
            });
        },
        getSelectorForce: function (req) {
            var data = {},
                code = "getSelectorForce($0, '" + req.root + "')";
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result, isException) {
                if (!isException) {
                    if (result) {
                        data.selector = result;
                        if (req.callback) {
                            req.callback(result);
                        }
                    } else {
                        setTimeout(function () {
                            getSelectorForce(req);
                        }, 1000);
                    }
                } else {
                    console.log("Exception" + isException);
                }
            });
        },
        getChildren: function (req) {
            var data = {},
                pnode = req.root;
            chrome.devtools.inspectedWindow.eval("getChildren('" + pnode + "')", {
                "useContentScriptContext": true
            }, function (result, isException) {
                if (!isException) {
                    data.selector = result;
                    if (req.callback) {
                        req.callback(result);
                    }
                } else {
                    console.log("Exception" + isException);
                }
            });
        },
        postEvents: function (req) {
            var data = req.data,
                code = "postEvents('" + data.node + "', '" + data.event + "', '" + data.value + "')";
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result, isException) {
                if (!isException) {
                    if (req.callback) {
                        req.callback(true);
                    }
                }
            });

        },
        _find: function (array, key, kvalue) {
            var i,
                out,
                temp,
                len = array.length;
            for (i = 0; i < len; i++) {
                temp = array[i]
                if (temp[key] == kvalue) {
                    out = temp;
                    break;
                }
            }
            return out;
        },
        getAjaxCalls: function (req) {
            var data = [],
                id,
                entry,
                header,
                i,
                len;
            chrome.devtools.network.getHAR(function (log) {
                len = log.entries.length;
                for (i = 0; i < len; i++) {
                    entry = log.entries[i];
                    header = DomWorker._find(entry.request.headers, "name", "X-Requested-With");
                    if (header && header['value'] === "XMLHttpRequest") {
                        id = md5(JSON.stringify(entry));
                        if (!ajaxCalls[id]) {
                            data.push(entry.request);
                            ajaxCalls[id] = entry.request;
                        }
                    }
                }
                if (req.callback) {
                    req.callback(data);
                }
            });
            // chrome.devtools.inspectedWindow.getResources(function (resources) {
            //     console.log(" " + JSON.stringify(resources));
            // });
            
        },
        getProperties: function (req) {
            var data = {},
                dat = req.data,
                root = dat.root,
                node = dat.node,
                index = dat.nodeIndex,
                properties = dat.props,
                propString = JSON.stringify(properties),
                code = "getComputedProps('" + root + "', '" + node + "'," + index + ", " + propString + ")";
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result, isException) {
                if (!isException) {
                    data.data = result;
                    data.root = root;
                    data.node = node;
                    if (req.callback) {
                        req.callback(data);
                    }
                } else {
                    console.log(code);
                    console.log("Exception: " + JSON.stringify(isException));
                }
            });
        },
        getOtherCalls: function (req) {
            var dat = req.data,
                node = dat.dataNode,
                attr = dat.dataAttrib,
                code = "getOtherCalls('" + node + "', '" + attr + "')";
            // chrome.devtools.
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result, isException) {
                if (!isException) {
                    if (req.callback) {
                        req.callback(result);
                    }
                } else {
                    console.log(code);
                    console.log("Exception: " + JSON.stringify(isException));
                }
            });
        }
    };
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
            var id,
                out,
                type = request.type;
            if (type === 'DATA_REQ_SEL') {
                DomWorker.getSelector(request);
            } else if (type === 'DATA_REQ_SEL_WITH_ROOT') {
                DomWorker.getSelectorForce(request);
            } else if (type === 'DATA_REQ_SEL_CHILDREN') {
                DomWorker.getChildren(request);
            } else if (type === 'DATA_REQ_PROPS') {
                DomWorker.getProperties(request);
            } else if (type === 'DATA_REQ_OTHER_CALLS') {
                DomWorker.getOtherCalls(request);
            } else if (type === 'DATA_REQ_AJAX_CALLS') {
                DomWorker.getAjaxCalls(request);
            } else if (type === 'DATA_POST_EVENTS') {
                DomWorker.postEvents(request);
            } else {
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
            }
        },
        run: function (options) {
            var reqQ = this.requestQueue;
            chrome.runtime.sendMessage(options, function (res) {
                var out;
                if (res.data) {
                    out = res.data;
                }
                reqQ[options.id].callback(out);
                delete reqQ[id];
            });
        },
        reset: function () {
            this.requestQueue = {};
            this.reqIndex = 0;
        },
        size: function (obj) {
            var size = 0,
                key;
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
