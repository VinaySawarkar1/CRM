import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  UserPlus,
  Target,
  Building2,
  Receipt,
  Factory,
  ClipboardList,
  HelpCircle,
  CreditCard,
  Truck,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const crmItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Leads",
    href: "/leads",
    icon: UserPlus,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Building2,
  },
  {
    title: "Quotations",
    href: "/quotations",
    icon: FileText,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: Receipt,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    title: "Sales Targets",
    href: "/sales-targets",
    icon: Target,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
];

const erpItems = [
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
  },
  {
    title: "Manufacturing",
    href: "/manufacturing",
    icon: Factory,
  },
  {
    title: "Purchase Orders",
    href: "/purchase-orders",
    icon: Truck,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: ClipboardList,
  },
  {
    title: "Employee Activities",
    href: "/employee-activities",
    icon: Users,
  },
  {
    title: "Support Tickets",
    href: "/support-tickets",
    icon: HelpCircle,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const allow = (title: string) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    // If user has granular permissions, check them first
    const perms = (user as any).permissions as string[] | undefined;
    if (Array.isArray(perms) && perms.length > 0) {
      return perms.includes(title.toLowerCase());
    }
    // Fallback to role-based buckets
    const salesOnly = ["Dashboard","Leads","Customers","Quotations","Orders","Invoices","Payments","Reports"];
    if (user.role === 'sales') return salesOnly.includes(title);
    return true;
  };

  return (
    <div className={cn("h-full flex flex-col bg-white", className)}>
      {/* Logo */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-white to-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-semibold text-sm">R</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-gray-900 truncate">Reckonix</h1>
            <p className="text-[11px] text-gray-500">Business AI Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 overflow-y-auto scrollbar-sidebar">
        {/* CRM Section */}
        <div className="mb-8">
          <div className="px-5 mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Customer Relationship
            </h3>
          </div>
          <div className="space-y-1">
            {crmItems.filter(i => allow(i.title)).map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10 px-5 rounded-md border-l-2",
                    location === item.href 
                      ? "bg-blue-50 border-blue-600 text-blue-700 hover:bg-blue-100" 
                      : "border-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* ERP Section */}
        <div className="mb-8">
          <div className="px-5 mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Enterprise Resource
            </h3>
          </div>
          <div className="space-y-1">
            {erpItems.filter(i => allow(i.title)).map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10 px-5 rounded-md border-l-2",
                    location === item.href 
                      ? "bg-blue-50 border-blue-600 text-blue-700 hover:bg-blue-100" 
                      : "border-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-gray-100">
        <div className="text-xs text-gray-500 text-center">
          © 2025 Reckonix
        </div>
      </div>
    </div>
  );
}
