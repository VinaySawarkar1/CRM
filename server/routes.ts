import { Express } from "express";
import { Server } from "http";
import { z } from "zod";
import { getStorage } from "./storage-init";
import { 
  insertCustomerSchema, 
  insertSupplierSchema, 
  insertLeadSchema, 
  insertInventorySchema, 
  insertTaskSchema, 
  insertQuotationSchema, 
  insertOrderSchema,
  insertInvoiceSchema,
  insertPaymentSchema,
  insertSalesTargetSchema,
  insertLeadDiscussionSchema,
  insertLeadCategorySchema,
  insertLeadSourceSchema
} from "@shared/schema";
import { pdfGenerator } from "./pdf-generator";
import type { Request, Response } from "express";
import { ProformaStore } from "./proforma-storage";


export async function registerRoutes(app: Express): Promise<Server> {
  // Simple permission helper (feature:action). Superuser and Admin bypasses.
  const hasPermission = (req: any, key: string, featureFallback?: string) => {
    if (!req.isAuthenticated?.()) return false;
    const user: any = req.user || {};
    if (!user) return false;
    if (user.role === "superuser" || user.role === "admin") return true;
    const list: string[] = Array.isArray(user.permissions) ? user.permissions : [];
    if (list.includes(key)) return true;
    if (featureFallback && list.includes(featureFallback)) return true;
    const f = key.split(":")[0];
    if (list.includes(`${f}:*`)) return true;
    return false;
  };
  // Customer Management Routes
  app.get("/api/customers", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'customers:view', 'customers')) return res.status(403).json({ message: 'Forbidden' });
      
      const storage = getStorage();
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      next(error);
    }
  });

  // Superuser: list all pending companies/users for approval
  app.get("/api/pending-approvals", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const me = await getStorage().getUser((req.user as any).id);
      if (!me || me.role !== 'superuser') return res.status(403).json({ message: "Forbidden" });
      const allCompanies = await getStorage().getAllCompanies();
      const pendingCompanies = allCompanies.filter(c => String(c.status || '').toLowerCase() === 'pending');
      const allUsers = await getStorage().getAllUsers();
      const pendingUsers = allUsers.filter(u => u.isActive === false && u.companyId != null);
      console.log('Pending approvals:', { 
        companiesCount: pendingCompanies.length, 
        usersCount: pendingUsers.length, 
        allCompaniesCount: allCompanies.length,
        allUsersCount: allUsers.length,
        companies: pendingCompanies.map(c => ({ id: c.id, name: c.name, status: c.status })),
        users: pendingUsers.map(u => ({ id: u.id, name: u.name, companyId: u.companyId, isActive: u.isActive }))
      });
      res.json({ companies: pendingCompanies, users: pendingUsers.map(u => ({ ...u, password: undefined })) });
    } catch (err) { 
      console.error('Error fetching pending approvals:', err);
      next(err); 
    }
  });

  // Superuser: approve company and activate admin user
  app.post("/api/approve-company/:companyId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const me = await getStorage().getUser((req.user as any).id);
      if (!me || me.role !== 'superuser') return res.status(403).json({ message: "Forbidden" });
      const companyId = parseInt(req.params.companyId);
      const company = await getStorage().getCompany(companyId);
      if (!company) return res.status(404).json({ message: "Company not found" });
      await getStorage().updateCompany(companyId, { status: 'active' });
      // Activate the company admin user
      const users = await getStorage().getAllUsers();
      const adminUser = users.find(u => u.companyId === companyId && u.role === 'admin');
      if (adminUser) {
        await getStorage().updateUser(adminUser.id, { isActive: true });
      }
      res.json({ success: true, message: "Company approved" });
    } catch (err) { next(err); }
  });

  // Admin or Parent: list users (filtered by company)
  app.get("/api/users", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const me = await getStorage().getUser((req.user as any).id);
      if (!me) return res.status(401).json({ message: "Unauthorized" });
      const allUsers = await getStorage().getAllUsers();
      let filtered;
      if (me.role === 'superuser') {
        filtered = allUsers; // Superuser sees all
      } else if (me.role === 'admin' && me.companyId) {
        // Company admin sees users in their company
        filtered = allUsers.filter(u => u.companyId === me.companyId);
      } else {
        // Regular users see only themselves and their sub-users
        filtered = allUsers.filter(u => u.id === me.id || (u as any).parentUserId === me.id);
      }
      res.json(filtered.map(u => ({ ...u, password: undefined })));
    } catch (err) { next(err); }
  });

  // Admin: approve user and set permissions, or parent user managing sub-users
  app.put("/api/users/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      const updates = req.body as any; // { isActive?, role?, parentUserId?, permissions? }
      const storage = getStorage();
      const me = await storage.getUser((req.user as any).id);
      if (!me) return res.status(401).json({ message: "Unauthorized" });
      const existing = await storage.getUser(id);
      if (!existing) return res.status(404).json({ message: "User not found" });
      
      // Superuser can update anyone
      if (me.role === 'superuser') {
        const user = await storage.updateUser(id, updates as any);
        return res.json({ ...user!, password: undefined });
      }
      
      // Company admin can update users in their company
      if (me.role === 'admin' && me.companyId) {
        if (existing.companyId !== me.companyId) {
          return res.status(403).json({ message: 'Forbidden: Cannot modify users from other companies' });
        }
        // Company admin cannot create superuser or change role to admin (only one admin per company)
        if (updates.role === 'superuser' || (updates.role === 'admin' && existing.id !== me.id)) {
          return res.status(403).json({ message: 'Forbidden role change' });
        }
        const user = await storage.updateUser(id, updates as any);
        return res.json({ ...user!, password: undefined });
      }
      
      // Regular users can only update their sub-users (or self)
      if (!(existing.parentUserId === me.id || existing.id === me.id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      // Non-admins cannot escalate role
      if (updates.role === 'admin' || updates.role === 'superuser') {
        return res.status(403).json({ message: 'Forbidden role change' });
      }
      const user = await storage.updateUser(id, updates as any);
      res.json({ ...user!, password: undefined });
    } catch (err) { next(err); }
  });

  // Create sub-user under current user or admin creates any user (max 20 per company)
  app.post("/api/users", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const storage = getStorage();
      const me = await storage.getUser((req.user as any).id);
      if (!me) return res.status(401).json({ message: "Unauthorized" });
      
      // Superuser can create any user
      if (me.role === 'superuser') {
        const payload = req.body as any;
        const { scrypt, randomBytes } = require('crypto');
        const { promisify } = require('util');
        const scryptAsync = promisify(scrypt);
        const salt = randomBytes(16).toString('hex');
        const buf = (await scryptAsync(payload.password, salt, 64)) as Buffer;
        const hashed = `${buf.toString('hex')}.${salt}`;
        const created = await storage.createUser({
          username: payload.username,
          password: hashed,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          role: payload.role || 'user',
          companyId: payload.companyId,
          department: payload.department,
          isActive: Boolean(payload.isActive),
          parentUserId: payload.parentUserId || null,
          permissions: payload.permissions || null,
        } as any);
        return res.status(201).json({ ...created, password: undefined });
      }
      
      // Company admin can create sub-users (max 20 per company)
      if (me.role === 'admin' && me.companyId) {
        const companyUsers = await storage.getUsersByCompanyId(me.companyId);
        if (companyUsers.length >= 20) {
          return res.status(400).json({ message: "Maximum 20 users per company reached" });
        }
        const payload = req.body as any;
        const { scrypt, randomBytes } = require('crypto');
        const { promisify } = require('util');
        const scryptAsync = promisify(scrypt);
        const salt = randomBytes(16).toString('hex');
        const buf = (await scryptAsync(payload.password, salt, 64)) as Buffer;
        const hashed = `${buf.toString('hex')}.${salt}`;
        const created = await storage.createUser({
          username: payload.username,
          password: hashed,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          role: 'user', // Company admin can only create regular users
          companyId: me.companyId,
          department: payload.department,
          isActive: Boolean(payload.isActive),
          parentUserId: me.id,
          permissions: payload.permissions || null,
        } as any);
        return res.status(201).json({ ...created, password: undefined });
      }
      
      // Regular users cannot create sub-users (removed for multi-tenant)
      return res.status(403).json({ message: "Only company admins can create users" });
    } catch (err) { next(err); }
  });

  app.post("/api/customers", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'customers:create', 'customers')) return res.status(403).json({ message: 'Forbidden' });

      const customerData = insertCustomerSchema.parse(req.body);
      const storage = getStorage();
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/customers/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'customers:view', 'customers')) return res.status(403).json({ message: 'Forbidden' });
      
      const id = parseInt(req.params.id);
      const storage = getStorage();
      const customer = await storage.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/customers/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'customers:update', 'customers')) return res.status(403).json({ message: 'Forbidden' });
      
      const id = parseInt(req.params.id);
      const customerData = insertCustomerSchema.partial().parse(req.body);
      
      const storage = getStorage();
      const updatedCustomer = await storage.updateCustomer(id, customerData);
      
      if (!updatedCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(updatedCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/customers/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'customers:delete', 'customers')) return res.status(403).json({ message: 'Forbidden' });
      
      const id = parseInt(req.params.id);
      const storage = getStorage();
      const deleted = await storage.deleteCustomer(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Lead Management Routes
  app.get("/api/leads", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'leads:view', 'leads')) return res.status(403).json({ message: 'Forbidden' });
      
      const storage = getStorage();
      const leads = await storage.getAllLeads();
      res.json(leads);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/leads", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'leads:create', 'leads')) return res.status(403).json({ message: 'Forbidden' });

      const leadData = insertLeadSchema.parse(req.body);
      const storage = getStorage();
      const lead = await storage.createLead(leadData);
      // Auto task for follow-up in 2 days
      try {
        const due = new Date();
        due.setDate(due.getDate() + 2);
        await storage.createTask({
          title: `Follow up: ${lead.name}`,
          description: `Follow up with ${lead.name} (${lead.company})`,
          assignedTo: (req.user as any)?.username || 'sales',
          priority: 'medium',
          status: 'pending',
          dueDate: due as any,
          category: 'sales',
          relatedTo: 'lead',
          relatedId: lead.id as any,
        } as any);
      } catch {}
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/leads/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const storage = getStorage();
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/leads/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const leadData = insertLeadSchema.partial().parse(req.body);
      
      const storage = getStorage();
      const updatedLead = await storage.updateLead(id, leadData);
      
      if (!updatedLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(updatedLead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/leads/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const storage = getStorage();
      const deleted = await storage.deleteLead(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Convert Lead -> Customer
  app.post("/api/leads/:id/convert-to-customer", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid lead ID" });
      const storage = getStorage();
      const lead = await storage.getLead(id);
      if (!lead) return res.status(404).json({ message: "Lead not found" });
      // Create customer using lead data
      const customer = await storage.createCustomer({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        address: lead.address || "",
        city: lead.city || "",
        state: lead.state || "",
        country: lead.country || "India",
        pincode: lead.pincode || "",
        gstNumber: lead.gstNumber || "",
        panNumber: lead.panNumber || "",
        creditLimit: "0",
        paymentTerms: "30 days",
        status: "active",
        notes: lead.notes || "",
      });
      await storage.updateLead(id, { status: "converted" });
      res.json({ success: true, customer });
    } catch (err) {
      next(err);
    }
  });

  // Lead Discussion Routes
  app.get("/api/leads/:leadId/discussions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const leadId = parseInt(req.params.leadId);
      const storage = getStorage();
      const discussions = await storage.getLeadDiscussions(leadId);
      res.json(discussions);
    } catch (error) {
      next(error);
    }
  });

  // Lead Categories Routes
  app.get("/api/lead-categories", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const storage = getStorage();
      const list = await storage.getAllLeadCategories();
      res.json(list);
    } catch (error) { next(error); }
  });

  app.post("/api/lead-categories", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const payload = insertLeadCategorySchema.partial().parse(req.body);
      const key = payload.key || (payload.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      if (!payload.name || !key) return res.status(400).json({ message: "name is required" });
      const created = await getStorage().createLeadCategory({ key, name: payload.name, isActive: payload.isActive ?? true });
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Validation error", errors: error.errors });
      next(error);
    }
  });

  app.put("/api/lead-categories/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid category ID" });
      const updates = insertLeadCategorySchema.partial().parse(req.body);
      const updated = await getStorage().updateLeadCategory(id, updates);
      if (!updated) return res.status(404).json({ message: "Lead category not found" });
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Validation error", errors: error.errors });
      next(error);
    }
  });

  app.delete("/api/lead-categories/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid category ID" });
      const deleted = await getStorage().deleteLeadCategory(id);
      if (!deleted) return res.status(404).json({ message: "Lead category not found" });
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  // Lead Sources Routes
  app.get("/api/lead-sources", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const storage = getStorage();
      const list = await storage.getAllLeadSources();
      res.json(list);
    } catch (error) { next(error); }
  });

  app.post("/api/lead-sources", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const payload = insertLeadSourceSchema.partial().parse(req.body);
      const key = payload.key || (payload.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      if (!payload.name || !key) return res.status(400).json({ message: "name is required" });
      const created = await getStorage().createLeadSource({ key, name: payload.name, isActive: payload.isActive ?? true });
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Validation error", errors: error.errors });
      next(error);
    }
  });

  app.put("/api/lead-sources/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid source ID" });
      const updates = insertLeadSourceSchema.partial().parse(req.body);
      const updated = await getStorage().updateLeadSource(id, updates);
      if (!updated) return res.status(404).json({ message: "Lead source not found" });
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Validation error", errors: error.errors });
      next(error);
    }
  });

  app.delete("/api/lead-sources/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid source ID" });
      const deleted = await getStorage().deleteLeadSource(id);
      if (!deleted) return res.status(404).json({ message: "Lead source not found" });
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  app.post("/api/leads/:leadId/discussions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const leadId = parseInt(req.params.leadId);
      const user = req.user as any;
      
      // Get user details to set createdBy
      const storage = getStorage();
      const userDetails = await storage.getUser(user.id);
      const createdBy = userDetails?.name || userDetails?.username || `User ${user.id}`;
      
      const discussionData = insertLeadDiscussionSchema.parse({
        ...req.body,
        leadId: leadId,
        createdBy: createdBy,
      });
      
      const discussion = await storage.createLeadDiscussion(discussionData);
      res.status(201).json(discussion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  // Inventory Management Routes
  app.get("/api/inventory", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const storage = getStorage();
      const inventory = await storage.getAllInventoryItems();
      res.json(inventory);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/inventory", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

      const inventoryData = insertInventorySchema.parse(req.body);
      const storage = getStorage();
      const item = await storage.createInventoryItem(inventoryData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  // Task Management Routes
  app.get("/api/tasks", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const storage = getStorage();
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tasks", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

      const taskData = insertTaskSchema.parse(req.body);
      const storage = getStorage();
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  // Quotation Management Routes
  app.get("/api/quotations", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'quotations:view', 'quotations')) return res.status(403).json({ message: 'Forbidden' });
      
      const storage = getStorage();
      const quotations = await storage.getAllQuotations();
      res.json(quotations);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/quotations/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quotation ID" });
      }
      
      const storage = getStorage();
      const quotation = await storage.getQuotation(id);
      
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      res.json(quotation);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/quotations", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'quotations:create', 'quotations')) return res.status(403).json({ message: 'Forbidden' });

      // Auto generate quotation number if missing
      if (!req.body?.quotationNumber) {
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        req.body.quotationNumber = `RX-VQ${String(d.getFullYear()).slice(-2)}-${pad(d.getMonth()+1)}-${pad(d.getDate())}-${Date.now()}`;
      }
      const quotationData = insertQuotationSchema.parse(req.body);
      const storage = getStorage();
      const quotation = await storage.createQuotation(quotationData);
      res.status(201).json(quotation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/quotations/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'quotations:update', 'quotations')) return res.status(403).json({ message: 'Forbidden' });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quotation ID" });
      }
      
      const quotationData = insertQuotationSchema.partial().parse(req.body);
      
      const storage = getStorage();
      const updatedQuotation = await storage.updateQuotation(id, quotationData);
      
      if (!updatedQuotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      res.json(updatedQuotation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/quotations/:id/download-pdf", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quotation ID" });
      }
      
      const storage = getStorage();
      const quotation = await storage.getQuotation(id);
      
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      console.log('Generating Quotation PDF for quotation:', id);
      const pdfBuffer = await pdfGenerator.generateQuotationPDF(quotation);
      console.log('Quotation PDF generated, buffer size:', pdfBuffer.length);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="quotation-${quotation.quotationNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Quotation PDF generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Quotation PDF generation failed: ${errorMessage}` });
    }
  });

  // Generate Proforma Invoice from Quotation
  app.get("/api/quotations/:id/proforma-invoice", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quotation ID" });
      }
      
      const storage = getStorage();
      const quotation = await storage.getQuotation(id);
      
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      console.log('Generating Proforma Invoice for quotation:', id);
      // Create or find a proforma record
      let proforma = (await ProformaStore.getAll()).find(p => p.quotationId === id);
      if (!proforma) {
        proforma = await ProformaStore.createFromQuotation(quotation);
      }
      const pdfBuffer = await pdfGenerator.generateProformaInvoicePDF(quotation);
      console.log('Proforma Invoice generated, buffer size:', pdfBuffer.length);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="proforma-invoice-${quotation.quotationNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Proforma Invoice generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Proforma Invoice generation failed: ${errorMessage}` });
    }
  });

  // Proforma Management Routes
  app.get("/api/proformas", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const list = await ProformaStore.getAll();
      res.json(list);
    } catch (error) { next(error); }
  });
      
  app.get("/api/proformas/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      const record = await ProformaStore.getById(id);
      if (!record) return res.status(404).json({ message: "Proforma not found" });
      res.json(record);
    } catch (error) { next(error); }
  });

  app.post("/api/proformas", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const quotationId = req.body?.quotationId ? parseInt(req.body.quotationId) : undefined;
      if (!quotationId) return res.status(400).json({ message: "quotationId is required" });
      const storage = getStorage();
      const quotation = await storage.getQuotation(quotationId);
      if (!quotation) return res.status(404).json({ message: "Quotation not found" });
      const created = await ProformaStore.createFromQuotation(quotation);
      res.status(201).json(created);
    } catch (error) { next(error); }
  });

  app.put("/api/proformas/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      const updated = await ProformaStore.update(id, req.body);
      if (!updated) return res.status(404).json({ message: "Proforma not found" });
      res.json(updated);
    } catch (error) { next(error); }
  });

  app.delete("/api/proformas/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      const deleted = await ProformaStore.remove(id);
      if (!deleted) return res.status(404).json({ message: "Proforma not found" });
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  // Download/Print Proforma PDF by proforma id
  app.get("/api/proformas/:id/download-pdf", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      const proforma = await ProformaStore.getById(id);
      if (!proforma) return res.status(404).json({ message: "Proforma not found" });
      const pdfBuffer = await pdfGenerator.generateProformaInvoicePDF(proforma as any);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="proforma-invoice-${proforma.quotationNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.send(pdfBuffer);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Proforma Invoice generation failed: ${msg}` });
    }
  });

  // Generate Delivery Challan from Quotation
  app.get("/api/quotations/:id/delivery-challan", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid quotation ID" });
      const storage = getStorage();
      const quotation = await storage.getQuotation(id);
      if (!quotation) return res.status(404).json({ message: "Quotation not found" });
      const pdfBuffer = await pdfGenerator.generateDeliveryChallanPDF(quotation as any);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=\"delivery-challan-${quotation.quotationNumber}.pdf\"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.send(pdfBuffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Delivery Challan generation failed: ${message}` });
    }
  });

  // Convert Quotation to Invoice
  app.post("/api/quotations/:id/convert-to-invoice", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quotation ID" });
      }
      
      const storage = getStorage();
      const quotation = await storage.getQuotation(id);
      
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      // Create invoice from quotation data
      const taxAmount = (Number(quotation.cgstTotal || 0) + Number(quotation.sgstTotal || 0) + Number(quotation.igstTotal || 0)).toString();
      const invoiceData = {
        invoiceNumber: `INV-${Date.now()}`,
        orderId: null,
        customerId: quotation.customerId ?? null,
        items: quotation.items,
        subtotal: quotation.subtotal,
        taxAmount,
        totalAmount: quotation.totalAmount,
        invoiceDate: new Date().toISOString().slice(0,10),
        dueDate: new Date().toISOString().slice(0,10),
        status: 'pending'
      } as any;
      const invoice = await storage.createInvoice(invoiceData);
      
      res.status(201).json({ 
        success: true, 
        message: "Quotation converted to invoice successfully",
        invoice: invoice
      });
    } catch (error) {
      console.error('Convert to invoice failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Failed to convert quotation to invoice: ${errorMessage}` });
    }
  });

  // Convert Quotation to Order
  app.post("/api/quotations/:id/convert-to-order", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quotation ID" });
      }
      
      const storage = getStorage();
      const quotation = await storage.getQuotation(id);
      
      if (!quotation) {
        return res.status(401).json({ message: "Quotation not found" });
      }
      
      // Create order from quotation data
      const orderData = {
        orderNumber: `ORD-${Date.now()}`,
        customerId: quotation.customerId ?? null,
        customerName: quotation.contactPerson || quotation.contactPersonTitle || 'Customer',
        customerCompany: quotation.customerCompany || 'Unknown',
        items: quotation.items,
        subtotal: quotation.subtotal,
        taxAmount: (Number(quotation.cgstTotal || 0) + Number(quotation.sgstTotal || 0) + Number(quotation.igstTotal || 0)).toString(),
        totalAmount: quotation.totalAmount,
        status: 'processing'
      } as any;
      const order = await storage.createOrder(orderData);
      
      res.status(201).json({ 
        success: true, 
        message: "Quotation converted to order successfully",
        order: order
      });
    } catch (error: any) {
      console.error('Convert to order failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Failed to convert quotation to order: ${errorMessage}` });
    }
  });

  app.delete("/api/quotations/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'quotations:delete', 'quotations')) return res.status(403).json({ message: 'Forbidden' });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quotation ID" });
      }
      
      const storage = getStorage();
      const deleted = await storage.deleteQuotation(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      res.json({ message: "Quotation deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Quotation templates
  app.get("/api/quotation-templates", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const storage = getStorage();
      const templates = await storage.getAllQuotationTemplates();
      res.json(templates);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch quotation templates" });
    }
  });

  app.post("/api/quotation-templates", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const storage = getStorage();
      const created = await storage.createQuotationTemplate(req.body);
      res.status(201).json(created);
    } catch (e) {
      res.status(500).json({ message: "Failed to create quotation template" });
    }
  });

  // Order Management Routes
  app.get("/api/orders", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'orders:view', 'orders')) return res.status(403).json({ message: 'Forbidden' });
      
      const storage = getStorage();
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/orders", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'orders:create', 'orders')) return res.status(403).json({ message: 'Forbidden' });

      const orderData = insertOrderSchema.parse(req.body);
      const storage = getStorage();
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/orders/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'orders:update', 'orders')) return res.status(403).json({ message: 'Forbidden' });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid order ID" });
      
      // Validate update data (partial schema)
      const orderData = insertOrderSchema.partial().parse(req.body);
      const storage = getStorage();
      const updated = await storage.updateOrder(id, orderData);
      if (!updated) return res.status(404).json({ message: "Order not found" });
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/orders/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid order ID" });
      const storage = getStorage();
      const deleted = await storage.deleteOrder(id);
      if (!deleted) return res.status(404).json({ message: "Order not found" });
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Internal Order print PDF
  app.get("/api/orders/:id/print-internal", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid order ID" });
      const storage = getStorage();
      const order = await storage.getOrder(id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      const pdfBuffer = await pdfGenerator.generateInternalOrderPDF(order as any);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="internal-order-${order.orderNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  });

  // Delivery challan from order
  app.get("/api/orders/:id/delivery-challan", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid order ID" });
      const storage = getStorage();
      const order = await storage.getOrder(id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      const pdfBuffer = await pdfGenerator.generateDeliveryChallanPDF(order as any);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="delivery-challan-${order.orderNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  });

  // Generate Invoice from order
  app.post("/api/orders/:id/generate-invoice", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid order ID" });
      const storage = getStorage();
      const order = await storage.getOrder(id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      const invoiceData = {
        invoiceNumber: `INV-${Date.now()}`,
        orderId: order.id,
        customerId: order.customerId,
        items: order.items,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
        invoiceDate: new Date().toISOString().slice(0,10),
        dueDate: new Date().toISOString().slice(0,10),
        status: 'pending'
      } as any;
      const invoice = await storage.createInvoice(invoiceData);
      res.json({ success: true, invoice });
    } catch (error) {
      next(error);
    }
  });

  // Dashboard Routes
  app.get("/api/dashboard/stats", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const storage = getStorage();
      const customers = await storage.getAllCustomers();
      const leads = await storage.getAllLeads();
      const orders = await storage.getAllOrders();
      const quotations = await storage.getAllQuotations();
      
          const now = new Date();
      const isSameDay = (d: any) => {
        const dt = new Date(d);
        return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth() && dt.getDate() === now.getDate();
      };

      const ordersThisMonth = orders.filter((order) => {
        const dt = new Date(order.createdAt);
        return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
      }).length;

      const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat((order as any).totalAmount as any) || 0), 0);
      const newLeadsToday = leads.filter((lead) => isSameDay((lead as any).createdAt)).length;
      const quotationsSent = quotations.length;

      res.json({ newLeadsToday, quotationsSent, ordersThisMonth, totalRevenue });
    } catch (error) {
      next(error);
    }
  });

  // Excel Import/Export/Templates
  app.get("/api/import/template/:entity", async (req, res, next) => {
    try {
      const { entity } = req.params as { entity: string };
      const XLSX = (await import("xlsx")).default;

      const headerByEntity: Record<string, { required: string[]; optional: string[] }> = {
        leads: {
          required: ["name", "company", "email", "phone"],
          optional: ["status", "category", "source", "assignedTo", "priority", "expectedValue", "nextFollowUp", "notes", "address", "city", "state", "country", "pincode", "gstNumber", "panNumber"],
        },
        customers: {
          required: ["name", "company", "email", "phone"],
          optional: ["address", "city", "state", "country", "pincode", "gstNumber", "panNumber", "creditLimit", "paymentTerms", "status", "notes"],
        },
        inventory: {
          required: ["name", "sku", "costPrice", "sellingPrice"],
          optional: ["description", "category", "unit", "quantity", "threshold", "taxRate", "location"],
        },
        quotations: {
          required: ["quotationNumber", "quotationDate", "validUntil", "contactPerson", "customerCompany", "addressLine1", "city", "state", "country", "pincode", "items"],
          optional: ["leadId", "customerId", "reference", "contactPersonTitle", "shippingAddressLine1", "shippingAddressLine2", "shippingCity", "shippingState", "shippingCountry", "shippingPincode", "salesCredit", "sameAsBilling", "terms", "notes", "discount", "discountType"],
        },
      };

      const defn = headerByEntity[entity];
      if (!defn) return res.status(400).json({ message: "Unknown entity" });

      const header = [...defn.required, ...defn.optional];
      const ws = XLSX.utils.aoa_to_sheet([header]);
      // add a sample row beneath with hints
      const sample: any[] = header.map((h) => {
        if (h === 'items') return '[{"name":"Item 1","quantity":1,"unit":"nos","rate":100}]';
        if (h.toLowerCase().includes('date')) return new Date().toISOString().slice(0,10);
        return '';
      });
      XLSX.utils.sheet_add_aoa(ws, [sample], { origin: -1 });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as unknown as Buffer;
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=${entity}_template.xlsx`);
      res.send(buf);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/export/:entity", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const { entity } = req.params as { entity: string };
      const storage = getStorage();
      const XLSX = (await import("xlsx")).default;
      let rows: any[] = [];
      if (entity === "leads") rows = await storage.getAllLeads();
      else if (entity === "customers") rows = await storage.getAllCustomers();
      else if (entity === "inventory") rows = await storage.getAllInventoryItems();
      else if (entity === "quotations") rows = await storage.getAllQuotations();
      else return res.status(400).json({ message: "Unknown entity" });
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, entity);
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=${entity}.xlsx`);
      res.send(buf);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/import/:entity", async (req: Request, res: Response, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const { entity } = req.params as { entity: string };
      const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
      const storage = getStorage();
      let created = 0;

      if (entity === "leads") {
        for (const r of rows) {
          const payload: any = {
            name: r.name || r.Name,
            company: r.company || r.Company,
            email: r.email || r.Email || "",
            phone: r.phone || r.Phone || "",
            status: r.status || "new",
            category: r.category || "industry",
            source: r.source || "import",
            assignedTo: r.assignedTo || undefined,
            priority: r.priority || "medium",
            expectedValue: r.expectedValue?.toString(),
            nextFollowUp: r.nextFollowUp ? new Date(r.nextFollowUp) : undefined,
            notes: r.notes || "",
            address: r.address || "",
            city: r.city || "",
            state: r.state || "",
            country: r.country || "India",
            pincode: r.pincode || "",
            gstNumber: r.gstNumber || "",
            panNumber: r.panNumber || "",
          };
          if (payload.name && payload.company) {
            await storage.createLead(payload);
            created++;
          }
        }
      } else if (entity === "customers") {
        for (const r of rows) {
          const payload: any = {
            name: r.name || r.Name,
            company: r.company || r.Company,
            email: r.email || r.Email || "",
            phone: r.phone || r.Phone || "",
            address: r.address || "",
            city: r.city || "",
            state: r.state || "",
            country: r.country || "India",
            pincode: r.pincode || "",
            gstNumber: r.gstNumber || "",
            panNumber: r.panNumber || "",
            creditLimit: r.creditLimit?.toString() || "0",
            paymentTerms: r.paymentTerms || "30 days",
            status: r.status || "active",
            notes: r.notes || "",
          };
          if (payload.name && payload.company && payload.email && payload.phone) {
            await storage.createCustomer(payload);
            created++;
          }
        }
      } else if (entity === "inventory") {
        for (const r of rows) {
          const payload: any = {
            name: r.name || r.Name,
            sku: r.sku || r.SKU,
            description: r.description || "",
            category: r.category || "",
            unit: r.unit || "pcs",
            quantity: Number(r.quantity ?? 0),
            threshold: Number(r.threshold ?? 5),
            costPrice: (r.costPrice ?? r.cost_price ?? "0").toString(),
            sellingPrice: (r.sellingPrice ?? r.selling_price ?? "0").toString(),
            taxRate: (r.taxRate ?? r.tax_rate ?? "18").toString(),
            supplierId: undefined,
            location: r.location || "",
            isActive: true,
          };
          if (payload.name && payload.sku) {
            await storage.createInventoryItem(payload);
            created++;
          }
        }
      } else if (entity === "quotations") {
        for (const r of rows) {
          // items column expected as JSON string
          const items = (() => {
            try { return JSON.parse(r.items || r.Items || "[]"); } catch { return []; }
          })();
          const payload: any = {
            quotationNumber: r.quotationNumber || r.QuotationNumber,
            customerId: r.customerId ? Number(r.customerId) : undefined,
            leadId: r.leadId ? Number(r.leadId) : undefined,
            quotationDate: r.quotationDate || new Date().toISOString().slice(0,10),
            validUntil: r.validUntil || new Date().toISOString().slice(0,10),
            reference: r.reference || "",
            contactPersonTitle: r.contactPersonTitle || "",
            contactPerson: r.contactPerson || r.ContactPerson || "",
            customerCompany: r.customerCompany || r.CustomerCompany || "",
            addressLine1: r.addressLine1 || r.AddressLine1 || "",
            addressLine2: r.addressLine2 || r.AddressLine2 || "",
            city: r.city || "",
            state: r.state || "",
            country: r.country || "India",
            pincode: r.pincode || "",
            shippingAddressLine1: r.shippingAddressLine1 || "",
            shippingAddressLine2: r.shippingAddressLine2 || "",
            shippingCity: r.shippingCity || "",
            shippingState: r.shippingState || "",
            shippingCountry: r.shippingCountry || "",
            shippingPincode: r.shippingPincode || "",
            salesCredit: r.salesCredit || "",
            sameAsBilling: (String(r.sameAsBilling || "true").toLowerCase() !== "false"),
            items,
            terms: r.terms ? String(r.terms) : "",
            notes: r.notes || "",
            bankDetails: undefined,
            extraCharges: [],
            discounts: [],
            discount: r.discount?.toString(),
            discountType: r.discountType || "amount",
            subtotal: (r.subtotal ?? "0").toString(),
            cgstTotal: (r.cgstTotal ?? "0").toString(),
            sgstTotal: (r.sgstTotal ?? "0").toString(),
            igstTotal: (r.igstTotal ?? "0").toString(),
            taxableTotal: (r.taxableTotal ?? "0").toString(),
            totalAmount: (r.totalAmount ?? "0").toString(),
            status: r.status || "draft",
          };
          if (payload.quotationNumber && payload.contactPerson && payload.addressLine1 && items.length >= 0) {
            await storage.createQuotation(payload);
            created++;
          }
        }
      } else {
        return res.status(400).json({ message: "Unknown entity" });
      }

      res.json({ message: "Imported successfully", created });
    } catch (err) {
      next(err);
    }
  });

  // IndiaMART Pull API integration
  app.post("/api/integrations/indiamart/sync", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const { apiKey: bodyKey, startTime, endTime } = req.body as { apiKey?: string; startTime?: string; endTime?: string };
      const storageA = getStorage();
      const settings = await storageA.getCompanySettings();
      const effectiveKey = bodyKey || settings?.integrations?.indiaMart?.apiKey;
      if (!effectiveKey) return res.status(400).json({ message: "Missing apiKey" });

      const fetchIndiaMart = async (key: string, s?: string, e?: string) => {
        const params = new URLSearchParams();
        params.set("glusr_crm_key", key);
        if (s) params.set("start_time", s);
        if (e) params.set("end_time", e);
        const url = `https://mapi.indiamart.com/wservce/crm/crmListing/v2/?${params.toString()}`;
        const r = await fetch(url, { headers: { "accept": "application/json" } });
        const text = await r.text();
        let payload: any;
        try { payload = JSON.parse(text); } catch { return { error: `Invalid response from IndiaMART`, raw: text }; }
        return payload;
      };

      let payload: any = await fetchIndiaMart(effectiveKey, startTime, endTime);
      if (payload?.STATUS === 'FAILURE') {
        return res.status(502).json({ message: payload.MESSAGE || 'IndiaMART error', code: payload.CODE, details: payload });
      }
      let rows: any[] = Array.isArray(payload?.RESPONSE) ? payload.RESPONSE : [];

      // Fallback: if no rows and no date range provided, pull last 7 days
      if ((!startTime && !endTime) && rows.length === 0) {
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fmt = (d: Date) => `${String(d.getDate()).padStart(2,'0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
        payload = await fetchIndiaMart(effectiveKey, fmt(weekAgo), fmt(now));
        if (payload?.STATUS === 'FAILURE') {
          return res.status(502).json({ message: payload.MESSAGE || 'IndiaMART error', code: payload.CODE, details: payload });
        }
        rows = Array.isArray(payload?.RESPONSE) ? payload.RESPONSE : [];
      }
      const storage = getStorage();
      let created = 0;
      for (const r of rows) {
        const name = (r.SENDER_NAME && r.SENDER_NAME !== 'IndiaMART Buyer') ? r.SENDER_NAME : (r.SENDER_EMAIL || r.SENDER_MOBILE || 'Unknown');
        const phone = r.SENDER_MOBILE || r.MOBILE || '';
        const email = r.SENDER_EMAIL || r.EMAIL || '';
        const company = r.SENDER_COMPANY || r.COMPANY || r.SUBJECT || 'IndiaMART Lead';
        const notes = r.QUERY_MESSAGE || r.SUBJECT || '';
        await storage.createLead({
          name,
          company,
          email,
          phone,
          status: 'new',
          category: 'industry',
          source: 'IndiaMART',
          notes,
          address: '', city: '', state: '', country: 'India', pincode: ''
        });
        created++;
      }
      // persist settings last synced
      await storage.updateCompanySettings({ integrations: { ...(settings?.integrations||{}), indiaMart: { ...(settings?.integrations?.indiaMart||{}), lastSyncedAt: new Date().toISOString() } } });
      res.json({ success: true, created, importedAt: new Date().toISOString(), totalReceived: rows.length });
    } catch (err) {
      next(err);
    }
  });

  // User Routes
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Company Settings Routes
  app.get("/api/company-settings", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const storage = getStorage();
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/company-settings", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

      const settingsData = req.body;
      const storage = getStorage();
      const settings = await storage.updateCompanySettings(settingsData);
      res.json(settings);
    } catch (error) {
      next(error);
    }
  });

  // Data Import Routes
  app.post("/api/import-data", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      console.log('Starting data import from web interface...');
      
      // Use child process to run the import script
      const { exec } = require('child_process');
      const path = require('path');
      
      const scriptPath = path.join(process.cwd(), 'import-excel.cjs');
      
      exec(`node "${scriptPath}"`, (error: any, stdout: string, stderr: string) => {
        if (error) {
          console.error('Data import failed:', error);
          return res.status(500).json({ 
            success: false, 
            message: "Data import failed", 
            error: error.message 
          });
        }
        
        if (stderr) {
          console.error('Data import stderr:', stderr);
        }
        
        console.log('Data import output:', stdout);
        
        res.json({ 
          success: true, 
          message: "Data import completed successfully",
          output: stdout
        });
      });
      
    } catch (error) {
      console.error('Data import failed:', error);
      res.status(500).json({ 
        success: false, 
        message: "Data import failed", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Invoice Management Routes
  app.get("/api/invoices", async (req, res, next) => {
    try {
      if (!req.isAuthenticated?.()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'invoices:view', 'invoices')) return res.status(403).json({ message: 'Forbidden' });
      
      const storage = getStorage();
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/invoices/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }
      
      const storage = getStorage();
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/invoices", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'invoices:create', 'invoices')) return res.status(403).json({ message: 'Forbidden' });

      const invoiceData = insertInvoiceSchema.parse(req.body);
      const storage = getStorage();
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/invoices/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }
      
      const storage = getStorage();
      const updated = await storage.updateInvoice(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/invoices/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'invoices:delete', 'invoices')) return res.status(403).json({ message: 'Forbidden' });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }
      
      const storage = getStorage();
      const deleted = await storage.deleteInvoice(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Generate Invoice PDF
  app.get("/api/invoices/:id/download-pdf", async (req, res, next) => {
    try {
      if (!req.isAuthenticated?.()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }
      
      const storage = getStorage();
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      console.log('Generating Invoice PDF for invoice:', id);
      const pdfBuffer = await pdfGenerator.generateInvoicePDF(invoice);
      console.log('Invoice PDF generated, buffer size:', pdfBuffer.length);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Invoice PDF generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Invoice PDF generation failed: ${errorMessage}` });
    }
  });

  // Payment Management Routes
  app.get("/api/payments", async (req, res, next) => {
    try {
      if (!req.isAuthenticated?.()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'payments:view', 'payments')) return res.status(403).json({ message: 'Forbidden' });
      
      const storage = getStorage();
      const payments = await storage.getAllPayments();
      // Transform payments to include customerName
      const paymentsWithCustomer = await Promise.all(payments.map(async (payment: any) => {
        if (payment.customerId) {
          const customer = await storage.getCustomer(payment.customerId);
          return {
            ...payment,
            customerName: customer?.name || 'Unknown Customer',
            receivedAmount: payment.amount || "0"
          };
        }
        return {
          ...payment,
          customerName: 'Unknown Customer',
          receivedAmount: payment.amount || "0"
        };
      }));
      res.json(paymentsWithCustomer);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/payments/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid payment ID" });
      }
      
      const storage = getStorage();
      const payment = await storage.getPayment(id);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      res.json(payment);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/payments", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'payments:create', 'payments')) return res.status(403).json({ message: 'Forbidden' });

      const paymentData = insertPaymentSchema.parse(req.body);
      const storage = getStorage();
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/payments/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid payment ID" });
      }
      
      const storage = getStorage();
      const updated = await storage.updatePayment(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/payments/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'payments:delete', 'payments')) return res.status(403).json({ message: 'Forbidden' });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid payment ID" });
      }
      
      const storage = getStorage();
      const deleted = await storage.deletePayment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      res.json({ message: "Payment deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Sales Targets Management Routes
  app.get("/api/sales-targets", async (req, res, next) => {
    try {
      if (!req.isAuthenticated?.()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'sales-targets:view', 'sales-targets')) return res.status(403).json({ message: 'Forbidden' });
      
      const storage = getStorage();
      const targets = await storage.getAllSalesTargets();
      // Transform targets to match frontend expectations
      const transformedTargets = await Promise.all(targets.map(async (target: any) => {
        let assignedToName = 'Unassigned';
        if (target.assignedTo) {
          const user = await storage.getUser(target.assignedTo);
          assignedToName = user?.name || `User ${target.assignedTo}`;
        }
        return {
          ...target,
          targetName: target.productName || target.targetName,
          assignedTo: assignedToName,
          targetValue: target.targetValue?.toString() || "0",
          actualValue: target.actualValue?.toString() || "0"
        };
      }));
      res.json(transformedTargets);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/sales-targets/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid sales target ID" });
      }
      
      const storage = getStorage();
      const target = await storage.getSalesTarget(id);
      
      if (!target) {
        return res.status(404).json({ message: "Sales target not found" });
      }
      
      res.json(target);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/sales-targets", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'sales-targets:create', 'sales-targets')) return res.status(403).json({ message: 'Forbidden' });

      // Transform frontend data (targetName -> productName, assignedTo string -> id)
      const body = req.body;
      const targetData: any = {
        productName: body.targetName || body.productName || '',
        targetMonth: body.targetMonth || '',
        targetYear: body.targetYear || '',
        targetValue: typeof body.targetValue === 'string' ? parseInt(body.targetValue) || 0 : (body.targetValue || 0),
        actualValue: typeof body.actualValue === 'string' ? parseInt(body.actualValue) || 0 : (body.actualValue || 0),
        assignedTo: body.assignedToId || (typeof body.assignedTo === 'number' ? body.assignedTo : undefined),
        notes: body.notes || ''
      };
      
      const storage = getStorage();
      const target = await storage.createSalesTarget(targetData);
      // Return transformed response
      const user = target.assignedTo ? await storage.getUser(target.assignedTo) : null;
      res.status(201).json({
        ...target,
        targetName: target.productName,
        assignedTo: user?.name || 'Unassigned',
        targetValue: target.targetValue?.toString() || "0",
        actualValue: target.actualValue?.toString() || "0"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/sales-targets/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid sales target ID" });
      }
      
      // Transform frontend data
      const body = req.body;
      const updateData: any = {};
      if (body.targetName !== undefined) updateData.productName = body.targetName;
      if (body.targetMonth !== undefined) updateData.targetMonth = body.targetMonth;
      if (body.targetYear !== undefined) updateData.targetYear = body.targetYear;
      if (body.targetValue !== undefined) updateData.targetValue = typeof body.targetValue === 'string' ? parseInt(body.targetValue) || 0 : body.targetValue;
      if (body.actualValue !== undefined) updateData.actualValue = typeof body.actualValue === 'string' ? parseInt(body.actualValue) || 0 : body.actualValue;
      if (body.assignedToId !== undefined) updateData.assignedTo = body.assignedToId;
      if (body.notes !== undefined) updateData.notes = body.notes;
      
      const storage = getStorage();
      const updated = await storage.updateSalesTarget(id, updateData);
      
      if (!updated) {
        return res.status(404).json({ message: "Sales target not found" });
      }
      
      // Return transformed response
      const user = updated.assignedTo ? await storage.getUser(updated.assignedTo) : null;
      res.json({
        ...updated,
        targetName: updated.productName,
        assignedTo: user?.name || 'Unassigned',
        targetValue: updated.targetValue?.toString() || "0",
        actualValue: updated.actualValue?.toString() || "0"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/sales-targets/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      if (!hasPermission(req, 'sales-targets:delete', 'sales-targets')) return res.status(403).json({ message: 'Forbidden' });
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid sales target ID" });
      }
      
      const storage = getStorage();
      const deleted = await storage.deleteSalesTarget(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Sales target not found" });
      }
      
      res.json({ message: "Sales target deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Purchase Orders API
  // Debug endpoints (temporary) to help verify storage
  app.post("/api/debug/test-purchase-order", async (req, res, next) => {
    try {
      const storage = getStorage();
      const sample = {
        poNumber: `PO-${new Date().getFullYear()}-TEST-${Date.now()}`,
        supplierName: "Debug Supplier",
        orderDate: new Date().toISOString().split('T')[0],
        items: [{ name: "Debug Item", quantity: 1, unit: "pcs", unitPrice: 1, amount: 1 }],
        subtotal: 1,
        taxAmount: 0,
        totalAmount: 1,
        status: 'draft',
        createdAt: new Date()
      };

      const created = await storage.createPurchaseOrder(sample as any);
      res.status(201).json({ success: true, created });
    } catch (err) {
      console.error('Debug create purchase order failed:', err);
      res.status(500).json({ success: false, message: (err as any)?.message || 'Error' });
    }
  });

  app.get("/api/debug/purchase-orders", async (req, res, next) => {
    try {
      const storage = getStorage();
      const list = await storage.getAllPurchaseOrders();
      res.json(list);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/purchase-orders", async (req, res, next) => {
    try {
      const storage = getStorage();
      const purchaseOrders = await storage.getAllPurchaseOrders();
      res.json(purchaseOrders);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/purchase-orders/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const storage = getStorage();
      const purchaseOrder = await storage.getPurchaseOrder(id);
      if (!purchaseOrder) return res.status(404).json({ message: "Purchase order not found" });
      res.json(purchaseOrder);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/purchase-orders", async (req, res, next) => {
    try {
      const storage = getStorage();
      
      // Validate required fields
      if (!req.body.poNumber) {
        return res.status(400).json({ message: "PO Number is required" });
      }
      if (!req.body.supplierName) {
        return res.status(400).json({ message: "Supplier name is required" });
      }
      if (!req.body.orderDate) {
        return res.status(400).json({ message: "Order date is required" });
      }
      if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
        return res.status(400).json({ message: "At least one item is required" });
      }
      
      const purchaseOrderData = {
        ...req.body,
        createdAt: new Date()
      };
      
      console.log('Creating purchase order with data:', JSON.stringify(purchaseOrderData, null, 2));
      
      const purchaseOrder = await storage.createPurchaseOrder(purchaseOrderData);
      res.status(201).json(purchaseOrder);
    } catch (error) {
      console.error('Error creating purchase order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.put("/api/purchase-orders/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const storage = getStorage();
      const purchaseOrder = await storage.getPurchaseOrder(id);
      if (!purchaseOrder) return res.status(404).json({ message: "Purchase order not found" });
      
      const updated = await storage.updatePurchaseOrder(id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/purchase-orders/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const storage = getStorage();
      const purchaseOrder = await storage.getPurchaseOrder(id);
      if (!purchaseOrder) return res.status(404).json({ message: "Purchase order not found" });
      
      await storage.deletePurchaseOrder(id);
      res.json({ message: "Purchase order deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/purchase-orders/:id/download-pdf", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const storage = getStorage();
      const purchaseOrder = await storage.getPurchaseOrder(id);
      if (!purchaseOrder) return res.status(404).json({ message: "Purchase order not found" });
      
      const supplier = purchaseOrder.supplierId ? await storage.getSupplier(purchaseOrder.supplierId) : null;
      const pdfBuffer = await pdfGenerator.generatePurchaseOrderPDF(purchaseOrder, supplier);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="PO-${purchaseOrder.poNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  });

  // Server is started in index.ts, so we don't need to start it here
  return app as any;
}