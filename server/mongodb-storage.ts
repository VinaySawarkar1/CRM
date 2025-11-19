import { Collection, ObjectId } from 'mongodb';
import { connectToMongoDB, getDatabase } from './mongodb';
import {
  users, type User, type InsertUser,
  customers, type Customer, type InsertCustomer,
  suppliers, type Supplier, type InsertSupplier,
  leads, type Lead, type InsertLead,
  leadDiscussions, type LeadDiscussion, type InsertLeadDiscussion,
  leadCategories, type LeadCategory, type InsertLeadCategory,
  leadSources, type LeadSource, type InsertLeadSource,
  quotations, type Quotation, type InsertQuotation,
  orders, type Order, type InsertOrder,
  invoices, type Invoice, type InsertInvoice,
  payments, type Payment, type InsertPayment,
  purchaseOrders, type PurchaseOrder, type InsertPurchaseOrder,
  inventory, type Inventory, type InsertInventory,
  manufacturingJobs, type ManufacturingJob, type InsertManufacturingJob,
  tasks, type Task, type InsertTask,
  employeeActivities, type EmployeeActivity, type InsertEmployeeActivity,
  salesTargets, type SalesTarget, type InsertSalesTarget,
  manufacturingForecasts, type ManufacturingForecast, type InsertManufacturingForecast,
  supportTickets, type SupportTicket, type InsertSupportTicket,
  contracts, type Contract, type InsertContract
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { Store as SessionStore } from "express-session";
import bcrypt from 'bcrypt';

const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Customer operations
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  deleteCustomer(id: number): Promise<boolean>;

  // Supplier operations
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  getAllSuppliers(): Promise<Supplier[]>;
  deleteSupplier(id: number): Promise<boolean>;

  // Lead operations
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  getAllLeads(): Promise<Lead[]>;
  deleteLead(id: number): Promise<boolean>;
  
  // Lead Discussion operations
  getLeadDiscussions(leadId: number): Promise<LeadDiscussion[]>;
  createLeadDiscussion(discussion: InsertLeadDiscussion): Promise<LeadDiscussion>;
  updateLeadDiscussion(id: number, discussion: Partial<InsertLeadDiscussion>): Promise<LeadDiscussion | undefined>;
  deleteLeadDiscussion(id: number): Promise<boolean>;

  // Lead Category operations
  getAllLeadCategories(): Promise<LeadCategory[]>;
  createLeadCategory(c: InsertLeadCategory): Promise<LeadCategory>;
  updateLeadCategory(id: number, c: Partial<InsertLeadCategory>): Promise<LeadCategory | undefined>;
  deleteLeadCategory(id: number): Promise<boolean>;
  getAllLeadSources(): Promise<LeadSource[]>;
  createLeadSource(c: InsertLeadSource): Promise<LeadSource>;
  updateLeadSource(id: number, c: Partial<InsertLeadSource>): Promise<LeadSource | undefined>;
  deleteLeadSource(id: number): Promise<boolean>;

  // Quotation operations
  getQuotation(id: number): Promise<Quotation | undefined>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  updateQuotation(id: number, quotation: Partial<InsertQuotation>): Promise<Quotation | undefined>;
  getAllQuotations(): Promise<Quotation[]>;
  deleteQuotation(id: number): Promise<boolean>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  deleteOrder(id: number): Promise<boolean>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;

  // Invoice operations
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
  deleteInvoice(id: number): Promise<boolean>;

  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  getAllPayments(): Promise<Payment[]>;
  deletePayment(id: number): Promise<boolean>;

  // Purchase Order operations
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(purchaseOrder: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: number, purchaseOrder: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  getAllPurchaseOrders(): Promise<PurchaseOrder[]>;
  deletePurchaseOrder(id: number): Promise<boolean>;

  // Inventory operations
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined>;
  getAllInventoryItems(): Promise<Inventory[]>;
  deleteInventoryItem(id: number): Promise<boolean>;
  getLowStockItems(): Promise<Inventory[]>;
  getInventoryItemBySku(sku: string): Promise<Inventory | undefined>;

  // Manufacturing Job operations
  getManufacturingJob(id: number): Promise<ManufacturingJob | undefined>;
  createManufacturingJob(job: InsertManufacturingJob): Promise<ManufacturingJob>;
  updateManufacturingJob(id: number, job: Partial<InsertManufacturingJob>): Promise<ManufacturingJob | undefined>;
  getAllManufacturingJobs(): Promise<ManufacturingJob[]>;
  deleteManufacturingJob(id: number): Promise<boolean>;

  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  deleteTask(id: number): Promise<boolean>;

  // Employee Activity operations
  getEmployeeActivity(id: number): Promise<EmployeeActivity | undefined>;
  createEmployeeActivity(activity: InsertEmployeeActivity): Promise<EmployeeActivity>;
  updateEmployeeActivity(id: number, activity: Partial<InsertEmployeeActivity>): Promise<EmployeeActivity | undefined>;
  getAllEmployeeActivities(): Promise<EmployeeActivity[]>;
  deleteEmployeeActivity(id: number): Promise<boolean>;

  // Sales Target operations
  getSalesTarget(id: number): Promise<SalesTarget | undefined>;
  createSalesTarget(target: InsertSalesTarget): Promise<SalesTarget>;
  updateSalesTarget(id: number, target: Partial<InsertSalesTarget>): Promise<SalesTarget | undefined>;
  getAllSalesTargets(): Promise<SalesTarget[]>;
  deleteSalesTarget(id: number): Promise<boolean>;
  getSalesTargetsByPeriod(month: string, year: string): Promise<SalesTarget[]>;

  // Manufacturing Forecast operations
  getManufacturingForecast(id: number): Promise<ManufacturingForecast | undefined>;
  createManufacturingForecast(forecast: InsertManufacturingForecast): Promise<ManufacturingForecast>;
  updateManufacturingForecast(id: number, forecast: Partial<InsertManufacturingForecast>): Promise<ManufacturingForecast | undefined>;
  getAllManufacturingForecasts(): Promise<ManufacturingForecast[]>;
  deleteManufacturingForecast(id: number): Promise<boolean>;
  getManufacturingForecastsByPeriod(month: string, year: string): Promise<ManufacturingForecast[]>;

  // Support Ticket operations
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  deleteSupportTicket(id: number): Promise<boolean>;

  // Contract operations
  getContract(id: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract | undefined>;
  getAllContracts(): Promise<Contract[]>;
  deleteContract(id: number): Promise<boolean>;

  // Products operations
  getAllProducts(): Promise<any[]>;

  // Raw Materials operations
  getAllRawMaterials(): Promise<any[]>;

  // Quotation Templates operations
  getAllQuotationTemplates(): Promise<any[]>;

  // Captured Leads operations
  getAllCapturedLeads(): Promise<any[]>;

  // Company operations (for pending approvals)
  createCompany(company: any): Promise<any>;
  getAllCompanies(): Promise<any[]>;
  getCompany(id: number | string): Promise<any | undefined>;
  updateCompany(id: number | string, updates: any): Promise<any | undefined>;
  getUsersByCompanyId(companyId: number): Promise<any[]>;

  // Company Settings operations
  getCompanySettings(): Promise<any | undefined>;
  updateCompanySettings(settings: any): Promise<any>;

  // Session store
  sessionStore: SessionStore;
}

export class MongoDBStorage implements IStorage {
  private collections: {
    users: Collection;
    customers: Collection;
    suppliers: Collection;
    leads: Collection;
    leadDiscussions: Collection;
    leadCategories: Collection;
    leadSources: Collection;
    quotations: Collection;
    orders: Collection;
    invoices: Collection;
    payments: Collection;
    purchaseOrders: Collection;
    inventory: Collection;
    manufacturingJobs: Collection;
    tasks: Collection;
    employeeActivities: Collection;
    salesTargets: Collection;
    manufacturingForecasts: Collection;
    supportTickets: Collection;
    contracts: Collection;
    companySettings: Collection;
  };

  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async initialize(): Promise<void> {
    const db = await connectToMongoDB();
    
    this.collections = {
      users: db.collection('users'),
      customers: db.collection('customers'),
      suppliers: db.collection('suppliers'),
      leads: db.collection('leads'),
      leadDiscussions: db.collection('leadDiscussions'),
      leadCategories: db.collection('leadCategories'),
      leadSources: db.collection('leadSources'),
      quotations: db.collection('quotations'),
      orders: db.collection('orders'),
      invoices: db.collection('invoices'),
      payments: db.collection('payments'),
      purchaseOrders: db.collection('purchaseOrders'),
      inventory: db.collection('inventory'),
      manufacturingJobs: db.collection('manufacturingJobs'),
      tasks: db.collection('tasks'),
      employeeActivities: db.collection('employeeActivities'),
      salesTargets: db.collection('salesTargets'),
      manufacturingForecasts: db.collection('manufacturingForecasts'),
      supportTickets: db.collection('supportTickets'),
      contracts: db.collection('contracts'),
      companySettings: db.collection('company_settings'),
    };

    // Create indexes for better performance
    await this.createIndexes();
    
    // Create default admin user if it doesn't exist
    await this.createDefaultAdminUser();
  }

  private async createIndexes(): Promise<void> {
    // Create indexes for frequently queried fields
    await this.collections.users.createIndex({ username: 1 }, { unique: true });
    await this.collections.customers.createIndex({ email: 1 });
    await this.collections.leads.createIndex({ email: 1 });
    await this.collections.orders.createIndex({ orderNumber: 1 }, { unique: true });
    await this.collections.inventory.createIndex({ sku: 1 }, { unique: true });
    await this.collections.leadDiscussions.createIndex({ leadId: 1 });
  }

  private async createDefaultAdminUser(): Promise<void> {
    const existingAdmin = await this.getUserByUsername('admin');
    if (!existingAdmin) {
      const hashPassword = async (password: string) => {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
      };

      const hashedPassword = await hashPassword('admin123');
      
      const adminUser: InsertUser = {
        username: 'admin',
        password: hashedPassword,
        name: 'System Administrator',
        email: 'admin@businessai.com',
        role: 'admin',
        isActive: true,
        lastLogin: null,
      };

      await this.createUser(adminUser);
      console.log('✅ Default admin user created');
    }
  }

  // Helper method to convert MongoDB ObjectId to number ID
  private convertToNumberId(id: any): number {
    if (typeof id === 'string') {
      // If it's a MongoDB ObjectId string, extract numeric part
      if (id.length === 24) {
        // Try to find a numeric ID field in the document
        return parseInt(id.substring(18, 24), 16) || parseInt(id.substring(0, 8), 16);
      }
      return parseInt(id);
    }
    return id;
  }

  // Helper method to convert number ID to MongoDB ObjectId
  private convertToObjectId(id: number): ObjectId {
    // For MongoDB, we need to find documents by their numeric ID field
    // Since MongoDB uses ObjectId but we need to find by numeric ID
    // We'll use a different approach - find by the 'id' field instead of '_id'
    throw new Error('Use findById instead of convertToObjectId');
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.collections.users.findOne({ id });
    return result ? { ...result, id: result.id } as User : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.collections.users.findOne({ username });
    return result ? { ...result, id: result.id } as User : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.collections.users.insertOne({
      ...user,
      id: user.id || Date.now(), // Use provided ID or generate one
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return {
      ...user,
      id: user.id || Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  }

  async getAllUsers(): Promise<User[]> {
    const results = await this.collections.users.find().toArray();
    return results.map(user => ({
      ...user,
      id: user.id,
    })) as User[];
  }

  // Customer operations
  async getCustomer(id: number): Promise<Customer | undefined> {
    const result = await this.collections.customers.findOne({ id });
    return result ? { ...result, id: result.id } as Customer : undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await this.collections.customers.insertOne({
      ...customer,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return {
      ...customer,
      id: this.convertToNumberId(result.insertedId),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Customer;
  }

  async updateCustomer(id: number, customerUpdate: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const result = await this.collections.customers.findOneAndUpdate(
      { _id: this.convertToObjectId(id) },
      { 
        $set: { 
          ...customerUpdate, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result ? { ...result, id: this.convertToNumberId(result._id) } as Customer : undefined;
  }

  async getAllCustomers(): Promise<Customer[]> {
    const results = await this.collections.customers.find().toArray();
    return results.map(customer => ({
      ...customer,
      id: this.convertToNumberId(customer._id),
    })) as Customer[];
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await this.collections.customers.deleteOne({ _id: this.convertToObjectId(id) });
    return result.deletedCount > 0;
  }

  // Lead operations
  async getLead(id: number): Promise<Lead | undefined> {
    const result = await this.collections.leads.findOne({ id });
    return result ? { ...result, id: result.id } as Lead : undefined;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const result = await this.collections.leads.insertOne({
      ...lead,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return {
      ...lead,
      id: this.convertToNumberId(result.insertedId),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Lead;
  }

  async updateLead(id: number, leadUpdate: Partial<InsertLead>): Promise<Lead | undefined> {
    const result = await this.collections.leads.findOneAndUpdate(
      { id },
      { 
        $set: { 
          ...leadUpdate, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result ? { ...result, id: result.id } as Lead : undefined;
  }

  async getAllLeads(): Promise<Lead[]> {
    const results = await this.collections.leads.find().toArray();
    return results.map(lead => {
      const { _id, ...leadData } = lead;
      return {
        ...leadData,
        id: lead.id,
      } as Lead;
    });
  }

  async deleteLead(id: number): Promise<boolean> {
    const result = await this.collections.leads.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Lead Category operations
  async getAllLeadCategories(): Promise<LeadCategory[]> {
    const results = await this.collections.leadCategories.find().toArray();
    return results.map(category => {
      const { _id, ...categoryData } = category;
      return {
        ...categoryData,
        id: category.id,
      } as LeadCategory;
    });
  }

  async createLeadCategory(category: InsertLeadCategory): Promise<LeadCategory> {
    const result = await this.collections.leadCategories.insertOne({
      ...category,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return {
      ...category,
      id: result.insertedId.toString(),
    } as LeadCategory;
  }

  async updateLeadCategory(id: number, categoryUpdate: Partial<InsertLeadCategory>): Promise<LeadCategory | undefined> {
    const result = await this.collections.leadCategories.findOneAndUpdate(
      { id },
      { 
        $set: { 
          ...categoryUpdate, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result ? { ...result, id: result.id } as LeadCategory : undefined;
  }

  async deleteLeadCategory(id: number): Promise<boolean> {
    const result = await this.collections.leadCategories.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async getAllLeadSources(): Promise<LeadSource[]> {
    const results = await this.collections.leadSources.find().toArray();
    return results.map(source => {
      const { _id, ...sourceData } = source;
      return {
        ...sourceData,
        id: this.convertToNumberId(source._id || source.id),
      } as LeadSource;
    });
  }

  async createLeadSource(source: InsertLeadSource): Promise<LeadSource> {
    // Get the next ID
    const allSources = await this.getAllLeadSources();
    const maxId = allSources.length > 0 ? Math.max(...allSources.map(s => typeof s.id === 'number' ? s.id : parseInt(String(s.id)) || 0)) : 0;
    const nextId = maxId + 1;
    
    const result = await this.collections.leadSources.insertOne({
      ...source,
      id: nextId,
      createdAt: new Date(),
    });
    
    return {
      ...source,
      id: nextId,
      createdAt: new Date(),
    } as LeadSource;
  }

  async updateLeadSource(id: number, sourceUpdate: Partial<InsertLeadSource>): Promise<LeadSource | undefined> {
    const result = await this.collections.leadSources.findOneAndUpdate(
      { id },
      { 
        $set: { 
          ...sourceUpdate,
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result ? { ...result, id: result.id } as LeadSource : undefined;
  }

  async deleteLeadSource(id: number): Promise<boolean> {
    const result = await this.collections.leadSources.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Lead Discussion operations
  async getLeadDiscussions(leadId: number): Promise<LeadDiscussion[]> {
    const results = await this.collections.leadDiscussions
      .find({ leadId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return results.map(discussion => ({
      ...discussion,
      id: this.convertToNumberId(discussion._id),
    })) as LeadDiscussion[];
  }

  async createLeadDiscussion(discussion: InsertLeadDiscussion): Promise<LeadDiscussion> {
    const result = await this.collections.leadDiscussions.insertOne({
      ...discussion,
      createdAt: new Date(),
    });
    
    return {
      ...discussion,
      id: this.convertToNumberId(result.insertedId),
      createdAt: new Date(),
    } as LeadDiscussion;
  }

  async updateLeadDiscussion(id: number, discussionUpdate: Partial<InsertLeadDiscussion>): Promise<LeadDiscussion | undefined> {
    const result = await this.collections.leadDiscussions.findOneAndUpdate(
      { _id: this.convertToObjectId(id) },
      { $set: discussionUpdate },
      { returnDocument: 'after' }
    );
    
    return result ? { ...result, id: this.convertToNumberId(result._id) } as LeadDiscussion : undefined;
  }

  async deleteLeadDiscussion(id: number): Promise<boolean> {
    const result = await this.collections.leadDiscussions.deleteOne({ _id: this.convertToObjectId(id) });
    return result.deletedCount > 0;
  }

  // Quotation operations
  async getQuotation(id: number): Promise<Quotation | undefined> {
    const result = await this.collections.quotations.findOne({ id });
    return result ? { ...result, id: result.id } as Quotation : undefined;
  }

  async getQuotationByObjectId(objectId: string): Promise<Quotation | undefined> {
    const result = await this.collections.quotations.findOne({ _id: new ObjectId(objectId) });
    return result ? { ...result, id: result.id } as Quotation : undefined;
  }

  async updateQuotationByObjectId(objectId: string, quotationUpdate: Partial<InsertQuotation>): Promise<Quotation | undefined> {
    const result = await this.collections.quotations.findOneAndUpdate(
      { _id: new ObjectId(objectId) },
      { 
        $set: { 
          ...quotationUpdate, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result ? { ...result, id: this.convertToNumberId(result._id) } as Quotation : undefined;
  }

  async createQuotation(quotation: InsertQuotation): Promise<Quotation> {
    const result = await this.collections.quotations.insertOne({
      ...quotation,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return {
      ...quotation,
      id: this.convertToNumberId(result.insertedId),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Quotation;
  }

  async updateQuotation(id: number, quotationUpdate: Partial<InsertQuotation>): Promise<Quotation | undefined> {
    const result = await this.collections.quotations.findOneAndUpdate(
      { id },
      { 
        $set: { 
          ...quotationUpdate, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result ? { ...result, id: result.id } as Quotation : undefined;
  }

  async getAllQuotations(): Promise<Quotation[]> {
    const results = await this.collections.quotations.find().toArray();
    return results.map(quotation => {
      const { _id, ...quotationData } = quotation;
      return {
        ...quotationData,
        id: quotation.id, // Use the numeric ID field
      } as Quotation;
    });
  }

  async deleteQuotation(id: number): Promise<boolean> {
    const result = await this.collections.quotations.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Delete by MongoDB ObjectId
  async deleteQuotationByObjectId(objectId: string): Promise<boolean> {
    try {
      const result = await this.collections.quotations.deleteOne({ _id: new ObjectId(objectId) });
      return result.deletedCount > 0;
    } catch (err) {
      console.warn('deleteQuotationByObjectId error', err);
      return false;
    }
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const result = await this.collections.orders.findOne({ id });
    if (!result) return undefined;
    const { _id, ...orderData } = result;
    return {
      ...orderData,
      id: this.convertToNumberId(result.id || result._id),
    } as Order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    // Get the next ID
    const allOrders = await this.getAllOrders();
    const maxId = allOrders.length > 0 ? Math.max(...allOrders.map(o => typeof o.id === 'number' ? o.id : parseInt(String(o.id)) || 0)) : 0;
    const nextId = maxId + 1;
    
    const orderData = {
      ...order,
      id: nextId,
      orderNumber: order.orderNumber || `ORD-${new Date().getFullYear()}-${nextId}`,
      customerName: order.customerName || '',
      customerCompany: order.customerCompany || '',
      status: order.status || "processing",
      items: Array.isArray(order.items) ? order.items : [],
      subtotal: order.subtotal || "0",
      taxAmount: order.taxAmount || "0",
      totalAmount: order.totalAmount || order.subtotal || "0",
      createdAt: new Date(),
    };
    
    const result = await this.collections.orders.insertOne(orderData);
    
    return {
      ...orderData,
      id: nextId,
      createdAt: new Date(),
    } as Order;
  }

  async updateOrder(id: number, orderUpdate: Partial<InsertOrder>): Promise<Order | undefined> {
    const result = await this.collections.orders.findOneAndUpdate(
      { id },
      { 
        $set: { 
          ...orderUpdate,
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result) return undefined;
    const { _id, ...orderData } = result;
    return {
      ...orderData,
      id: this.convertToNumberId(result.id || result._id),
    } as Order;
  }

  async getAllOrders(): Promise<Order[]> {
    const results = await this.collections.orders.find().toArray();
    return results.map(order => {
      const { _id, ...orderData } = order;
      return {
        ...orderData,
        id: this.convertToNumberId(order.id || order._id),
      };
    }) as Order[];
  }

  async deleteOrder(id: number): Promise<boolean> {
    const result = await this.collections.orders.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const result = await this.collections.orders.findOne({ orderNumber });
    if (!result) return undefined;
    const { _id, ...orderData } = result;
    return {
      ...orderData,
      id: this.convertToNumberId(result.id || result._id),
    } as Order;
  }

  // Inventory operations
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const result = await this.collections.inventory.findOne({ _id: this.convertToObjectId(id) });
    return result ? { ...result, id: this.convertToNumberId(result._id) } as Inventory : undefined;
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const result = await this.collections.inventory.insertOne({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return {
      ...item,
      id: this.convertToNumberId(result.insertedId),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Inventory;
  }

  async updateInventoryItem(id: number, itemUpdate: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const result = await this.collections.inventory.findOneAndUpdate(
      { _id: this.convertToObjectId(id) },
      { 
        $set: { 
          ...itemUpdate, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result ? { ...result, id: this.convertToNumberId(result._id) } as Inventory : undefined;
  }

  async getAllInventoryItems(): Promise<Inventory[]> {
    const results = await this.collections.inventory.find().toArray();
    return results.map(item => ({
      ...item,
      id: this.convertToNumberId(item._id),
    })) as Inventory[];
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const result = await this.collections.inventory.deleteOne({ _id: this.convertToObjectId(id) });
    return result.deletedCount > 0;
  }

  async getLowStockItems(): Promise<Inventory[]> {
    const results = await this.collections.inventory
      .find({ 
        $expr: { 
          $lte: ["$quantity", "$reorderLevel"] 
        } 
      })
      .toArray();
    
    return results.map(item => ({
      ...item,
      id: this.convertToNumberId(item._id),
    })) as Inventory[];
  }

  async getInventoryItemBySku(sku: string): Promise<Inventory | undefined> {
    const result = await this.collections.inventory.findOne({ sku });
    return result ? { ...result, id: this.convertToNumberId(result._id) } as Inventory : undefined;
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    const result = await this.collections.tasks.findOne({ _id: this.convertToObjectId(id) });
    return result ? { ...result, id: this.convertToNumberId(result._id) } as Task : undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await this.collections.tasks.insertOne({
      ...task,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return {
      ...task,
      id: this.convertToNumberId(result.insertedId),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Task;
  }

  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await this.collections.tasks.findOneAndUpdate(
      { _id: this.convertToObjectId(id) },
      { 
        $set: { 
          ...taskUpdate, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result ? { ...result, id: this.convertToNumberId(result._id) } as Task : undefined;
  }

  async getAllTasks(): Promise<Task[]> {
    const results = await this.collections.tasks.find().toArray();
    return results.map(task => ({
      ...task,
      id: this.convertToNumberId(task._id),
    })) as Task[];
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await this.collections.tasks.deleteOne({ _id: this.convertToObjectId(id) });
    return result.deletedCount > 0;
  }

  // Placeholder methods for other entities (implement as needed)
  async getSupplier(id: number): Promise<Supplier | undefined> { return undefined; }
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> { throw new Error('Not implemented'); }
  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> { return undefined; }
  async getAllSuppliers(): Promise<Supplier[]> { return []; }
  async deleteSupplier(id: number): Promise<boolean> { return false; }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const result = await this.collections.invoices.findOne({ id });
    return result ? { ...result, id: result.id } as Invoice : undefined;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    // Get the next ID
    const allInvoices = await this.getAllInvoices();
    const maxId = allInvoices.length > 0 ? Math.max(...allInvoices.map(i => typeof i.id === 'number' ? i.id : parseInt(String(i.id)) || 0)) : 0;
    const nextId = maxId + 1;

    const invoiceData = {
      ...invoice,
      id: nextId,
      invoiceNumber: invoice.invoiceNumber || `INV-${new Date().getFullYear()}-${nextId}`,
      status: invoice.status || "pending",
      paidAmount: invoice.paidAmount || "0",
      createdAt: new Date(),
    };

    const result = await this.collections.invoices.insertOne(invoiceData);

    return {
      ...invoice,
      id: nextId,
      invoiceNumber: invoice.invoiceNumber || `INV-${new Date().getFullYear()}-${nextId}`,
      status: invoice.status || "pending",
      paidAmount: invoice.paidAmount || "0",
      createdAt: new Date(),
    } as Invoice;
  }

  async updateInvoice(id: number, invoiceUpdate: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const result = await this.collections.invoices.findOneAndUpdate(
      { id },
      {
        $set: {
          ...invoiceUpdate,
        }
      },
      { returnDocument: 'after' }
    );

    return result ? { ...result, id: result.id } as Invoice : undefined;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    const results = await this.collections.invoices.find().toArray();
    return results.map(invoice => {
      const { _id, ...invoiceData } = invoice;
      return {
        ...invoiceData,
        id: invoice.id,
      } as Invoice;
    });
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const result = await this.collections.invoices.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async getPayment(id: number): Promise<Payment | undefined> { return undefined; }
  async createPayment(payment: InsertPayment): Promise<Payment> { throw new Error('Not implemented'); }
  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> { return undefined; }
  async getAllPayments(): Promise<Payment[]> { return []; }
  async deletePayment(id: number): Promise<boolean> { return false; }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    const purchaseOrder = await this.collections.purchaseOrders.findOne({ id });
    return purchaseOrder as PurchaseOrder | undefined;
  }
  
  async createPurchaseOrder(purchaseOrder: InsertPurchaseOrder): Promise<PurchaseOrder> {
    // Get the next ID
    const allPurchaseOrders = await this.getAllPurchaseOrders();
    const maxId = allPurchaseOrders.length > 0 ? Math.max(...allPurchaseOrders.map(po => typeof po.id === 'number' ? po.id : parseInt(String(po.id)) || 0)) : 0;
    const nextId = maxId + 1;
    
    const purchaseOrderData = {
      ...purchaseOrder,
      id: nextId,
      status: purchaseOrder.status || "pending",
      createdAt: new Date(),
    };
    
    const result = await this.collections.purchaseOrders.insertOne(purchaseOrderData);
    
    return {
      ...purchaseOrder,
      id: nextId,
      status: purchaseOrder.status || "pending",
      createdAt: new Date(),
    } as PurchaseOrder;
  }
  
  async updatePurchaseOrder(id: number, purchaseOrder: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const existing = await this.getPurchaseOrder(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...purchaseOrder,
    };
    
    await this.collections.purchaseOrders.updateOne(
      { id },
      { $set: updated }
    );
    
    return updated as PurchaseOrder;
  }
  
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    const purchaseOrders = await this.collections.purchaseOrders.find({}).toArray();
    return purchaseOrders as PurchaseOrder[];
  }
  
  async deletePurchaseOrder(id: number): Promise<boolean> {
    const result = await this.collections.purchaseOrders.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async getManufacturingJob(id: number): Promise<ManufacturingJob | undefined> { return undefined; }
  async createManufacturingJob(job: InsertManufacturingJob): Promise<ManufacturingJob> { throw new Error('Not implemented'); }
  async updateManufacturingJob(id: number, job: Partial<InsertManufacturingJob>): Promise<ManufacturingJob | undefined> { return undefined; }
  async getAllManufacturingJobs(): Promise<ManufacturingJob[]> { return []; }
  async deleteManufacturingJob(id: number): Promise<boolean> { return false; }

  async getEmployeeActivity(id: number): Promise<EmployeeActivity | undefined> { return undefined; }
  async createEmployeeActivity(activity: InsertEmployeeActivity): Promise<EmployeeActivity> { throw new Error('Not implemented'); }
  async updateEmployeeActivity(id: number, activity: Partial<InsertEmployeeActivity>): Promise<EmployeeActivity | undefined> { return undefined; }
  async getAllEmployeeActivities(): Promise<EmployeeActivity[]> { return []; }
  async deleteEmployeeActivity(id: number): Promise<boolean> { return false; }

  async getSalesTarget(id: number): Promise<SalesTarget | undefined> { return undefined; }
  async createSalesTarget(target: InsertSalesTarget): Promise<SalesTarget> { throw new Error('Not implemented'); }
  async updateSalesTarget(id: number, target: Partial<InsertSalesTarget>): Promise<SalesTarget | undefined> { return undefined; }
  async getAllSalesTargets(): Promise<SalesTarget[]> { return []; }
  async deleteSalesTarget(id: number): Promise<boolean> { return false; }
  async getSalesTargetsByPeriod(month: string, year: string): Promise<SalesTarget[]> { return []; }

  async getManufacturingForecast(id: number): Promise<ManufacturingForecast | undefined> { return undefined; }
  async createManufacturingForecast(forecast: InsertManufacturingForecast): Promise<ManufacturingForecast> { throw new Error('Not implemented'); }
  async updateManufacturingForecast(id: number, forecast: Partial<InsertManufacturingForecast>): Promise<ManufacturingForecast | undefined> { return undefined; }
  async getAllManufacturingForecasts(): Promise<ManufacturingForecast[]> { return []; }
  async deleteManufacturingForecast(id: number): Promise<boolean> { return false; }
  async getManufacturingForecastsByPeriod(month: string, year: string): Promise<ManufacturingForecast[]> { return []; }

  async getSupportTicket(id: number): Promise<SupportTicket | undefined> { return undefined; }
  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> { throw new Error('Not implemented'); }
  async updateSupportTicket(id: number, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> { return undefined; }
  async getAllSupportTickets(): Promise<SupportTicket[]> { return []; }
  async deleteSupportTicket(id: number): Promise<boolean> { return false; }

  async getContract(id: number): Promise<Contract | undefined> { return undefined; }
  async createContract(contract: InsertContract): Promise<Contract> { throw new Error('Not implemented'); }
  async updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract | undefined> { return undefined; }
  async getAllContracts(): Promise<Contract[]> { return []; }
  async deleteContract(id: number): Promise<boolean> { return false; }

  // Company operations (for pending approvals)
  async createCompany(company: any): Promise<any> {
    const result = await this.collections.companySettings.insertOne({
      ...company,
      id: Date.now(), // Generate numeric ID
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      ...company,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  }

  async getAllCompanies(): Promise<any[]> {
    const results = await this.collections.companySettings.find().toArray();
    return results.map(company => ({
      ...company,
      id: this.convertToNumberId(company._id),
    })) as any[];
  }

  async getCompany(id: number | string): Promise<any | undefined> {
    // Handle both numeric IDs and MongoDB ObjectIds
    if (typeof id === 'string' && id.length === 24) {
      // It's likely a MongoDB ObjectId
      try {
        const objectId = new ObjectId(id);
        const result = await this.collections.companySettings.findOne({ _id: objectId });
        return result ? { ...result, id: this.convertToNumberId(result._id) } as any : undefined;
      } catch (err) {
        // Not a valid ObjectId, fall through to numeric search
      }
    }

    // Try numeric ID search
    const result = await this.collections.companySettings.findOne({ id: typeof id === 'string' ? parseInt(id) : id });
    return result ? { ...result, id: result.id } as any : undefined;
  }

  async updateCompany(id: number | string, updates: any): Promise<any | undefined> {
    let filter: any = {};

    // Handle both numeric IDs and MongoDB ObjectIds
    if (typeof id === 'string' && id.length === 24) {
      // It's likely a MongoDB ObjectId
      try {
        const objectId = new ObjectId(id);
        filter = { _id: objectId };
      } catch (err) {
        // Not a valid ObjectId, fall through to numeric search
        filter = { id: parseInt(id) };
      }
    } else {
      // Numeric ID
      filter = { id: typeof id === 'string' ? parseInt(id) : id };
    }

    const result = await this.collections.companySettings.findOneAndUpdate(
      filter,
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result ? { ...result, id: result.id || this.convertToNumberId(result._id) } as any : undefined;
  }

  async getUsersByCompanyId(companyId: number): Promise<any[]> {
    const results = await this.collections.users.find({ companyId }).toArray();
    return results.map(user => ({
      ...user,
      id: user.id,
    })) as any[];
  }

  async getAllProducts(): Promise<any[]> { return []; }
  async getAllRawMaterials(): Promise<any[]> { return []; }
  async getAllQuotationTemplates(): Promise<any[]> { return []; }
  async getAllCapturedLeads(): Promise<any[]> { return []; }

  // Company Settings operations
  async getCompanySettings(): Promise<any | undefined> {
    try {
      const result = await this.collections.companySettings.findOne({});
      return result;
    } catch (error) {
      console.error('Error getting company settings:', error);
      // Return default settings if none exist
      return {
        id: 1,
        name: "Business AI",
        address: "Unit F2, MIDC Plot no. BG/PAP3, Opp. The Fern Residency Hotel, MIDC, Bhosari, Pune-411026, Maharashtra",
        phone: "+91 8767431725 / 9175240313",
        email: "sales@businessai.in",
        gstNumber: "27ABGFR0875B1ZA",
        panNumber: "",
        logo: "",
        website: "",
        bankDetails: {
          bankName: "IDFC FIRST BANK LTD",
          accountNo: "10120052061",
          ifsc: "IDFB0041434",
          branch: "BHOSARI PUNE",
          upi: "",
          swift: ""
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  async updateCompanySettings(settings: any): Promise<any> {
    try {
      const existingSettings = await this.getCompanySettings();
      
      // Deep merge nested objects (bankDetails, integrations, etc.)
      const mergedSettings = {
        ...existingSettings,
        ...settings,
        // Merge bankDetails if both exist
        bankDetails: settings.bankDetails 
          ? { ...(existingSettings?.bankDetails || {}), ...settings.bankDetails }
          : existingSettings?.bankDetails,
        // Merge integrations if both exist (deep merge for nested objects like indiaMart)
        integrations: settings.integrations
          ? {
              ...(existingSettings?.integrations || {}),
              ...settings.integrations,
              // Deep merge indiaMart if both exist
              indiaMart: settings.integrations.indiaMart
                ? { ...(existingSettings?.integrations?.indiaMart || {}), ...settings.integrations.indiaMart }
                : existingSettings?.integrations?.indiaMart
            }
          : existingSettings?.integrations,
        updatedAt: new Date()
      };
      
      // Remove MongoDB _id from the update object
      const { _id, ...updateData } = mergedSettings;
      
      if (existingSettings && existingSettings._id) {
        // Update existing settings
        const result = await this.collections.companySettings.updateOne(
          { _id: existingSettings._id },
          { 
            $set: updateData
          }
        );
        
        if (result.modifiedCount > 0 || result.matchedCount > 0) {
          return await this.getCompanySettings();
        }
      } else {
        // Create new settings
        const result = await this.collections.companySettings.insertOne({
          ...updateData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        if (result.insertedId) {
          return await this.getCompanySettings();
        }
      }
      
      throw new Error('Failed to update company settings');
    } catch (error) {
      console.error('Error updating company settings:', error);
      throw error;
    }
  }
}
