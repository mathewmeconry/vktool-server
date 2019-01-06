export enum AuthRoles {
    AUTHENTICATED = 'authenticated',
    
    CONTACTS_READ = 'contacts_read',
    CONTACTS_EDIT = 'contacts_edit',

    MEMBERS_READ = 'members_read',
    MEMBERS_EDIT = 'members_edit',

    RANKS_READ = 'ranks_read',
    RANKS_EDIT = 'ranks_edit',

    ORDERS_READ = 'orders_read',
    ORDERS_EDIT = 'orders_edit',

    COMPENSATIONS_READ = 'compensation_read',
    COMPENSATIONS_CREATE = 'compensation_create',
    COMPENSATIONS_EDIT = 'compensation_edit',
    COMPENSATIONS_APPROVE = 'compensation_approve',

    BILLINGREPORTS_READ = 'billingreports_read',
    BILLINGREPORTS_CREATE = 'billingreports_create',
    BILLINGREPORTS_EDIT = 'billingreports_edit',

    ADMIN = 'admin'
}