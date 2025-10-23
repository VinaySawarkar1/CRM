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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Live
            </Badge>
            <span className="text-sm text-gray-500">Last updated 2 minutes ago</span>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${getColorClasses(card.color)}`}>
                    <card.icon className="h-4 w-4" />
                  </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </div>
                  <div className={`flex items-center text-sm ${
                    card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
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
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Leads</CardTitle>
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
                  recentLeads.slice(0, 5).map((lead: any) => (
                    <div key={lead.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {lead.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {lead.company}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
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
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
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
                  recentOrders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {order.customerName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{Number(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <Badge variant="outline" className="text-xs">
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
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button 
                  onClick={handleAddNewLead}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-left transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Add New Lead</span>
                </button>
                
                <button 
                  onClick={handleCreateQuotation}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 text-left transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Create Quotation</span>
                </button>
                
                <button 
                  onClick={handleNewOrder}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 text-left transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">New Order</span>
                </button>
                
                <button 
                  onClick={handleCheckInventory}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-50 text-left transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Check Inventory</span>
                </button>

                <button 
                  onClick={() => importData.mutate()}
                  disabled={importData.isPending}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-50 text-left transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    {importData.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    ) : (
                      <Database className="h-4 w-4 text-indigo-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {importData.isPending ? 'Importing...' : 'Import Excel Data'}
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Alerts Section */}
        {((lowStockItems && lowStockItems.length > 0) || (tasks && tasks.length > 0) || lowStockLoading || tasksLoading) && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Alerts & Notifications</CardTitle>
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
                  <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Low stock alert: {item.name}
                      </p>
                      <p className="text-xs text-gray-600">
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
                  <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Pending task: {task.title}
                      </p>
                      <p className="text-xs text-gray-600">
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
