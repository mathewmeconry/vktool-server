export enum AuthRoles {
	AUTHENTICATED = 'authenticated',

	CONTACTS_READ = 'contacts_read',
	CONTACTS_EDIT = 'contacts_edit',

	MEMBERS_READ = 'members_read',
	MEMBERS_EDIT = 'members_edit',
	MEMBERS_PRODUCTS = 'members_products',

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
	BILLINGREPORTS_APPROVE = 'billingreports_approve',

	COLLECTIONPOINT_READ = 'collectionpoint_read',
	COLLECTIONPOINT_CREATE = 'collectionpoint_read',
	COLLECTIONPOINT_EDIT = 'collectionpoint_read',

	PAYOUTS_READ = 'payouts_read',
	PAYOUTS_CREATE = 'payouts_create',
	PAYOUTS_SEND = 'payouts_send',
	PAYOUTS_EDIT = 'payouts_edit',

	LOGOFFS_READ = 'logoffs_read',
	LOGOFFS_CREATE = 'logoffs_create',
	LOGOFFS_EDIT = 'logoffs_edit',
	LOGOFFS_APPROVE = 'logoffs_approve',

	PRODUCT_READ = 'product_read',
	PRODUCT_EDIT = 'product_edit',

	MATERIAL_CHANGELOG_READ = 'material_changelog_read',
	MATERIAL_CHANGELOG_CREATE = 'material_changelog_create',
	MATERIAL_CHANGELOG_EDIT = 'material_changelog_edit',

	WAREHOUSE_READ = 'warehouse_read',
	WAREHOUSE_CREATE = 'warehouse_create',
	WAREHOUSE_OVERLOAD = 'warehouse_overload',

	ADMIN = 'admin',
}

export const AuthRolesByFunction: { [index: number]: Array<AuthRoles> } = {
	// VST
	16: [AuthRoles.MEMBERS_READ, AuthRoles.RANKS_READ, AuthRoles.BILLINGREPORTS_CREATE],
	// FHR
	9: [AuthRoles.MEMBERS_READ, AuthRoles.RANKS_READ, AuthRoles.BILLINGREPORTS_CREATE],
};

export const AuthRolesByRank: { [index: number]: Array<AuthRoles> } = {
	// VK
	10: [AuthRoles.MEMBERS_READ],
	// KA
	11: [AuthRoles.MEMBERS_READ, AuthRoles.RANKS_READ, AuthRoles.BILLINGREPORTS_CREATE],
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
		AuthRoles.MEMBERS_PRODUCTS,
		AuthRoles.MATERIAL_CHANGELOG_READ,
		AuthRoles.WAREHOUSE_OVERLOAD
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
		AuthRoles.COLLECTIONPOINT_READ,
		AuthRoles.COLLECTIONPOINT_EDIT,
		AuthRoles.COLLECTIONPOINT_READ,
		AuthRoles.MAILING_LISTS,
		AuthRoles.PAYOUTS_READ,
		AuthRoles.PAYOUTS_CREATE,
		AuthRoles.PAYOUTS_SEND,
		AuthRoles.PAYOUTS_EDIT,
		AuthRoles.LOGOFFS_CREATE,
		AuthRoles.LOGOFFS_EDIT,
		AuthRoles.LOGOFFS_READ,
		AuthRoles.LOGOFFS_APPROVE,
		AuthRoles.PRODUCT_EDIT,
		AuthRoles.PRODUCT_READ,
		AuthRoles.MEMBERS_PRODUCTS,
		AuthRoles.MATERIAL_CHANGELOG_CREATE,
		AuthRoles.MATERIAL_CHANGELOG_EDIT,
		AuthRoles.MATERIAL_CHANGELOG_READ,
		AuthRoles.WAREHOUSE_CREATE,
		AuthRoles.WAREHOUSE_READ,
		AuthRoles.WAREHOUSE_OVERLOAD
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
		AuthRoles.COLLECTIONPOINT_READ,
		AuthRoles.COLLECTIONPOINT_EDIT,
		AuthRoles.COLLECTIONPOINT_READ,
		AuthRoles.MAILING_LISTS,
		AuthRoles.PAYOUTS_READ,
		AuthRoles.PAYOUTS_CREATE,
		AuthRoles.PAYOUTS_SEND,
		AuthRoles.PAYOUTS_EDIT,
		AuthRoles.LOGOFFS_CREATE,
		AuthRoles.LOGOFFS_EDIT,
		AuthRoles.LOGOFFS_READ,
		AuthRoles.LOGOFFS_APPROVE,
		AuthRoles.PRODUCT_EDIT,
		AuthRoles.PRODUCT_READ,
		AuthRoles.MEMBERS_PRODUCTS,
		AuthRoles.MATERIAL_CHANGELOG_CREATE,
		AuthRoles.MATERIAL_CHANGELOG_EDIT,
		AuthRoles.MATERIAL_CHANGELOG_READ,
		AuthRoles.WAREHOUSE_CREATE,
		AuthRoles.WAREHOUSE_READ,
		AuthRoles.WAREHOUSE_OVERLOAD
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
