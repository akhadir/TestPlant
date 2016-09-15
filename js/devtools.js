(function () {
    var pollFlag = true,
        domAgent = window.DomAgent;
    domAgent.init("POLL_REQ");
    chrome.devtools.panels.create("TCPlant", "icon.png", "panel.html",
        function (panel) {
          // code invoked on panel creation
            panel.show();
        }
        );

    chrome.devtools.panels.elements.createSidebarPane("Testcases",
        function (sidebar) {
            sidebar.setPage("sidebar.html");
            //sidebar.setHeight("8ex");
        });

    chrome.devtools.panels.elements.onSelectionChanged.addListener(function (res) {
        console.log(res);
    });
    function getSelector(req) {
        var data = {},
            code = "getSelector($0)";
        if (req.root) {
            code = "getSelector($0, '" + req.root + "')";
        }
        chrome.devtools.inspectedWindow.eval(code, {"useContentScriptContext": true}, function (result, isException) {
            if (!isException) {
                data.selector = result;
                domAgent.process({sid: req.id, url: req.url, type: "POLL_DATA", data: result, callback: function (res) {
                    console.log(res);
                }});
            } else {
                console.log("Exception" + isException);
            }
        });
    }
    function getSelectorForce(req) {
        var data = {},
            code = "getSelectorForce($0, '" + req.root + "')";
        chrome.devtools.inspectedWindow.eval(code, {"useContentScriptContext": true}, function (result, isException) {
            if (!isException) {
                if (result) {
                    data.selector = result;
                    domAgent.process({sid: req.id, url: req.url, type: "POLL_DATA", data: result, callback: function (res) {
                        console.log(res);
                    }});
                } else {
                    setTimeout(function () {
                        getSelectorForce(req);
                    }, 1000);
                }
            } else {
                console.log("Exception" + isException);
            }
        });
    }
    function getChildren(req) {
        var data = {},
            pnode = req.root;
        chrome.devtools.inspectedWindow.eval("getChildren('" + pnode + "')", {"useContentScriptContext": true}, function (result, isException) {
            if (!isException) {
                data.selector = result;
                domAgent.process({sid: req.id, url: req.url, type: "POLL_DATA", data: result, callback: function (res) {
                    console.log(res);
                }});
            } else {
                console.log("Exception" + isException);
            }
        });
    }
    function getProperties(req) {
        var data = {},
            dat = req.data,
            root = dat.root,
            node = dat.node,
            properties = dat.props,
            propString = JSON.stringify(properties),
            code = "getComputedProps('" + root + "', '" + node + "'," + propString + ")";

        chrome.devtools.inspectedWindow.eval(code, {"useContentScriptContext": true}, function (result, isException) {
            if (!isException) {
                data.data = result;
                data.root = root;
                data.node = node;
                domAgent.process({sid: req.id, url: req.url, type: "POLL_DATA", data: data, callback: function (res) {
                    console.log(res);
                }});
            } else {
                console.log(code);
                console.log("Exception: " + JSON.stringify(isException));
            }
        });
    }
    // Polling for requests
    function poll() {
        if (pollFlag) {
            pollFlag = false;
            domAgent.process({type: "POLL_REQ", data: {}, callback: function (inp) {
                var req, i;
                if (inp && inp.length) {
                    for (i in inp) {
                        if (inp.hasOwnProperty(i)) {
                            req = inp[i];
                            if (req.type === 'DATA_REQ_SEL') {
                                getSelector(req);
                            } if (req.type === 'DATA_REQ_SEL_WITH_ROOT') {
                                getSelectorForce(req);
                            }else if (req.type === 'DATA_REQ_SEL_CHILDREN') {
                                getChildren(req);
                            } else if (req.type === 'DATA_REQ_PROPS') {
                                getProperties(req);
                            }
                        }
                    }
                }
                pollFlag = true;
            }});
        }
    }
    setInterval(function () {
        poll();
    }, 1000);
})();