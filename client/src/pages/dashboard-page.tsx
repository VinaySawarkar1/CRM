import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Lead, Order, Task, Inventory } from "@shared/schema";
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import StatsCard from "@/components/dashboard/stats-card";
import RecentLeads from "@/components/dashboard/recent-leads";
import RecentOrders from "@/components/dashboard/recent-orders";
import TasksList from "@/components/dashboard/tasks-list";
import LowStockAlert from "@/components/dashboard/low-stock-alert";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import LeadForm from "@/components/leads/lead-form";
import TaskForm from "@/components/tasks/task-form";
import { useAuth } from "@/hooks/use-auth";
import OrderForm from "@/components/orders/order-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  // Get dashboard statistics
  const {
    data: dashboardStats,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery<{
    totalLeads: number;
    activeOrders: number;
    lowStockCount: number;
    pendingTasks: number;
    recentLeads: Lead[];
    recentOrders: Order[];
    urgentTasks: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Get all tasks
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    error: tasksError
  } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Get low stock items
  const {
    data: lowStockItems,
    isLoading: isLoadingInventory,
    error: inventoryError
  } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory/low-stock"],
  });

  // Get all inventory items for order creation
  const {
    data: inventoryItems,
    isLoading: isLoadingAllInventory
  } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  // Create lead mutation
  const createLead = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/leads", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setLeadDialogOpen(false);
      toast({
        title: "Lead Created",
        description: "New lead has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setTaskDialogOpen(false);
      toast({
        title: "Task Created",
        description: "New task has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create order mutation
  const createOrder = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setOrderDialogOpen(false);
      toast({
        title: "Order Created",
        description: "New order has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTask = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/tasks/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Task Updated",
        description: "Task status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleToggleTaskComplete = (taskId: number, completed: boolean) => {
    updateTask.mutate({
      id: taskId,
      status: completed ? "completed" : "pending"
    });
  };

  if (isLoadingStats) {
    return (
      <Layout>
        <PageHeader
          title="Dashboard"
          subtitle="Overview of your business metrics"
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (statsError) {
    return (
      <Layout>
        <div className="text-center my-8">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">{(statsError as Error).message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Dashboard"
          subtitle="Overview of your business metrics"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Leads"
            value={dashboardStats?.totalLeads || 0}
            change={{
              value: 12,
              type: "increase",
              text: "12%"
            }}
            icon="leads"
            viewAllLink="/leads"
          />
          
          <StatsCard
            title="Active Orders"
            value={dashboardStats?.activeOrders || 0}
            change={{
              value: 7,
              type: "increase",
              text: "7%"
            }}
            icon="orders"
            viewAllLink="/orders"
          />
          
          <StatsCard
            title="Low Stock Items"
            value={dashboardStats?.lowStockCount || 0}
            change={{
              value: 4,
              type: "warning",
              text: "4 new"
            }}
            icon="inventory"
            viewAllLink="/inventory"
          />
          
          <StatsCard
            title="Pending Tasks"
            value={dashboardStats?.pendingTasks || 0}
            change={{
              value: 5,
              type: "warning",
              text: `${dashboardStats?.urgentTasks || 0} urgent`
            }}
            icon="tasks"
            viewAllLink="/tasks"
          />
        </div>
        
        {/* Recent Activity Section */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Leads */}
          <RecentLeads
            leads={dashboardStats?.recentLeads || []}
            onAddNew={() => setLeadDialogOpen(true)}
          />
          
          {/* Recent Orders */}
          <RecentOrders
            orders={dashboardStats?.recentOrders || []}
            onAddNew={() => setOrderDialogOpen(true)}
          />
        </div>
        
        {/* Tasks and Inventory Section */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Tasks */}
          <div className="lg:col-span-2">
            <TasksList
              tasks={tasks?.filter(t => t.status !== "completed").slice(0, 4) || []}
              onAddNew={() => setTaskDialogOpen(true)}
              onToggleComplete={handleToggleTaskComplete}
            />
          </div>
          
          {/* Low Stock Alert */}
          <div>
            <LowStockAlert
              items={lowStockItems || []}
              onRestock={() => navigate("/inventory")}
            />
          </div>
        </div>
      </div>

      {/* Lead Dialog */}
      <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <LeadForm
            onSubmit={(data) => createLead.mutate(data)}
            isSubmitting={createLead.isPending}
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={(data) => createTask.mutate(data)}
            isSubmitting={createTask.isPending}
            mode="create"
            defaultValues={{
              assignedTo: user?.name || "",
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
          </DialogHeader>
          <OrderForm
            onSubmit={(data) => createOrder.mutate(data)}
            isSubmitting={createOrder.isPending}
            mode="create"
            inventoryItems={inventoryItems || []}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
