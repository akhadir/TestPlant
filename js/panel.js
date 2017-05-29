"use strict";
(function () {
    var myApp, type, tempEventIndex, domAgent = DomAgents.DomAgent, propLoopFlag = false, pollFlag = false, homeScope, propScope, testcases = [];
    domAgent.init("POLL_RES");
    myApp = angular.module('myApp', ['ngRoute']);
    myApp.filter("ajaxIndex", function () {
        return function (input) {
            var index = 0, test, temp;
            if (!input.clearPrev) {
                temp = testcases.indexOf(input);
                if (temp > 0) {
                    test = testcases[index - 1];
                    index = test.index + 1;
                }
            }
            input.index = index;
            return index;
        };
    });
    myApp.filter('timerSum', function () {
        return function (input) {
            var len = input.length, out = 0, i;
            for (i = 0; i < len; i++) {
                out += input[i].timer * 1000;
            }
            return out + 1000;
        };
    });
    myApp.filter('eventIndex', function () {
        return function (increment) {
            if (increment) {
                tempEventIndex++;
            }
            return tempEventIndex;
        };
    });
    myApp.filter('escapeSlashes', function () {
        return function (input) {
            return input.replace(/\\"/g, '\\\\"');
        };
    });
    myApp.filter('geRunEvents.TEventName', function () {
        return function (input) {
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
                    out = "mouseover";
                    break;
                case "4":
                    out = "keypress";
                    break;
                case "5":
                    out = "keyup";
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
                    out = "doubleclick";
                    break;
                case "11":
                    out = "submit";
                    break;
            }
            return out;
        };
    });
    myApp.controller('MyCtrl', ['$scope', function ($scope) {
            $scope.name = 'Superhero';
        }]);
    myApp.controller('Homepage', ['$scope', function ($scope) {
            homeScope = $scope;
            $scope.testcases = testcases;
            $scope.type = type;
            $("#addTestCase").off("click").click(function () {
                if (type == '1') {
                    $scope.testcases.push({
                        "name": "",
                        "tnode": "",
                        "nprop": {}
                    });
                }
                else if (type == '2') {
                    $scope.testcases.push({
                        "name": "",
                        "method": "",
                        "post": ""
                    });
                }
                $scope.$apply();
            });
            $scope.homepage = "Homepage";
            setTimeout(function () {
                $("#testCases .edit").off("click").click(editProperties);
                $("#testCases input").off("focus").focus(function (e) {
                    propScope.show = false;
                    $("#testCases .edit").attr('disabled', false);
                    propScope.$apply();
                });
                $("#home .clear-all-tests").first().off("click").click(function (e) {
                    homeScope.testcases = testcases = [];
                    homeScope.$apply();
                });
            }, 100);
        }]);
    function editProperties(e) {
        var target = $(e.target).parents(".tests").first(), index;
        $("#testCases .edit").attr('disabled', false);
        $(e.target).attr('disabled', true);
        propScope.show = true;
        index = target.find("[name='index']").first().val();
        propScope.props = testcases[index].nprop;
        propScope.$apply();
    }
    myApp.controller('MCS', ['$scope', function ($scope) {
            tempEventIndex = 0;
            $scope.now = new Date();
            $scope.type = homeScope.type;
            $scope.testcases = testcases;
            setTimeout(function () {
                var codeNode = $(".code").first(), text = "<pre>" + codeNode.text().replace(/\n+/g, "\n") + "</pre>";
                codeNode.html(text);
                $(".test-code button.copy").off("click").on("click", function () {
                    function copyToClipboard(text) {
                        var input = document.createElement('textarea');
                        input.style.position = 'fixed';
                        input.style.opacity = '0';
                        input.value = text;
                        document.body.appendChild(input);
                        input.select();
                        document.execCommand('Copy');
                        document.body.removeChild(input);
                    }
                    ;
                    copyToClipboard(codeNode.text().replace(/\n+/g, "\n"));
                });
            }, 400);
        }]);
    myApp.controller('JSON', ['$scope', function ($scope) {
            $scope.testcasesStr = JSON.stringify(angular.copy(testcases), null, 2);
        }]);
    myApp.controller('rCtrl', ['$scope', function ($scope) {
            propScope = $scope;
        }]);
    myApp.config(function ($routeProvider) {
        $routeProvider
            .when('/', {
            templateUrl: 'pages/homepage.html',
            controller: 'Homepage'
        })
            .when('/json', {
            templateUrl: 'pages/JSON.html',
            controller: 'JSON'
        })
            .when('/mcs', {
            templateUrl: 'pages/mcs.html',
            controller: 'MCS'
        });
    });
    var getChange = function () {
    };
    try {
        chrome.devtools.panels.elements.onSelectionChanged.addListener(function () {
            getChange();
        });
    }
    catch (e) {
        console.log("Chrome not defined.");
    }
    function poll() {
        if (!pollFlag) {
            pollFlag = true;
            domAgent.process({ type: "DATA_REQ_PANEL", data: {}, callback: function (res) {
                    if (res) {
                        generateTestcase(res);
                    }
                } });
        }
    }
    setTimeout(function () {
        poll();
        $(".fetch-data").on("click", function () {
            pollFlag = false;
            poll();
        });
    }, 1000);
    function getProperties(root, node, nodeIndex, properties) {
        var compPropList = [];
        $.each(properties, function (index, prop) {
            if (prop === 'Width') {
                compPropList.push("width");
            }
            else if (prop === 'Height') {
                compPropList.push("width");
            }
            else if (prop === 'Spacing') {
                compPropList.push("padding-top");
                compPropList.push("padding-right");
                compPropList.push("padding-bottom");
                compPropList.push("padding-left");
                compPropList.push("margin-top");
                compPropList.push("margin-right");
                compPropList.push("margin-bottom");
                compPropList.push("margin-left");
            }
            else if (prop === 'Text') {
                compPropList.push("font-size");
                compPropList.push("cursor");
                compPropList.push("color");
            }
            else if (prop === 'Presence') {
                compPropList.push("display");
                compPropList.push("visibility");
            }
            else if (prop === 'Position') {
                compPropList.push("top");
                compPropList.push("right");
                compPropList.push("bottom");
                compPropList.push("left");
                compPropList.push("position");
            }
            else if (prop === 'Dimension') {
                compPropList.push("width");
                compPropList.push("height");
            }
            else if (prop === 'DOM Attributes') {
                compPropList.push("data");
                compPropList.push("value");
            }
            else if (prop === 'Focus') {
                compPropList.push("focus");
            }
        });
        return new Promise((resolve, reject) => {
            pollProps(root, node, nodeIndex, compPropList, resolve);
        });
    }
    function pollProps(root, node, nodeIndex, compPropList, callback) {
        var data;
        if (root) {
            data = { root: root, node: node, nodeIndex: nodeIndex, props: compPropList };
        }
        domAgent.process({ type: "DATA_REQ_PROPS", data: data, callback: function (res) {
                var test = {
                    "name": "Test for Node " + node,
                    "root": root,
                    "tnode": node,
                    "nprop": getObjectedData(res.data),
                    "events": []
                };
                callback(test);
            } });
    }
    function generateTestcase(input) {
        var i = 0, index = 0, root = input.rootNode, events = input.events, properties = input.nprops, prom, type = input.type;
        homeScope.type = type;
        if (type == '1') {
            prom = [];
            $.each(input.childNodes, function (key, value) {
                var child = value.value;
                prom.push(getProperties(root, child, 0, properties));
            });
            Promise.all(prom).then(function (result) {
                result[0].events = events;
                testcases = testcases.concat(result);
                updateTestcases();
            }, function () {
            });
        }
        else if (type == '2') {
            $.each(input.ajaxCalls, function (key, value) {
                var postData = value.postData ? value.postData : value.queryString, test = {
                    "index": 0,
                    "name": "Test for Ajax Call " + value.url,
                    "method": value.method,
                    "post": postData.text,
                    "clearPrev": value.clearPrev,
                    "events": []
                };
                testcases.push(test);
                if (0 === i++) {
                    test.events = events;
                }
                updateTestcases();
            });
        }
        else if (type == '3') {
            homeScope.dataNode = input.dataNode;
            homeScope.dataAttrib = input.dataAttrib;
            $.each(input.dataCalls, function (key, value) {
                var test = {
                    "name": "Test for Data Call " + value[0],
                    "test": angular.toJson(value),
                    "events": []
                };
                testcases.push(test);
                if (0 === i++) {
                    test.events = events;
                }
                updateTestcases();
            });
        }
    }
    function getObjectedData(obj) {
        $.each(obj, function (key, value) {
            obj[key] = [value];
        });
        return obj;
    }
    function updateTestcases() {
        homeScope.testcases = testcases;
        homeScope.$apply();
        $("#testCases .edit").off('click').click(editProperties);
    }
})();
//# sourceMappingURL=panel.js.map