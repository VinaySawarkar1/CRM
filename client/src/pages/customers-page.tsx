import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Customer } from "@shared/schema";
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import CustomerTable from "@/components/customers/customer-table";
import CustomerForm from "@/components/customers/customer-form";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter } from "lucide-react";
import ExcelImportExport from "@/components/common/ExcelImportExport";

export default function CustomersPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Get all customers
  const {
    data: customers,
    isLoading,
    error
  } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Create customer mutation
  const createCustomer = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/customers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setDialogOpen(false);
      toast({
        title: "Customer Created",
        description: "New customer has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create customer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update customer mutation
  const updateCustomer = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/customers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setDialogOpen(false);
      setEditingCustomer(null);
      toast({
        title: "Customer Updated",
        description: "Customer has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update customer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete customer mutation
  const deleteCustomer = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/customers/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Customer Deleted",
        description: "Customer has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete customer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    if (editingCustomer) {
      updateCustomer.mutate({ id: editingCustomer.id, data });
    } else {
      createCustomer.mutate(data);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    setDialogOpen(true);
  };

  // Filter customers based on search and status
  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const paginatedCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);

  if (error) {
    return (
      <Layout>
        <div className="text-center my-8">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Customers</h2>
          <p className="text-gray-600">{(error as Error).message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Customers"
          subtitle="Manage your customer database"
        />

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <ExcelImportExport entity="customers" />
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm font-medium text-gray-500">Total Customers</div>
            <div className="text-2xl font-bold">{customers?.length || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm font-medium text-gray-500">Active Customers</div>
            <div className="text-2xl font-bold text-green-600">
              {customers?.filter(c => c.status === 'active').length || 0}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm font-medium text-gray-500">This Month</div>
            <div className="text-2xl font-bold text-blue-600">
              {customers?.filter(c => {
                const created = new Date(c.createdAt);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length || 0}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm font-medium text-gray-500">Total Value</div>
            <div className="text-2xl font-bold text-purple-600">
              ₹{customers?.reduce((sum, c) => sum + (parseFloat(c.creditLimit || '0') || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <CustomerTable
          customers={paginatedCustomers}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {filteredCustomers.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">Showing {(page-1)*pageSize + 1} - {Math.min(page*pageSize, filteredCustomers.length)} of {filteredCustomers.length}</div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</Button>
              <Button variant="outline" disabled={page*pageSize >= filteredCustomers.length} onClick={() => setPage(p => p+1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[1200px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleSubmit}
            isSubmitting={createCustomer.isPending || updateCustomer.isPending}
            mode={editingCustomer ? "edit" : "create"}
            defaultValues={editingCustomer || undefined}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
} 