import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Package, 
  CheckSquare, 
  BarChart, 
  Menu,
  LogOut,
  UserCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [open, setOpen] = useState(false);
  
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Users, label: "Lead Management", href: "/leads" },
    { icon: ShoppingCart, label: "Order Management", href: "/orders" },
    { icon: Package, label: "Inventory", href: "/inventory" },
    { icon: CheckSquare, label: "Task Management", href: "/tasks" },
    { icon: UserCircle, label: "Employee Activities", href: "/employee-activities" },
    { icon: BarChart, label: "Reports", href: "/reports" },
  ];
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#800000] text-white">
      {/* Logo */}
      <div className="px-4 py-6 bg-[#4B0000] flex flex-col items-center">
        <h1 className="cinzel text-2xl font-bold text-white tracking-wider">RECKONIX</h1>
        <p className="text-xs mt-1 text-[#D4AF37] tracking-widest">TEST. MEASURE. CALIBRATE.</p>
      </div>
      
      {/* Navigation */}
      <div className="py-4 flex-grow overflow-y-auto">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <div
                key={item.href}
                className="group"
              >
                <Link 
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  <div className={cn(
                    "flex items-center px-4 py-3 text-white rounded-md group",
                    isActive ? "bg-[#4B0000]" : "hover:bg-[#4B0000]"
                  )}>
                    <item.icon className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-[#D4AF37]" : ""
                    )} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </nav>
      </div>
      
      {/* User Menu */}
      <div className="border-t border-[#4B0000] p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#4B0000] flex items-center justify-center">
            <span className="text-[#D4AF37] font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <Button 
              variant="link" 
              className="text-xs text-[#D4AF37] hover:text-[#F1C40F] p-0 h-auto"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      {/* Mobile sidebar trigger */}
      <div className="block md:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="bg-white">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Desktop sidebar */}
      <div className={cn("hidden md:flex md:flex-col w-64 h-screen", className)}>
        <SidebarContent />
      </div>
    </>
  );
}
