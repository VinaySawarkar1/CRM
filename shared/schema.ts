import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

// Lead schema
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  status: text("status").notNull().default("new"),
  category: text("category").notNull().default("industry"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerCompany: text("customer_company").notNull(),
  poNumber: text("po_number"),
  poDate: timestamp("po_date"),
  address: text("address"),
  calibrationCertificateInfo: text("calibration_certificate_info"),
  calibrationFrequency: text("calibration_frequency"),
  paymentTerms: text("payment_terms"),
  otherTerms: text("other_terms"),
  deliveryTime: text("delivery_time"),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("processing"),
  items: json("items").notNull(),
  // New profit calculation fields
  listPrice: integer("list_price"), // Selling price
  purchasePrice: integer("purchase_price"),
  profit: integer("profit"),
  poFile: text("po_file"), // Reference to uploaded PO file
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

// Inventory schema
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(0),
  threshold: integer("threshold").notNull().default(5),
  price: integer("price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: text("assigned_to").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Employee Activities schema
export const employeeActivities = pgTable("employee_activities", {
  id: serial("id").primaryKey(),
  employeeName: text("employee_name").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  activitiesPerformed: text("activities_performed").notNull(),
  issues: text("issues"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployeeActivitySchema = createInsertSchema(employeeActivities).omit({
  id: true,
  createdAt: true,
});

// Sales Targets schema
export const salesTargets = pgTable("sales_targets", {
  id: serial("id").primaryKey(),
  productName: text("product_name").notNull(),
  targetMonth: text("target_month").notNull(),
  targetYear: text("target_year").notNull(),
  targetValue: integer("target_value").notNull(),
  actualValue: integer("actual_value").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSalesTargetSchema = createInsertSchema(salesTargets).omit({
  id: true,
  createdAt: true,
});

// Manufacturing Forecast schema
export const manufacturingForecasts = pgTable("manufacturing_forecasts", {
  id: serial("id").primaryKey(),
  productName: text("product_name").notNull(),
  forecastMonth: text("forecast_month").notNull(),
  forecastYear: text("forecast_year").notNull(),
  forecastQuantity: integer("forecast_quantity").notNull(),
  actualQuantity: integer("actual_quantity").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertManufacturingForecastSchema = createInsertSchema(manufacturingForecasts).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertEmployeeActivity = z.infer<typeof insertEmployeeActivitySchema>;
export type EmployeeActivity = typeof employeeActivities.$inferSelect;

export type InsertSalesTarget = z.infer<typeof insertSalesTargetSchema>;
export type SalesTarget = typeof salesTargets.$inferSelect;

export type InsertManufacturingForecast = z.infer<typeof insertManufacturingForecastSchema>;
export type ManufacturingForecast = typeof manufacturingForecasts.$inferSelect;
