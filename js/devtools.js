(function () {
    var pollFlag = true,
        ajaxCalls = [],
        domAgent = window.DomAgent,
        tcSidebar,
        tcPanel;

    domAgent.init("POLL_REQ");
    chrome.devtools.panels.create("TCPlant", "icon.png", "panel.html",
        function (panel) {
          // code invoked on panel creation
            tcPanel = panel;
            panel.show();
        }
        );

    chrome.devtools.panels.elements.createSidebarPane("Testcases",
        function (sidebar) {
            tcSidebar = sidebar;
            sidebar.setPage("sidebar.html");
            //sidebar.setHeight("8ex");
        });

    chrome.devtools.panels.elements.onSelectionChanged.addListener(function (res) {
        console.log(res);
    });
    
})();