/// <reference path="extJs/jquery.d.ts" />
interface classSel {
    id: string;
    className: string;
    tagName: string;
}
interface winFunc {
    isFocusable(node: any):boolean;
    getFocusable(node: any): Array<classSel>;
    observeAjaxCalls(): void;
    observedAjaxCalls: Array<any>;
    getFocusables(node:string): any;
    getComputedProps(root: string, node: string, nodeIndex:number, properties:Array<string>): any;
    getClassNameSel(node: any): string;
    getSelector(node: any, root: string, usi: boolean, maxDepth?: number): string;
    getSelectorForce(node:any, root:string, usi:boolean): string;
    getNodeIndex(node: any, rootNode:any, selector:string): number;
    getChildren(root: string, usi: boolean): Array<string>;
    getOtherCalls(node: string, attrib:string): string;
    postEvents(node: any, event:string, value:string): void;
    getObservedAjaxCalls(): Array<any>;
};
var win: winFunc;
(function () {
win = {
    observedAjaxCalls: [],   
    isFocusable: function (node: any) {
        var out,
        tag = node.tagName;
        if (tag == 'A' || tag == "SELECT" || tag == "INPUT" || tag == "AREA" ||
            tag == "BUTTON" || node.tabIndex >= 0 || tag == "TEXTAREA") {
            out = true;
        } else {
            out = false;
        }
        return out;
    },
    getFocusable: function (node) {
        var out:Array<classSel> = [],
            jout;
        if ($) {
            jout = $(node).find("a, button, select, input, [tabindex='0'], textarea, area");
            jout.each(function (node: any) {
                out.push({ tagName: node.tagName, id: node.id, className: node.className });
            })
        } else {
            throw ("JQUERY INJECT IS NOT WORKING");
        }
        return out;
    },
    observeAjaxCalls: function () {
        this.observedAjaxCalls = [];
        var ajaxSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function () {
            win.observedAjaxCalls.push(arguments);
            ajaxSend.apply(this, arguments);
        }
    },
    getObservedAjaxCalls: function () {
        var out = win.observedAjaxCalls;
        return out;
    },
    getFocusables: function (node: string) {
        var jout = {};
        if ($) {
            jout = $(node).find("a, button, select, input, [tabindex='0'], textarea, area");
        } else {
            throw "JQUERY INJECT IS NOT WORKING";
        }
        return jout;
    },
    getComputedProps: function (root: string, node: string, nodeIndex:number, properties:Array<string>) {
        var out:any = {},
            i: number,
            attributes,
            attrName: {name: string, value: any},
            len: number,
            cNode: any;
        if ($) {
            cNode = $(root).find(node).eq(nodeIndex);
            $.each(properties, function (index: number, prop: string) {
                if (prop === "data") {
                    attributes = cNode[0].attributes;
                    len = attributes.length;
                    for (i = 0; i < len; i++) {
                        attrName = attributes[i];
                        if (attrName.name.indexOf("data-") === 0) {
                            out[attrName.name] = attrName.value;
                        }
                    }
                } else if (prop === "value") {
                    out[prop] = cNode.val();
                } else if (prop === "focus") {
                    out[prop] = (document.activeElement == cNode[0]);
                } else {
                    out[prop] = cNode.css(prop);
                }
            });
        } else {
            throw "JQUERY INJECT IS NOT WORKING";
        }
        return out;
    },
    getSelectorForce: function (node:any, root:string, usi:boolean) {
        var out: string;
        if ($(root).has($(node)).length) {
            out =  this.getSelector(node, root, usi);
        } else {
            out = "";
        }
        return out;
    },
    getSelector: function (node: any, root: string, usi: boolean, maxDepth?: number) {
        var self = this,
            out: string = "",
            nindex: number,
            index: number = 0,
            rootNode: any,
            parents: any;
        try {
            if ($) {
                parents = $(node).parents("[id]");
                if (root) {
                    maxDepth = 0;
                    rootNode = $(root);
                }
                parents.each(function (node: any) {
                    index++;
                    if (!rootNode || rootNode.has(node).length) {
                        if (node.id.indexOf(":") === -1) {
                            if (usi) {
                                out = '#' + node.id + ' ' + out;
                            } else {
                                out = self.getClassNameSel(node) + ' ' + out;
                            }
                            if (maxDepth && index <= maxDepth) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                });
            } else {
                throw "JQUERY INJECT IS NOT WORKING";
            }
        } catch (e) {
            return out;
        }
        if (usi && node.id && node.id.indexOf(":") === -1) {
            out += '#' + node.id;
        } else {
            out += self.getClassNameSel(node);
        }
        nindex = self.getNodeIndex(node, rootNode, out);
        if (nindex > -1) {
            out += ":nth(" + nindex + ")";
        }
        return out;
    },
    getClassNameSel: function (node: any) {
        var out = node.tagName;
        if (node.className && node.className.indexOf(":") === -1) {
            out += '.' + node.className.trim().replace(/\s+/g, '.');
        }
        return out;
    },
    getNodeIndex: function (node: any, rootNode: any, selector:string) {
        var nodes: any,
            i: number,
            len: number,
            cnode: any,
            jnode: any = $(node),
            out:number = -1;
        if (rootNode) {
            nodes = rootNode.find(selector);
        } else {
            nodes = $(selector);
        }
        len = nodes.length;
        if (len > 1) {
            for (i = 0; i < len; i++) {
                cnode = nodes.eq(i);
                if (cnode[0] == jnode[0]) {
                    out = i;
                    break;
                }
            };
        }
        return out;
    },
    getChildren: function (root: string, usi: boolean) {
        var out:Array<string> = [],
            children;
        if ($) {
            children = win.getFocusables(root);
            children.each(function (index:number, node:string) {
                out.push(win.getSelector(node, root, usi));
            });
        } else {
            throw "JQUERY INJECT IS NOT WORKING";
        }
        return out;
    },
    getOtherCalls: function (node: string, attrib:string) {
        var out = '';
        if ($) {
            out = JSON.parse($(node).attr('data-' + attrib));
            $(node).attr('data-' + attrib, '');
        } else {
            throw "JQUERY INJECT IS NOT WORKING";
        }
        return out;
    },
    postEvents: function (node: any, event: string, value:string) {
        var jnode;
        if ($) {
            jnode = $(node);
            if (value) {
                jnode.val(value)
            }
            // jnode[event]();
            dispatcherEvent(jnode[0], event, true, true);
        } else {
            throw "JQUERY INJECT IS NOT WORKING";
        }
    }
};
var dispatcherEvent = function (target: any, ...args:any[]) {
    var e = document.createEvent("Event");
    e.initEvent.apply(e, args);
    target.dispatchEvent(e);
};
})();