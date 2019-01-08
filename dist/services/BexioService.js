"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bexio_1 = __importStar(require("bexio"));
const ContactType_1 = __importDefault(require("../entities/ContactType"));
const ContactGroup_1 = __importDefault(require("../entities/ContactGroup"));
const Contact_1 = __importDefault(require("../entities/Contact"));
const Order_1 = __importDefault(require("../entities/Order"));
const Position_1 = __importDefault(require("../entities/Position"));
const config_1 = __importDefault(require("config"));
const typeorm_1 = require("typeorm");
var BexioService;
(function (BexioService) {
    let bexioAPI = new bexio_1.default('6317446720.apps.bexio.com', 'Q5+mns0qH/vgB8/Q9phFV9cjpCU=', config_1.default.get('apiEndpoint') + '/bexio/callback', [bexio_1.Scopes.CONTACT_SHOW, bexio_1.Scopes.KB_ORDER_SHOW]);
    function isInitialized() {
        return bexioAPI.isInitialized();
    }
    BexioService.isInitialized = isInitialized;
    function addExpressHandlers(app) {
        app.get('/bexio/init', (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!bexioAPI.isInitialized()) {
                res.redirect(bexioAPI.getAuthUrl());
            }
            else {
                res.send('Done');
            }
        }));
        app.get('/bexio/callback', (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield bexioAPI.generateAccessToken(req.query);
            res.send('Done');
        }));
        app.get('/bexio/sync/contactTypes', (req, res) => {
            BexioService.syncContactTypes().then(() => {
                res.send('Synced');
            }).catch(() => {
                res.send('Something went wrong!');
            });
        });
        app.get('/bexio/sync/contactGroups', (req, res) => {
            BexioService.syncContactGroups().then(() => {
                res.send('Synced');
            }).catch(() => {
                res.send('Something went wrong!');
            });
        });
        app.get('/bexio/sync/contacts', (req, res) => {
            BexioService.syncContacts().then(() => {
                res.send('Synced');
            }).catch(() => {
                res.send('Something went wrong!');
            });
        });
        app.get('/bexio/sync/orders', (req, res) => {
            BexioService.syncOrders().then(() => {
                res.send('Synced');
            }).catch(() => {
                res.send('Something went wrong!');
            });
        });
    }
    BexioService.addExpressHandlers = addExpressHandlers;
    function getAuthUrl() {
        return bexioAPI.getAuthUrl();
    }
    BexioService.getAuthUrl = getAuthUrl;
    /**
     * syncs active contacts as contacts
     *
     * @export
     * @returns {Promise<void>}
     */
    function syncContacts() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let contacts = yield bexioAPI.contacts.list({});
                let contactRepo = typeorm_1.getManager().getRepository(Contact_1.default);
                let contactTypeRepo = typeorm_1.getManager().getRepository(ContactType_1.default);
                let contactGroupRepo = typeorm_1.getManager().getRepository(ContactGroup_1.default);
                let savePromises = [];
                console.log('syncing ' + contacts.length);
                for (let contact of contacts) {
                    let contactType = yield contactTypeRepo.findOne({ bexioId: contact.contact_type_id });
                    let contactGroups = yield contactGroupRepo.find({ bexioId: typeorm_1.In((contact.contact_group_ids || '').split(',')) });
                    let contactDB = yield contactRepo.findOne({ bexioId: contact.id });
                    if (!contactDB)
                        contactDB = new Contact_1.default();
                    contactDB = Object.assign(contactDB, {
                        bexioId: contact.id,
                        nr: contact.nr,
                        contactType: contactType,
                        firstname: contact.name_2,
                        lastname: contact.name_1,
                        birthday: new Date(contact.birthday),
                        address: contact.address,
                        postcode: contact.postcode,
                        city: contact.city,
                        mail: contact.mail,
                        mailSecond: contact.mail_second,
                        phoneFixed: contact.phone_fixed,
                        phoneFixedSecond: contact.phone_fixed_second,
                        phoneMobile: contact.phone_mobile,
                        remarks: contact.remarks,
                        contactGroups: contactGroups,
                        userId: contact.user_id,
                        ownerId: contact.owner_id
                    });
                    savePromises.push(contactRepo.save(contactDB));
                    console.log('synced ' + savePromises.length);
                }
                Promise.all(savePromises).then(() => {
                    resolve();
                }).catch((err) => {
                    console.error(err);
                    reject();
                });
            }));
        });
    }
    BexioService.syncContacts = syncContacts;
    /**
     * Syncs the contact groups and updates if needed
     *
     * @export
     * @returns {Promise<void>}
     */
    function syncContactGroups() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let groups = yield bexioAPI.contactGroups.list({});
                let contactGroupRepo = typeorm_1.getManager().getRepository(ContactGroup_1.default);
                let savePromises = [];
                for (let group of groups) {
                    let groupDB = yield contactGroupRepo.findOne({ bexioId: group.id });
                    if (!groupDB)
                        groupDB = new ContactGroup_1.default();
                    groupDB.bexioId = group.id;
                    groupDB.name = group.name;
                    savePromises.push(contactGroupRepo.save(groupDB));
                }
                Promise.all(savePromises).then(() => {
                    resolve();
                }).catch((err) => {
                    console.error(err);
                    reject();
                });
            }));
        });
    }
    BexioService.syncContactGroups = syncContactGroups;
    /**
     * Syncs the contact types and updates if needed
     *
     * @export
     * @returns {Promise<void>}
     */
    function syncContactTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let types = yield bexioAPI.contactTypes.list({});
                let contactTypeRepo = typeorm_1.getManager().getRepository(ContactType_1.default);
                let savePromises = [];
                for (let type of types) {
                    let typeDB = yield contactTypeRepo.findOne({ bexioId: type.id });
                    if (!typeDB)
                        typeDB = new ContactType_1.default();
                    typeDB.bexioId = type.id;
                    typeDB.name = type.name;
                    savePromises.push(contactTypeRepo.save(typeDB));
                }
                Promise.all(savePromises).then(() => {
                    resolve();
                }).catch((err) => {
                    console.error(err);
                    reject();
                });
            }));
        });
    }
    BexioService.syncContactTypes = syncContactTypes;
    /**
     * syncs all order and their positions
     *
     * @export
     * @returns {Promise<void>}
     */
    function syncOrders() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let orders = yield bexioAPI.orders.list({});
                let contactRepo = typeorm_1.getManager().getRepository(Contact_1.default);
                let savePromises = [];
                console.log('Syncing ' + orders.length);
                for (let order of orders) {
                    let bexioOrder = yield bexioAPI.orders.show({}, order.id.toString());
                    if (bexioOrder) {
                        let contact = yield contactRepo.findOne({ bexioId: bexioOrder.contact_id });
                        let user = yield contactRepo.findOne({ bexioId: bexioOrder.user_id });
                        savePromises.push(typeorm_1.getManager().transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                                let orderRepo = transaction.getRepository(Order_1.default);
                                let orderDB = yield orderRepo.findOne({ bexioId: bexioOrder.id });
                                if (!orderDB)
                                    orderDB = new Order_1.default();
                                orderDB = Object.assign(orderDB, {
                                    bexioId: bexioOrder.id,
                                    documentNr: bexioOrder.document_nr,
                                    validFrom: new Date(bexioOrder.is_valid_from),
                                    title: bexioOrder.title,
                                    contact: contact,
                                    total: (parseFloat(bexioOrder.total)) ? parseFloat(bexioOrder.total) : null,
                                    user: user,
                                    positions: [],
                                });
                                yield orderRepo.save(orderDB);
                                //first sync all positions 
                                let positionPromises = [];
                                if (bexioOrder.positions) {
                                    let positionRepo = transaction.getRepository(Position_1.default);
                                    for (let position of bexioOrder.positions) {
                                        let positionDB = yield positionRepo.findOne({ bexioId: position.id });
                                        if (!positionDB)
                                            positionDB = new Position_1.default();
                                        positionDB = Object.assign(positionDB, {
                                            bexioId: position.id,
                                            positionType: position.type,
                                            text: position.text,
                                            pos: position.pos,
                                            internalPos: position.internal_pos,
                                            articleId: position.article_id,
                                            orderBexioId: bexioOrder.id,
                                            positionTotal: (parseFloat(position.position_total)) ? parseFloat(position.position_total) : null,
                                            order: orderDB
                                        });
                                        positionPromises.push(positionRepo.save(positionDB));
                                    }
                                }
                                Promise.all(positionPromises).then((positions) => __awaiter(this, void 0, void 0, function* () {
                                    if (orderDB) {
                                        orderDB.positions = positions;
                                        yield orderRepo.save(orderDB);
                                        console.log('Synced ' + savePromises.length);
                                        resolve();
                                    }
                                }));
                            }));
                        })));
                    }
                }
                Promise.all(savePromises).then(() => {
                    resolve();
                }).catch((err) => {
                    console.error(err);
                    reject();
                });
            }));
        });
    }
    BexioService.syncOrders = syncOrders;
})(BexioService = exports.BexioService || (exports.BexioService = {}));
//# sourceMappingURL=BexioService.js.map