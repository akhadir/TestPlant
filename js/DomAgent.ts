/// <reference path = "../extJs/chrome.d.ts" />
/// <reference path = "../extJs/md5.d.ts" />
namespace DomAgents {
    export interface IResponse {
        selector?:Array<string>;
    }
    export interface IRequest {
        type: string;
        root?: string;
        callback: Function;
        data?: any
    }
    export interface Agent {
        reqIndex: number;
        loopFlag: boolean;
        pollString: string;
        requestQueue: any;
        init(pollString?: string): void;
        process(a:IRequest): void;
        run(option:any): void;
        reset(): void;
        size(obj: object): number;
        clone(obj: any):any;
    }
    export var DomAgent: Agent = {
        reqIndex: 0,
        loopFlag: true,
        requestQueue: {},
        pollString: "POLL_RES",
        init: function (pollString?:string) {
            if (pollString) {
                this.pollString = pollString;
            }
        },
        process: function (request:IRequest) {
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
        run: function (options:any) {
            var reqQ = this.requestQueue;
            chrome.runtime.sendMessage(options, function (res:IRequest) {
                var out;
                if (res && res.data) {
                    out = res.data;
                }
                reqQ[options.id].callback(out);
                delete reqQ[options.id];
            });
        },
        reset: function () {
            this.requestQueue = {};
            this.reqIndex = 0;
        },
        size: function (obj:object) {
            var size = 0,
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    size++;
                }
            }
            return size;
        },
        clone: function (obj:any) {
            var out:any = {},
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    out[key] = obj[key];
                }
            }
            return out;
        }
    };
    var ajaxCalls:any = {};
    var DomWorker = {
        getSelector(req:any): void {
            var data:IResponse = { "selector": undefined},
                code = "win.getSelector($0, ''," + req.data.usi + ")";
            if (req.root) {
                code = "win.getSelector($0, '" + req.root + "', " + req.data.usi + ")";
            }
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result: any, isException: any) {
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
        getSelectorForce: function (req:IRequest) {
            var data:IResponse = {selector: undefined},
                code = "win.getSelectorForce($0, '" + req.root + "', " + req.data.usi + ")";
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result: any, isException: any) {
                if (!isException) {
                    if (result) {
                        data.selector = result;
                        if (req.callback) {
                            req.callback(result);
                        }
                    } else {
                        setTimeout(function () {
                            DomWorker.getSelectorForce(req);
                        }, 1000);
                    }
                } else {
                    console.log("Exception" + isException);
                }
            });
        },
        getChildren: function (req:IRequest) {
            var data:IResponse = {selector: undefined},
                pnode = req.root;
            chrome.devtools.inspectedWindow.eval("win.getChildren('" + pnode + "', " + req.data.usi + ")", {
                "useContentScriptContext": true
            }, function (result: any, isException: any) {
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
        postEvents: function (req: IRequest) {
            var data = req.data,
                code = "win.postEvents('" + data.node + "', '" + data.event + "', '" + data.value + "')";
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result: any, isException:any) {
                if (!isException) {
                    if (req.callback) {
                        req.callback(true);
                    }
                }
            });

        },
        _find: function (array:Array<any>, key:string, kvalue:any) {
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
        getAjaxCalls: function (req:IRequest) {
            var data:Array<any> = [],
                id,
                entry,
                header,
                i,
                len;
            chrome.devtools.network.getHAR(function (log:any) {
                len = log.entries.length;
                for (i = 0; i < len; i++) {
                    entry = log.entries[i];
                    header = DomWorker._find(entry.request.headers, "name", "X-Requested-With");
                    if (header && header['value'] === "XMLHttpRequest") {
                        id = md5.md5(JSON.stringify(entry));
                        if (!ajaxCalls[id]) {
                            entry.request.clearPrev = false;
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
        getProperties: function (req:IRequest) {
            var data = {data:{}, root:String, node:String},
                dat = req.data,
                root = dat.root,
                node = dat.node,
                index = dat.nodeIndex,
                properties = dat.props,
                propString = JSON.stringify(properties),
                code = "win.getComputedProps('" + root + "', '" + node + "'," + index + ", " + propString + ")";
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result:any, isException:any) {
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
        getOtherCalls: function (req:IRequest) {
            var dat = req.data,
                node = dat.dataNode,
                attr = dat.dataAttrib,
                code = "win.getOtherCalls('" + node + "', '" + attr + "')";
            // chrome.devtools.
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result:any, isException:any) {
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
    
}