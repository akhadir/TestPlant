window.isFocusable = function (node) {
    var out;
    if (node.tagName == 'A' || node.tagName == "SELECT" || node.tagName == "INPUT" || 
        node.tagName == "BUTTON" || node.tabIndex >= 0 || node.tagName == "TEXTAREA" ||
        node.tagName == "AREA") {
        out = true;
    } else {
        out = false;
    }
    return out;
}
window.getFocusable = function (node) {
    var out = [],
        jout;
    if ($) {
        jout =  $(node).find("a, button, select, input, [tabindex='0'], textarea, area");
        jout.each(function () {
            out.push({tagName: this.tagName, id: this.id, className: this.className});
        })
    } else {
        throw new Exception("JQUERY INJECT IS NOT WORKING");
    }
    return out;
}
window.observeAjaxCalls = function () {
    window.observedAjaxCalls = [];
    var ajaxSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
        window.observedAjaxCalls.push(arguments);
        ajaxSend.apply(this, arguments);
    }
}
window.getObservedAjaxCalls = function () {
    var out =  window.observedAjaxCalls;
    window.observedAjaxCalls = [];
    return out;
}
window.getFocusables = function (node) {
    var jout = {};
    if ($) {
        jout = $(node).find("a, button, select, input, [tabindex='0'], textarea, area");
    } else {
        throw new Exception("JQUERY INJECT IS NOT WORKING");
    }
    return jout;
}
window.getComputedProps = function (root, node, nodeIndex, properties) {
    var out = {},
        cNode = $(root).find(node).eq(nodeIndex);
    if ($) {
        $.each(properties, function (index, prop) {
            if (prop != "focus") {
                out[prop] = cNode.css(prop);
            } else {
                out[prop] = (document.activeElement == cNode[0]);
            }
        });
    } else {
        throw new Exception("JQUERY INJECT IS NOT WORKING");
    }
    return out;    
}
window.getSelectorForce = function (node, root) {
    var out;
    if ($(root).has($(node)).length) {
        out =  window.getSelector(node, root);
    } else {
        out = "";
    }
    return out;
}
window.getSelector = function (node, root, maxDepth) {
    var out = "",
        nindex,
        index = 0,
        rootNode,
        parents;
    try {
        if ($) {
            parents = $(node).parents("[id]");
            if (root) {
                maxDepth = false;
                rootNode = $(root);
            }
            parents.each(function () {
                index++;
                if (!rootNode || rootNode.has(this).length) {
                    out = '#' + this.id + ' ' + out;
                    if (maxDepth && index <= maxDepth) {
                        return false;
                    }
                } else {
                    return false;
                }
            });
        } else {
            throw new Exception("JQUERY INJECT IS NOT WORKING");
        }
    } catch(e) {
        return out;
    }
    if (node.id) {
        out += '#' + node.id;
    } else {
        out += node.tagName;
        if (node.className) {
            out += '.' + node.className.trim().replace(/\s+/g, '.');
        }
    }
    nindex = window.getNodeIndex(node, rootNode, out);
    if (typeof nindex == 'number') {
        out += ":nth(" + nindex + ")";
    }
    return out;
}
window.getNodeIndex = function (node, rootNode, selector) {
    var nodes,
        i,
        len,
        cnode,
        jnode = $(node);
        out = '';
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
}
window.getChildren = function (root) {
    var out = [],
        children;
    if ($) {
        children = window.getFocusables(root);
        children.each(function (index, node) {
            out.push(window.getSelector(node, root));
        });
    } else {
        throw new Exception("JQUERY INJECT IS NOT WORKING");
    }
    return out;
}
//window.observeAjaxCalls();