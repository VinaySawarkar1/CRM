import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertLeadSchema, 
  insertOrderSchema, 
  insertInventorySchema, 
  insertTaskSchema,
  insertEmployeeActivitySchema,
  insertSalesTargetSchema,
  insertManufacturingForecastSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Lead Management Routes
  app.get("/api/leads", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const leads = await storage.getAllLeads();
      res.json(leads);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/leads", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
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
      const deleted = await storage.deleteLead(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Order Management Routes
  app.get("/api/orders", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/orders", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

      const orderData = insertOrderSchema.parse(req.body);
      
      // Verify inventory for all items in the order
      const orderItems = Array.isArray(orderData.items) ? orderData.items : [];
      for (const item of orderItems) {
        const inventoryItem = await storage.getInventoryItemBySku(item.sku);
        if (!inventoryItem) {
          return res.status(400).json({ message: `Item with SKU ${item.sku} not found in inventory` });
        }
        if (inventoryItem.quantity < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient inventory for item ${inventoryItem.name}`,
            available: inventoryItem.quantity,
            requested: item.quantity
          });
        }
      }
      
      // Update inventory quantities
      for (const item of orderItems) {
        const inventoryItem = await storage.getInventoryItemBySku(item.sku);
        if (inventoryItem) {
          await storage.updateInventoryItem(inventoryItem.id, {
            quantity: inventoryItem.quantity - item.quantity
          });
        }
      }
      
      // Create the order
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/orders/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/orders/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const orderData = insertOrderSchema.partial().parse(req.body);
      
      const updatedOrder = await storage.updateOrder(id, orderData);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
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
      
      const items = await storage.getAllInventoryItems();
      res.json(items);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/inventory/low-stock", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const items = await storage.getLowStockItems();
      res.json(items);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/inventory", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

      const itemData = insertInventorySchema.parse(req.body);
      
      // Check if SKU already exists
      const existingItem = await storage.getInventoryItemBySku(itemData.sku);
      if (existingItem) {
        return res.status(400).json({ message: "Item with this SKU already exists" });
      }
      
      const item = await storage.createInventoryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/inventory/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const item = await storage.getInventoryItem(id);
      
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/inventory/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const itemData = insertInventorySchema.partial().parse(req.body);
      
      // If SKU is being updated, check it's not duplicate
      if (itemData.sku) {
        const existingItem = await storage.getInventoryItemBySku(itemData.sku);
        if (existingItem && existingItem.id !== id) {
          return res.status(400).json({ message: "Another item with this SKU already exists" });
        }
      }
      
      const updatedItem = await storage.updateInventoryItem(id, itemData);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/inventory/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInventoryItem(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Task Management Routes
  app.get("/api/tasks", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
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
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/tasks/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/tasks/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const taskData = insertTaskSchema.partial().parse(req.body);
      
      const updatedTask = await storage.updateTask(id, taskData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/tasks/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Employee Activity Routes
  app.get("/api/employee-activities", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const activities = await storage.getAllEmployeeActivities();
      res.json(activities);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/employee-activities", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

      const activityData = insertEmployeeActivitySchema.parse(req.body);
      const activity = await storage.createEmployeeActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/employee-activities/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const activity = await storage.getEmployeeActivity(id);
      
      if (!activity) {
        return res.status(404).json({ message: "Employee activity not found" });
      }
      
      res.json(activity);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/employee-activities/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const activityData = insertEmployeeActivitySchema.partial().parse(req.body);
      
      const updatedActivity = await storage.updateEmployeeActivity(id, activityData);
      
      if (!updatedActivity) {
        return res.status(404).json({ message: "Employee activity not found" });
      }
      
      res.json(updatedActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/employee-activities/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEmployeeActivity(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Employee activity not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Sales Target Routes
  app.get("/api/sales-targets", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const targets = await storage.getAllSalesTargets();
      res.json(targets);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/sales-targets/period", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const { month, year } = req.query;
      
      if (!month || !year) {
        return res.status(400).json({ message: "Month and year are required query parameters" });
      }
      
      const targets = await storage.getSalesTargetsByPeriod(month as string, year as string);
      res.json(targets);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/sales-targets", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

      const targetData = insertSalesTargetSchema.parse(req.body);
      const target = await storage.createSalesTarget(targetData);
      res.status(201).json(target);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/sales-targets/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const target = await storage.getSalesTarget(id);
      
      if (!target) {
        return res.status(404).json({ message: "Sales target not found" });
      }
      
      res.json(target);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/sales-targets/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const targetData = insertSalesTargetSchema.partial().parse(req.body);
      
      const updatedTarget = await storage.updateSalesTarget(id, targetData);
      
      if (!updatedTarget) {
        return res.status(404).json({ message: "Sales target not found" });
      }
      
      res.json(updatedTarget);
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
      
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSalesTarget(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Sales target not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Manufacturing Forecast Routes
  app.get("/api/manufacturing-forecasts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const forecasts = await storage.getAllManufacturingForecasts();
      res.json(forecasts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/manufacturing-forecasts/period", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const { month, year } = req.query;
      
      if (!month || !year) {
        return res.status(400).json({ message: "Month and year are required query parameters" });
      }
      
      const forecasts = await storage.getManufacturingForecastsByPeriod(month as string, year as string);
      res.json(forecasts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/manufacturing-forecasts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

      const forecastData = insertManufacturingForecastSchema.parse(req.body);
      const forecast = await storage.createManufacturingForecast(forecastData);
      res.status(201).json(forecast);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/manufacturing-forecasts/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const forecast = await storage.getManufacturingForecast(id);
      
      if (!forecast) {
        return res.status(404).json({ message: "Manufacturing forecast not found" });
      }
      
      res.json(forecast);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/manufacturing-forecasts/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const forecastData = insertManufacturingForecastSchema.partial().parse(req.body);
      
      const updatedForecast = await storage.updateManufacturingForecast(id, forecastData);
      
      if (!updatedForecast) {
        return res.status(404).json({ message: "Manufacturing forecast not found" });
      }
      
      res.json(updatedForecast);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/manufacturing-forecasts/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteManufacturingForecast(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Manufacturing forecast not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const leads = await storage.getAllLeads();
      const orders = await storage.getAllOrders();
      const inventory = await storage.getAllInventoryItems();
      const lowStockItems = await storage.getLowStockItems();
      const tasks = await storage.getAllTasks();
      const activities = await storage.getAllEmployeeActivities();
      const salesTargets = await storage.getAllSalesTargets();
      
      // Get current month and year for filtering
      const now = new Date();
      const currentMonth = now.toLocaleString('default', { month: 'long' });
      const currentYear = now.getFullYear().toString();
      
      const stats = {
        totalLeads: leads.length,
        activeOrders: orders.filter(o => o.status !== 'completed').length,
        lowStockCount: lowStockItems.length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        recentLeads: leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
        recentOrders: orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
        urgentTasks: tasks.filter(t => t.priority === 'high' && t.status === 'pending').length,
        recentActivities: activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
        currentMonthSalesTargets: salesTargets.filter(t => t.targetMonth === currentMonth && t.targetYear === currentYear),
        salesPerformance: {
          target: salesTargets.filter(t => t.targetMonth === currentMonth && t.targetYear === currentYear)
                             .reduce((total, target) => total + target.targetValue, 0),
          actual: salesTargets.filter(t => t.targetMonth === currentMonth && t.targetYear === currentYear)
                             .reduce((total, target) => total + (target.actualValue || 0), 0)
        }
      };
      
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
