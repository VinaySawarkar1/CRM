import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  console.log('Comparing passwords, stored hash format:', stored.includes('.') ? 'valid' : 'invalid');
  const [hashed, salt] = stored.split(".");
  
  if (!hashed || !salt) {
    console.log('Password comparison failed: Invalid hash format');
    return false;
  }
  
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  const result = timingSafeEqual(hashedBuf, suppliedBuf);
  console.log('Password comparison result:', result ? 'match' : 'no match');
  return result;
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'business-ai-app-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          // Superuser bypasses company checks
          if (user.role === 'superuser') {
            return done(null, user);
          }
          // Only allow active (approved) users
          if (user.isActive === false) return done(null, false);
          // Check if company is active (if user has companyId)
          if (user.companyId) {
            const company = await storage.getCompany(user.companyId);
            if (!company || company.status !== 'active') {
              return done(null, false);
            }
          }
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log('Registration request received:', { ...req.body, password: '[HIDDEN]' });
      
      // Validate required fields
      if (!req.body.username || !req.body.password || !req.body.name || !req.body.email || !req.body.companyName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log('Registration failed: Username already exists');
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const allUsers = await storage.getAllUsers();
      const existingEmail = allUsers.find(u => u.email && u.email.toLowerCase() === req.body.email.toLowerCase());
      if (existingEmail) {
        console.log('Registration failed: Email already exists');
        return res.status(400).json({ message: "Email already registered" });
      }

      // Check if company email already exists
      const allCompanies = await storage.getAllCompanies();
      const existingCompanyEmail = allCompanies.find(c => c.email && c.email.toLowerCase() === req.body.email.toLowerCase());
      if (existingCompanyEmail) {
        console.log('Registration failed: Company email already exists');
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create company for new registration
      const company = await storage.createCompany({
        name: req.body.companyName || req.body.name + "'s Company",
        email: req.body.email,
        phone: req.body.phone || "",
        status: "pending", // Awaiting superuser approval
        maxUsers: 20
      });

      console.log('Creating new user with company...');
      const user = await storage.createUser({
        username: req.body.username,
        password: await hashPassword(req.body.password),
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone || "",
        role: 'admin', // Company admin after approval
        companyId: company.id,
        // New users are inactive until approved by superuser
        isActive: false,
        department: req.body.department || "",
      });
      console.log('User created (inactive):', { id: user.id, username: user.username, companyId: company.id });
      // Do not auto-login inactive users
      res.status(201).json({ message: 'Registration successful. Await superuser approval.', userId: user.id, companyId: company.id });
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log('Login attempt for username:', req.body.username);
    
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.log('Login authentication error:', err);
        return next(err);
      }
      
      if (!user) {
        console.log('Login failed: Invalid credentials');
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      console.log('User authenticated, creating session');
      req.login(user, (err) => {
        if (err) {
          console.log('Session creation error:', err);
          return next(err);
        }
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        console.log('Login successful for user:', userWithoutPassword.username);
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Return user without password
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
