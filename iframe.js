(function () {
	alert("ggg")
	
	var iframe = document.createElement('iframe');
	(function(e, s) {
	    e.src = s;
	    e.onload = function() {
	        console.log(window);
	        console.log('jQuery injected');
	    };
	    document.body.appendChild(e);
	})(iframe, "sidebar.html");
	iframe.width = '100%';
	iframe.height= '300';
	iframe.style= "background: white; position: fixed; bottom: 0; left: 0";
	document.body.style += ";margin-bottom: 1000px !important;";
})();
