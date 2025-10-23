import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type LeadCategory = { id: number; key: string; name: string; isActive: boolean };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}

export default function LeadCategoriesManager({ open, onOpenChange, onChanged }: Props) {
  const [newName, setNewName] = useState("");
  const { data: categories = [] } = useQuery<LeadCategory[]>({ queryKey: ["/api/lead-categories"] });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/lead-categories", { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-categories"] });
      onChanged?.();
    }
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<LeadCategory> }) => {
      const res = await apiRequest("PUT", `/api/lead-categories/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-categories"] });
      onChanged?.();
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/lead-categories/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-categories"] });
      onChanged?.();
    }
  });

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    createMutation.mutate(name);
    setNewName("");
  };

  const toggleActive = (id: string | number) => {
    const cat = categories.find(c => String(c.id) === String(id));
    if (!cat) return;
    updateMutation.mutate({ id: cat.id, updates: { isActive: !cat.isActive } });
  };

  const handleDelete = (id: string | number) => {
    const cat = categories.find(c => String(c.id) === String(id));
    if (!cat) return;
    deleteMutation.mutate(cat.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Lead Categories</DialogTitle>
          <DialogDescription>Enable/disable, add or remove categories. Disabled categories won't show in tabs and forms.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="New category name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Button onClick={handleAdd}>Add</Button>
          </div>

          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500">No categories defined.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between border rounded p-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{cat.id}</Badge>
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant={cat.isActive ? "secondary" : "default"} onClick={() => toggleActive(cat.id)}>
                      {cat.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(cat.id)}>Delete</Button>
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


