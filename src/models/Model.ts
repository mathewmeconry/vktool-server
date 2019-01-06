import { Model } from "mongoose";
import ContactModel from "./ContactModel";
import ContactTypeModel from "./ContactTypeModel";
import ContactGroupModel from "./ContactGroupModel";
import OrderModel from "./OrderModel";
import PositionModel from "./PositionModel";
import BillingReportModel from "./BillingReportModel";
import CompensationEntryModel from "./CompensationEntryModel";
import PayoutModel from "./PayoutModel";

export default interface ModelInterface {
  contact: Model<ContactModel>
  contactType: Model<ContactTypeModel>
  contactGroup: Model<ContactGroupModel>
  order: Model<OrderModel>
  position: Model<PositionModel>
  billingReport: Model<BillingReportModel>
  compensationEntry: Model<CompensationEntryModel>
  payout: Model<PayoutModel>
}