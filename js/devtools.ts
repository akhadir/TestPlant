/// <reference path = "../extJs/chrome.d.ts" />
/// <reference path = "../js/DomAgent.ts" />
(function () {
    var pollFlag = true,
        ajaxCalls = [],
        domAgent = DomAgents.DomAgent,
        tcSidebar,
        tcPanel;

    domAgent.init("POLL_REQ");
    chrome.devtools.panels.create("TCPlant", "icon.png", "panel.html",
        function (panel:any) {
          // code invoked on panel creation
            tcPanel = panel;
            panel.show();
        }
    );

    chrome.devtools.panels.elements.createSidebarPane("Testcases",
        function (sidebar:any) {
            tcSidebar = sidebar;
            sidebar.setPage("sidebar.html");
            //sidebar.setHeight("8ex");
        });

    chrome.devtools.panels.elements.onSelectionChanged.addListener(function (res:any) {
        console.log(res);
    });
    
})();