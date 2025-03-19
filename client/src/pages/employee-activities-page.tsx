import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { EmployeeActivity, InsertEmployeeActivity } from "@shared/schema";
import PageHeader from "@/components/page-header";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmployeeActivityTable from "@/components/employee/employee-activity-table";
import EmployeeActivityForm from "@/components/employee/employee-activity-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeActivitiesPage() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<EmployeeActivity | null>(null);
  const { toast } = useToast();

  const { data: activities, isLoading, refetch } = useQuery<EmployeeActivity[]>({
    queryKey: ["/api/employee-activities"],
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: InsertEmployeeActivity) => {
      const res = await apiRequest("POST", "/api/employee-activities", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-activities"] });
      setOpenAddDialog(false);
      toast({
        title: "Activity recorded",
        description: "Employee activity has been recorded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to record activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertEmployeeActivity> }) => {
      const res = await apiRequest("PUT", `/api/employee-activities/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-activities"] });
      setOpenEditDialog(false);
      setSelectedActivity(null);
      toast({
        title: "Activity updated",
        description: "Employee activity has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/employee-activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-activities"] });
      setOpenDeleteDialog(false);
      setSelectedActivity(null);
      toast({
        title: "Activity deleted",
        description: "Employee activity has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddActivity = (data: InsertEmployeeActivity) => {
    createActivityMutation.mutate(data);
  };

  const handleEditActivity = (activity: EmployeeActivity) => {
    setSelectedActivity(activity);
    setOpenEditDialog(true);
  };

  const handleDeleteActivity = (id: number) => {
    const activity = activities?.find(a => a.id === id);
    if (activity) {
      setSelectedActivity(activity);
      setOpenDeleteDialog(true);
    }
  };

  const handleUpdateActivity = (data: Partial<InsertEmployeeActivity>) => {
    if (selectedActivity) {
      updateActivityMutation.mutate({ id: selectedActivity.id, data });
    }
  };

  const handleConfirmDelete = () => {
    if (selectedActivity) {
      deleteActivityMutation.mutate(selectedActivity.id);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <PageHeader
            title="Employee Activities"
            subtitle="Track and manage employee activities"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => setOpenAddDialog(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Activity
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <EmployeeActivityTable
            activities={activities || []}
            onEdit={handleEditActivity}
            onDelete={handleDeleteActivity}
          />
        )}

        {/* Add Dialog */}
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record New Activity</DialogTitle>
              <DialogDescription>
                Record a new employee activity. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <EmployeeActivityForm
              onSubmit={handleAddActivity}
              isSubmitting={createActivityMutation.isPending}
              mode="create"
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Activity</DialogTitle>
              <DialogDescription>
                Update the employee activity record.
              </DialogDescription>
            </DialogHeader>
            {selectedActivity && (
              <EmployeeActivityForm
                defaultValues={selectedActivity}
                onSubmit={handleUpdateActivity}
                isSubmitting={updateActivityMutation.isPending}
                mode="edit"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete the activity record for {selectedActivity?.employeeName} 
                from {selectedActivity?.date && new Date(selectedActivity.date).toLocaleDateString()}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}