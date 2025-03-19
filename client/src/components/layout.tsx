import { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { Bell, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Get current page title based on location
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/leads":
        return "Lead Management";
      case "/orders":
        return "Order Management";
      case "/inventory":
        return "Inventory";
      case "/tasks":
        return "Task Management";
      case "/reports":
        return "Reports";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-1 text-gray-600 hover:text-[#800000] focus:outline-none">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-[#800000] text-white text-xs rounded-full">3</span>
                </button>
              </div>
              
              {/* Settings */}
              <button className="p-1 text-gray-600 hover:text-[#800000] focus:outline-none">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className={cn("flex-1 overflow-y-auto bg-gray-50 grid-bg", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
