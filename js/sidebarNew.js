(function () {
    var domAgent = window.DomAgent,
        props = ['Dimension', 'Spacing', 'Presence', 'Text', 'Position', 'Focus'],
        eventTypes = ['PageLoad', 'Click', 'Change', 'Hover', 'KeyPress', 'KeyUp', 'KeyDown', 'Focus', 'Blur', 'RightClick', 'DoubleClick'],
        addTestApp = angular.module('AddTestApp',[]),
        testCaseScope,
        lastRemovedChild,
        selecNode;
    domAgent.init();
    addTestApp.controller('TestCase', ['$scope', function($scope) {
        testCaseScope = $scope;
        $scope.type = '1';
        $scope.events = [{node: ["document"], event: ["0"], timer: [3]}];
        $scope.rootNode = '';
        $scope.childNodes = [];
        $scope.nprops = props;
    }]);
    function getSelector(callback) {
        domAgent.process({type: "DATA_REQ_SEL", callback: callback, data: {}});
    }
    function getSelectorFromRoot(root, callback) {
        domAgent.process({type: "DATA_REQ_SEL_WITH_ROOT", root: root, callback: callback, data: {}});
    }
    function setChildren(inp) {
        testCaseScope.childNodes = [];
        addChild(inp);
    }
    function addChild(inp) {
        var i,
            len;
        if (typeof inp == "string") {
            testCaseScope.childNodes.push({value: inp});
        } else {
            len = inp.length;
            for (i = 0; i < len; i++) {
                testCaseScope.childNodes.push({value: inp[i]});
            }
        }
        testCaseScope.$apply();
        $(".child-nodes a.node").off("click").click(function (e) {
            removeChild($(e.target).data('val'))
        });
    }
    function getSelectedChildren(callback) {
        var rootSel = $(".root-node").first().val();
        domAgent.process({type: "DATA_REQ_SEL_CHILDREN", root: rootSel, callback: callback, data: {}});
    }
    
    $(".root-node").first().change(function () {
        handleRootNodeChange();
    });
    function handleRootNodeChange() {
        if ($(".root-node").val().trim() == "") {
            $(".add-child").first().attr("disabled", true);
        } else {
            $(".add-child").first().attr("disabled", false);
        }
    }
    function handleAddNodeClick(e) {       
        var selNode = e.target;
        $(selNode).css("border-color", "green").css("border-width", "1px");
        getSelector(function (res) {
            var index = $(selNode).parents(".form-control-static").first().data("index");
            $(selNode).first().css("border-color", "grey").css("border-width", "auto");
            testCaseScope.events[index].node[0] = res;
            testCaseScope.$apply();
        });
        e.preventDefault();
    }
    function handleRootNodeClick(e) {       
        var selNode = e.target;
        $(selNode).css("border-color", "green").css("border-width", "1px");
        getSelector(function (res) {
            var index = $(selNode).parents(".form-control-static").first().data("index");
            $(selNode).first().css("border-color", "grey").css("border-width", "auto");
            testCaseScope.rootNode = res;
            $(".add-child").first().attr("disabled", false);
            testCaseScope.$apply();
        });
        e.preventDefault();
    }
    $(".root-node").first().click(handleRootNodeClick).focus(handleRootNodeClick);
    $(".add-child").click(function (e) {
        getSelectedChildren(function (res) {
            setChildren(res);
        });
        e.preventDefault();
    });

    $(".add-event").click(function (e) {
        testCaseScope.events.push({node: ["document"], event: ["0"], timer: [1]});
        testCaseScope.$apply();
        $(".remove-event").off("click").click(function (e) {
            var index = $(e.target).data("index");
            testCaseScope.events.splice(index, 1);
            testCaseScope.$apply();
            e.preventDefault();
        });
        $(".event-node").off('click').off('focus');
        $(".event-node").click(handleAddNodeClick).focus(handleAddNodeClick);
        e.preventDefault();
    });

    $(".reset-prop").click(function (e) {
        $(".properties a.prop").off("click");
        testCaseScope.nprops = props;
        testCaseScope.$apply();
        $(".properties a.prop").click(function (e) {
            removeProp($(e.target).data('val'))
        });
        e.preventDefault();
    });
    $(".add-nodes").first().click(function (e) {
        getSelectorFromRoot(testCaseScope.rootNode, function (res) {
            addChild(res);
        });
    });
    setTimeout(function () {
        $(".event-node").first().click(handleAddNodeClick).focus(handleAddNodeClick);
        $(".child-nodes a.node").click(function (e) {
            removeChild($(e.target).data('val'))
        });
        $(".properties a.prop").click(function (e) {
            removeProp($(e.target).data('val'))
        });
        handleRootNodeChange();
    }, 1000);
    function removeProp(removeVal) {
        var properties = testCaseScope.nprops;
        testCaseScope.nprops = jQuery.grep(properties, function(value) {
            return value != removeVal;
        });
        testCaseScope.$apply();
    }
    function removeChild(removeVal) {
        var childNodes = testCaseScope.childNodes;
        lastRemovedChild = removeVal;
        testCaseScope.childNodes = jQuery.grep(childNodes, function(value) {
            return (value.value != removeVal.value);
        });
        testCaseScope.$apply();
    }
    $("input[type='submit']").click(function () {
        var data = {};
        $.each(testCaseScope, function (key, value) {
            if (key.indexOf("$") != 0) {
                data[key] = value;
            }
        });
        domAgent.process({type: "DATA_RES_TESTCASE", data: data, callback: function (res) {
            //Request Sent
        }});
    });
})();