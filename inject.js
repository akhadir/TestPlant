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
        //console.log(root + "+" + node)
        $.each(properties, function (index, prop) {
            out[prop] = cNode.css(prop);
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
                if (rootNode && rootNode.is(this)) {
                    return false;
                } else if (maxDepth && index <= maxDepth) {
                    out = '#' + this.id + ' ' + out;
                    return false;
                }
                out = '#' + this.id + ' ' + out;
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
            out += '.' + node.className.split(' ').join('.');
        }
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