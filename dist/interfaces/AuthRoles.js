"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AuthRoles;
(function (AuthRoles) {
    AuthRoles["AUTHENTICATED"] = "authenticated";
    AuthRoles["CONTACTS_READ"] = "contacts_read";
    AuthRoles["CONTACTS_EDIT"] = "contacts_edit";
    AuthRoles["MEMBERS_READ"] = "members_read";
    AuthRoles["MEMBERS_EDIT"] = "members_edit";
    AuthRoles["MAILING_LISTS"] = "mailing_lists";
    AuthRoles["RANKS_READ"] = "ranks_read";
    AuthRoles["RANKS_EDIT"] = "ranks_edit";
    AuthRoles["ORDERS_READ"] = "orders_read";
    AuthRoles["ORDERS_EDIT"] = "orders_edit";
    AuthRoles["COMPENSATIONS_READ"] = "compensation_read";
    AuthRoles["COMPENSATIONS_CREATE"] = "compensation_create";
    AuthRoles["COMPENSATIONS_EDIT"] = "compensation_edit";
    AuthRoles["COMPENSATIONS_APPROVE"] = "compensation_approve";
    AuthRoles["BILLINGREPORTS_READ"] = "billingreports_read";
    AuthRoles["BILLINGREPORTS_CREATE"] = "billingreports_create";
    AuthRoles["BILLINGREPORTS_EDIT"] = "billingreports_edit";
    AuthRoles["BILLINGREPORTS_APPROVE"] = "billingrepors_approve";
    AuthRoles["DRAFT_READ"] = "draft_read";
    AuthRoles["DRAFT_CREATE"] = "draft_create";
    AuthRoles["DRAFT_EDIT"] = "draft_edit";
    AuthRoles["ADMIN"] = "admin";
})(AuthRoles = exports.AuthRoles || (exports.AuthRoles = {}));
exports.AuthRolesByFunction = {
    // FHR
    9: [
        AuthRoles.MEMBERS_READ,
        AuthRoles.RANKS_READ
    ]
};
exports.AuthRolesByRank = {
    // VK
    10: [],
    // KA
    11: [],
    // KS
    12: [
        AuthRoles.MEMBERS_READ,
        AuthRoles.RANKS_READ,
        AuthRoles.BILLINGREPORTS_CREATE
    ],
    // GF
    13: [
        AuthRoles.MEMBERS_READ,
        AuthRoles.RANKS_READ,
        AuthRoles.BILLINGREPORTS_CREATE
    ],
    // ZF
    14: [
        AuthRoles.MEMBERS_READ,
        AuthRoles.RANKS_READ,
        AuthRoles.BILLINGREPORTS_CREATE,
        AuthRoles.MAILING_LISTS
    ],
    // OZF
    15: [
        AuthRoles.MEMBERS_READ,
        AuthRoles.CONTACTS_READ,
        AuthRoles.RANKS_READ,
        AuthRoles.BILLINGREPORTS_CREATE,
        AuthRoles.BILLINGREPORTS_READ,
        AuthRoles.ORDERS_READ,
        AuthRoles.COMPENSATIONS_READ,
        AuthRoles.COMPENSATIONS_CREATE,
        AuthRoles.MAILING_LISTS
    ],
    // Leiter Stv.
    29: [
        AuthRoles.MEMBERS_READ,
        AuthRoles.MEMBERS_EDIT,
        AuthRoles.CONTACTS_EDIT,
        AuthRoles.CONTACTS_READ,
        AuthRoles.RANKS_READ,
        AuthRoles.RANKS_EDIT,
        AuthRoles.BILLINGREPORTS_CREATE,
        AuthRoles.BILLINGREPORTS_READ,
        AuthRoles.BILLINGREPORTS_APPROVE,
        AuthRoles.BILLINGREPORTS_EDIT,
        AuthRoles.ORDERS_READ,
        AuthRoles.ORDERS_EDIT,
        AuthRoles.COMPENSATIONS_READ,
        AuthRoles.COMPENSATIONS_CREATE,
        AuthRoles.COMPENSATIONS_APPROVE,
        AuthRoles.COMPENSATIONS_EDIT,
        AuthRoles.DRAFT_READ,
        AuthRoles.DRAFT_EDIT,
        AuthRoles.DRAFT_READ,
        AuthRoles.MAILING_LISTS
    ],
    // Leiter
    28: [
        AuthRoles.MEMBERS_READ,
        AuthRoles.MEMBERS_EDIT,
        AuthRoles.CONTACTS_EDIT,
        AuthRoles.CONTACTS_READ,
        AuthRoles.RANKS_READ,
        AuthRoles.RANKS_EDIT,
        AuthRoles.BILLINGREPORTS_CREATE,
        AuthRoles.BILLINGREPORTS_READ,
        AuthRoles.BILLINGREPORTS_APPROVE,
        AuthRoles.BILLINGREPORTS_EDIT,
        AuthRoles.ORDERS_READ,
        AuthRoles.ORDERS_EDIT,
        AuthRoles.COMPENSATIONS_READ,
        AuthRoles.COMPENSATIONS_CREATE,
        AuthRoles.COMPENSATIONS_APPROVE,
        AuthRoles.COMPENSATIONS_EDIT,
        AuthRoles.DRAFT_READ,
        AuthRoles.DRAFT_EDIT,
        AuthRoles.DRAFT_READ,
        AuthRoles.MAILING_LISTS
    ],
    // VST
    16: [
        AuthRoles.MEMBERS_READ,
        AuthRoles.MEMBERS_EDIT,
        AuthRoles.CONTACTS_EDIT,
        AuthRoles.CONTACTS_READ,
        AuthRoles.RANKS_READ,
        AuthRoles.RANKS_EDIT,
        AuthRoles.BILLINGREPORTS_CREATE,
        AuthRoles.BILLINGREPORTS_READ,
        AuthRoles.BILLINGREPORTS_APPROVE,
        AuthRoles.BILLINGREPORTS_EDIT,
        AuthRoles.ORDERS_READ,
        AuthRoles.ORDERS_EDIT,
        AuthRoles.COMPENSATIONS_READ,
        AuthRoles.COMPENSATIONS_CREATE,
        AuthRoles.COMPENSATIONS_APPROVE,
        AuthRoles.COMPENSATIONS_EDIT,
        AuthRoles.DRAFT_READ,
        AuthRoles.DRAFT_EDIT,
        AuthRoles.DRAFT_READ,
        AuthRoles.MAILING_LISTS
    ],
};
//# sourceMappingURL=AuthRoles.js.map