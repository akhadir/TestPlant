(function () {

    var domAgent = window.DomAgent,
        props = ['Dimension', 'Spacing', 'Presence', 'Text', 'Position', 'Focus', 'DOM Attributes'],
        // eventTypes = ['PageLoad', 'Click', 'Change', 'Hover', 'KeyPress', 'KeyUp', 'KeyDown', 'Focus', 'Blur', 'RightClick', 'DoubleClick'],
        addTestApp = angular.module('AddTestApp', []),
        testCaseScope,
        settingsScope,
        lastRemovedChild,
        sessName = "tcplant",
        settings = {};
    addTestApp.controller('Settings', ['$scope', function ($scope) {
        settingsScope = $scope;
        if (settings.useIdInSelector == undefined) {
            settings.useIdInSelector = $scope.useIdInSelector = true;
        } else {
            $scope.useIdInSelector = settings.useIdInSelector;
        }
        $scope.eventSessions = [];
        if (settings.eventSessions) {
            settingsScope.eventSessions = settings.eventSessions;
        }
        if (settings.preferredProps) {
            settingsScope.preferredProps = settings.preferredProps;
        } else {
            settings.preferredProps = settingsScope.preferredProps = $.extend(true, [], props);
        }
    }]);
    addTestApp.controller('TestCase', ['$scope', function ($scope) {
        testCaseScope = $scope;
        $scope.type = '1';
        $scope.events = [{node: ["document"], event: ["0"], timer: [5]}];
        $scope.rootNode = '';
        $scope.childNodes = [];
        $scope.nprops = $.extend(true, [], props);
        $scope.eventSessions = [];
        $scope.currEventSessName = "";
        if (settings.eventSessions) {
            testCaseScope.eventSessions = settings.eventSessions;
        }
        if (settings.preferredProps) {
            testCaseScope.nprops = $.extend(true, [], settings.preferredProps);
        }
    }]);
    
    chrome.storage.local.get(sessName, function(items) {
        var i, len;
        if (items[sessName]) {
            settings = items[sessName];
        }
        
        if (settings.eventSessions) {
            if (testCaseScope) {
                if (settings.preferredProps) {
                    testCaseScope.nprops = $.extend(true, [], settings.preferredProps);
                }
                testCaseScope.eventSessions = settings.eventSessions;
                testCaseScope.$apply();
            }
            if (settingsScope) {
                if (settings.preferredProps) {
                    settingsScope.preferredProps = settings.preferredProps;
                } else {
                    settings.preferredProps = settingsScope.preferredProps = $.extend([], props);
                }
                settingsScope.eventSessions = settings.eventSessions;
                settingsScope.$apply();
            }
        }
        if (settingsScope) {
            if (settings.useIdInSelector == undefined) {
                settings.useIdInSelector = settingsScope.useIdInSelector = true;
            } else {
                settingsScope.useIdInSelector = settings.useIdInSelector;
            }
        }
    });

    function saveSettings() {
        var sess = {};
        sess[sessName] = settings;
        chrome.storage.local.set(sess, function(items) {
            // saved
        });
    }
    domAgent.init();
    
    addTestApp.filter("trimURL", function () {
        return function(input) {
            return input.replace(/(http.+?)\?.+/, '$1');
        };
    });
    function getSelector(callback) {
        domAgent.process({type: "DATA_REQ_SEL", callback: callback, data: {usi: settings.useIdInSelector}});
    }
    function getSelectorFromRoot(root, callback) {
        domAgent.process({type: "DATA_REQ_SEL_WITH_ROOT", root: root, callback: callback, data: {usi: settings.useIdInSelector}});
    }
    function removeAjaxCall(index) {
        delete testCaseScope.ajaxCalls[index];
        testCaseScope.$apply();
    }
    function removeChild(removeVal) {
        var childNodes = testCaseScope.childNodes;
        lastRemovedChild = removeVal;
        testCaseScope.childNodes = jQuery.grep(childNodes, function (value) {
            return (value.value !== removeVal.value);
        });
        testCaseScope.$apply();
    }
    function addChild(inp) {
        var i,
            len;
        if (typeof inp === "string") {
            testCaseScope.childNodes.push({value: inp});
        } else {
            len = inp.length;
            for (i = 0; i < len; i++) {
                testCaseScope.childNodes.push({value: inp[i]});
            }
        }
        testCaseScope.$apply();
        $(".child-nodes a.node").off("click").click(function (e) {
            removeChild($(e.currentTarget).data('val'));
        });
    }
    function setChildren(inp) {
        testCaseScope.childNodes = [];
        addChild(inp);
    }
    function getSelectedChildren(callback) {
        var rootSel = $(".root-node").first().val();
        domAgent.process({type: "DATA_REQ_SEL_CHILDREN", root: rootSel, callback: callback, data: {usi: settings.useIdInSelector}});
    }

    function handleRootNodeChange() {
        if ($(".root-node").val().trim() === "") {
            $(".add-child").first().attr("disabled", true);
        } else {
            $(".add-child").first().attr("disabled", false);
        }
    }
    function handleAddNodeClick(e) {
        var selNode = e.currentTarget;
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
        var selNode = e.currentTarget;
        $(selNode).css("border-color", "green").css("border-width", "1px");
        getSelector(function (res) {
            //var index = $(selNode).parents(".form-control-static").first().data("index");
            $(selNode).first().css("border-color", "grey").css("border-width", "auto");
            testCaseScope.rootNode = res;
            $(".add-child").first().attr("disabled", false);
            testCaseScope.$apply();
        });
        e.preventDefault();
    }
    function handleDataNodeClick(e) {
        var selNode = e.currentTarget;
        $(selNode).css("border-color", "green").css("border-width", "1px");
        getSelector(function (res) {
            //var index = $(selNode).parents(".form-control-static").first().data("index");
            $(selNode).first().css("border-color", "grey").css("border-width", "auto");
            testCaseScope.dataNode = res;
            testCaseScope.$apply();
        });
        e.preventDefault();
    }
    function removeProp(removeVal) {
        var properties = testCaseScope.nprops;
        testCaseScope.nprops = jQuery.grep(properties, function (value) {
            return value !== removeVal;
        });
        testCaseScope.$apply();
    }
    function sremoveProp(removeVal) {
        var properties = $.extend(true, [], settingsScope.preferredProps);
        settings.preferredProps = settingsScope.preferredProps = jQuery.grep(properties, function (value) {
            return value !== removeVal;
        });
        settingsScope.$apply();
    }
    function getSelectedEventSession(name) {
        var sess = settings.eventSessions,
            len = sess.length,
            out,
            i;
        for (i = 0; i < len; i++) {
            if (sess[i].name === name) {
                out = sess[i];
                break;
            }
        }
        return out;
    }
    function addDeleteEventSession() {
        $(".del-ev-sess").off("click").click(function (e) {
            var index = $(e.currentTarget).data("id");
            settings.eventSessions.splice(index, 1);
            saveSettings();
            testCaseScope.$apply();
            settingsScope.$apply();
        });
    }
    function addSettingsPropEvents() {
        $(".settings .reset-prop").off("click").click(function (e) {
            $(".settings a.prop").off("click");
            settings.preferredProps = settingsScope.preferredProps = props;
            settingsScope.$apply();
            $(".settings a.prop").click(function (e) {
                sremoveProp($(e.currentTarget).data('val'));
            });
            e.preventDefault();
        });
        $(".settings a.prop").click(function (e) {
            sremoveProp($(e.currentTarget).data('val'));
        });
        $(".save-pref-prop").off("click").click(function () {
            testCaseScope.nprops = $.extend(true, [], settings.preferredProps);
            settings.useIdInSelector = settingsScope.useIdInSelector;
            saveSettings();
            testCaseScope.$apply();
        });
        // $(".toggle-uis").off("change").change(function (e) {
        //     if (settings.useIdInSelector) {
        //         $scope.useIdInSelector = settings.useIdInSelector = false;
        //     } else {
        //         $scope.useIdInSelector = settings.useIdInSelector = true;
        //     }
        // });
    }
    
    function addEvents() {
        $(".settings-btn").off("click").click(function () {
            $(".container.settings").removeClass("hide");
            $(".container.testcase").addClass("hide");
            addDeleteEventSession();
            addSettingsPropEvents();
        });
        $(".settings-cls-btn").off("click").click(function () {
            $(".container.settings").addClass("hide");
            $(".container.testcase").removeClass("hide");
        });
        
        $("#sbTcType").off("change").change(function () {
            var type = $("#sbTcType").val();
            testCaseScope.type = type;
            testCaseScope.$apply();
            if (type == '2') {
                setTimeout(function () {
                    $("#sbLoadCalls").off("click");
                    $("#sbLoadCalls").click(function (e) {
                        domAgent.process({type: "DATA_REQ_AJAX_CALLS", callback: function (data) {
                            testCaseScope.ajaxCalls = data;
                            testCaseScope.$apply();
                            addEvents();
                        }});
                    });
                }, 500);
            } else if (type == '3') {
                testCaseScope.dataNode = "body";
                testCaseScope.dataAttrib = "ytrack";
                testCaseScope.$apply();
                setTimeout(function () {
                    $("#sbLoadOthrCalls").off("click");
                    $("#sbLoadOthrCalls").click(function (e) {
                        var data = {dataNode: testCaseScope.dataNode, dataAttrib: testCaseScope.dataAttrib};
                        domAgent.process({type: "DATA_REQ_OTHER_CALLS", data: data, callback: function (res) {
                            testCaseScope.dataCalls = res;
                            testCaseScope.$apply();
                        }});
                    });
                }, 500);
            }
            addEvents();
        });
        $("#loadEvents").off('change').change(function () {
            var val = $("#loadEvents").val(),
                sess = getSelectedEventSession(val);
            testCaseScope.events = $.extend(true, [], sess.value);
            testCaseScope.$apply();
            addEventEvents();
        });
        $("#saveEvents").off('change').change(function () {
            var val = $("#saveEvents").val();
            if (val) {
                $(".save-events-sess").attr("disabled", false);
            } else {
                $(".save-events-sess").attr("disabled", true);
            }
        });
        
        $(".save-events-sess").off("click").click(function (e) {
            if (settings.eventSessions) {
                settings.eventSessions.push({
                    name: testCaseScope.currEventSessName,
                    value: $.extend(true, [], testCaseScope.events)
                });
            } else {
                settings.eventSessions = [{
                    name: testCaseScope.currEventSessName,
                    value: $.extend(true, [], testCaseScope.events)
                }];
                testCaseScope.eventSessions = settings.eventSessions;
            }
            saveSettings();
            testCaseScope.$apply();
        });
        
        $(".load-calls .calls a").off("click").click(function (e) {
            // removeAjaxCall($(e.currentTarget).data('val'));
        });
        $(".add-child").off("click").click(function (e) {
            getSelectedChildren(function (res) {
                setChildren(res);
            });
            e.preventDefault();
        });
        
        $(".load-events").off("click").click(function (e) {
            $(".load-events").addClass("hide");
            $(".load-cont").removeClass("hide");
        });
        $(".load-events-sess").off("click").click(function (e) {
            $(".load-events").removeClass("hide")
            $(".load-cont").addClass("hide");
        });
        $(".add-event").off("click").click(function (e) {
            testCaseScope.events.push({node: ["document"], event: ["0"], timer: [1]});
            testCaseScope.$apply();
            addEventEvents();
            e.preventDefault();
        });
        function addEventEvents() {
            $(".remove-event").off("click").click(function (e) {
                var index = $(e.currentTarget).data("index");
                testCaseScope.events.splice(index, 1);
                testCaseScope.$apply();
                e.preventDefault();
            });
            $(".run-event").off("click").click(function (e) {
                var index = $(e.currentTarget).data("index"),
                    event = testCaseScope.events[index],
                    value = '',
                    data;
                if (event.evalue && event.evalue[0]) {
                    value = event.evalue[0];
                }
                data = {
                    node: event.node[0],
                    event: getEventName(event.event[0]),
                    value: value
                };
                domAgent.process({type: "DATA_POST_EVENTS", data: data, callback: function (res) {
                    //Request Sent
                }});
            });
            $(".event-node").off('click').off('focus');
            $(".event-node").click(handleAddNodeClick).focus(handleAddNodeClick);
        }
        function getEventName(input) {
            var out = "click";
            switch (input) {
                case "0":
                    out = "";
                    break;
                case "1":
                    out = "click";
                    break;
                case "2":
                    out = "change";
                    break;
                case "3":
                    out = "mouseover",
                    brek;
                case "4":
                    out =  "keypress";
                    break;
                case "5":
                    out =  "keyup";
                    break;
                case "6":
                    out = "keydown";
                    break;
                case "7":
                    out = "focus";
                    break;
                case "8":
                    out = "blur";
                    break;
                case "9":
                    out = "rightclick";
                    break;
                case "10":
                    out = "doubleclick"
                    break;
                case "11":
                    out = "submit"
                    break;
            }
            return out;
        };
        $(".testcase .reset-prop").off("click").click(function (e) {
            $(".properties a.prop").off("click");
            testCaseScope.nprops = props;
            testCaseScope.$apply();
            $(".properties a.prop").click(function (e) {
                removeProp($(e.currentTarget).data('val'))
            });
            e.preventDefault();
        });
        
        $(".add-nodes").first().off("click").click(function (e) {
            getSelectorFromRoot(testCaseScope.rootNode, function (res) {
                addChild(res);
            });
        });
        $(".root-node").first().off("change").change(function () {
            handleRootNodeChange();
        }).off("click").off("focus").click(handleRootNodeClick).focus(handleRootNodeClick);
        $(".data-node").off("click").off("focus").click(handleDataNodeClick).focus(handleDataNodeClick);
        $(".event-node").first().off("click").off("focus").click(handleAddNodeClick).focus(handleAddNodeClick);
        $(".child-nodes a.node").off("click").click(function (e) {
            removeChild($(e.currentTarget).data('val'))
        });
        $(".properties a.prop").off("click").click(function (e) {
            removeProp($(e.currentTarget).data('val'))
        });
        handleRootNodeChange();
        $("input[type='submit']").off("click").click(function () {
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
    }
    setTimeout(function () {
        addEvents();
    }, 1000);
    
})();