import { pgTable, text, serial, integer, boolean, timestamp, json, decimal, date, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Company/Tenant schema
export const companies = pgTable("companies", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country").default("India"),
  pincode: text("pincode"),
  gstNumber: text("gst_number"),
  status: text("status").notNull().default("pending"), // pending, active, suspended
  maxUsers: integer("max_users").notNull().default(20),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User schema
export const users = pgTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").notNull().default("user"), // superuser, admin, user
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  department: text("department"),
  isActive: boolean("is_active").notNull().default(false),
  parentUserId: bigint("parent_user_id", { mode: "number" }).references(() => users.id),
  permissions: json("permissions"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  companyId: true,
  department: true,
  parentUserId: true,
  permissions: true,
  isActive: true,
});

// Customer schema
export const customers = pgTable("customers", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country").default("India"),
  pincode: text("pincode"),
  gstNumber: text("gst_number"),
  panNumber: text("pan_number"),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0"),
  paymentTerms: text("payment_terms").default("30 days"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

// Supplier schema
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country").default("India"),
  pincode: text("pincode"),
  gstNumber: text("gst_number"),
  panNumber: text("pan_number"),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0"),
  paymentTerms: text("payment_terms").default("30 days"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

// Lead schema (enhanced)
export const leads = pgTable("leads", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  position: text("position"),
  status: text("status").notNull().default("new"),
  category: text("category").notNull().default("industry"),
  source: text("source").default("website"),
  assignedTo: text("assigned_to"),
  priority: text("priority").default("medium"),
  expectedValue: decimal("expected_value", { precision: 10, scale: 2 }),
  // Opportunity fields
  probability: integer("probability"), // 0-100 probability percentage
  opportunityStage: text("opportunity_stage"), // prospecting, qualified, proposal, negotiation, won, lost
  nextFollowUp: timestamp("next_follow_up"),
  notes: text("notes"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country").default("India"),
  pincode: text("pincode"),
  gstNumber: text("gst_number"),
  panNumber: text("pan_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Lead Discussion schema
export const leadDiscussions = pgTable("lead_discussions", {
  id: serial("id").primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  leadId: integer("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  discussion: text("discussion").notNull(),
  discussionType: text("discussion_type").notNull().default("general"), // general, call, email, meeting, follow_up
  outcome: text("outcome"), // positive, negative, neutral, pending
  nextAction: text("next_action"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertLeadDiscussionSchema = createInsertSchema(leadDiscussions).omit({
  id: true,
  createdAt: true,
});

// Lead Category schema
export const leadCategories = pgTable("lead_categories", {
  id: serial("id").primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  key: text("key").notNull(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadCategorySchema = createInsertSchema(leadCategories).omit({
  id: true,
  createdAt: true,
});

// Lead Source schema
export const leadSources = pgTable("lead_sources", {
  id: serial("id").primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  key: text("key").notNull(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSourceSchema = createInsertSchema(leadSources).omit({
  id: true,
  createdAt: true,
});

// Quotation schema
export const quotations = pgTable("quotations", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  quotationNumber: text("quotation_number").notNull().unique(),
  customerId: bigint("customer_id", { mode: "number" }).references(() => customers.id),
  leadId: bigint("lead_id", { mode: "number" }).references(() => leads.id),
  quotationDate: date("quotation_date").notNull(),
  validUntil: date("valid_until").notNull(),
  reference: text("reference"),
  contactPersonTitle: text("contact_person_title"),
  contactPerson: text("contact_person").notNull(),
  customerCompany: text("customer_company"), // Customer company name for PDF generation
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull().default("India"),
  pincode: text("pincode").notNull(),
  shippingAddressLine1: text("shipping_address_line1"),
  shippingAddressLine2: text("shipping_address_line2"),
  shippingCity: text("shipping_city"),
  shippingState: text("shipping_state"),
  shippingCountry: text("shipping_country"),
  shippingPincode: text("shipping_pincode"),
  salesCredit: text("sales_credit"),
  sameAsBilling: boolean("same_as_billing").default(true),
  items: json("items").notNull(),
  terms: text("terms"),
  notes: text("notes"),
  bankDetails: json("bank_details"),
  extraCharges: json("extra_charges"),
  discounts: json("discounts"),
  discount: text("discount"),
  discountType: text("discount_type"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  cgstTotal: decimal("cgst_total", { precision: 10, scale: 2 }).default("0"),
  sgstTotal: decimal("sgst_total", { precision: 10, scale: 2 }).default("0"),
  igstTotal: decimal("igst_total", { precision: 10, scale: 2 }).default("0"),
  taxableTotal: decimal("taxable_total", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({
  id: true,
  createdAt: true,
});

// Proforma Invoice schema (separate from quotations)
export const proformas = pgTable("proformas", {
  id: serial("id").primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  proformaNumber: text("proforma_number").notNull().unique(),
  quotationId: integer("quotation_id").references(() => quotations.id),
  customerId: integer("customer_id").references(() => customers.id),
  leadId: integer("lead_id").references(() => leads.id),
  proformaDate: date("proforma_date").notNull(),
  validUntil: date("valid_until").notNull(),
  reference: text("reference"),
  contactPersonTitle: text("contact_person_title"),
  contactPerson: text("contact_person").notNull(),
  customerCompany: text("customer_company"),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull().default("India"),
  pincode: text("pincode").notNull(),
  shippingAddressLine1: text("shipping_address_line1"),
  shippingAddressLine2: text("shipping_address_line2"),
  shippingCity: text("shipping_city"),
  shippingState: text("shipping_state"),
  shippingCountry: text("shipping_country"),
  shippingPincode: text("shipping_pincode"),
  salesCredit: text("sales_credit"),
  sameAsBilling: boolean("same_as_billing").default(true),
  items: json("items").notNull(),
  terms: text("terms"),
  notes: text("notes"),
  bankDetails: json("bank_details"),
  extraCharges: json("extra_charges"),
  discounts: json("discounts"),
  discount: text("discount"),
  discountType: text("discount_type"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  cgstTotal: decimal("cgst_total", { precision: 10, scale: 2 }).default("0"),
  sgstTotal: decimal("sgst_total", { precision: 10, scale: 2 }).default("0"),
  igstTotal: decimal("igst_total", { precision: 10, scale: 2 }).default("0"),
  taxableTotal: decimal("taxable_total", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProformaSchema = createInsertSchema(proformas).omit({
  id: true,
  createdAt: true,
});

// Order schema (enhanced)
export const orders = pgTable("orders", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  orderNumber: text("order_number").notNull().unique(),
  customerId: bigint("customer_id", { mode: "number" }).references(() => customers.id),
  quotationId: bigint("quotation_id", { mode: "number" }).references(() => quotations.id),
  customerName: text("customer_name").notNull(),
  customerCompany: text("customer_company").notNull(),
  poNumber: text("po_number"),
  poDate: timestamp("po_date"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country").default("India"),
  pincode: text("pincode"),
  gstNumber: text("gst_number"),
  panNumber: text("pan_number"),
  calibrationCertificateInfo: text("calibration_certificate_info"),
  calibrationFrequency: text("calibration_frequency"),
  paymentTerms: text("payment_terms"),
  otherTerms: text("other_terms"),
  deliveryTime: text("delivery_time"),
  items: json("items").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("processing"),
  // Profit calculation fields
  listPrice: decimal("list_price", { precision: 10, scale: 2 }),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  profit: decimal("profit", { precision: 10, scale: 2 }),
  poFile: text("po_file"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

// Invoice schema
export const invoices = pgTable("invoices", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  invoiceNumber: text("invoice_number").notNull().unique(),
  orderId: bigint("order_id", { mode: "number" }).references(() => orders.id),
  customerId: bigint("customer_id", { mode: "number" }).references(() => customers.id),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date").notNull(),
  items: json("items").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

// Payment schema
export const payments = pgTable("payments", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  paymentNumber: text("payment_number").notNull().unique(),
  invoiceId: bigint("invoice_id", { mode: "number" }).references(() => invoices.id),
  customerId: bigint("customer_id", { mode: "number" }).references(() => customers.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: text("payment_method").notNull(),
  referenceNumber: text("reference_number"),
  status: text("status").notNull().default("completed"),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// Purchase Order schema
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  poNumber: text("po_number").notNull().unique(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  supplierName: text("supplier_name").notNull(),
  supplierCompany: text("supplier_company"),
  supplierTitle: text("supplier_title"),
  supplierAddress: text("supplier_address"),
  supplierCity: text("supplier_city"),
  supplierState: text("supplier_state"),
  supplierCountry: text("supplier_country"),
  supplierPincode: text("supplier_pincode"),
  supplierGstin: text("supplier_gstin"),
  supplierPan: text("supplier_pan"),
  supplierPhone: text("supplier_phone"),
  supplierEmail: text("supplier_email"),
  orderDate: date("order_date").notNull(),
  expectedDelivery: date("expected_delivery"),
  items: json("items").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  terms: json("terms"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
});

// Inventory schema (enhanced)
export const inventory = pgTable("inventory", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  description: text("description"),
  category: text("category"),
  unit: text("unit").default("pcs"),
  quantity: integer("quantity").notNull().default(0),
  threshold: integer("threshold").notNull().default(5),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("18"),
  supplierId: bigint("supplier_id", { mode: "number" }).references(() => suppliers.id),
  location: text("location"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
});

// Manufacturing Job schema
export const manufacturingJobs = pgTable("manufacturing_jobs", {
  id: serial("id").primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  jobNumber: text("job_number").notNull().unique(),
  productName: text("product_name").notNull(),
  orderId: integer("order_id").references(() => orders.id),
  startDate: date("start_date").notNull(),
  expectedCompletion: date("expected_completion").notNull(),
  actualCompletion: date("actual_completion"),
  quantity: integer("quantity").notNull(),
  completedQuantity: integer("completed_quantity").default(0),
  rejectedQuantity: integer("rejected_quantity").default(0),
  status: text("status").notNull().default("pending"),
  priority: text("priority").default("medium"),
  materials: json("materials"),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }).default("0"),
  overheadCost: decimal("overhead_cost", { precision: 10, scale: 2 }).default("0"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertManufacturingJobSchema = createInsertSchema(manufacturingJobs).omit({
  id: true,
  createdAt: true,
});

// Task schema (enhanced)
export const tasks = pgTable("tasks", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: text("assigned_to").notNull(),
  assignedById: bigint("assigned_by_id", { mode: "number" }).references(() => users.id),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  dueDate: timestamp("due_date").notNull(),
  completedDate: timestamp("completed_date"),
  category: text("category"),
  relatedTo: text("related_to"), // lead, order, customer, etc.
  relatedId: bigint("related_id", { mode: "number" }),
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Employee Activities schema (enhanced)
export const employeeActivities = pgTable("employee_activities", {
  id: serial("id").primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  employeeId: integer("employee_id").references(() => users.id),
  employeeName: text("employee_name").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  activitiesPerformed: text("activities_performed").notNull(),
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }),
  issues: text("issues"),
  notes: text("notes"),
  category: text("category"), // manufacturing, sales, admin, etc.
  relatedTo: text("related_to"), // job, order, customer, etc.
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployeeActivitySchema = createInsertSchema(employeeActivities).omit({
  id: true,
  createdAt: true,
});

// Sales Targets schema (enhanced)
export const salesTargets = pgTable("sales_targets", {
  id: serial("id").primaryKey(),
  productName: text("product_name").notNull(),
  targetMonth: text("target_month").notNull(),
  targetYear: text("target_year").notNull(),
  targetValue: integer("target_value").notNull(),
  actualValue: integer("actual_value").default(0),
  assignedTo: integer("assigned_to").references(() => users.id),
  companyId: integer("company_id").references(() => companies.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSalesTargetSchema = createInsertSchema(salesTargets).omit({
  id: true,
  createdAt: true,
});

// Manufacturing Forecast schema (enhanced)
export const manufacturingForecasts = pgTable("manufacturing_forecasts", {
  id: serial("id").primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  productName: text("product_name").notNull(),
  forecastMonth: text("forecast_month").notNull(),
  forecastYear: text("forecast_year").notNull(),
  forecastQuantity: integer("forecast_quantity").notNull(),
  actualQuantity: integer("actual_quantity").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertManufacturingForecastSchema = createInsertSchema(manufacturingForecasts).omit({
  id: true,
  createdAt: true,
});

// Support Tickets schema
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  ticketNumber: text("ticket_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  orderId: integer("order_id").references(() => orders.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  assignedTo: integer("assigned_to").references(() => users.id),
  openedBy: integer("opened_by").references(() => users.id),
  openedDate: timestamp("opened_date").defaultNow().notNull(),
  resolvedDate: timestamp("resolved_date"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
});

// Contracts/AMC schema
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
  contractNumber: text("contract_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  contractType: text("contract_type").notNull(), // AMC, Service, etc.
  subject: text("subject").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("active"),
  terms: text("terms"),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertLeadDiscussion = z.infer<typeof insertLeadDiscussionSchema>;
export type LeadDiscussion = typeof leadDiscussions.$inferSelect;
export type LeadCategory = typeof leadCategories.$inferSelect;
export type InsertLeadCategory = z.infer<typeof insertLeadCategorySchema>;
export type LeadSource = typeof leadSources.$inferSelect;
export type InsertLeadSource = z.infer<typeof insertLeadSourceSchema>;

export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotations.$inferSelect;
export type InsertProforma = z.infer<typeof insertProformaSchema>;
export type Proforma = typeof proformas.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type InsertManufacturingJob = z.infer<typeof insertManufacturingJobSchema>;
export type ManufacturingJob = typeof manufacturingJobs.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertEmployeeActivity = z.infer<typeof insertEmployeeActivitySchema>;
export type EmployeeActivity = typeof employeeActivities.$inferSelect;

export type InsertSalesTarget = z.infer<typeof insertSalesTargetSchema>;
export type SalesTarget = typeof salesTargets.$inferSelect;

export type InsertManufacturingForecast = z.infer<typeof insertManufacturingForecastSchema>;
export type ManufacturingForecast = typeof manufacturingForecasts.$inferSelect;

export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

// Company Settings schema
export const companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  gstNumber: text("gst_number"),
  panNumber: text("pan_number"),
  logo: text("logo"), // Base64 encoded logo or URL
  website: text("website"),
  bankDetails: json("bank_details").$type<{
    bankName?: string;
    accountNo?: string;
    ifsc?: string;
    branch?: string;
    upi?: string;
    swift?: string;
  }>(),
  integrations: json("integrations").$type<{
    indiaMart?: {
      apiKey?: string;
      lastSyncedAt?: string;
    };
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;
