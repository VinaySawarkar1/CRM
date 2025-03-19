import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "@shared/schema";
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import LeadTable from "@/components/leads/lead-table";
import LeadForm from "@/components/leads/lead-form";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import OrderForm from "@/components/orders/order-form";
import { Plus, Loader2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LeadsPage() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  
  // Categories mapping for display
  const categoryLabels: Record<string, string> = {
    "industry": "Industry",
    "calibration_labs": "Calibration Labs",
    "vision_measuring_machine": "Vision Measuring Machine",
    "data_logger": "Data Logger",
    "calibration_software": "Calibration Software",
    "meatest": "Meatest",
    "finalization": "Finalization",
    "waiting_for_po": "Waiting for PO"
  };

  // Get all leads
  const {
    data: leads,
    isLoading,
    error,
  } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  // Get all inventory items for order creation
  const {
    data: inventoryItems,
    isLoading: isLoadingInventory
  } = useQuery<any[]>({
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
      setCreateDialogOpen(false);
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

  // Update lead mutation
  const updateLead = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/leads/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setEditDialogOpen(false);
      toast({
        title: "Lead Updated",
        description: "Lead has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete lead mutation
  const deleteLead = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setDeleteDialogOpen(false);
      toast({
        title: "Lead Deleted",
        description: "Lead has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create order mutation (for lead conversion)
  const createOrder = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setConvertDialogOpen(false);
      
      // Update lead status to 'converted'
      if (currentLead) {
        updateLead.mutate({
          id: currentLead.id,
          data: { ...currentLead, status: "converted" }
        });
      }
      
      toast({
        title: "Lead Converted",
        description: "Lead has been converted to an order successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to convert lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (lead: Lead) => {
    setCurrentLead(lead);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    const lead = leads?.find(lead => lead.id === id);
    if (lead) {
      setCurrentLead(lead);
      setDeleteDialogOpen(true);
    }
  };

  const handleConvertToOrder = (lead: Lead) => {
    setCurrentLead(lead);
    setConvertDialogOpen(true);
  };

  // Calculate category counts
  const getCategoryCounts = () => {
    const counts: Record<string, number> = { all: 0 };
    if (!leads) return counts;
    
    leads.forEach(lead => {
      counts.all++;
      if (!counts[lead.category]) {
        counts[lead.category] = 0;
      }
      counts[lead.category]++;
    });
    
    return counts;
  };
  
  const categoryCounts = getCategoryCounts();
  
  // Filter leads based on search query and selected category
  const filteredLeads = leads?.filter(lead => {
    // Category filter
    if (selectedCategory !== "all" && lead.category !== selectedCategory) {
      return false;
    }
    
    // Search query filter
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.company.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.status.toLowerCase().includes(query)
    );
  });

  return (
    <Layout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Lead Management"
          subtitle="Manage and track potential client leads"
        />

        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="w-full sm:w-auto mb-4 sm:mb-0">
            <Input
              className="max-w-xs"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-[#800000] hover:bg-[#4B0000]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Lead
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="mb-4 overflow-x-auto flex flex-nowrap pb-1 scrollbar-hide">
              <TabsTrigger value="all" className="whitespace-nowrap">
                All Leads
                <Badge variant="outline" className="ml-2 bg-gray-100">{categoryCounts.all || 0}</Badge>
              </TabsTrigger>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <TabsTrigger key={value} value={value} className="whitespace-nowrap">
                  {label}
                  <Badge variant="outline" className="ml-2 bg-gray-100">{categoryCounts[value] || 0}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={selectedCategory} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">Error loading leads: {(error as Error).message}</p>
                </div>
              ) : filteredLeads && filteredLeads.length > 0 ? (
                <LeadTable
                  leads={filteredLeads}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onConvertToOrder={handleConvertToOrder}
                />
              ) : (
                <div className="text-center py-12 border rounded-md bg-gray-50">
                  <p className="text-gray-500">No leads found in this category. Add a new lead to get started.</p>
                  <Button 
                    onClick={() => setCreateDialogOpen(true)}
                    className="mt-4 bg-[#800000] hover:bg-[#4B0000]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Lead
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Create Lead Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>
                Enter the details for the new lead.
              </DialogDescription>
            </DialogHeader>
            <LeadForm
              onSubmit={(data) => createLead.mutate(data)}
              isSubmitting={createLead.isPending}
              mode="create"
            />
          </DialogContent>
        </Dialog>

        {/* Edit Lead Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
              <DialogDescription>
                Update the lead information.
              </DialogDescription>
            </DialogHeader>
            {currentLead && (
              <LeadForm
                defaultValues={currentLead}
                onSubmit={(data) => updateLead.mutate({ id: currentLead.id, data })}
                isSubmitting={updateLead.isPending}
                mode="edit"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the lead for {currentLead?.name} from {currentLead?.company}.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => currentLead && deleteLead.mutate(currentLead.id)}
              >
                {deleteLead.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Convert to Order Dialog */}
        <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Convert Lead to Order</DialogTitle>
              <DialogDescription>
                Create a new order based on this lead.
              </DialogDescription>
            </DialogHeader>
            {currentLead && (
              <OrderForm
                onSubmit={(data) => createOrder.mutate(data)}
                isSubmitting={createOrder.isPending}
                mode="create"
                inventoryItems={inventoryItems || []}
                leadData={currentLead}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
