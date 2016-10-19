(function(){
    var myApp,
        domAgent = window.DomAgent,
        propLoopFlag = false,
        pollFlag = false,
        homeScope,
        propScope,
        testcases = [
        // {
        //     "name": "Test for link button Node",
        //     "tnode": ".title .link-btn",
        //     "event": "Page Load",
        //     "nprop": {
        //         width: ["50px"],
        //         height: ["30px"]
        //     }
        // },
        // {
        //     "name": "Test for Add Accounts Node",
        //     "tnode": ".title .add-accts-btn",
        //     "event": "Page Load",
        //     "nprop": {
        //         width: ["100px"],
        //         height: ["70px"]
        //     }
        // }
    ];
    domAgent.init("POLL_RES");
    myApp = angular.module('myApp',['ngRoute']);
    myApp.filter('timerSum', function() {
        return function(input) {
            var len = input.length,
                out = 0,
                i;
            for (i = 0; i < len; i++) {
                out += input[i].timer * 1000;
            }
            return out + 1000;
        }
    });
    myApp.filter('escapeSlashes', function() {
        return function(input) {
            alert(input);
            return input.replace(/\\"/g, '\\\\"');
        }
    });
    myApp.filter('getEventName', function() {
        return function(input) {
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
            }
            return out;
        };
    })
    //myApp.directive('myDirective', function() {});
    //myApp.factory('myService', function() {});
    myApp.controller('MyCtrl', ['$scope', function($scope) {
        $scope.name = 'Superhero';
    }]);
    myApp.controller('Homepage', ['$scope', function($scope) {
        homeScope = $scope;
        $scope.testcases = testcases;
        $("#addTestCase").click(function () {
            $scope.testcases.push({
                "name": "",
                "tnode": "",
                "nprop": {}
            });
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
        var target = $(e.target).parents(".tests").first();
        $("#testCases .edit").attr('disabled', false);
        $(e.target).attr('disabled', true);
        propScope.show = true;
        index = target.find("[name='index']").first().val();
        propScope.props = testcases[index].nprop;
        propScope.$apply();
    }
    myApp.controller('MCS', ['$scope', function($scope) {
        $scope.now = new Date();
        $scope.type = homeScope.type;
        $scope.testcases = testcases;
        setTimeout(function () {
            var codeNode = $(".code").first(),
                text = "<pre>" + codeNode.text().replace(/\n+/g, "\n") + "</pre>";
            codeNode.html(text);
            $(".test-code button.copy").off("click").on("click", function () {
                function copyToClipboard(text) {
                      var input = document.createElement('textarea');
                      input.style.position = 'fixed';
                      input.style.opacity = 0;
                      input.value = text;
                      document.body.appendChild(input);
                      input.select();
                      document.execCommand('Copy');
                      document.body.removeChild(input);
                };
                copyToClipboard(codeNode.text().replace(/\n+/g, "\n"));
            });
        }, 400)

    }]);
    myApp.controller('JSON', ['$scope', function($scope) {
        //$scope.testcasesStr = JSON.stringify(testcases, null, 2);
        $scope.testcasesStr = JSON.stringify(angular.copy(testcases), null, 2);
    }]);
    myApp.controller('rCtrl', ['$scope', function($scope) {
        propScope = $scope;

    }]);
    myApp.config(function($routeProvider) {
        $routeProvider
            //default page
        .when('/', {
            templateUrl : 'pages/homepage.html',
            controller  : 'Homepage'
        })

        //page2
        .when('/json', {
            templateUrl : 'pages/JSON.html',
            controller  : 'JSON'
        })

        //page2
        .when('/mcs', {
            templateUrl : 'pages/mcs.html',
            controller  : 'MCS'
        });
    });
    try {
        chrome.devtools.panels.elements.onSelectionChanged.addListener(function () {
            getChange();
        });
    } catch (e) {
        console.log("Chrome not defined.");
    }
    var getChange = function () {
        
    }
    setInterval(function () {
        if (!pollFlag) {
            pollRequests();
        }
    }, 1000);
    function pollRequests() {
        pollFlag = true;
        domAgent.process({type: "DATA_REQ_PANEL", data: {}, callback: function (res) {
            generateTestcase(res);
            pollFlag = false;
        }});
    }
    function getProperties(root, node, nodeIndex, properties, callback) {
        var compPropList = [];
        $.each(properties, function (index, prop) {
            if (prop === 'Width') {
                compPropList.push("width");
            } else if (prop === 'Height') {
                compPropList.push("width");
            } else if (prop === 'Spacing') {
                compPropList.push("padding-top");
                compPropList.push("padding-right");
                compPropList.push("padding-bottom");
                compPropList.push("padding-left");
                compPropList.push("margin-top");
                compPropList.push("margin-right");
                compPropList.push("margin-bottom");
                compPropList.push("margin-left");
            } else if (prop === 'Text') {
                compPropList.push("font-size");
                compPropList.push("cursor");
                compPropList.push("color");
            } else if (prop === 'Presence') {
                compPropList.push("display");
                compPropList.push("visibility");
            } else if (prop === 'Position') {
                compPropList.push("top");
                compPropList.push("right");
                compPropList.push("bottom");
                compPropList.push("left");
                compPropList.push("position");
            } else if (prop === 'Dimension') {
                compPropList.push("width");
                compPropList.push("height");
            } else if (prop === 'Focus') {
                compPropList.push("focus");
            }
        });
        pollProps(root, node, nodeIndex, compPropList, callback);
    }
    function pollProps(root, node, nodeIndex, compPropList, callback) {
        var data,
            self = this;
        if (root) {
            data = {root: root, node: node, nodeIndex: nodeIndex, props: compPropList};
        }
        domAgent.process({type: "DATA_REQ_PROPS", data: data, callback: function (res) {
            callback.call(self, res)
        }});
    }
    function generateTestcase(input) {
        //testcases = [];
        var i = 0,
            index = 0,
            type = input.type,
            root = input.rootNode,
            events = input.events,
            properties = input.nprops;
        homeScope.type = type;
        if (type == '1') {
            $.each(input.childNodes, function (key, value) {
                var child = value.value;
                getProperties(root, child, 0, properties, function (res) {
                    var test = {
                        "name": "Test for Node " + child,
                        "root": root,
                        "tnode": child,
                        "nprop": getObjectedData(res.data)
                    };
                    testcases.push(test);
                    if (0 === i++) {
                        test.events = events;
                    }
                    updateTestcases();
                });
            });
        } else if (type == '2') {
            $.each(input.ajaxCalls, function (key, value) {
                var test = {
                    "name": "Test for Ajax Call " + value.url,
                    "method": value.method,
                    "post": value.postBody.replace(/\\"/g, '\\\\"')
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