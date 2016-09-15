(function () {
    var props = ['Dimension', 'Spacing', 'Presence', 'Text', 'Position'],
        eventTypes = ['PageLoad', 'Click', 'Change', 'Hover', 'KeyPress', 'KeyUp', 'KeyDown', 'Focus', 'Blur', 'RightClick', 'DoubleClick'];
    var addTestApp = angular.module('AddTestApp',[]),
        testCaseScope,
        lastRemovedChild,
        selecNode;
    addTestApp.controller('TestCase', ['$scope', function($scope) {
        testCaseScope = $scope;
        $scope.type = '1';
        $scope.events = [{node: ["document"], event: ["0"]}];
        $scope.rootNode = "#iAEAHeader";
        $scope.childNodes = [];
        $scope.nprops = props;
    }]);
    function getSelector(selNode, secReq) {
        if (!selecNode || !secReq || (secReq && selecNode == selNode)) {
            selecNode = selNode;
            chrome.runtime.sendMessage({type: "DATA_REQ_SEL"}, function (res) {
                if (!res) {
                    setTimeout(function () {
                      getSelector(selNode, true);
                    }, 1000);
                } else {
                    $(selNode).first().val(res).css("border-color", "grey").css("border-width", "auto");
                    $(".add-child").first().attr("disabled", false);
                }
            });
        } else {
            $(selNode).first().css("border-color", "grey").css("border-width", "auto");
        }
    }
    function getSelectorToAdd(parent) {
        chrome.runtime.sendMessage({type: "DATA_REQ_SEL"}, function (res) {
            if (!res) {
                setTimeout(function () {
                    getSelectorToAdd(parent);
                }, 1000);
            } else {
                if ($(parent).first().find(res).length) {
                    addChild(res);
                }
            }
        });
    }
    function setChildren(inp) {
        testCaseScope.childNodes = inp;
        testCaseScope.$apply();
        $(".child-nodes a.node").off("click");
        $(".child-nodes a.node").click(function (e) {
            removeChild($(e.target).data('val'))
        });
    }
    function addChild(inp) {
        testCaseScope.childNodes.push(inp);
        testCaseScope.$apply();
        $(".child-nodes a.node").off("click");
        $(".child-nodes a.node").click(function (e) {
            removeChild($(e.target).data('val'))
        });
    }
    function getSelectedChildren() {
        var rootSel = $(".root-node").first().val();
        chrome.runtime.sendMessage({type: "DATA_REQ_SEL_CHILDREN", root: rootSel}, function (res) {
            if (!res) {
                setTimeout(function () {
                  getSelectedChildren();
                }, 1000);
            } else {
                setChildren(res);
            }
        });
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
        getSelector(selNode);
        e.preventDefault();
    }
    $(".root-node").first().click(handleAddNodeClick);
    $(".root-node").first().focus(handleAddNodeClick);
    $(".add-child").click(function (e) {
        getSelectedChildren();
        e.preventDefault();
    });

    $(".add-event").click(function (e) {
        testCaseScope.events.push({node:["document"], event: ["0"]});
        testCaseScope.$apply();
        $(".remove-event").off("click");
        $(".remove-event").click(function (e) {
            var index = $(e.target).data("index");
            testCaseScope.events.splice(index, 1);
            testCaseScope.$apply();
            e.preventDefault();
        });
        $(".event-node").off('click');
        $(".event-node").off('focus');
        $(".event-node").click(handleAddNodeClick);
        $(".event-node").focus(handleAddNodeClick);
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

    })
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
            return value != removeVal;
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
        chrome.runtime.sendMessage({type: "DATA_RES_TESTCASE", data: data}, function (res) {
            //Request Sent
        });
    });
})();