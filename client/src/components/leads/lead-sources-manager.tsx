import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type LeadSource = { id: number; key: string; name: string; isActive: boolean };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}

export default function LeadSourcesManager({ open, onOpenChange, onChanged }: Props) {
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const { data: sources = [] } = useQuery<LeadSource[]>({ queryKey: ["/api/lead-sources"] });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/lead-sources", { name });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to create source" }));
        throw new Error(error.message || "Failed to create source");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-sources"] });
      queryClient.refetchQueries({ queryKey: ["/api/lead-sources"] });
      toast({
        title: "Success",
        description: "Lead source created successfully.",
      });
      setNewName("");
      onChanged?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create lead source",
        variant: "destructive",
      });
    }
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<LeadSource> }) => {
      const res = await apiRequest("PUT", `/api/lead-sources/${id}`, updates);
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to update source" }));
        throw new Error(error.message || "Failed to update source");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-sources"] });
      queryClient.refetchQueries({ queryKey: ["/api/lead-sources"] });
      toast({
        title: "Success",
        description: "Lead source updated successfully.",
      });
      onChanged?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update lead source",
        variant: "destructive",
      });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/lead-sources/${id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to delete source" }));
        throw new Error(error.message || "Failed to delete source");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-sources"] });
      queryClient.refetchQueries({ queryKey: ["/api/lead-sources"] });
      toast({
        title: "Success",
        description: "Lead source deleted successfully.",
      });
      onChanged?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete lead source",
        variant: "destructive",
      });
    }
  });

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) {
      toast({
        title: "Validation Error",
        description: "Please enter a source name",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(name);
  };

  const toggleActive = (id: string | number) => {
    const source = sources.find(s => String(s.id) === String(id));
    if (!source) return;
    updateMutation.mutate({ id: source.id, updates: { isActive: !source.isActive } });
  };

  const handleDelete = (id: string | number) => {
    const source = sources.find(s => String(s.id) === String(id));
    if (!source) return;
    deleteMutation.mutate(source.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Lead Sources</DialogTitle>
          <DialogDescription>Enable/disable, add or remove lead sources. Disabled sources won't show in forms and filters.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="New source name" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd();
                }
              }}
            />
            <Button 
              onClick={handleAdd}
              disabled={createMutation.isPending || !newName.trim()}
              className="text-gray-900 bg-white hover:bg-gray-50"
            >
              {createMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </div>

          <div className="space-y-2">
            {sources.length === 0 ? (
              <p className="text-sm text-gray-500">No sources defined.</p>
            ) : (
              sources.map((source) => (
                <div key={source.id} className="flex items-center justify-between border rounded p-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{source.id}</Badge>
                    <span className="font-medium">{source.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant={source.isActive ? "secondary" : "default"} onClick={() => toggleActive(source.id)}>
                      {source.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(source.id)}>Delete</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

