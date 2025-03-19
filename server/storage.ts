import { 
  users, type User, type InsertUser,
  leads, type Lead, type InsertLead,
  orders, type Order, type InsertOrder,
  inventory, type Inventory, type InsertInventory,
  tasks, type Task, type InsertTask,
  employeeActivities, type EmployeeActivity, type InsertEmployeeActivity,
  salesTargets, type SalesTarget, type InsertSalesTarget,
  manufacturingForecasts, type ManufacturingForecast, type InsertManufacturingForecast
} from "@shared/schema";
import fs from 'fs/promises';
import path from 'path';
import createMemoryStore from "memorystore";
import session from "express-session";

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
const LEAD_FILE = path.join(DATA_DIR, 'leads.json');
const ORDER_FILE = path.join(DATA_DIR, 'orders.json');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');
const TASK_FILE = path.join(DATA_DIR, 'tasks.json');
const EMPLOYEE_ACTIVITY_FILE = path.join(DATA_DIR, 'employee_activities.json');
const SALES_TARGET_FILE = path.join(DATA_DIR, 'sales_targets.json');
const MANUFACTURING_FORECAST_FILE = path.join(DATA_DIR, 'manufacturing_forecasts.json');

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Lead operations
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  getAllLeads(): Promise<Lead[]>;
  deleteLead(id: number): Promise<boolean>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  deleteOrder(id: number): Promise<boolean>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;

  // Inventory operations
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined>;
  getAllInventoryItems(): Promise<Inventory[]>;
  deleteInventoryItem(id: number): Promise<boolean>;
  getLowStockItems(): Promise<Inventory[]>;
  getInventoryItemBySku(sku: string): Promise<Inventory | undefined>;

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

  // Session store
  sessionStore: session.SessionStore;
}

// Implementation for JSON file storage
export class JSONFileStorage implements IStorage {
  private users: Map<number, User>;
  private leads: Map<number, Lead>;
  private orders: Map<number, Order>;
  private inventory: Map<number, Inventory>;
  private tasks: Map<number, Task>;
  private employeeActivities: Map<number, EmployeeActivity>;
  private salesTargets: Map<number, SalesTarget>;
  private manufacturingForecasts: Map<number, ManufacturingForecast>;
  sessionStore: session.SessionStore;
  
  userIdCounter: number;
  leadIdCounter: number;
  orderIdCounter: number;
  inventoryIdCounter: number;
  taskIdCounter: number;
  employeeActivityIdCounter: number;
  salesTargetIdCounter: number;
  manufacturingForecastIdCounter: number;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.orders = new Map();
    this.inventory = new Map();
    this.tasks = new Map();
    this.employeeActivities = new Map();
    this.salesTargets = new Map();
    this.manufacturingForecasts = new Map();
    
    this.userIdCounter = 1;
    this.leadIdCounter = 1;
    this.orderIdCounter = 1;
    this.inventoryIdCounter = 1;
    this.taskIdCounter = 1;
    this.employeeActivityIdCounter = 1;
    this.salesTargetIdCounter = 1;
    this.manufacturingForecastIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });

    // Load data from files if they exist
    this.loadData();
  }

  // Helper to load all data from JSON files
  private async loadData() {
    await ensureDataDir();
    await this.loadUsers();
    await this.loadLeads();
    await this.loadOrders();
    await this.loadInventory();
    await this.loadTasks();
    await this.loadEmployeeActivities();
    await this.loadSalesTargets();
    await this.loadManufacturingForecasts();
  }
  
  // Load employee activities from file
  private async loadEmployeeActivities() {
    try {
      const data = await fs.readFile(EMPLOYEE_ACTIVITY_FILE, 'utf-8');
      const activities = JSON.parse(data);
      this.employeeActivities.clear();
      
      let maxId = 0;
      activities.forEach((activity: EmployeeActivity) => {
        this.employeeActivities.set(activity.id, activity);
        maxId = Math.max(maxId, activity.id);
      });
      
      this.employeeActivityIdCounter = maxId + 1;
    } catch (error) {
      // File doesn't exist or can't be read, using empty map
      console.log('No employee activities file found, starting with empty data');
    }
  }

  // Save employee activities to file
  private async saveEmployeeActivities() {
    try {
      const data = JSON.stringify(Array.from(this.employeeActivities.values()), null, 2);
      await fs.writeFile(EMPLOYEE_ACTIVITY_FILE, data, 'utf-8');
    } catch (error) {
      console.error('Error saving employee activities:', error);
    }
  }
  
  // Load sales targets from file
  private async loadSalesTargets() {
    try {
      const data = await fs.readFile(SALES_TARGET_FILE, 'utf-8');
      const targets = JSON.parse(data);
      this.salesTargets.clear();
      
      let maxId = 0;
      targets.forEach((target: SalesTarget) => {
        this.salesTargets.set(target.id, target);
        maxId = Math.max(maxId, target.id);
      });
      
      this.salesTargetIdCounter = maxId + 1;
    } catch (error) {
      // File doesn't exist or can't be read, using empty map
      console.log('No sales targets file found, starting with empty data');
    }
  }

  // Save sales targets to file
  private async saveSalesTargets() {
    try {
      const data = JSON.stringify(Array.from(this.salesTargets.values()), null, 2);
      await fs.writeFile(SALES_TARGET_FILE, data, 'utf-8');
    } catch (error) {
      console.error('Error saving sales targets:', error);
    }
  }
  
  // Load manufacturing forecasts from file
  private async loadManufacturingForecasts() {
    try {
      const data = await fs.readFile(MANUFACTURING_FORECAST_FILE, 'utf-8');
      const forecasts = JSON.parse(data);
      this.manufacturingForecasts.clear();
      
      let maxId = 0;
      forecasts.forEach((forecast: ManufacturingForecast) => {
        this.manufacturingForecasts.set(forecast.id, forecast);
        maxId = Math.max(maxId, forecast.id);
      });
      
      this.manufacturingForecastIdCounter = maxId + 1;
    } catch (error) {
      // File doesn't exist or can't be read, using empty map
      console.log('No manufacturing forecasts file found, starting with empty data');
    }
  }

  // Save manufacturing forecasts to file
  private async saveManufacturingForecasts() {
    try {
      const data = JSON.stringify(Array.from(this.manufacturingForecasts.values()), null, 2);
      await fs.writeFile(MANUFACTURING_FORECAST_FILE, data, 'utf-8');
    } catch (error) {
      console.error('Error saving manufacturing forecasts:', error);
    }
  }

  // Load users from file
  private async loadUsers() {
    try {
      const data = await fs.readFile(USER_FILE, 'utf-8');
      const users = JSON.parse(data);
      this.users.clear();
      
      let maxId = 0;
      users.forEach((user: User) => {
        this.users.set(user.id, user);
        maxId = Math.max(maxId, user.id);
      });
      
      this.userIdCounter = maxId + 1;
    } catch (error) {
      // File doesn't exist or can't be read, using empty map
      console.log('No users file found, starting with empty data');
    }
  }

  // Save users to file
  private async saveUsers() {
    try {
      const data = JSON.stringify(Array.from(this.users.values()), null, 2);
      await fs.writeFile(USER_FILE, data, 'utf-8');
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  // Load leads from file
  private async loadLeads() {
    try {
      const data = await fs.readFile(LEAD_FILE, 'utf-8');
      const leads = JSON.parse(data);
      this.leads.clear();
      
      let maxId = 0;
      leads.forEach((lead: Lead) => {
        this.leads.set(lead.id, lead);
        maxId = Math.max(maxId, lead.id);
      });
      
      this.leadIdCounter = maxId + 1;
    } catch (error) {
      // File doesn't exist or can't be read, using empty map
      console.log('No leads file found, starting with empty data');
    }
  }

  // Save leads to file
  private async saveLeads() {
    try {
      const data = JSON.stringify(Array.from(this.leads.values()), null, 2);
      await fs.writeFile(LEAD_FILE, data, 'utf-8');
    } catch (error) {
      console.error('Error saving leads:', error);
    }
  }

  // Load orders from file
  private async loadOrders() {
    try {
      const data = await fs.readFile(ORDER_FILE, 'utf-8');
      const orders = JSON.parse(data);
      this.orders.clear();
      
      let maxId = 0;
      orders.forEach((order: Order) => {
        this.orders.set(order.id, order);
        maxId = Math.max(maxId, order.id);
      });
      
      this.orderIdCounter = maxId + 1;
    } catch (error) {
      // File doesn't exist or can't be read, using empty map
      console.log('No orders file found, starting with empty data');
    }
  }

  // Save orders to file
  private async saveOrders() {
    try {
      const data = JSON.stringify(Array.from(this.orders.values()), null, 2);
      await fs.writeFile(ORDER_FILE, data, 'utf-8');
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  }

  // Load inventory from file
  private async loadInventory() {
    try {
      const data = await fs.readFile(INVENTORY_FILE, 'utf-8');
      const items = JSON.parse(data);
      this.inventory.clear();
      
      let maxId = 0;
      items.forEach((item: Inventory) => {
        this.inventory.set(item.id, item);
        maxId = Math.max(maxId, item.id);
      });
      
      this.inventoryIdCounter = maxId + 1;
    } catch (error) {
      // File doesn't exist or can't be read, using empty map
      console.log('No inventory file found, starting with empty data');
    }
  }

  // Save inventory to file
  private async saveInventory() {
    try {
      const data = JSON.stringify(Array.from(this.inventory.values()), null, 2);
      await fs.writeFile(INVENTORY_FILE, data, 'utf-8');
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  }

  // Load tasks from file
  private async loadTasks() {
    try {
      const data = await fs.readFile(TASK_FILE, 'utf-8');
      const tasks = JSON.parse(data);
      this.tasks.clear();
      
      let maxId = 0;
      tasks.forEach((task: Task) => {
        this.tasks.set(task.id, task);
        maxId = Math.max(maxId, task.id);
      });
      
      this.taskIdCounter = maxId + 1;
    } catch (error) {
      // File doesn't exist or can't be read, using empty map
      console.log('No tasks file found, starting with empty data');
    }
  }

  // Save tasks to file
  private async saveTasks() {
    try {
      const data = JSON.stringify(Array.from(this.tasks.values()), null, 2);
      await fs.writeFile(TASK_FILE, data, 'utf-8');
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
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
    // Ensure role has a default value if not provided
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user" 
    };
    this.users.set(id, user);
    await this.saveUsers();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Lead methods
  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.leadIdCounter++;
    const createdAt = new Date();
    // Ensure required fields have default values
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

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const createdAt = new Date();
    // Ensure required fields have default values
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt,
      status: insertOrder.status || "processing"
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

  // Inventory methods
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const id = this.inventoryIdCounter++;
    const createdAt = new Date();
    // Ensure required fields have default values
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

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const createdAt = new Date();
    // Ensure required fields have default values
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
}

// Using JSON file storage by default
export const storage = new JSONFileStorage();
