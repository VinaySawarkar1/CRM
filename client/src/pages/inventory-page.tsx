import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Inventory } from "@shared/schema";
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import InventoryTable from "@/components/inventory/inventory-table";
import InventoryForm from "@/components/inventory/inventory-form";
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
import { Plus, Loader2 } from "lucide-react";
import ExcelImportExport from "@/components/common/ExcelImportExport";
import { Input } from "@/components/ui/input";

export default function InventoryPage() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [currentItem, setCurrentItem] = useState<Inventory | null>(null);

  // Get all inventory items
  const {
    data: inventoryItems,
    isLoading,
    error,
  } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  // Create inventory item mutation
  const createInventoryItem = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/inventory", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      setCreateDialogOpen(false);
      toast({
        title: "Item Created",
        description: "New inventory item has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create inventory item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update inventory item mutation
  const updateInventoryItem = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/inventory/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      setEditDialogOpen(false);
      toast({
        title: "Item Updated",
        description: "Inventory item has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update inventory item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete inventory item mutation
  const deleteInventoryItem = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      setDeleteDialogOpen(false);
      toast({
        title: "Item Deleted",
        description: "Inventory item has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete inventory item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (item: Inventory) => {
    setCurrentItem(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    const item = inventoryItems?.find(item => item.id === id);
    if (item) {
      setCurrentItem(item);
      setDeleteDialogOpen(true);
    }
  };

  // Filter inventory items based on search query
  const filteredItems = inventoryItems?.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    );
  });

  const paginatedItems = (filteredItems || []).slice((page-1)*pageSize, page*pageSize);

  return (
    <Layout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Inventory Management"
          subtitle="Manage and track your inventory items"
        />

        {/* Search, Import/Export and Add */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="w-full sm:w-auto mb-4 sm:mb-0">
            <Input
              className="max-w-xs"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-3">
            <ExcelImportExport entity="inventory" />
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-[#800000] hover:bg-[#4B0000]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </div>
        </div>

        {/* Inventory Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading inventory: {(error as Error).message}</p>
          </div>
        ) : (
          <>
            <InventoryTable
              items={paginatedItems || []}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {filteredItems && filteredItems.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">Showing {(page-1)*pageSize + 1} - {Math.min(page*pageSize, filteredItems.length)} of {filteredItems.length}</div>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</Button>
                  <Button variant="outline" disabled={page*pageSize >= filteredItems.length} onClick={() => setPage(p => p+1)}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Inventory Item Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>
                Fill in the details for the new inventory item.
              </DialogDescription>
            </DialogHeader>
            <InventoryForm
              onSubmit={(data) => createInventoryItem.mutate(data)}
              isSubmitting={createInventoryItem.isPending}
              mode="create"
            />
          </DialogContent>
        </Dialog>

        {/* Edit Inventory Item Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
              <DialogDescription>
                Update the inventory item information.
              </DialogDescription>
            </DialogHeader>
            {currentItem && (
              <InventoryForm
                defaultValues={currentItem}
                onSubmit={(data) => updateInventoryItem.mutate({ id: currentItem.id, data })}
                isSubmitting={updateInventoryItem.isPending}
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
                This will permanently delete the inventory item "{currentItem?.name}" ({currentItem?.sku}).
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => currentItem && deleteInventoryItem.mutate(currentItem.id)}
              >
                {deleteInventoryItem.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
