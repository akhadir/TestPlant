/// <reference path='src/index.d.ts'/>
/// <reference path='src/IStatic.d.ts'/>
"use strict";
var jQuery = require("jquery/dist/jquery");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = jQuery;
function initJQuery(window) {
    return jQuery(window);
}
exports.initJQuery = initJQuery;
