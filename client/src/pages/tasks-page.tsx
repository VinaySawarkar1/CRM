import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@shared/schema";
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import TaskTable from "@/components/tasks/task-table";
import TaskForm from "@/components/tasks/task-form";
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
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TasksPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Get all tasks
  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setCreateDialogOpen(false);
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

  // Update task mutation
  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/tasks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setEditDialogOpen(false);
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully.",
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

  // Delete task mutation
  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setDeleteDialogOpen(false);
      toast({
        title: "Task Deleted",
        description: "Task has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (task: Task) => {
    setCurrentTask(task);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    const task = tasks?.find(task => task.id === id);
    if (task) {
      setCurrentTask(task);
      setDeleteDialogOpen(true);
    }
  };

  const handleStatusChange = (id: number, status: string) => {
    updateTask.mutate({
      id,
      data: { status }
    });
  };

  // Filter tasks based on search query and filters
  const filteredTasks = tasks?.filter(task => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !task.title.toLowerCase().includes(query) &&
        !(task.description && task.description.toLowerCase().includes(query)) &&
        !task.assignedTo.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    
    // Priority filter
    if (priorityFilter && task.priority !== priorityFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter && task.status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  return (
    <Layout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Task Management"
          subtitle="Create and manage tasks for your team"
        />

        {/* Search, Filters, and Add */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
            <Input
              className="max-w-xs"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <div className="flex gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-[#800000] hover:bg-[#4B0000]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
        </div>

        {/* Tasks Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading tasks: {(error as Error).message}</p>
          </div>
        ) : (
          <TaskTable
            tasks={filteredTasks || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Create Task Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task and assign it to a team member.
              </DialogDescription>
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

        {/* Edit Task Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Update the task information and assignment.
              </DialogDescription>
            </DialogHeader>
            {currentTask && (
              <TaskForm
                defaultValues={currentTask}
                onSubmit={(data) => updateTask.mutate({ id: currentTask.id, data })}
                isSubmitting={updateTask.isPending}
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
                This will permanently delete the task "{currentTask?.title}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => currentTask && deleteTask.mutate(currentTask.id)}
              >
                {deleteTask.isPending ? (
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
