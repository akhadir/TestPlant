(function () {
  var TCPlantPanel,
      domAgent = DomAgent;
  domAgent.init("POLL_REQ")
  chrome.devtools.panels.create("TCPlant",
      "icon.png",
      "panel.html",
      function(panel) {
        // code invoked on panel creation
          TCPlantPanel = panel;
          chrome.runtime.TCPlantPanel = panel;
          panel.show();
      }
  );

  chrome.devtools.panels.elements.createSidebarPane("Testcases",
  function(sidebar) {
      TCPlantSidebar = sidebar;
      chrome.runtime.TCPlantSidebar = sidebar;
      sidebar.setPage("sidebar.html");
      //sidebar.setHeight("8ex");
  });

  chrome.devtools.panels.elements.onSelectionChanged.addListener(function (e) {
      getSelector();
  });
  function getSelector() {
      var data = {};
      chrome.devtools.inspectedWindow.eval("getSelector($0)", {"useContentScriptContext": true},function(result, isException) {
          if (!isException) {
              data.selector = result;
              chrome.runtime.sendMessage({type: "DATA_RES_SEL", data: result}, function (res) {
                  //Reponse Sent
              });
          } else {
            //alert("Exception" + isException)
          }
      });
  }
  function getChildren(pnode) {
      var data = {};
      chrome.devtools.inspectedWindow.eval("getChildren('" + pnode + "')", {"useContentScriptContext": true},function(result, isException) {
          if (!isException) {
              data.selector = result;
              chrome.runtime.sendMessage({type: "DATA_RES_SEL_CHILDREN", data: result}, function (res) {
                  //Reponse Sent
              });
          } else {
              //alert("Exception" + isException)
          }
      });
  }
  function getProperties(root, node, properties) {
      var data = {},
          propString = JSON.stringify(properties),
          code = "getComputedProps('" + root + "', '" + node +"'," + propString + ")";

      chrome.devtools.inspectedWindow.eval(code, {"useContentScriptContext": true},function(result, isException) {
          if (!isException) {
              data.data = result;
              data.root = root;
              data.node = node;
              chrome.runtime.sendMessage({type: "DATA_RES_PROPS", data: data}, function (res) {
                  //Response Sent
              });
          } else {
              console.log(code);
              console.log("Exception: " + JSON.stringify(isException));
          }
      });
  }
  // Polling for requests
  var pollFlag = false;
  function pollRequests() {
      pollFlag = true;
      chrome.runtime.sendMessage({type: "DATA_REQ"}, function (res) {
          var req, i, data;
          if (res && res.length) {
              for (i in res) {
                  req = res[i];
                  if (req.type === 'DATA_REQ_SEL_CHILDREN') {
                      getChildren(req.root);
                  } else if (req.type === 'DATA_REQ_PROPS') {
                      data = req.data;
                      getProperties(data.root, data.node, data.props);
                  }
              }
          }
          pollFlag = false;
      });
  }
  setInterval(function () {
      if (!pollFlag) {
          pollRequests();
      }
  }, 1000);

})();