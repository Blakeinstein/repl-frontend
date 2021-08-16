"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var templates_1 = require("./templates");
var ReactTemplate = /** @class */ (function (_super) {
    __extends(ReactTemplate, _super);
    function ReactTemplate(wd) {
        var _this = _super.call(this, wd) || this;
        _this.gitTemplate = "https://github.com/Blakeinstein/codeserver-react-template";
        _this.startScript = "dev";
        _this.folderName = "codeserver-react-template";
        _this.files = [
            'src/*',
            'index.html'
        ];
        return _this;
    }
    return ReactTemplate;
}(templates_1["default"]));
exports["default"] = ReactTemplate;
