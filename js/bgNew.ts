/// <reference path = "../extJs/chrome.d.ts" />
(function () {
    var resp = [],
        ajaxCalls = {},
        data:Array<any> = [],
        reqt = [];
    chrome.runtime.onMessage.addListener(
        function (request:any, sender:any, sendResponse:Function) {
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
})();
