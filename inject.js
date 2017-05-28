"use strict";
;
var winOver;
(function () {
    winOver = {
        observedAjaxCalls: [],
        isFocusable: function (node) {
            var out, tag = node.tagName;
            if (tag == 'A' || tag == "SELECT" || tag == "INPUT" || tag == "AREA" ||
                tag == "BUTTON" || node.tabIndex >= 0 || tag == "TEXTAREA") {
                out = true;
            }
            else {
                out = false;
            }
            return out;
        },
        getFocusable: function (node) {
            var out = [], jout;
            if ($) {
                jout = $(node).find("a, button, select, input, [tabindex='0'], textarea, area");
                jout.each(function (i) {
                    var node = jout[i];
                    out.push({ tagName: node.tagName, id: node.id, className: node.className });
                });
            }
            else {
                throw ("JQUERY INJECT IS NOT WORKING");
            }
            return out;
        },
        observeAjaxCalls: function () {
            this.observedAjaxCalls = [];
            var ajaxSend = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.send = function () {
                winOver.observedAjaxCalls.push(arguments);
                ajaxSend.apply(this, arguments);
            };
        },
        getObservedAjaxCalls: function () {
            var out = winOver.observedAjaxCalls;
            return out;
        },
        getFocusables: function (node) {
            var jout = {};
            if ($) {
                jout = $(node).find("a, button, select, input, [tabindex='0'], textarea, area");
            }
            else {
                throw "JQUERY INJECT IS NOT WORKING";
            }
            return jout;
        },
        getComputedProps: function (root, node, nodeIndex, properties) {
            var out = {}, i, attributes, attrName, len, cNode;
            if ($) {
                cNode = $(root).find(node).eq(nodeIndex);
                $.each(properties, function (index, prop) {
                    if (prop === "data") {
                        attributes = cNode[0].attributes;
                        len = attributes.length;
                        for (i = 0; i < len; i++) {
                            attrName = attributes[i];
                            if (attrName.name.indexOf("data-") === 0) {
                                out[attrName.name] = attrName.value;
                            }
                        }
                    }
                    else if (prop === "value") {
                        out[prop] = cNode.val();
                    }
                    else if (prop === "focus") {
                        out[prop] = (document.activeElement == cNode[0]);
                    }
                    else {
                        out[prop] = cNode.css(prop);
                    }
                });
            }
            else {
                throw "JQUERY INJECT IS NOT WORKING";
            }
            return out;
        },
        getSelectorForce: function (node, root, usi) {
            var out;
            if ($(root).has($(node)).length) {
                out = this.getSelector(node, root, usi);
            }
            else {
                out = "";
            }
            return out;
        },
        getSelector: function (node, root, usi, maxDepth) {
            var self = this, out = "", nindex, index = 0, rootNode, parents;
            try {
                if ($) {
                    parents = $(node).parents("[id]");
                    if (root) {
                        maxDepth = 0;
                        rootNode = $(root);
                    }
                    parents.each(function (i) {
                        var node = parents[i];
                        index++;
                        if (!rootNode || rootNode.has(node).length) {
                            if (node.id.indexOf(":") === -1) {
                                if (usi) {
                                    out = '#' + node.id + ' ' + out;
                                }
                                else {
                                    out = self.getClassNameSel(node) + ' ' + out;
                                }
                                if (maxDepth && index <= maxDepth) {
                                    return false;
                                }
                            }
                        }
                        else {
                            return false;
                        }
                    });
                }
                else {
                    throw "JQUERY INJECT IS NOT WORKING";
                }
            }
            catch (e) {
                return out;
            }
            if (usi && node.id && node.id.indexOf(":") === -1) {
                out += '#' + node.id;
            }
            else {
                out += self.getClassNameSel(node);
            }
            nindex = self.getNodeIndex(node, rootNode, out);
            if (nindex > -1) {
                out += ":nth(" + nindex + ")";
            }
            return out;
        },
        getClassNameSel: function (node) {
            var out = node.tagName;
            if (node.className && node.className.indexOf(":") === -1) {
                out += '.' + node.className.trim().replace(/\s+/g, '.');
            }
            return out;
        },
        getNodeIndex: function (node, rootNode, selector) {
            var nodes, i, len, cnode, jnode = $(node), out = -1;
            if (rootNode) {
                nodes = rootNode.find(selector);
            }
            else {
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
                }
                ;
            }
            return out;
        },
        getChildren: function (root, usi) {
            var out = [], children;
            if ($) {
                children = winOver.getFocusables(root);
                children.each(function (index, node) {
                    out.push(winOver.getSelector(node, root, usi));
                });
            }
            else {
                throw "JQUERY INJECT IS NOT WORKING";
            }
            return out;
        },
        getOtherCalls: function (node, attrib) {
            var out = '';
            if ($) {
                out = JSON.parse($(node).attr('data-' + attrib));
                $(node).attr('data-' + attrib, '');
            }
            else {
                throw "JQUERY INJECT IS NOT WORKING";
            }
            return out;
        },
        postEvents: function (node, event, value) {
            var jnode;
            if ($) {
                jnode = $(node);
                if (value) {
                    jnode.val(value);
                }
                dispatcherEvent(jnode[0], event, true, true);
            }
            else {
                throw "JQUERY INJECT IS NOT WORKING";
            }
        }
    };
    var dispatcherEvent = function (target) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var e = document.createEvent("Event");
        e.initEvent.apply(e, args);
        target.dispatchEvent(e);
    };
})();
//# sourceMappingURL=inject.js.map