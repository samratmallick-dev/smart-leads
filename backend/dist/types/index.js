"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.LeadSource = exports.LeadStatus = void 0;
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["New"] = "New";
    LeadStatus["Contacted"] = "Contacted";
    LeadStatus["Qualified"] = "Qualified";
    LeadStatus["Lost"] = "Lost";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
var LeadSource;
(function (LeadSource) {
    LeadSource["Website"] = "Website";
    LeadSource["Instagram"] = "Instagram";
    LeadSource["Referral"] = "Referral";
})(LeadSource || (exports.LeadSource = LeadSource = {}));
var UserRole;
(function (UserRole) {
    UserRole["Admin"] = "admin";
    UserRole["Sales"] = "sales";
})(UserRole || (exports.UserRole = UserRole = {}));
