"use strict";
(function () {
    var pollFlag = true, ajaxCalls = [], domAgent = DomAgents.DomAgent, tcSidebar, tcPanel;
    domAgent.init("POLL_REQ");
    chrome.devtools.panels.create("TCPlant", "icon.png", "panel.html", function (panel) {
        tcPanel = panel;
        panel.show();
    });
    chrome.devtools.panels.elements.createSidebarPane("Testcases", function (sidebar) {
        tcSidebar = sidebar;
        sidebar.setPage("sidebar.html");
    });
    chrome.devtools.panels.elements.onSelectionChanged.addListener(function (res) {
        console.log(res);
    });
})();
//# sourceMappingURL=devtools.js.map