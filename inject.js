(function () {
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
        i,
        attributes,
        attrName,
        len,
        cNode;
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
            } else if (prop === "value") {
                out[prop] = cNode.val();
            } else if (prop === "focus") {
                out[prop] = (document.activeElement == cNode[0]);
            } else {
                out[prop] = cNode.css(prop);
            }
        });
    } else {
        throw new Exception("JQUERY INJECT IS NOT WORKING");
    }
    return out;    
}
window.getSelectorForce = function (node, root, usi) {
    var out;
    if ($(root).has($(node)).length) {
        out =  window.getSelector(node, root, usi);
    } else {
        out = "";
    }
    return out;
}
window.getSelector = function (node, root, usi, maxDepth) {
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
                    if (this.id.indexOf(":") === -1) {
                        if (usi) {
                            out = '#' + this.id + ' ' + out;
                        } else {
                            out = getClassNameSel(this) + ' ' + out;
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
            throw new Exception("JQUERY INJECT IS NOT WORKING");
        }
    } catch(e) {
        return out;
    }
    if (usi && node.id && node.id.indexOf(":") === -1) {
        out += '#' + node.id;
    } else {
        out += getClassNameSel(node);
    }
    nindex = window.getNodeIndex(node, rootNode, out);
    if (typeof nindex == 'number') {
        out += ":nth(" + nindex + ")";
    }
    return out;
}
var getClassNameSel = function (node) {
    var out = node.tagName;
    if (node.className && node.className.indexOf(":") === -1) {
        out += '.' + node.className.trim().replace(/\s+/g, '.');
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
window.getChildren = function (root, usi) {
    var out = [],
        children;
    if ($) {
        children = window.getFocusables(root);
        children.each(function (index, node) {
            out.push(window.getSelector(node, root, usi));
        });
    } else {
        throw new Exception("JQUERY INJECT IS NOT WORKING");
    }
    return out;
}
window.getOtherCalls = function (node, attrib) {
    var out = '';
    if ($) {
        out = JSON.parse($(node).attr('data-' + attrib));
        $(node).attr('data-' + attrib, '');
    } else {
        throw new Exception("JQUERY INJECT IS NOT WORKING");
    }
    return out;
}
window.postEvents = function (node, event, value) {
    var jnode;
    if ($) {
        jnode = $(node);
        if (value) {
            jnode.val(value)
        }
        // jnode[event]();
        dispatchEvent(jnode[0], event, true, true);
    } else {
        throw new Exception("JQUERY INJECT IS NOT WORKING");
    }
}
var dispatchEvent = function(target, var_args) {
    var e = document.createEvent("Event");
    e.initEvent.apply(e, Array.prototype.slice.call(arguments, 1));
    target.dispatchEvent(e);
};

})();