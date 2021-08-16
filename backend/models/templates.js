"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var shelljs_1 = require("shelljs");
var nodegit_1 = require("nodegit");
var Template = /** @class */ (function () {
    function Template(wd) {
        this.initState = false;
        this.installState = false;
        this.gitTemplate = '';
        this.folderName = '';
        this.startScript = '';
        this.wd = '';
        this.files = [];
        this.output = null;
        this.wd = wd;
    }
    Template.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.gitTemplate)
                            throw new Error("Git template missing from template");
                        if (!this.wd)
                            throw new Error("Working directory was not provided");
                        shelljs_1["default"].cd(this.wd);
                        shelljs_1["default"].rm("-rf", this.folderName);
                        return [4 /*yield*/, nodegit_1.Clone.clone(this.gitTemplate, this.wd + "/" + this.folderName)];
                    case 1:
                        _a.sent();
                        this.initState = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    Template.prototype.install = function () {
        return __awaiter(this, void 0, void 0, function () {
            var progress;
            return __generator(this, function (_a) {
                if (!this.initState)
                    throw new Error("Template was not initialized");
                if (!this.folderName)
                    throw new Error("Template did not specify project folder name");
                shelljs_1["default"].cd(this.wd + "/" + this.folderName);
                progress = shelljs_1["default"].exec("yarn");
                this.installState = true;
                return [2 /*return*/];
            });
        });
    };
    Template.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.installState)
                            throw new Error("Dependencies were not installed");
                        if (!this.startScript)
                            throw new Error("Template did not specify start script name");
                        shelljs_1["default"].cd(this.wd + "/" + this.folderName);
                        this.output = shelljs_1["default"].exec("yarn " + this.startScript, { async: true });
                        return [4 /*yield*/, (function () {
                                return new Promise(function (resolve, reject) {
                                    _this.output.addListener("error", function (err) {
                                        reject(err);
                                    });
                                    console.log(_this.output.eventNames());
                                });
                            })()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Template.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.output)
                    this.output.kill();
                if (this.initState)
                    shelljs_1["default"].rm("-rf", this.wd + "/" + this.folderName);
                return [2 /*return*/];
            });
        });
    };
    return Template;
}());
exports["default"] = Template;
