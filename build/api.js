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
var axios_1 = __importDefault(require("axios"));
var utils_1 = require("./utils");
var node_html_parser_1 = require("node-html-parser");
var moment_1 = __importDefault(require("moment"));
var API = /** @class */ (function () {
    function API(options) {
        this.email = "";
        this.password = "";
        this.date = "";
        this.startDate = "";
        this.endDate = "";
        this.userId = "";
        this.pep_jwt_token = "";
        this.pep_oath_token = "";
        this.pep_oauth_refresh_token = "";
        this.pep_oauth_refresh_token_pp = "";
        this.sessionId = "";
        this.guests = null;
        this.selectedGuests = [];
        this.selectedParks = [];
        this.email = options.email;
        this.password = options.password;
        this.date = options.date;
    }
    API.prototype.getSessionAndCsrf = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, headers, data, setCookie, cookie, i, root, csrfInput, rawAttributes, value, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get(utils_1.phpSessionUrl)];
                    case 1:
                        response = _a.sent();
                        headers = response.headers, data = response.data;
                        setCookie = headers["set-cookie"];
                        cookie = "";
                        for (i = 0; i < setCookie.length; i++) {
                            if (setCookie[i].includes("PHP")) {
                                cookie += setCookie[i] + "; ";
                            }
                        }
                        cookie = cookie.split(";")[0];
                        root = node_html_parser_1.parse(data);
                        csrfInput = root.querySelector("#pep_csrf");
                        rawAttributes = csrfInput.rawAttributes;
                        value = rawAttributes.value;
                        this.sessionId = cookie.split("=")[1];
                        return [2 /*return*/, { csrf: value, cookie: cookie }];
                    case 2:
                        e_1 = _a.sent();
                        throw e_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    API.prototype.login = function (cookie, csrf) {
        return __awaiter(this, void 0, void 0, function () {
            var loginBody, e_2, _a, status_1, headers, cookies, i, cookie_1, value, key, initialSplit, userId, userIdHeader;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        loginBody = utils_1.formLoginBody(this.email, this.password, csrf);
                        return [4 /*yield*/, axios_1.default.post(utils_1.loginUrl, loginBody, {
                                maxRedirects: 0,
                                headers: {
                                    Cookie: cookie,
                                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36",
                                },
                            })];
                    case 1:
                        _b.sent();
                        throw new Error("No redirect. Something has changed. Create an issue.");
                    case 2:
                        e_2 = _b.sent();
                        _a = e_2.response, status_1 = _a.status, headers = _a.headers;
                        if (status_1 === 302) {
                            cookies = headers["set-cookie"];
                            for (i = 0; i < cookies.length; i++) {
                                cookie_1 = cookies[i];
                                value = cookie_1.substring(cookie_1.indexOf("=") + 1).split(";")[0];
                                key = cookie_1.substring(0, cookie_1.indexOf("="));
                                if (key === "SWID") {
                                    initialSplit = cookie_1
                                        .split(";")[0]
                                        .replace(/{/g, "")
                                        .replace(/}/g, "");
                                    userId = initialSplit.split("=")[1];
                                    this.userId = userId;
                                }
                                if (key === "pep_oauth_token") {
                                    this.pep_oath_token = value;
                                }
                                if (key === "pep_oauth_refresh_token") {
                                    this.pep_oauth_refresh_token = value;
                                }
                                if (key === "pep_oauth_refresh_token_pp") {
                                    this.pep_oauth_refresh_token_pp = value;
                                }
                                if (key === "pep_jwt_token") {
                                    this.pep_jwt_token = value;
                                }
                            }
                            userIdHeader = cookies.find(function (item) {
                                return item.includes("SWID");
                            });
                            if (!userIdHeader) {
                                throw new Error("Unable to get userId");
                            }
                        }
                        else {
                            throw e_2;
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    API.prototype.getAvailableDates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, endDate, startDate, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get(utils_1.availableDatesUrl)];
                    case 1:
                        response = _a.sent();
                        data = response.data;
                        endDate = data.endDate, startDate = data.startDate;
                        console.log("data: ", data);
                        if (moment_1.default(startDate).isAfter(this.date)) {
                            throw new Error("Your configured date is before any available dates.");
                        }
                        if (moment_1.default(endDate).isBefore(this.date)) {
                            throw new Error("Your configured date is after any available dates");
                        }
                        this.startDate = startDate;
                        this.endDate = endDate;
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        throw e_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    API.prototype.formAuthCookie = function () {
        return "pep_jwt_token=" + this.pep_jwt_token + "; pep_oauth_token=" + this.pep_oath_token + "; pep_oauth_refresh_token=" + this.pep_oauth_refresh_token + "; pep_oauth_refresh_token_pp=" + this.pep_oauth_refresh_token_pp + "; SWID={" + this.userId + "}; PHPSESSID=" + this.sessionId;
    };
    API.prototype.getGuests = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, guests, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get(utils_1.createGuestUrl(this.userId), {
                                headers: { Authorization: "BEARER " + this.pep_oath_token },
                            })];
                    case 1:
                        response = _a.sent();
                        data = response.data;
                        guests = data.guests;
                        this.guests = guests;
                        return [3 /*break*/, 3];
                    case 2:
                        e_4 = _a.sent();
                        throw e_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    API.prototype.checkForParkAvailability = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, parks, availableParks, _loop_1, i, message, selectedParks, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get(utils_1.getParksUrl(this.date, this.selectedGuests), { headers: { Authorization: "BEARER " + this.pep_oath_token } })];
                    case 1:
                        response = _a.sent();
                        data = response.data;
                        parks = data.parks;
                        availableParks = [];
                        _loop_1 = function (i) {
                            var park = parks[i];
                            var available = park.available, id = park.id;
                            if (available) {
                                var parkFound = utils_1.PARKS.find(function (item) { return item.id === id; });
                                if (parkFound !== undefined) {
                                    availableParks.push({ name: parkFound.name, value: id });
                                }
                            }
                        };
                        for (i = 0; i < parks.length; i++) {
                            _loop_1(i);
                        }
                        if (!availableParks || !availableParks.length) {
                            throw new Error("No parks are available at this time");
                        }
                        message = "Select the parks you would like to search. Press the spacebar to select. Enter to submit.";
                        return [4 /*yield*/, utils_1.selectOptions(message, availableParks, "selectedParks")];
                    case 2:
                        selectedParks = _a.sent();
                        this.selectedParks = selectedParks;
                        return [3 /*break*/, 4];
                    case 3:
                        e_5 = _a.sent();
                        throw e_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    API.prototype.askForGuestsToUse = function () {
        return __awaiter(this, void 0, void 0, function () {
            var choices, i, guest, firstName, lastName, xid, message, selectedUsers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.guests || !this.guests.length) {
                            throw new Error("There are no guests attached to this session.");
                        }
                        choices = [];
                        for (i = 0; i < this.guests.length; i++) {
                            guest = this.guests[i];
                            firstName = guest.firstName, lastName = guest.lastName, xid = guest.xid;
                            choices.push({ name: firstName + " " + lastName, value: xid });
                        }
                        message = "Select which users you would like to make reservations for. Press the spacebar to select. Enter to submit.";
                        return [4 /*yield*/, utils_1.selectOptions(message, choices, "selectedUsers")];
                    case 1:
                        selectedUsers = _a.sent();
                        this.selectedGuests = selectedUsers;
                        return [2 /*return*/];
                }
            });
        });
    };
    API.prototype.getSegmentId = function (parkId) {
        return __awaiter(this, void 0, void 0, function () {
            var segmentUrl, response, data, segments, firstSegent, segmentId, e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        segmentUrl = utils_1.formGetSegmentUrl(this.selectedGuests, this.date, parkId);
                        return [4 /*yield*/, axios_1.default.get(segmentUrl, {
                                headers: {
                                    Authorization: "BEARER " + this.pep_oath_token,
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        data = response.data;
                        segments = data.segments;
                        if (!segments || !segments.length) {
                            throw new Error("No Segments available");
                        }
                        firstSegent = segments[0];
                        segmentId = firstSegent.segmentId;
                        return [2 /*return*/, segmentId];
                    case 2:
                        e_6 = _a.sent();
                        throw e_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    API.prototype.getOfferId = function (segmentId, parkId) {
        return __awaiter(this, void 0, void 0, function () {
            var checkUrl, response, data, experience, offers, offerWithNoConflict, checkOfferUrl, checkOnOfferResponse, e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        checkUrl = utils_1.formCheckReservationsUrl(this.selectedGuests, this.date, parkId, segmentId);
                        return [4 /*yield*/, axios_1.default.get(checkUrl, {
                                headers: {
                                    Authorization: "BEARER " + this.pep_oath_token,
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        data = response.data;
                        experience = data.experience;
                        if (!experience)
                            throw new Error("No experience available for this configuration.");
                        offers = experience.offers;
                        if (!offers || !offers.length)
                            throw new Error("No offers available for this configuration");
                        offerWithNoConflict = offers.find(function (offer) { return !offer.hasConflictingPlanAtTime && !offer.isLocked; });
                        if (!offerWithNoConflict)
                            throw new Error("All the offers have conflicts");
                        checkOfferUrl = utils_1.formCheckOfferUrl(offerWithNoConflict.id);
                        return [4 /*yield*/, axios_1.default.put(checkOfferUrl, {}, {
                                headers: {
                                    Authorization: "BEARER " + this.pep_oath_token,
                                },
                            })];
                    case 2:
                        checkOnOfferResponse = _a.sent();
                        if (checkOnOfferResponse.data.offer) {
                            return [2 /*return*/, checkOnOfferResponse.data.offer.id];
                        }
                        throw new Error("Offer is not available anymore.");
                    case 3:
                        e_7 = _a.sent();
                        throw e_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    API.prototype.acceptOffer = function (offerId) {
        return __awaiter(this, void 0, void 0, function () {
            var acceptUrl, body, response, data, e_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        acceptUrl = utils_1.formAcceptOfferUrl(this.userId);
                        body = { offerId: offerId };
                        return [4 /*yield*/, axios_1.default.post(acceptUrl, body, {
                                headers: {
                                    Authorization: "BEARER " + this.pep_oath_token,
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        data = response.data;
                        console.log("OFFER  SUCCESSFULLY ACEPTED exiting");
                        process.exit(0);
                        return [3 /*break*/, 3];
                    case 2:
                        e_8 = _a.sent();
                        throw e_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return API;
}());
exports.default = API;
