import { ReactNode } from "react";
import { Link } from "wouter";
import Sidebar from "./sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Plus, Search, ChevronDown, LogOut, User, FileText, ShoppingCart } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading, logoutMutation } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const can = (perm: keyof NonNullable<typeof user> & string) => {
    // Basic check placeholder; will be extended when permissions are stored
    return true;
  };

  const initials = (user.name || user.username || "").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex overflow-hidden">
      {/* Sidebar - Fixed position */}
      <div className="w-64 glass-effect border-r border-gray-200/50 shadow-xl flex-shrink-0 h-screen fixed left-0 top-0 z-40">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 glass-effect border-b border-gray-200/50 shadow-sm flex-shrink-0">
          <div className="px-6 py-3 flex items-center gap-4">
            {/* Brand */}
            <Link href="/">
              <div className="flex items-center gap-2 text-gray-900 hover:opacity-90 cursor-pointer select-none group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-semibold shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  C
                </div>
                <span className="hidden sm:block text-base font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Cortex AI
                </span>
              </div>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  className="pl-9 h-9 bg-white/80 backdrop-blur-sm border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm"
                  placeholder="Search leads, customers, quotations..."
                />
                <div className="hidden md:flex items-center gap-1 absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                  <kbd className="px-1.5 py-0.5 rounded border bg-white/50 backdrop-blur-sm">Ctrl</kbd>
                  +
                  <kbd className="px-1.5 py-0.5 rounded border bg-white/50 backdrop-blur-sm">K</kbd>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300" variant="default">
                  <Plus className="h-4 w-4 mr-2" /> New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Quick create</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/leads">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" /> Lead
                  </DropdownMenuItem>
                </Link>
                <Link href="/quotations/new">
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" /> Quotation
                  </DropdownMenuItem>
                </Link>
                <Link href="/orders">
                  <DropdownMenuItem>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Order
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-2 hover:bg-blue-50/50 transition-colors duration-300 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full text-white flex items-center justify-center text-xs font-semibold mr-2 shadow-md ring-2 ring-blue-100">
                    {initials || "U"}
                  </div>
                  <div className="hidden sm:flex flex-col items-start mr-1">
                    <span className="text-sm leading-4 font-semibold text-gray-900">{user.name || user.username}</span>
                    <span className="text-[11px] leading-3 text-gray-500 capitalize">{user.role}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/settings">
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-content">
          {children}
        </main>
      </div>
    </div>
  );
}
