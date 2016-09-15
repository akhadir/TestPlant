/* global chrome; */
(function () {
    var resp = [],
        dataResp = [],
        dataReq = [],
        reqt = [];
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            var reqType = request.type,
                req,
                i,
                out;
            switch (reqType) {
            case "POLL_RES":
                out = [];
                if (resp.length) {
                    for (i in resp) {
                        if (resp.hasOwnProperty(i)) {
                            if (resp[i].url === sender.url) {
                                out.push(resp[i]);
                                delete resp[i];
                            }
                        }
                    }
                }
                if (dataResp.length) {
                    for (i in dataResp) {
                        if (dataResp.hasOwnProperty(i)) {
                            if (dataReq.length) {
                                req = dataReq[0];
                                if (req.url === sender.url) {
                                    dataResp[i]["sid"] = req.id;
                                    out.push(dataResp[i]);
                                    delete dataResp[i];
                                    dataReq.splice(0, 1);
                                }
                            }
                        }
                    }
                }
                if (out.length) {
                    sendResponse(out);
                }
                break;
            case "POLL_REQ":
                if (reqt.length) {
                    sendResponse(reqt);
                    reqt = [];
                }
                break;
            case 'DATA_RES_TESTCASE':
                dataResp.push(request);
                break;
            case 'DATA_REQ_PANEL':
                request.url = sender.url;
                dataReq.push(request);
                break;
            case "POLL_DATA":
                resp.push(request);
                break;
            default:
                request.url = sender.url;
                reqt.push(request);
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
})();
