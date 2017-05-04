/* global chrome; */
(function () {
    var resp = [],
        ajaxCalls = {},
        data = [],
        reqt = [];
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            var reqType = request.type,
                req,
                i,
                out;
            switch (reqType) {
            case 'DATA_RES_TESTCASE':
                data.push(request);
                break;
            case 'DATA_REQ_PANEL':
                if (data.length) {
                    sendResponse(data.shift());
                }
                break;
            }
        }
    );
    function inArray(needle, hayStack) {
        var i,
            out = false;
        if (typeof hayStack === "object" && hayStack.length) {
            for (i in hayStack) {
                if (hayStack[i] === needle) {
                    out = true;
                    break;
                }
            }
        }
        return out;
    }
    function observeAjaxCalls() {
        chrome.webRequest.onBeforeRequest.addListener(function(details) {
            var tabId = details.tabId;
            if (details.type === "xmlhttprequest") {
                if (details.requestBody) {
                    if (details.requestBody.raw && details.requestBody.raw[0] && details.requestBody.raw[0].bytes) {
                        details.postBody = decodeURIComponent(String.fromCharCode.apply(null,
                                          new Uint8Array(details.requestBody.raw[0].bytes)));
                    } else {
                        details.postBody = details.requestBody;
                    }
                }
                if (ajaxCalls[tabId]) {
                    ajaxCalls[tabId].push(details);
                } else {
                    ajaxCalls[tabId] = [details];
                }
            }
        }, { urls: ["<all_urls>"] }, ["requestBody"]);
    }
    // observeAjaxCalls();
})();
