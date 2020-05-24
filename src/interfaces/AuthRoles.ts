export enum AuthRoles {
	AUTHENTICATED = 'authenticated',

	CONTACTS_READ = 'contacts_read',
	CONTACTS_EDIT = 'contacts_edit',

	MEMBERS_READ = 'members_read',
	MEMBERS_EDIT = 'members_edit',

	MAILING_LISTS = 'mailing_lists',

	RANKS_READ = 'ranks_read',
	RANKS_EDIT = 'ranks_edit',

	ORDERS_READ = 'orders_read',
	ORDERS_EDIT = 'orders_edit',

	COMPENSATIONS_READ = 'compensations_read',
	COMPENSATIONS_CREATE = 'compensations_create',
	COMPENSATIONS_EDIT = 'compensations_edit',
	COMPENSATIONS_APPROVE = 'compensations_approve',

	BILLINGREPORTS_READ = 'billingreports_read',
	BILLINGREPORTS_CREATE = 'billingreports_create',
	BILLINGREPORTS_EDIT = 'billingreports_edit',
	BILLINGREPORTS_APPROVE = 'billingrepors_approve',

	DRAFT_READ = 'draft_read',
	DRAFT_CREATE = 'draft_create',
	DRAFT_EDIT = 'draft_edit',

	PAYOUTS_READ = 'payouts_read',
	PAYOUTS_CREATE = 'payouts_create',
	PAYOUTS_SEND = 'payouts_send',

	LOGOFFS_READ = 'logoffs_read',
	LOGOFFS_CREATE = 'logoffs_create',
	LOGOFFS_EDIT = 'logoffs_edit',
	LOGOFFS_APPROVE = 'logoffs_approve',

	ADMIN = 'admin',
}

export const AuthRolesByFunction: { [index: number]: Array<AuthRoles> } = {
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
		AuthRoles.MAILING_LISTS,
		AuthRoles.PAYOUTS_READ,
		AuthRoles.PAYOUTS_CREATE,
		AuthRoles.PAYOUTS_SEND,
		AuthRoles.LOGOFFS_CREATE,
		AuthRoles.LOGOFFS_EDIT,
		AuthRoles.LOGOFFS_READ,
		AuthRoles.LOGOFFS_APPROVE,
	],
	// FHR
	9: [AuthRoles.MEMBERS_READ, AuthRoles.RANKS_READ, AuthRoles.BILLINGREPORTS_CREATE],
};

export const AuthRolesByRank: { [index: number]: Array<AuthRoles> } = {
	// VK
	10: [],
	// KA
	11: [],
	// KS
	12: [AuthRoles.MEMBERS_READ, AuthRoles.RANKS_READ, AuthRoles.BILLINGREPORTS_CREATE],
	// GF
	13: [AuthRoles.MEMBERS_READ, AuthRoles.RANKS_READ, AuthRoles.BILLINGREPORTS_CREATE],
	// ZF
	14: [
		AuthRoles.MEMBERS_READ,
		AuthRoles.RANKS_READ,
		AuthRoles.BILLINGREPORTS_CREATE,
		AuthRoles.MAILING_LISTS,
		AuthRoles.LOGOFFS_READ,
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
		AuthRoles.MAILING_LISTS,
		AuthRoles.PAYOUTS_READ,
		AuthRoles.LOGOFFS_CREATE,
		AuthRoles.LOGOFFS_EDIT,
		AuthRoles.LOGOFFS_READ,
		AuthRoles.LOGOFFS_APPROVE,
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
		AuthRoles.MAILING_LISTS,
		AuthRoles.PAYOUTS_READ,
		AuthRoles.PAYOUTS_CREATE,
		AuthRoles.PAYOUTS_SEND,
		AuthRoles.LOGOFFS_CREATE,
		AuthRoles.LOGOFFS_EDIT,
		AuthRoles.LOGOFFS_READ,
		AuthRoles.LOGOFFS_APPROVE,
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
		AuthRoles.MAILING_LISTS,
		AuthRoles.PAYOUTS_READ,
		AuthRoles.PAYOUTS_CREATE,
		AuthRoles.PAYOUTS_SEND,
		AuthRoles.LOGOFFS_CREATE,
		AuthRoles.LOGOFFS_EDIT,
		AuthRoles.LOGOFFS_READ,
		AuthRoles.LOGOFFS_APPROVE,
	],
	// CON
	22: [
		AuthRoles.MEMBERS_READ,
		AuthRoles.CONTACTS_READ,
		AuthRoles.RANKS_READ,
		AuthRoles.BILLINGREPORTS_CREATE,
		AuthRoles.MAILING_LISTS,
	],
};
