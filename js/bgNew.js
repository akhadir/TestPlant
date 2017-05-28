"use strict";
(function () {
    var resp = [], ajaxCalls = {}, data = [], reqt = [];
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        var reqType = request.type, req, i, out;
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
    });
})();
//# sourceMappingURL=bgNew.js.map