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
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var api_1 = __importDefault(require("./api"));
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var email, password, date, API, _a, cookie, csrf, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    email = process.env.email;
                    password = process.env.password;
                    date = process.env.date;
                    if (email === undefined || password === undefined) {
                        throw new Error("Email or password not set in .env file");
                    }
                    if (date === undefined) {
                        throw new Error("No date passed");
                    }
                    API = new api_1.default({ email: email, password: password, date: date });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, API.getAvailableDates()];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, API.getSessionAndCsrf()];
                case 3:
                    _a = _b.sent(), cookie = _a.cookie, csrf = _a.csrf;
                    return [4 /*yield*/, API.login(cookie, csrf)];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, API.getGuests()];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, API.askForGuestsToUse()];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, API.checkForParkAvailability()];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, worker(API)];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 9:
                    e_1 = _b.sent();
                    console.log(e_1.message);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function sleep(timeout) {
    return new Promise(function (resolve) {
        setTimeout(function () { return resolve(); }, timeout);
    });
}
function worker(API) {
    return __awaiter(this, void 0, void 0, function () {
        var segmentResults, i, park, segmentId, i, result, offerId, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, , 15]);
                    segmentResults = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < API.selectedParks.length)) return [3 /*break*/, 4];
                    park = API.selectedParks[i];
                    return [4 /*yield*/, API.getSegmentId(park)];
                case 2:
                    segmentId = _a.sent();
                    segmentResults.push({ segmentId: segmentId, parkId: park });
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    i = 0;
                    _a.label = 5;
                case 5:
                    if (!(i < segmentResults.length)) return [3 /*break*/, 9];
                    result = segmentResults[i];
                    return [4 /*yield*/, API.getOfferId(result.segmentId, result.parkId)];
                case 6:
                    offerId = _a.sent();
                    return [4 /*yield*/, API.acceptOffer(offerId)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 5];
                case 9:
                    console.log("Sleeping 5 seconds before next attempt");
                    return [4 /*yield*/, sleep(5000)];
                case 10:
                    _a.sent();
                    worker(API);
                    return [3 /*break*/, 15];
                case 11:
                    e_2 = _a.sent();
                    if (!e_2.message.includes(410)) return [3 /*break*/, 13];
                    console.log("There are no slots available");
                    console.log("Sleeping 5 seconds before next attempt");
                    return [4 /*yield*/, sleep(5000)];
                case 12:
                    _a.sent();
                    worker(API);
                    return [3 /*break*/, 14];
                case 13:
                    console.log("Error: ", e_2.message);
                    _a.label = 14;
                case 14: return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
main();
