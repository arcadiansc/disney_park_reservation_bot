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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForCachedTokens = exports.cacheTokens = exports.selectOptions = exports.getParksUrl = exports.createGuestUrl = exports.availableDatesUrl = exports.formGetSegmentUrl = exports.formAcceptOfferUrl = exports.formCheckOfferUrl = exports.formCheckReservationsUrl = exports.refreshTokenUrl = exports.PARKS = exports.loginUrl = void 0;
var inquirer_1 = __importDefault(require("inquirer"));
var fs_1 = __importDefault(require("fs"));
exports.loginUrl = "https://disneyworld.disney.go.com/login/";
exports.PARKS = [
    { id: "80007944", name: "Magic Kingdom" },
    { id: "80007838", name: "Epcot" },
    { id: "80007998", name: "Hollywood Studios" },
    { id: "80007823", name: "Animal Kingdom" },
];
exports.refreshTokenUrl = "https://disneyworld.disney.go.com/authentication/get-client-token/";
function formCheckReservationsUrl(guests, date, parkId, segmentId) {
    var guestString = createGuestString(guests);
    return "https://disneyworld.disney.go.com/vas/api/v1/availability/dates/" + date + "/parks/" + parkId + "/reservations/" + segmentId + "?guestXids=" + guestString + "&conflictingEntitlementIds=&replacementEntitlementIds=";
}
exports.formCheckReservationsUrl = formCheckReservationsUrl;
function formCheckOfferUrl(offerId) {
    return "https://disneyworld.disney.go.com/vas/api/v1/offers/" + offerId;
}
exports.formCheckOfferUrl = formCheckOfferUrl;
function formAcceptOfferUrl(userId) {
    return "https://disneyworld.disney.go.com/vas/api/v1/park-reservation/users/%7B" + userId + "%7D/entitlements";
}
exports.formAcceptOfferUrl = formAcceptOfferUrl;
function formGetSegmentUrl(guests, date, parkId) {
    var guestString = createGuestString(guests);
    return "https://disneyworld.disney.go.com/vas/api/v1/park-reservation/eligibility/dates/" + date + "/parks/" + parkId + "/segments?guestXids=" + guestString;
}
exports.formGetSegmentUrl = formGetSegmentUrl;
exports.availableDatesUrl = "https://disneyworld.disney.go.com/vas/api/v1/park-reservation/eligibility/dates";
function createGuestUrl(userId) {
    return "https://disneyworld.disney.go.com/vas/api/v1/park-reservation/users/%7B" + userId + "%7D/guests";
}
exports.createGuestUrl = createGuestUrl;
function createGuestString(guests) {
    var guestString = "";
    for (var i = 0; i < guests.length; i++) {
        if (i !== 0) {
            guestString += ",";
        }
        guestString += guests[i];
    }
    return guestString;
}
function getParksUrl(date, guests) {
    var guestString = createGuestString(guests);
    return "https://disneyworld.disney.go.com/vas/api/v1/park-reservation/availability/dates/" + date + "/parks?guestXids=" + guestString;
}
exports.getParksUrl = getParksUrl;
function selectOptions(message, choices, name) {
    return __awaiter(this, void 0, void 0, function () {
        var answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, inquirer_1.default.prompt([
                        {
                            type: "checkbox",
                            name: name,
                            message: message,
                            choices: choices,
                        },
                    ], function (answers) {
                        // console.log("answers: ", answers);
                    })];
                case 1:
                    answer = _a.sent();
                    return [2 /*return*/, answer[name]];
            }
        });
    });
}
exports.selectOptions = selectOptions;
function cacheTokens(email, accessToken, refreshToken, userId) {
    var cacheString = accessToken + "|" + refreshToken + "|" + userId;
    try {
        fs_1.default.writeFileSync("./tokens/" + email, cacheString);
    }
    catch (e) {
        console.log("Please make a tokens directory in the root of this project to continue");
        throw e;
    }
}
exports.cacheTokens = cacheTokens;
function checkForCachedTokens(email) {
    try {
        var tokens = fs_1.default.readFileSync("./tokens/" + email, "utf8");
        if (!tokens)
            throw new Error("No tokens were cached");
        var _a = __read(tokens.split('|'), 3), accessToken = _a[0], refreshToken = _a[1], userId = _a[2];
        return { accessToken: accessToken, refreshToken: refreshToken, userId: userId };
    }
    catch (e) {
        return false;
    }
}
exports.checkForCachedTokens = checkForCachedTokens;
