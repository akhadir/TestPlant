(function () {
    var tcDataSel = null,
        reqArray = [],
        reqFlag = false,
        tcTestcase = null,
        tcProperties = {},
        key,
        data,
        tcDataChildrenSel = null;
    chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var reqType = request.type,
            data;
        if (reqType === 'DATA_RES_SEL') {
            tcDataSel = request.data;
        } else if (reqType === 'DATA_RES_TESTCASE') {
            tcTestcase = request.data;
        } else if (reqType === 'DATA_RES_SEL_CHILDREN') {
            reqFlag = false;
            tcDataChildrenSel = request.data;
        } else if (reqType === 'DATA_RES_PROPS') {
            data = request.data;
            tcProperties[data.root+data.node] = data;
        } else if (reqType === 'DATA_REQ') {
            if (reqArray.length) {
                sendResponse(reqArray);
                reqArray = [];
            }
        } else if (reqType === 'DATA_REQ_PANEL') {
             sendResponse(tcTestcase);
             tcTestcase = null;
        } else if (reqType === 'DATA_REQ_SEL') {
            sendResponse(tcDataSel);
            tcDataSel = null;
        } else if (reqType === 'DATA_REQ_SEL_CHILDREN') {
            if (tcDataChildrenSel != null) {
                reqFlag = false;
            } else {
                if (!reqFlag) {
                    reqArray.push(request);
                    reqFlag = true;
                }
            }
            sendResponse(tcDataChildrenSel);
            tcDataChildrenSel = null;
        } else if (reqType === 'DATA_REQ_PROPS') {
          console.log(reqType + JSON.stringify(tcProperties));
            if (request.data) {
                reqArray.push(request);
            }
            sendResponse(tcProperties);
            tcProperties = {};
        }
    });
    function inArray(needle, hayStack) {
        var i,
            out = false;
        if (typeof hayStack === "object" && hayStack.length) {
            for (i in hayStack) {
                if (hasStack[i] === needle) {
                    out = true;
                    break;
                }
            }
        }
        return out;
    }
})();
