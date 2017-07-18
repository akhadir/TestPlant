/// <reference path = "DomAgent.ts" />
/// <reference path = "RunEvents.ts" />
/// <reference path="../extJs/jquery.d.ts" />
/// <reference path="../node_modules/definitely-typed-angular/angular.d.ts" />
/// <reference path="../node_modules/definitely-typed-angular/angular-resource.d.ts" />
(function () {
    interface Settings {
        useIdInSelector: boolean;
        eventTimer: number;
        eventSessions: Array<EventSession>;
        preferredProps: Array<string>;
    }
    interface EventSession {
        name: string;
        value: Array<RunEvents.TEvent>;
    }
    var domAgent = DomAgents.DomAgent,
        runEvents = RunEvents.RunEvents,
        props = ['Dimension', 'Spacing', 'Presence', 'Text', 'Position', 'Focus', 'DOM Attributes'],
        // eventTypes = ['PageLoad', 'Click', 'Change', 'Hover', 'KeyPress', 'KeyUp', 'KeyDown', 'Focus', 'Blur', 'RightClick', 'DoubleClick'],
        addTestApp = angular.module('AddTestApp', []),
        testCaseScope:angular.IScope,
        settingsScope:angular.IScope,
        lastRemovedChild,
        sessName = "tcplant",
        settings:Settings = {};
    addTestApp.controller('Settings', ['$scope', function ($scope:angular.IScope) {
        settingsScope = $scope;
        if (settings) {
            if (settings.useIdInSelector == undefined) {
                settings.useIdInSelector = $scope.useIdInSelector = true;
            } else {
                $scope.useIdInSelector = settings.useIdInSelector;
            }
            $scope.eventSessions = [];
            if (settings.eventTimer == undefined) {
                settings.eventTimer = $scope.eventTimer = 3;
            } else {
                $scope.eventTimer = settings.eventTimer;
            }
            if (settings.eventSessions) {
                settingsScope.eventSessions = settings.eventSessions;
            }
            if (settings.preferredProps) {
                settingsScope.preferredProps = settings.preferredProps;
            } else {
                settings.preferredProps = settingsScope.preferredProps = $.extend(true, [], props);
            }
        }
    }]);
    addTestApp.controller('TestCase', ['$scope', function ($scope:angular.IScope) {
        testCaseScope = $scope;
        $scope.type = '1';
        $scope.events = [{node: ["document"], event: ["0"], timer: [5], evalue:['']}];
        $scope.rootNode = '';
        $scope.childNodes = [];
        $scope.nprops = $.extend(true, [], props);
        $scope.eventSessions = [];
        $scope.currEventSessName = "";
        if (settings) {
            if (settings.eventSessions) {
                testCaseScope.eventSessions = settings.eventSessions;
            }
            if (settings.preferredProps) {
                testCaseScope.nprops = $.extend(true, [], settings.preferredProps);
            }
            if (settings.eventTimer) {
                testCaseScope.events[0].timer = [settings.eventTimer];
            }
        }
    }]);
    
    chrome.storage.local.get(sessName, function(items:any) {
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
            if (settings.eventTimer == undefined) {
                settings.eventTimer = settingsScope.eventTimer = 3;
            } else {
                settingsScope.eventTimer = settings.eventTimer;
            }
            if (testCaseScope) {
                testCaseScope.events[0].timer = [settings.eventTimer];
            }
        } 
        if (testCaseScope) {
            if (settings.eventTimer == undefined) {
                settings.eventTimer = 3;
            }
            testCaseScope.events[0].timer = [settings.eventTimer];
        }
    });

    function saveSettings() {
        var sess:any = {};
        sess[sessName] = settings;
        chrome.storage.local.set(sess, function(items:any) {
            // saved
        });
    }
    domAgent.init();
    
    addTestApp.filter("trimURL", function () {
        return function(input: string) {
            return input.replace(/(http.+?)\?.+/, '$1');
        };
    });
    function getSelector(callback:Function) {
        domAgent.process({type: "DATA_REQ_SEL", callback: callback, data: {usi: settings.useIdInSelector}});
    }
    function getSelectorFromRoot(root: string, callback:Function) {
        domAgent.process({type: "DATA_REQ_SEL_WITH_ROOT", root: root, callback: callback, data: {usi: settings.useIdInSelector}});
    }
    function removeAjaxCall(index: number) {
        delete testCaseScope.ajaxCalls[index];
        testCaseScope.$apply();
    }
    function removeChild(removeVal:{value: string}) {
        var childNodes = testCaseScope.childNodes;
        lastRemovedChild = removeVal;
        testCaseScope.childNodes = $.grep(childNodes, function (value:{value: string}) {
            return (value.value !== removeVal.value);
        });
        testCaseScope.$apply();
    }
    function addChild(inp: string|Array<string>) {
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
        $(".child-nodes a.node").off("click").click(function (e:any) {
            removeChild($(e.currentTarget).data('val'));
        });
    }
    function setChildren(inp:string|Array<string>) {
        testCaseScope.childNodes = [];
        addChild(inp);
    }
    function getSelectedChildren(callback: Function) {
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
    function handleAddNodeClick(e: any) {
        var selNode = e.currentTarget;
        $(selNode).css("border-color", "green").css("border-width", "1px");
        getSelector(function (res: any) {
            var index = $(selNode).parents(".form-control-static").first().data("index");
            $(selNode).first().css("border-color", "grey").css("border-width", "auto");
            testCaseScope.events[index].node[0] = res;
            testCaseScope.$apply();
        });
        e.preventDefault();
    }
    function handleRootNodeClick(e: any) {
        var selNode = e.currentTarget;
        $(selNode).css("border-color", "green").css("border-width", "1px");
        getSelector(function (res:any) {
            //var index = $(selNode).parents(".form-control-static").first().data("index");
            $(selNode).first().css("border-color", "grey").css("border-width", "auto");
            testCaseScope.rootNode = res;
            $(".add-child").first().attr("disabled", false);
            testCaseScope.$apply();
        });
        e.preventDefault();
    }
    function handleDataNodeClick(e:any) {
        var selNode = e.currentTarget;
        $(selNode).css("border-color", "green").css("border-width", "1px");
        getSelector(function (res:any) {
            //var index = $(selNode).parents(".form-control-static").first().data("index");
            $(selNode).first().css("border-color", "grey").css("border-width", "auto");
            testCaseScope.dataNode = res;
            testCaseScope.$apply();
        });
        e.preventDefault();
    }
    function removeProp(removeVal:string) {
        var properties = testCaseScope.nprops;
        testCaseScope.nprops = jQuery.grep(properties, function (value: string) {
            return value !== removeVal;
        });
        testCaseScope.$apply();
    }
    function sremoveProp(removeVal:string) {
        var properties = $.extend(true, [], settingsScope.preferredProps);
        settings.preferredProps = settingsScope.preferredProps = jQuery.grep(properties, function (value:string) {
            return value !== removeVal;
        });
        settingsScope.$apply();
    }
    function getSelectedEventSession(name:string) {
        var sess = settings.eventSessions,
            len = sess.length,
            out:EventSession|undefined,
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
        $(".del-ev-sess").off("click").click(function (e: any) {
            var index = $(e.currentTarget).data("id");
            settings.eventSessions.splice(index, 1);
            saveSettings();
            testCaseScope.$apply();
            settingsScope.$apply();
        });
    }
    function addSettingsPropEvents() {
        $(".settings .reset-prop").off("click").click(function (e:any) {
            $(".settings a.prop").off("click");
            settings.preferredProps = settingsScope.preferredProps = props;
            settingsScope.$apply();
            $(".settings a.prop").click(function (e:any) {
                sremoveProp($(e.currentTarget).data('val'));
            });
            e.preventDefault();
        });
        $(".settings a.prop").click(function (e:any) {
            sremoveProp($(e.currentTarget).data('val'));
        });
        $(".save-pref-prop").off("click").click(function () {
            testCaseScope.nprops = $.extend(true, [], settings.preferredProps);
            settings.useIdInSelector = settingsScope.useIdInSelector;
            settings.eventTimer = settingsScope.eventTimer;
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
                    $("#sbLoadCalls").click(function (e: any) {
                        domAgent.process({type: "DATA_REQ_AJAX_CALLS", callback: function (data: any) {
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
                    $("#sbLoadOthrCalls").click(function (e:any) {
                        var data = {dataNode: testCaseScope.dataNode, dataAttrib: testCaseScope.dataAttrib};
                        domAgent.process({type: "DATA_REQ_OTHER_CALLS", data: data, callback: function (res: DomAgents.IResponse) {
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
            if (sess) {
                testCaseScope.events = sess.value;
                testCaseScope.$apply();
                addEvenRunEvents();
            }
        });
        $("#saveEvents").off('change').change(function () {
            var val = $("#saveEvents").val();
            if (val) {
                $(".save-events-sess").attr("disabled", false);
            } else {
                $(".save-events-sess").attr("disabled", true);
            }
        });
        
        $(".save-events-sess").off("click").click(function (e: any) {
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
        
        $(".load-calls .calls a").off("click").click(function (e: any) {
            // removeAjaxCall($(e.currentTarget).data('val'));
        });
        $(".add-child").off("click").click(function (e:any) {
            getSelectedChildren(function (res:string|Array<string>) {
                setChildren(res);
            });
            e.preventDefault();
        });
        
        $(".load-events").off("click").click(function (e:any) {
            $(".load-events").addClass("hide");
            $(".load-cont").removeClass("hide");
        });
        $(".load-events-sess").off("click").click(function (e: any) {
            $(".load-events").removeClass("hide")
            $(".load-cont").addClass("hide");
        });
        $(".add-event").off("click").click(function (e: any) {
            testCaseScope.events.push({node: ["document"], event: ["0"], timer: [settings.eventTimer]});
            testCaseScope.$apply();
            addEvenRunEvents();
            e.preventDefault();
        });
        function addEvenRunEvents() {
            $(".remove-event").off("click").click(function (e: any) {
                var index = $(e.currentTarget).data("index");
                testCaseScope.events.splice(index, 1);
                testCaseScope.$apply();
                e.preventDefault();
            });
            $(".run-event").off("click").click(function (e: any) {
                var index = $(e.currentTarget).data("index"),
                    event = testCaseScope.events[index];
                runEvents.run(event);
            });
            $(".run-events").off("click").click(function (e: any) {
                runEvents.runAll(testCaseScope.events);
            });
            $(".event-node").off('click').off('focus');
            $(".event-node").click(handleAddNodeClick).focus(handleAddNodeClick);
        }
        $(".testcase .reset-prop").off("click").click(function (e: any) {
            $(".properties a.prop").off("click");
            testCaseScope.nprops = props;
            testCaseScope.$apply();
            $(".properties a.prop").click(function (e: any) {
                removeProp($(e.currentTarget).data('val'))
            });
            e.preventDefault();
        });
        
        $(".add-nodes").first().off("click").click(function (e: any) {
            getSelectorFromRoot(testCaseScope.rootNode, function (res: any) {
                addChild(res);
            });
        });
        $(".root-node").first().off("change").change(function () {
            handleRootNodeChange();
        }).off("click").off("focus").click(handleRootNodeClick).focus(handleRootNodeClick);
        $(".data-node").off("click").off("focus").click(handleDataNodeClick).focus(handleDataNodeClick);
        $(".event-node").first().off("click").off("focus").click(handleAddNodeClick).focus(handleAddNodeClick);
        $(".child-nodes a.node").off("click").click(function (e: any) {
            removeChild($(e.currentTarget).data('val'))
        });
        $(".properties a.prop").off("click").click(function (e: any) {
            removeProp($(e.currentTarget).data('val'))
        });
        handleRootNodeChange();
        $("input[type='submit']").off("click").click(function () {
            var data:any = {};
            $.each(testCaseScope, function (key: string, value:any) {
                if (key.indexOf("$") != 0) {
                    data[key] = value;
                }
            });
            domAgent.process({type: "DATA_RES_TESTCASE", data: data, callback: function (res:DomAgents.IResponse) {
                //Request Sent
            }});
        });
    }
    setTimeout(function () {
        addEvents();
    }, 1000);
    
})();