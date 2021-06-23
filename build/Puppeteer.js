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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var puppeteer_1 = __importDefault(require("puppeteer"));
var utils_1 = require("./utils");
var window;
var Puppeteer = /** @class */ (function () {
    function Puppeteer(email, password) {
        var _this = this;
        this.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36";
        this.responseUrls = [];
        this.responses = [];
        this.requests = [];
        this.email = "";
        this.password = "";
        this.createPage = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // @ts-ignore
                        _a = this;
                        return [4 /*yield*/, puppeteer_1.default.launch({
                                headless: true,
                                args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
                            })];
                    case 1:
                        // @ts-ignore
                        _a.browser = _c.sent();
                        _b = this;
                        return [4 /*yield*/, this.browser.newPage()];
                    case 2:
                        _b.page = _c.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.kill = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.browser.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.waitForInput = function (retry) {
            if (retry === void 0) { retry = 0; }
            return __awaiter(_this, void 0, void 0, function () {
                var element, frame, inputs, button;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (retry > 100)
                                throw new Error("Unable to get inputs");
                            return [4 /*yield*/, this.page.$('#disneyid-iframe')];
                        case 1:
                            element = _a.sent();
                            if (!element) {
                                this.page.waitForTimeout(500);
                                return [2 /*return*/, this.waitForInput(retry + 1)];
                            }
                            return [4 /*yield*/, element.contentFrame()];
                        case 2:
                            frame = _a.sent();
                            if (!frame) {
                                this.page.waitForTimeout(500);
                                return [2 /*return*/, this.waitForInput(retry + 1)];
                            }
                            return [4 /*yield*/, frame.$$('input')];
                        case 3:
                            inputs = _a.sent();
                            return [4 /*yield*/, frame.$('button')];
                        case 4:
                            button = _a.sent();
                            if (!inputs || !inputs.length) {
                                this.page.waitForTimeout(500);
                                return [2 /*return*/, this.waitForInput(retry + 1)];
                            }
                            return [2 /*return*/, { inputs: inputs, button: button }];
                    }
                });
            });
        };
        this.start = function (url) { return __awaiter(_this, void 0, void 0, function () {
            var _a, inputs, button, accessToken, refreshToken, userId, login, e_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.createPage()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.page.setUserAgent(this.userAgent)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.page.goto(url)];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, this.waitForInput(0)];
                    case 4:
                        _a = _b.sent(), inputs = _a.inputs, button = _a.button;
                        return [4 /*yield*/, this.page.waitForTimeout(3000)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, inputs[0].type(this.email, { delay: 20 })];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, inputs[1].type(this.password, { delay: 20 })];
                    case 7:
                        _b.sent();
                        return [4 /*yield*/, button.click()];
                    case 8:
                        _b.sent();
                        accessToken = "";
                        refreshToken = "";
                        userId = "";
                        login = "https://registerdisney.go.com/jgc/v6/client/TPR-WDW-LBJS.WEB-PROD/guest/login?langPref=en-US";
                        // @ts-ignore
                        return [4 /*yield*/, this.page.waitForResponse(function (response) { return __awaiter(_this, void 0, void 0, function () {
                                var matches, text, body;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            matches = response.url() === login;
                                            if (!matches) return [3 /*break*/, 3];
                                            return [4 /*yield*/, response.status()];
                                        case 1:
                                            text = _a.sent();
                                            return [4 /*yield*/, response.json()];
                                        case 2:
                                            body = _a.sent();
                                            // console.log("MATCHES: ", text, body);
                                            if (body && body.data && body.data.token) {
                                                accessToken = body.data.token.access_token;
                                                refreshToken = body.data.token.refresh_token;
                                                userId = body.data.token.swid.replace(/{/g, '').replace(/}/g, '');
                                            }
                                            return [2 /*return*/, true];
                                        case 3: return [2 /*return*/, false];
                                    }
                                });
                            }); })];
                    case 9:
                        // @ts-ignore
                        _b.sent();
                        _b.label = 10;
                    case 10:
                        _b.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, this.kill()];
                    case 11:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        e_1 = _b.sent();
                        return [3 /*break*/, 13];
                    case 13:
                        utils_1.cacheTokens(this.email, accessToken, refreshToken, userId);
                        return [2 /*return*/, { accessToken: accessToken, refreshToken: refreshToken, userId: userId }];
                }
            });
        }); };
        this.email = email;
        this.password = password;
    }
    return Puppeteer;
}());
exports.default = Puppeteer;
