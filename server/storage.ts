import { 
  users, type User, type InsertUser,
  companies, type Company, type InsertCompany,
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
  contracts, type Contract, type InsertContract,
  companySettings, type CompanySettings, type InsertCompanySettings,
  proformas, type Proforma, type InsertProforma
} from "@shared/schema";
import fs from 'fs/promises';
import path from 'path';
import createMemoryStore from "memorystore";
import session from "express-session";
import { Store as SessionStore } from "express-session";

const MemoryStore = createMemoryStore(session);

// Directory for JSON storage
const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Create file paths for each data type
const USER_FILE = path.join(DATA_DIR, 'users.json');
const CUSTOMER_FILE = path.join(DATA_DIR, 'customers.json');
const SUPPLIER_FILE = path.join(DATA_DIR, 'suppliers.json');
const LEAD_FILE = path.join(DATA_DIR, 'leads.json');
const QUOTATION_FILE = path.join(DATA_DIR, 'quotations.json');
const ORDER_FILE = path.join(DATA_DIR, 'orders.json');
const INVOICE_FILE = path.join(DATA_DIR, 'invoices.json');
const PAYMENT_FILE = path.join(DATA_DIR, 'payments.json');
const PURCHASE_ORDER_FILE = path.join(DATA_DIR, 'purchase_orders.json');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');
const MANUFACTURING_JOB_FILE = path.join(DATA_DIR, 'manufacturing_jobs.json');
const TASK_FILE = path.join(DATA_DIR, 'tasks.json');
const EMPLOYEE_ACTIVITY_FILE = path.join(DATA_DIR, 'employee_activities.json');
const SALES_TARGET_FILE = path.join(DATA_DIR, 'sales_targets.json');
const MANUFACTURING_FORECAST_FILE = path.join(DATA_DIR, 'manufacturing_forecasts.json');
const SUPPORT_TICKET_FILE = path.join(DATA_DIR, 'support_tickets.json');
const CONTRACT_FILE = path.join(DATA_DIR, 'contracts.json');
const COMPANY_SETTINGS_FILE = path.join(DATA_DIR, 'company-settings.json');
const LEAD_CATEGORY_FILE = path.join(DATA_DIR, 'lead-categories.json');
const LEAD_SOURCE_FILE = path.join(DATA_DIR, 'lead-sources.json');
const PRODUCT_FILE = path.join(DATA_DIR, 'products.json');
const RAW_MATERIAL_FILE = path.join(DATA_DIR, 'raw-materials.json');
const QUOTATION_TEMPLATE_FILE = path.join(DATA_DIR, 'quotation-templates.json');
const CAPTURED_LEAD_FILE = path.join(DATA_DIR, 'captured-leads.json');
const PROFORMA_FILE = path.join(DATA_DIR, 'proformas.json');
const COMPANY_FILE = path.join(DATA_DIR, 'companies.json');

// Interface for all storage operations
export interface IStorage {
  // Company operations
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  getUsersByCompanyId(companyId: number): Promise<User[]>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

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

  // Proforma operations
  getProforma(id: number): Promise<Proforma | undefined>;
  createProforma(p: InsertProforma): Promise<Proforma>;
  updateProforma(id: number, p: Partial<InsertProforma>): Promise<Proforma | undefined>;
  getAllProformas(): Promise<Proforma[]>;
  deleteProforma(id: number): Promise<boolean>;

  // Company Settings operations
  getCompanySettings(): Promise<CompanySettings | undefined>;
  updateCompanySettings(settings: Partial<InsertCompanySettings>): Promise<CompanySettings>;

  // Session store
  sessionStore: SessionStore;
}

// Implementation for JSON file storage
export class JSONFileStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private suppliers: Map<number, Supplier>;
  private leads: Map<number, Lead>;
  private leadDiscussions: Map<number, LeadDiscussion>;
  private leadCategories: Map<number, LeadCategory>;
  private leadSources: Map<number, LeadSource>;
  private quotations: Map<number, Quotation>;
  private orders: Map<number, Order>;
  private invoices: Map<number, Invoice>;
  private payments: Map<number, Payment>;
  private purchaseOrders: Map<number, PurchaseOrder>;
  private inventory: Map<number, Inventory>;
  private manufacturingJobs: Map<number, ManufacturingJob>;
  private tasks: Map<number, Task>;
  private employeeActivities: Map<number, EmployeeActivity>;
  private salesTargets: Map<number, SalesTarget>;
  private manufacturingForecasts: Map<number, ManufacturingForecast>;
  private supportTickets: Map<number, SupportTicket>;
  private contracts: Map<number, Contract>;
  private proformas: Map<number, Proforma>;
  private companies: Map<number, Company>;
  sessionStore: SessionStore;
  
  // Counters for auto-incrementing IDs
  companyIdCounter: number;
  userIdCounter: number;
  customerIdCounter: number;
  supplierIdCounter: number;
  leadIdCounter: number;
  leadDiscussionIdCounter: number;
  leadCategoryIdCounter: number;
  leadSourceIdCounter: number;
  quotationIdCounter: number;
  orderIdCounter: number;
  invoiceIdCounter: number;
  paymentIdCounter: number;
  purchaseOrderIdCounter: number;
  inventoryIdCounter: number;
  manufacturingJobIdCounter: number;
  taskIdCounter: number;
  employeeActivityIdCounter: number;
  salesTargetIdCounter: number;
  manufacturingForecastIdCounter: number;
  supportTicketIdCounter: number;
  contractIdCounter: number;
  proformaIdCounter: number;

  constructor() {
    // Initialize all maps
    this.users = new Map();
    this.customers = new Map();
    this.suppliers = new Map();
    this.leads = new Map();
    this.leadDiscussions = new Map();
    this.leadCategories = new Map();
    this.leadSources = new Map();
    this.quotations = new Map();
    this.orders = new Map();
    this.invoices = new Map();
    this.payments = new Map();
    this.purchaseOrders = new Map();
    this.inventory = new Map();
    this.manufacturingJobs = new Map();
    this.tasks = new Map();
    this.employeeActivities = new Map();
    this.salesTargets = new Map();
    this.manufacturingForecasts = new Map();
    this.supportTickets = new Map();
    this.contracts = new Map();
    this.proformas = new Map();
    this.companies = new Map();
    
    // Initialize counters
    this.companyIdCounter = 1;
    this.userIdCounter = 1;
    this.customerIdCounter = 1;
    this.supplierIdCounter = 1;
    this.leadIdCounter = 1;
    this.leadDiscussionIdCounter = 1;
    this.leadCategoryIdCounter = 1;
    this.leadSourceIdCounter = 1;
    this.quotationIdCounter = 1;
    this.orderIdCounter = 1;
    this.invoiceIdCounter = 1;
    this.paymentIdCounter = 1;
    this.purchaseOrderIdCounter = 1;
    this.inventoryIdCounter = 1;
    this.manufacturingJobIdCounter = 1;
    this.taskIdCounter = 1;
    this.employeeActivityIdCounter = 1;
    this.salesTargetIdCounter = 1;
    this.manufacturingForecastIdCounter = 1;
    this.supportTicketIdCounter = 1;
    this.contractIdCounter = 1;
    this.proformaIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });

    // Load data from files if they exist
    this.loadData().then(() => {
      // Create default admin user if no users exist
      this.createDefaultAdminUser();
    });
  }

  // Create default admin user if no users exist
  private async createDefaultAdminUser() {
    try {
      const existingUsers = await this.getAllUsers();
      if (existingUsers.length === 0) {
        console.log('No users found, creating default admin user...');
        
        // Import the hashPassword function from auth.ts
        const { scrypt, randomBytes } = require('crypto');
        const { promisify } = require('util');
        const scryptAsync = promisify(scrypt);
        
        const hashPassword = async (password: string) => {
          const salt = randomBytes(16).toString('hex');
          const buf = (await scryptAsync(password, salt, 64)) as Buffer;
          return `${buf.toString('hex')}.${salt}`;
        };
        
        const adminUser = await this.createUser({
          username: 'admin',
          password: await hashPassword('admin123'),
          name: 'System Administrator',
          email: 'admin@businessai.com',
          phone: '+91 98765 43210',
          role: 'superuser',
          department: 'IT',
          companyId: null,
          isActive: true
        });
        
        console.log('Default admin user created:', adminUser.username);
      }
    } catch (error) {
      console.error('Error creating default admin user:', error);
    }
  }

  // Helper to load all data from JSON files
  private async loadData() {
    await ensureDataDir();
    await this.loadCompanies();
    await this.loadUsers();
    await this.loadCustomers();
    await this.loadSuppliers();
    await this.loadLeads();
    await this.loadLeadDiscussions();
    await this.loadLeadCategories();
    await this.loadLeadSources();
    await this.loadQuotations();
    await this.loadOrders();
    await this.loadInvoices();
    await this.loadPayments();
    await this.loadPurchaseOrders();
    await this.loadInventory();
    await this.loadManufacturingJobs();
    await this.loadTasks();
    await this.loadEmployeeActivities();
    await this.loadSalesTargets();
    await this.loadManufacturingForecasts();
    await this.loadSupportTickets();
    await this.loadContracts();
    await this.loadProformas();
  }

  // Generic load/save helpers
  private async loadFromFile<T>(filePath: string, map: Map<number, T>, counter: keyof this): Promise<void> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const items = JSON.parse(data);
      map.clear();
      
      let maxId = 0;
      items.forEach((item: T & { id: number }) => {
        map.set(item.id, item);
        maxId = Math.max(maxId, item.id);
      });
      
      (this as any)[counter] = maxId + 1;
    } catch (error) {
      console.log(`No ${path.basename(filePath)} file found, starting with empty data`);
    }
  }

  private async saveToFile<T>(filePath: string, map: Map<number, T>): Promise<void> {
    try {
      const data = JSON.stringify(Array.from(map.values()), null, 2);
      console.log(`Saving ${map.size} items to ${filePath}`);
      await fs.writeFile(filePath, data, 'utf-8');
      console.log(`Saved to ${filePath} successfully`);
    } catch (error) {
      console.error(`Error saving ${path.basename(filePath)}:`, error);
    }
  }

  // Load methods for each entity
  private async loadCompanies() {
    await this.loadFromFile(COMPANY_FILE, this.companies, 'companyIdCounter');
  }

  private async loadUsers() {
    await this.loadFromFile(USER_FILE, this.users, 'userIdCounter');
  }

  private async loadCustomers() {
    await this.loadFromFile(CUSTOMER_FILE, this.customers, 'customerIdCounter');
  }

  private async loadSuppliers() {
    await this.loadFromFile(SUPPLIER_FILE, this.suppliers, 'supplierIdCounter');
  }

  private async loadLeads() {
    await this.loadFromFile(LEAD_FILE, this.leads, 'leadIdCounter');
  }

  private async loadQuotations() {
    try {
      const data = await fs.readFile(QUOTATION_FILE, 'utf-8');
      const quotations = JSON.parse(data);
      this.convertQuotationData(quotations);
    } catch (error) {
      console.log('No quotations file found, starting with empty quotations');
      this.quotations.clear();
      this.quotationIdCounter = 1;
    }
  }

  private convertQuotationData(data: any[]): void {
    this.quotations.clear();
    data.forEach((item, index) => {
      const numericId = index + 1;
      const convertedItem = {
        ...item,
        id: numericId,
        quotationNumber: item.quoteNumber || item.quotationNumber,
        customerId: item.customerId ? parseInt(item.customerId.toString().replace(/\D/g, '')) || null : null,
        leadId: item.leadId ? parseInt(item.leadId.toString().replace(/\D/g, '')) || null : null,
        createdAt: item.issueDate || item.createdAt || new Date().toISOString(),
        createdBy: item.assignedTo ? parseInt(item.assignedTo.toString().replace(/\D/g, '')) || null : null,
      };
      this.quotations.set(numericId, convertedItem as any);
    });
    this.quotationIdCounter = data.length + 1;
  }

  private async loadOrders() {
    await this.loadFromFile(ORDER_FILE, this.orders, 'orderIdCounter');
  }

  private async loadInvoices() {
    await this.loadFromFile(INVOICE_FILE, this.invoices, 'invoiceIdCounter');
  }

  private async loadPayments() {
    await this.loadFromFile(PAYMENT_FILE, this.payments, 'paymentIdCounter');
  }

  private async loadPurchaseOrders() {
    await this.loadFromFile(PURCHASE_ORDER_FILE, this.purchaseOrders, 'purchaseOrderIdCounter');
  }

  private async loadInventory() {
    await this.loadFromFile(INVENTORY_FILE, this.inventory, 'inventoryIdCounter');
  }

  private async loadManufacturingJobs() {
    await this.loadFromFile(MANUFACTURING_JOB_FILE, this.manufacturingJobs, 'manufacturingJobIdCounter');
  }

  private async loadTasks() {
    await this.loadFromFile(TASK_FILE, this.tasks, 'taskIdCounter');
  }

  private async loadEmployeeActivities() {
    await this.loadFromFile(EMPLOYEE_ACTIVITY_FILE, this.employeeActivities, 'employeeActivityIdCounter');
  }

  private async loadSalesTargets() {
    await this.loadFromFile(SALES_TARGET_FILE, this.salesTargets, 'salesTargetIdCounter');
  }

  private async loadManufacturingForecasts() {
    await this.loadFromFile(MANUFACTURING_FORECAST_FILE, this.manufacturingForecasts, 'manufacturingForecastIdCounter');
  }

  private async loadSupportTickets() {
    await this.loadFromFile(SUPPORT_TICKET_FILE, this.supportTickets, 'supportTicketIdCounter');
  }

  private async loadContracts() {
    await this.loadFromFile(CONTRACT_FILE, this.contracts, 'contractIdCounter');
  }

  private async loadProformas() {
    await this.loadFromFile(PROFORMA_FILE, this.proformas, 'proformaIdCounter');
  }

  private async loadLeadCategories() {
    try {
      const data = await fs.readFile(LEAD_CATEGORY_FILE, 'utf-8');
      const list = JSON.parse(data) as any[];
      this.leadCategories.clear();
      let maxId = 0;
      const normalized = list.map((c, idx) => {
        const id = c.id ?? (idx + 1);
        maxId = Math.max(maxId, id);
        return {
          id,
          key: c.key || (c.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
          name: c.name || c.key,
          isActive: typeof c.isActive === 'boolean' ? c.isActive : true,
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date()
        } as LeadCategory;
      });
      normalized.forEach((c) => this.leadCategories.set(c.id, c));
      this.leadCategoryIdCounter = maxId + 1;
    } catch {
      const defaults: LeadCategory[] = [
        { id: 1, key: 'industry', name: 'Industry', isActive: true, createdAt: new Date() },
        { id: 2, key: 'calibration_labs', name: 'Calibration Labs', isActive: true, createdAt: new Date() },
        { id: 3, key: 'vision_measuring_machine', name: 'Vision Measuring Machine', isActive: true, createdAt: new Date() },
        { id: 4, key: 'data_logger', name: 'Data Logger', isActive: true, createdAt: new Date() },
        { id: 5, key: 'calibration_software', name: 'Calibration Software', isActive: true, createdAt: new Date() },
        { id: 6, key: 'meatest', name: 'Meatest', isActive: true, createdAt: new Date() },
        { id: 7, key: 'finalization', name: 'Finalization', isActive: true, createdAt: new Date() },
        { id: 8, key: 'waiting_for_po', name: 'Waiting for PO', isActive: true, createdAt: new Date() },
      ];
      this.leadCategories.clear();
      defaults.forEach((c) => this.leadCategories.set(c.id, c));
      this.leadCategoryIdCounter = defaults.length + 1;
      await this.saveLeadCategories();
    }
  }

  private async saveLeadCategories() {
    const arr = Array.from(this.leadCategories.values()).map((c) => ({
      ...c,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt
    }));
    await fs.writeFile(LEAD_CATEGORY_FILE, JSON.stringify(arr, null, 2), 'utf-8');
  }

  private async loadLeadSources() {
    try {
      const data = await fs.readFile(LEAD_SOURCE_FILE, 'utf-8');
      const list = JSON.parse(data) as any[];
      this.leadSources.clear();
      let maxId = 0;
      const normalized = list.map((c, idx) => {
        const id = c.id ?? (idx + 1);
        maxId = Math.max(maxId, id);
        return {
          id,
          key: c.key || (c.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
          name: c.name || c.key,
          isActive: typeof c.isActive === 'boolean' ? c.isActive : true,
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date()
        } as LeadSource;
      });
      normalized.forEach((c) => this.leadSources.set(c.id, c));
      this.leadSourceIdCounter = maxId + 1;
    } catch {
      const defaults: LeadSource[] = [
        { id: 1, key: 'website', name: 'Website', isActive: true, createdAt: new Date() },
        { id: 2, key: 'referral', name: 'Referral', isActive: true, createdAt: new Date() },
        { id: 3, key: 'social_media', name: 'Social Media', isActive: true, createdAt: new Date() },
        { id: 4, key: 'email_campaign', name: 'Email Campaign', isActive: true, createdAt: new Date() },
        { id: 5, key: 'cold_call', name: 'Cold Call', isActive: true, createdAt: new Date() },
        { id: 6, key: 'trade_show', name: 'Trade Show', isActive: true, createdAt: new Date() },
        { id: 7, key: 'partner', name: 'Partner', isActive: true, createdAt: new Date() },
        { id: 8, key: 'online_ad', name: 'Online Advertisement', isActive: true, createdAt: new Date() },
        { id: 9, key: 'other', name: 'Other', isActive: true, createdAt: new Date() },
      ];
      this.leadSources.clear();
      defaults.forEach((c) => this.leadSources.set(c.id, c));
      this.leadSourceIdCounter = defaults.length + 1;
      await this.saveLeadSources();
    }
  }

  private async saveLeadSources() {
    const arr = Array.from(this.leadSources.values()).map((c) => ({
      ...c,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt
    }));
    await fs.writeFile(LEAD_SOURCE_FILE, JSON.stringify(arr, null, 2), 'utf-8');
  }

  // Save methods for each entity
  private async saveCompanies() {
    await this.saveToFile(COMPANY_FILE, this.companies);
  }

  private async saveUsers() {
    await this.saveToFile(USER_FILE, this.users);
  }

  private async saveCustomers() {
    await this.saveToFile(CUSTOMER_FILE, this.customers);
  }

  private async saveSuppliers() {
    await this.saveToFile(SUPPLIER_FILE, this.suppliers);
  }

  private async saveLeads() {
    await this.saveToFile(LEAD_FILE, this.leads);
  }

  private async saveQuotations() {
    await this.saveToFile(QUOTATION_FILE, this.quotations);
  }

  private async saveOrders() {
    await this.saveToFile(ORDER_FILE, this.orders);
  }

  private async saveInvoices() {
    await this.saveToFile(INVOICE_FILE, this.invoices);
  }

  private async savePayments() {
    await this.saveToFile(PAYMENT_FILE, this.payments);
  }

  private async savePurchaseOrders() {
    await this.saveToFile(PURCHASE_ORDER_FILE, this.purchaseOrders);
  }

  private async saveInventory() {
    await this.saveToFile(INVENTORY_FILE, this.inventory);
  }

  private async saveManufacturingJobs() {
    await this.saveToFile(MANUFACTURING_JOB_FILE, this.manufacturingJobs);
  }

  private async saveTasks() {
    await this.saveToFile(TASK_FILE, this.tasks);
  }

  private async saveEmployeeActivities() {
    await this.saveToFile(EMPLOYEE_ACTIVITY_FILE, this.employeeActivities);
  }

  private async saveSalesTargets() {
    await this.saveToFile(SALES_TARGET_FILE, this.salesTargets);
  }

  private async saveManufacturingForecasts() {
    await this.saveToFile(MANUFACTURING_FORECAST_FILE, this.manufacturingForecasts);
  }

  private async saveSupportTickets() {
    await this.saveToFile(SUPPORT_TICKET_FILE, this.supportTickets);
  }

  private async saveContracts() {
    await this.saveToFile(CONTRACT_FILE, this.contracts);
  }

  private async saveProformas() {
    await this.saveToFile(PROFORMA_FILE, this.proformas);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user",
      isActive: insertUser.isActive !== undefined ? insertUser.isActive : (insertUser.role === 'superuser'),
      createdAt: new Date()
    };
    this.users.set(id, user);
    await this.saveUsers();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated: User = { ...existing, ...updates } as User;
    this.users.set(id, updated);
    await this.saveUsers();
    return updated;
  }

  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    console.log('Creating company:', insertCompany.name);
    const id = this.companyIdCounter++;
    const company: Company = {
      ...insertCompany,
      id,
      status: insertCompany.status || "pending",
      maxUsers: insertCompany.maxUsers || 20,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.companies.set(id, company);
    console.log('Company created with id:', id, 'total companies:', this.companies.size);
    await this.saveCompanies();
    return company;
  }

  async updateCompany(id: number, companyUpdate: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    const updated: Company = { ...company, ...companyUpdate, updatedAt: new Date() } as Company;
    this.companies.set(id, updated);
    await this.saveCompanies();
    return updated;
  }

  async getAllCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async getUsersByCompanyId(companyId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.companyId === companyId);
  }

  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.customerIdCounter++;
    const customer: Customer = { 
      ...insertCustomer, 
      id,
      status: insertCustomer.status || "active",
      createdAt: new Date()
    };
    this.customers.set(id, customer);
    await this.saveCustomers();
    return customer;
  }

  async updateCustomer(id: number, customerUpdate: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) {
      return undefined;
    }
    
    const updatedCustomer = { ...customer, ...customerUpdate };
    this.customers.set(id, updatedCustomer);
    await this.saveCustomers();
    return updatedCustomer;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const deleted = this.customers.delete(id);
    if (deleted) {
      await this.saveCustomers();
    }
    return deleted;
  }

  // Supplier methods
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = this.supplierIdCounter++;
    const supplier: Supplier = { 
      ...insertSupplier, 
      id,
      status: insertSupplier.status || "active",
      createdAt: new Date()
    };
    this.suppliers.set(id, supplier);
    await this.saveSuppliers();
    return supplier;
  }

  async updateSupplier(id: number, supplierUpdate: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) {
      return undefined;
    }
    
    const updatedSupplier = { ...supplier, ...supplierUpdate };
    this.suppliers.set(id, updatedSupplier);
    await this.saveSuppliers();
    return updatedSupplier;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async deleteSupplier(id: number): Promise<boolean> {
    const deleted = this.suppliers.delete(id);
    if (deleted) {
      await this.saveSuppliers();
    }
    return deleted;
  }

  // Lead methods
  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.leadIdCounter++;
    const createdAt = new Date();
    const lead: Lead = { 
      ...insertLead, 
      id, 
      createdAt,
      status: insertLead.status || "new",
      category: insertLead.category || "industry",
      notes: insertLead.notes || null
    };
    this.leads.set(id, lead);
    await this.saveLeads();
    return lead;
  }

  async updateLead(id: number, leadUpdate: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) {
      return undefined;
    }
    
    const updatedLead = { ...lead, ...leadUpdate };
    this.leads.set(id, updatedLead);
    await this.saveLeads();
    return updatedLead;
  }

  async getAllLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async deleteLead(id: number): Promise<boolean> {
    const deleted = this.leads.delete(id);
    if (deleted) {
      await this.saveLeads();
    }
    return deleted;
  }

  // Lead Category methods
  async getAllLeadCategories(): Promise<LeadCategory[]> {
    return Array.from(this.leadCategories.values());
  }

  async createLeadCategory(insert: InsertLeadCategory): Promise<LeadCategory> {
    const id = this.leadCategoryIdCounter++;
    const rec: LeadCategory = {
      id,
      key: insert.key,
      name: insert.name,
      isActive: typeof insert.isActive === 'boolean' ? insert.isActive : true,
      createdAt: new Date(),
    } as LeadCategory;
    this.leadCategories.set(id, rec);
    await this.saveLeadCategories();
    return rec;
  }

  async updateLeadCategory(id: number, updates: Partial<InsertLeadCategory>): Promise<LeadCategory | undefined> {
    const existing = this.leadCategories.get(id);
    if (!existing) return undefined;
    const updated: LeadCategory = {
      ...existing,
      ...updates,
    } as any;
    this.leadCategories.set(id, updated);
    await this.saveLeadCategories();
    return updated;
  }

  async deleteLeadCategory(id: number): Promise<boolean> {
    const deleted = this.leadCategories.delete(id);
    if (deleted) await this.saveLeadCategories();
    return deleted;
  }

  // Lead Source operations
  async getAllLeadSources(): Promise<LeadSource[]> {
    return Array.from(this.leadSources.values());
  }

  async createLeadSource(insert: InsertLeadSource): Promise<LeadSource> {
    const id = this.leadSourceIdCounter++;
    const rec: LeadSource = {
      id,
      key: insert.key,
      name: insert.name,
      isActive: insert.isActive ?? true,
      createdAt: new Date()
    };
    this.leadSources.set(id, rec);
    await this.saveLeadSources();
    return rec;
  }

  async updateLeadSource(id: number, updates: Partial<InsertLeadSource>): Promise<LeadSource | undefined> {
    const existing = this.leadSources.get(id);
    if (!existing) return undefined;
    const updated: LeadSource = {
      ...existing,
      ...updates,
    };
    this.leadSources.set(id, updated);
    await this.saveLeadSources();
    return updated;
  }

  async deleteLeadSource(id: number): Promise<boolean> {
    const deleted = this.leadSources.delete(id);
    if (deleted) await this.saveLeadSources();
    return deleted;
  }

  // Quotation methods
  async getQuotation(id: number): Promise<Quotation | undefined> {
    return this.quotations.get(id);
  }

  async createQuotation(insertQuotation: InsertQuotation): Promise<Quotation> {
    const id = this.quotationIdCounter++;
    const quotation: Quotation = { 
      ...insertQuotation, 
      id,
      status: insertQuotation.status || "draft",
      createdAt: new Date()
    };
    this.quotations.set(id, quotation);
    await this.saveQuotations();
    return quotation;
  }

  async updateQuotation(id: number, quotationUpdate: Partial<InsertQuotation>): Promise<Quotation | undefined> {
    const quotation = this.quotations.get(id);
    if (!quotation) {
      return undefined;
    }
    
    const updatedQuotation = { ...quotation, ...quotationUpdate };
    this.quotations.set(id, updatedQuotation);
    await this.saveQuotations();
    return updatedQuotation;
  }

  async getAllQuotations(): Promise<Quotation[]> {
    return Array.from(this.quotations.values());
  }

  async deleteQuotation(id: number): Promise<boolean> {
    const deleted = this.quotations.delete(id);
    if (deleted) {
      await this.saveQuotations();
    }
    return deleted;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const createdAt = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt,
      orderNumber: insertOrder.orderNumber || `ORD-${new Date().getFullYear()}-${id}`,
      customerName: insertOrder.customerName || '',
      customerCompany: insertOrder.customerCompany || '',
      status: insertOrder.status || "processing",
      items: Array.isArray(insertOrder.items) ? insertOrder.items : [],
      subtotal: insertOrder.subtotal || "0",
      taxAmount: insertOrder.taxAmount || "0",
      totalAmount: insertOrder.totalAmount || insertOrder.subtotal || "0",
      customerId: insertOrder.customerId || null,
      quotationId: insertOrder.quotationId || null,
      poNumber: insertOrder.poNumber || null,
      poDate: insertOrder.poDate || null,
      address: insertOrder.address || null,
      city: insertOrder.city || null,
      state: insertOrder.state || null,
      country: insertOrder.country || 'India',
      pincode: insertOrder.pincode || null,
      gstNumber: insertOrder.gstNumber || null,
      panNumber: insertOrder.panNumber || null,
      deliveryTime: insertOrder.deliveryTime || null,
      calibrationCertificateInfo: insertOrder.calibrationCertificateInfo || null,
      calibrationFrequency: insertOrder.calibrationFrequency || null,
      paymentTerms: insertOrder.paymentTerms || null,
      otherTerms: insertOrder.otherTerms || null,
      listPrice: insertOrder.listPrice || null,
      purchasePrice: insertOrder.purchasePrice || null,
      profit: insertOrder.profit || null,
      poFile: insertOrder.poFile || null,
      createdBy: insertOrder.createdBy || null,
    };
    this.orders.set(id, order);
    await this.saveOrders();
    return order;
  }

  async updateOrder(id: number, orderUpdate: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) {
      return undefined;
    }
    
    const updatedOrder = { ...order, ...orderUpdate };
    this.orders.set(id, updatedOrder);
    await this.saveOrders();
    return updatedOrder;
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async deleteOrder(id: number): Promise<boolean> {
    const deleted = this.orders.delete(id);
    if (deleted) {
      await this.saveOrders();
    }
    return deleted;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(
      (order) => order.orderNumber === orderNumber,
    );
  }

  // Invoice methods
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceIdCounter++;
    const invoice: Invoice = { 
      ...insertInvoice, 
      id,
      status: insertInvoice.status || "pending",
      createdAt: new Date()
    };
    this.invoices.set(id, invoice);
    await this.saveInvoices();
    return invoice;
  }

  async updateInvoice(id: number, invoiceUpdate: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) {
      return undefined;
    }
    
    const updatedInvoice = { ...invoice, ...invoiceUpdate };
    this.invoices.set(id, updatedInvoice);
    await this.saveInvoices();
    return updatedInvoice;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const deleted = this.invoices.delete(id);
    if (deleted) {
      await this.saveInvoices();
    }
    return deleted;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const payment: Payment = { 
      ...insertPayment, 
      id,
      status: insertPayment.status || "completed",
      createdAt: new Date()
    };
    this.payments.set(id, payment);
    await this.savePayments();
    return payment;
  }

  async updatePayment(id: number, paymentUpdate: Partial<InsertPayment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) {
      return undefined;
    }
    
    const updatedPayment = { ...payment, ...paymentUpdate };
    this.payments.set(id, updatedPayment);
    await this.savePayments();
    return updatedPayment;
  }

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async deletePayment(id: number): Promise<boolean> {
    const deleted = this.payments.delete(id);
    if (deleted) {
      await this.savePayments();
    }
    return deleted;
  }

  // Purchase Order methods
  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async createPurchaseOrder(insertPurchaseOrder: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const id = this.purchaseOrderIdCounter++;
    const purchaseOrder: PurchaseOrder = { 
      ...insertPurchaseOrder, 
      id,
      status: insertPurchaseOrder.status || "pending",
      createdAt: new Date()
    };
    this.purchaseOrders.set(id, purchaseOrder);
    await this.savePurchaseOrders();
    return purchaseOrder;
  }

  async updatePurchaseOrder(id: number, purchaseOrderUpdate: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const purchaseOrder = this.purchaseOrders.get(id);
    if (!purchaseOrder) {
      return undefined;
    }
    
    const updatedPurchaseOrder = { ...purchaseOrder, ...purchaseOrderUpdate };
    this.purchaseOrders.set(id, updatedPurchaseOrder);
    await this.savePurchaseOrders();
    return updatedPurchaseOrder;
  }

  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values());
  }

  async deletePurchaseOrder(id: number): Promise<boolean> {
    const deleted = this.purchaseOrders.delete(id);
    if (deleted) {
      await this.savePurchaseOrders();
    }
    return deleted;
  }

  // Inventory methods
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const id = this.inventoryIdCounter++;
    const createdAt = new Date();
    const item: Inventory = { 
      ...insertItem, 
      id, 
      createdAt,
      description: insertItem.description ?? null,
      quantity: insertItem.quantity ?? 0,
      threshold: insertItem.threshold ?? 5
    };
    this.inventory.set(id, item);
    await this.saveInventory();
    return item;
  }

  async updateInventoryItem(id: number, itemUpdate: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const item = this.inventory.get(id);
    if (!item) {
      return undefined;
    }
    
    const updatedItem = { ...item, ...itemUpdate };
    this.inventory.set(id, updatedItem);
    await this.saveInventory();
    return updatedItem;
  }

  async getAllInventoryItems(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const deleted = this.inventory.delete(id);
    if (deleted) {
      await this.saveInventory();
    }
    return deleted;
  }

  async getLowStockItems(): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter(
      (item) => item.quantity <= item.threshold
    );
  }

  async getInventoryItemBySku(sku: string): Promise<Inventory | undefined> {
    return Array.from(this.inventory.values()).find(
      (item) => item.sku === sku
    );
  }

  // Manufacturing Job methods
  async getManufacturingJob(id: number): Promise<ManufacturingJob | undefined> {
    return this.manufacturingJobs.get(id);
  }

  async createManufacturingJob(insertJob: InsertManufacturingJob): Promise<ManufacturingJob> {
    const id = this.manufacturingJobIdCounter++;
    const job: ManufacturingJob = { 
      ...insertJob, 
      id,
      status: insertJob.status || "pending",
      priority: insertJob.priority || "medium",
      createdAt: new Date()
    };
    this.manufacturingJobs.set(id, job);
    await this.saveManufacturingJobs();
    return job;
  }

  async updateManufacturingJob(id: number, jobUpdate: Partial<InsertManufacturingJob>): Promise<ManufacturingJob | undefined> {
    const job = this.manufacturingJobs.get(id);
    if (!job) {
      return undefined;
    }
    
    const updatedJob = { ...job, ...jobUpdate };
    this.manufacturingJobs.set(id, updatedJob);
    await this.saveManufacturingJobs();
    return updatedJob;
  }

  async getAllManufacturingJobs(): Promise<ManufacturingJob[]> {
    return Array.from(this.manufacturingJobs.values());
  }

  async deleteManufacturingJob(id: number): Promise<boolean> {
    const deleted = this.manufacturingJobs.delete(id);
    if (deleted) {
      await this.saveManufacturingJobs();
    }
    return deleted;
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const createdAt = new Date();
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt,
      status: insertTask.status || "pending",
      description: insertTask.description ?? null,
      priority: insertTask.priority || "medium"
    };
    this.tasks.set(id, task);
    await this.saveTasks();
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) {
      return undefined;
    }
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    await this.saveTasks();
    return updatedTask;
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async deleteTask(id: number): Promise<boolean> {
    const deleted = this.tasks.delete(id);
    if (deleted) {
      await this.saveTasks();
    }
    return deleted;
  }
  
  // Employee Activity methods
  async getEmployeeActivity(id: number): Promise<EmployeeActivity | undefined> {
    return this.employeeActivities.get(id);
  }

  async createEmployeeActivity(insertActivity: InsertEmployeeActivity): Promise<EmployeeActivity> {
    const id = this.employeeActivityIdCounter++;
    const createdAt = new Date();
    const now = new Date();
    const activity: EmployeeActivity = { 
      ...insertActivity, 
      id, 
      createdAt,
      date: insertActivity.date || now,
      issues: insertActivity.issues || null,
      notes: insertActivity.notes || null
    };
    this.employeeActivities.set(id, activity);
    await this.saveEmployeeActivities();
    return activity;
  }

  async updateEmployeeActivity(id: number, activityUpdate: Partial<InsertEmployeeActivity>): Promise<EmployeeActivity | undefined> {
    const activity = this.employeeActivities.get(id);
    if (!activity) {
      return undefined;
    }
    
    const updatedActivity = { ...activity, ...activityUpdate };
    this.employeeActivities.set(id, updatedActivity);
    await this.saveEmployeeActivities();
    return updatedActivity;
  }

  async getAllEmployeeActivities(): Promise<EmployeeActivity[]> {
    return Array.from(this.employeeActivities.values());
  }

  async deleteEmployeeActivity(id: number): Promise<boolean> {
    const deleted = this.employeeActivities.delete(id);
    if (deleted) {
      await this.saveEmployeeActivities();
    }
    return deleted;
  }
  
  // Sales Target methods
  async getSalesTarget(id: number): Promise<SalesTarget | undefined> {
    return this.salesTargets.get(id);
  }

  async createSalesTarget(insertTarget: InsertSalesTarget): Promise<SalesTarget> {
    const id = this.salesTargetIdCounter++;
    const createdAt = new Date();
    const target: SalesTarget = { 
      ...insertTarget, 
      id, 
      createdAt,
      actualValue: insertTarget.actualValue ?? 0
    };
    this.salesTargets.set(id, target);
    await this.saveSalesTargets();
    return target;
  }

  async updateSalesTarget(id: number, targetUpdate: Partial<InsertSalesTarget>): Promise<SalesTarget | undefined> {
    const target = this.salesTargets.get(id);
    if (!target) {
      return undefined;
    }
    
    const updatedTarget = { ...target, ...targetUpdate };
    this.salesTargets.set(id, updatedTarget);
    await this.saveSalesTargets();
    return updatedTarget;
  }

  async getAllSalesTargets(): Promise<SalesTarget[]> {
    return Array.from(this.salesTargets.values());
  }

  async deleteSalesTarget(id: number): Promise<boolean> {
    const deleted = this.salesTargets.delete(id);
    if (deleted) {
      await this.saveSalesTargets();
    }
    return deleted;
  }
  
  async getSalesTargetsByPeriod(month: string, year: string): Promise<SalesTarget[]> {
    return Array.from(this.salesTargets.values()).filter(
      (target) => target.targetMonth === month && target.targetYear === year
    );
  }
  
  // Manufacturing Forecast methods
  async getManufacturingForecast(id: number): Promise<ManufacturingForecast | undefined> {
    return this.manufacturingForecasts.get(id);
  }

  async createManufacturingForecast(insertForecast: InsertManufacturingForecast): Promise<ManufacturingForecast> {
    const id = this.manufacturingForecastIdCounter++;
    const createdAt = new Date();
    const forecast: ManufacturingForecast = { 
      ...insertForecast, 
      id, 
      createdAt,
      actualQuantity: insertForecast.actualQuantity ?? 0
    };
    this.manufacturingForecasts.set(id, forecast);
    await this.saveManufacturingForecasts();
    return forecast;
  }

  async updateManufacturingForecast(id: number, forecastUpdate: Partial<InsertManufacturingForecast>): Promise<ManufacturingForecast | undefined> {
    const forecast = this.manufacturingForecasts.get(id);
    if (!forecast) {
      return undefined;
    }
    
    const updatedForecast = { ...forecast, ...forecastUpdate };
    this.manufacturingForecasts.set(id, updatedForecast);
    await this.saveManufacturingForecasts();
    return updatedForecast;
  }

  async getAllManufacturingForecasts(): Promise<ManufacturingForecast[]> {
    return Array.from(this.manufacturingForecasts.values());
  }

  async deleteManufacturingForecast(id: number): Promise<boolean> {
    const deleted = this.manufacturingForecasts.delete(id);
    if (deleted) {
      await this.saveManufacturingForecasts();
    }
    return deleted;
  }
  
  async getManufacturingForecastsByPeriod(month: string, year: string): Promise<ManufacturingForecast[]> {
    return Array.from(this.manufacturingForecasts.values()).filter(
      (forecast) => forecast.forecastMonth === month && forecast.forecastYear === year
    );
  }

  // Support Ticket methods
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    return this.supportTickets.get(id);
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.supportTicketIdCounter++;
    const ticket: SupportTicket = { 
      ...insertTicket, 
      id,
      status: insertTicket.status || "open",
      priority: insertTicket.priority || "medium",
      openedDate: insertTicket.openedDate || new Date(),
      createdAt: new Date()
    };
    this.supportTickets.set(id, ticket);
    await this.saveSupportTickets();
    return ticket;
  }

  async updateSupportTicket(id: number, ticketUpdate: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const ticket = this.supportTickets.get(id);
    if (!ticket) {
      return undefined;
    }
    
    const updatedTicket = { ...ticket, ...ticketUpdate };
    this.supportTickets.set(id, updatedTicket);
    await this.saveSupportTickets();
    return updatedTicket;
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values());
  }

  async deleteSupportTicket(id: number): Promise<boolean> {
    const deleted = this.supportTickets.delete(id);
    if (deleted) {
      await this.saveSupportTickets();
    }
    return deleted;
  }

  // Contract methods
  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = this.contractIdCounter++;
    const contract: Contract = { 
      ...insertContract, 
      id,
      status: insertContract.status || "active",
      createdAt: new Date()
    };
    this.contracts.set(id, contract);
    await this.saveContracts();
    return contract;
  }

  async updateContract(id: number, contractUpdate: Partial<InsertContract>): Promise<Contract | undefined> {
    const contract = this.contracts.get(id);
    if (!contract) {
      return undefined;
    }
    
    const updatedContract = { ...contract, ...contractUpdate };
    this.contracts.set(id, updatedContract);
    await this.saveContracts();
    return updatedContract;
  }

  async getAllContracts(): Promise<Contract[]> {
    return Array.from(this.contracts.values());
  }

  async deleteContract(id: number): Promise<boolean> {
    const deleted = this.contracts.delete(id);
    if (deleted) {
      await this.saveContracts();
    }
    return deleted;
  }

  // Products operations
  async getAllProducts(): Promise<any[]> {
    try {
      const data = await fs.readFile(PRODUCT_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  }

  // Raw Materials operations
  async getAllRawMaterials(): Promise<any[]> {
    try {
      const data = await fs.readFile(RAW_MATERIAL_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading raw materials:', error);
      return [];
    }
  }

  // Quotation Templates operations
  async getAllQuotationTemplates(): Promise<any[]> {
    try {
      const data = await fs.readFile(QUOTATION_TEMPLATE_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading quotation templates:', error);
      return [];
    }
  }

  async createQuotationTemplate(template: any): Promise<any> {
    try {
      // Ensure file exists and read current templates
      let templates: any[] = [];
      try {
        const data = await fs.readFile(QUOTATION_TEMPLATE_FILE, 'utf-8');
        templates = JSON.parse(data);
      } catch {
        templates = [];
      }
      const newTemplate = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...template,
      };
      templates.push(newTemplate);
      await fs.writeFile(QUOTATION_TEMPLATE_FILE, JSON.stringify(templates, null, 2), 'utf-8');
      return newTemplate;
    } catch (error) {
      console.error('Error creating quotation template:', error);
      throw error;
    }
  }

  // Captured Leads operations
  async getAllCapturedLeads(): Promise<any[]> {
    try {
      const data = await fs.readFile(CAPTURED_LEAD_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading captured leads:', error);
      return [];
    }
  }

  // Proforma operations
  async getProforma(id: number): Promise<Proforma | undefined> {
    return this.proformas.get(id);
  }

  async createProforma(insertProforma: InsertProforma): Promise<Proforma> {
    const id = this.proformaIdCounter++;
    const proforma: Proforma = {
      ...insertProforma,
      id,
      status: insertProforma.status || 'draft',
      createdAt: new Date()
    } as any;
    this.proformas.set(id, proforma);
    await this.saveProformas();
    return proforma;
  }

  async updateProforma(id: number, update: Partial<InsertProforma>): Promise<Proforma | undefined> {
    const current = this.proformas.get(id);
    if (!current) return undefined;
    const updated = { ...current, ...update } as Proforma;
    this.proformas.set(id, updated);
    await this.saveProformas();
    return updated;
  }

  async getAllProformas(): Promise<Proforma[]> {
    return Array.from(this.proformas.values());
  }

  async deleteProforma(id: number): Promise<boolean> {
    const deleted = this.proformas.delete(id);
    if (deleted) await this.saveProformas();
    return deleted;
  }

  // Lead Discussion methods
  async getLeadDiscussions(leadId: number): Promise<LeadDiscussion[]> {
    const discussions = Array.from(this.leadDiscussions.values()).filter(
      discussion => discussion.leadId === leadId
    );
    return discussions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createLeadDiscussion(insertDiscussion: InsertLeadDiscussion): Promise<LeadDiscussion> {
    const discussion: LeadDiscussion = {
      id: this.leadDiscussionIdCounter++,
      ...insertDiscussion,
      createdAt: new Date(),
    };
    
    this.leadDiscussions.set(discussion.id, discussion);
    await this.saveLeadDiscussions();
    return discussion;
  }

  async updateLeadDiscussion(id: number, discussionUpdate: Partial<InsertLeadDiscussion>): Promise<LeadDiscussion | undefined> {
    const discussion = this.leadDiscussions.get(id);
    if (!discussion) return undefined;

    const updatedDiscussion: LeadDiscussion = {
      ...discussion,
      ...discussionUpdate,
    };

    this.leadDiscussions.set(id, updatedDiscussion);
    await this.saveLeadDiscussions();
    return updatedDiscussion;
  }

  async deleteLeadDiscussion(id: number): Promise<boolean> {
    const deleted = this.leadDiscussions.delete(id);
    if (deleted) {
      await this.saveLeadDiscussions();
    }
    return deleted;
  }

  private async loadLeadDiscussions() {
    await this.loadFromFile("data/lead-discussions.json", this.leadDiscussions, "leadDiscussionIdCounter");
  }

  private async saveLeadDiscussions() {
    await this.saveToFile("data/lead-discussions.json", this.leadDiscussions);
  }

  // Company Settings operations
  async getCompanySettings(): Promise<CompanySettings | undefined> {
    try {
      const data = await fs.readFile(COMPANY_SETTINGS_FILE, 'utf-8');
      const settings = JSON.parse(data);
      return settings;
    } catch (error) {
      // Return default settings if file doesn't exist
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

  async updateCompanySettings(settings: Partial<InsertCompanySettings>): Promise<CompanySettings> {
    const existingSettings = await this.getCompanySettings();
    
    // Deep merge nested objects (bankDetails, integrations, etc.)
    const updatedSettings: CompanySettings = {
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
    
    await fs.writeFile(COMPANY_SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2));
    return updatedSettings;
  }
}

// Using JSON file storage by default
export const storage = new JSONFileStorage();
