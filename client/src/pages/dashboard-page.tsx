import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  ShoppingCart, 
  Receipt,
  Package,
  AlertTriangle,
  ClipboardList,
  Database,
  Download
} from "lucide-react";

interface DashboardStats {
  newLeadsToday?: number;
  quotationsSent?: number;
  ordersThisMonth?: number;
  totalRevenue?: number;
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: stats, error: statsError } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: recentLeads, isLoading: recentLeadsLoading } = useQuery<any[]>({
    queryKey: ["/api/leads"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: recentOrders, isLoading: recentOrdersLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: lowStockItems, isLoading: lowStockLoading } = useQuery<any[]>({
    queryKey: ["/api/inventory"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<any[]>({
    queryKey: ["/api/tasks"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Data import mutation
  const importData = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/import-data");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Data Import Successful",
        description: "Excel data has been imported successfully. Please refresh the page to see the new data.",
      });
      // Refresh all queries to show new data
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Data Import Failed",
        description: `Failed to import data: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const statCards = [
    {
      title: "New Leads Today",
      value: stats?.newLeadsToday || 0,
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "blue"
    },
    {
      title: "Quotations Sent",
      value: stats?.quotationsSent || 0,
      change: "+8%",
      trend: "up",
      icon: FileText,
      color: "green"
    },
    {
      title: "Orders This Month",
      value: stats?.ordersThisMonth || 0,
      change: "+15%",
      trend: "up",
      icon: ShoppingCart,
      color: "purple"
    },
    {
      title: "Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: "+23%",
      trend: "up",
      icon: Receipt,
      color: "orange"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      green: "bg-green-50 text-green-700 border-green-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Quick Actions handlers
  const handleAddNewLead = () => {
    setLocation("/leads");
  };

  const handleCreateQuotation = () => {
    setLocation("/quotations");
  };

  const handleNewOrder = () => {
    setLocation("/orders");
  };

  const handleCheckInventory = () => {
    setLocation("/inventory");
  };

  return (
    <Layout>
      <div className="p-6 space-y-6 page-transition">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-8 mb-6">
          <div className="absolute inset-0 bg-gradient-mesh opacity-50"></div>
          <div className="relative flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2 animate-fade-in-up">Dashboard</h1>
              <p className="text-lg text-blue-100">Welcome back! Here's what's happening today.</p>
          </div>
            <div className="flex items-center space-x-3">
              <div className="glass-effect rounded-full px-4 py-2 backdrop-blur-md">
          <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-900">Live</span>
                </div>
              </div>
              <span className="text-sm text-white/90 hidden md:block">Last updated 2 minutes ago</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {statsError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading dashboard data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {statsError instanceof Error ? statsError.message : 'Unknown error occurred'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid with enhanced animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <Card 
              key={index} 
              className="card-hover border-0 shadow-lg overflow-hidden group relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${getColorClasses(card.color)} blur-xl`}></div>
              
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                    {card.title}
                  </CardTitle>
                  <div className={`p-3 rounded-xl ${getColorClasses(card.color)} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    {card.value}
                  </div>
                  <div className={`flex items-center text-sm font-semibold px-2 py-1 rounded-full ${
                    card.trend === 'up' 
                      ? 'bg-green-100 text-green-700 group-hover:bg-green-200' 
                      : 'bg-red-100 text-red-700 group-hover:bg-red-200'
                  } transition-colors duration-300`}>
                    {card.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {card.change}
                  </div>
                </div>
            </CardContent>
          </Card>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Leads */}
          <Card className="border-0 shadow-lg glass-effect card-hover">
            <CardHeader>
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Recent Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLeadsLoading ? (
                  [...Array(5)].map((_, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg">
                      <div className="w-8 h-8 bg-slate-100 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28 mt-2" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))
                ) : recentLeads && recentLeads.length > 0 ? (
                  recentLeads.slice(0, 5).map((lead: any, idx: number) => (
                    <div 
                      key={lead.id} 
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-blue-200"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                          {lead.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {lead.company}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs group-hover:bg-blue-100 group-hover:border-blue-300 transition-colors">
                        {lead.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 p-3">No recent leads</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-0 shadow-lg glass-effect card-hover">
            <CardHeader>
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrdersLoading ? (
                  [...Array(5)].map((_, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg">
                      <div className="w-8 h-8 bg-slate-100 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28 mt-2" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-24 ml-auto" />
                        <Skeleton className="h-5 w-16 ml-auto mt-2" />
                      </div>
                    </div>
                  ))
                ) : recentOrders && recentOrders.length > 0 ? (
                  recentOrders.slice(0, 5).map((order: any, idx: number) => (
                    <div 
                      key={order.id} 
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-green-200"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                        <ShoppingCart className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-700 transition-colors">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {order.customerName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                          ₹{Number(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <Badge variant="outline" className="text-xs group-hover:bg-green-100 group-hover:border-green-300 transition-colors mt-1">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 p-3">No recent orders</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg glass-effect card-hover">
            <CardHeader>
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button 
                  onClick={handleAddNewLead}
                  className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-left transition-all duration-300 cursor-pointer group border border-blue-200 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Add New Lead</span>
                </button>
                
                <button 
                  onClick={handleCreateQuotation}
                  className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-left transition-all duration-300 cursor-pointer group border border-green-200 hover:border-green-300 hover:shadow-md"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Create Quotation</span>
                </button>
                
                <button 
                  onClick={handleNewOrder}
                  className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-left transition-all duration-300 cursor-pointer group border border-purple-200 hover:border-purple-300 hover:shadow-md"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">New Order</span>
                </button>
                
                <button 
                  onClick={handleCheckInventory}
                  className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-left transition-all duration-300 cursor-pointer group border border-orange-200 hover:border-orange-300 hover:shadow-md"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">Check Inventory</span>
                </button>

                <button 
                  onClick={() => importData.mutate()}
                  disabled={importData.isPending}
                  className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 text-left transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group border border-indigo-200 hover:border-indigo-300 hover:shadow-md disabled:hover:shadow-none"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    {importData.isPending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Database className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                    {importData.isPending ? 'Importing...' : 'Import Excel Data'}
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Alerts Section */}
        {((lowStockItems && lowStockItems.length > 0) || (tasks && tasks.length > 0) || lowStockLoading || tasksLoading) && (
          <Card className="border-0 shadow-lg glass-effect card-hover">
            <CardHeader>
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockLoading ? (
                  [...Array(3)].map((_, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <div className="h-4 w-4 bg-yellow-200 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32 mt-2" />
                      </div>
                    </div>
                  ))
                ) : lowStockItems?.filter((item: any) => item.quantity < 10).slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:shadow-md transition-all duration-300 group cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                        Low stock alert: {item.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Only {item.quantity} units remaining
                      </p>
                    </div>
                  </div>
                ))}
                
                {tasksLoading ? (
                  [...Array(3)].map((_, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="h-4 w-4 bg-blue-200 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32 mt-2" />
                      </div>
                    </div>
                  ))
                ) : tasks?.filter((task: any) => task.status === 'pending').slice(0, 3).map((task: any) => (
                  <div key={task.id} className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-md transition-all duration-300 group cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <ClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        Pending task: {task.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
