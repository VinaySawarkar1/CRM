import { useState } from "react";
import { Lead } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, User, Building, Mail, Phone, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface LeadFormProps {
  defaultValues?: Lead;
  onSubmit: (lead: Omit<Lead, "id" | "createdAt">) => void;
  isSubmitting?: boolean;
  mode: "create" | "edit";
}

const useCategories = () => {
  const { data: allCategories = [] } = useQuery<any[]>({ queryKey: ["/api/lead-categories"] });
  return allCategories.filter((c: any) => c.isActive).map((c: any) => ({ value: c.key, label: c.name }));
};

const statuses = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
];

export default function LeadForm({ defaultValues, onSubmit, isSubmitting, mode }: LeadFormProps) {
  const categories = useCategories();
  const [formData, setFormData] = useState<any>({
    name: defaultValues?.name || "",
    email: defaultValues?.email || "",
    phone: defaultValues?.phone || "",
    company: defaultValues?.company || "",
    position: defaultValues?.position || "",
    address: defaultValues?.address || "",
    category: defaultValues?.category || "industry",
    status: defaultValues?.status || "new",
    notes: defaultValues?.notes || "",
    probability: (defaultValues as any)?.probability ?? 0,
    opportunityStage: (defaultValues as any)?.opportunityStage || "prospecting",
    assignedProducts: Array.isArray((defaultValues as any)?.assignedProducts) ? (defaultValues as any).assignedProducts : [],
  });
  const { data: inventoryItems } = useQuery<any[]>({ queryKey: ["/api/inventory"] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as unknown as Omit<Lead, "id" | "createdAt">);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAssignedProduct = () => {
    setFormData((prev: any) => ({ ...prev, assignedProducts: [...(prev.assignedProducts as any[]), { description: "", quantity: 1, unit: "nos", rate: 0 }] }));
  };

  const updateAssignedProduct = (idx: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const items = [...(prev.assignedProducts as any[])];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, assignedProducts: items };
    });
  };

  const removeAssignedProduct = (idx: number) => {
    setFormData((prev: any) => {
      const items = [...(prev.assignedProducts as any[])];
      items.splice(idx, 1);
      return { ...prev, assignedProducts: items };
    });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {mode === "edit" ? "Edit Lead" : "Add New Lead"}
        </h2>
      </div>
      
      <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter full name"
                    required
                    className="h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
                    className="h-10"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    className="h-10"
          />
        </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                    Position
                  </Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleChange("position", e.target.value)}
                    placeholder="Enter job position"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Building className="h-5 w-5 mr-2 text-green-600" />
                Company Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                  Company Name *
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  placeholder="Enter company name"
                  required
                  className="h-10"
          />
        </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Enter company address"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Lead Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                Lead Details
              </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange("category", value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                </div>
        </div>

              {/* Opportunity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="probability" className="text-sm font-medium text-gray-700">Opportunity Probability (%)</Label>
                  <Input id="probability" type="number" min={0} max={100} value={(formData as any).probability}
                    onChange={(e) => handleChange("probability", String(Math.max(0, Math.min(100, Number(e.target.value) || 0))))} className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opportunityStage" className="text-sm font-medium text-gray-700">Opportunity Stage</Label>
                  <Select value={(formData as any).opportunityStage} onValueChange={(v) => handleChange("opportunityStage", v)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { value: "prospecting", label: "Prospecting" },
                        { value: "qualified", label: "Qualified" },
                        { value: "proposal", label: "Proposal" },
                        { value: "negotiation", label: "Negotiation" },
                        { value: "won", label: "Won" },
                        { value: "lost", label: "Lost" }
                      ].map(s => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assigned Products for Quotation Prefill */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Assigned Products</Label>
                  <Button type="button" variant="outline" onClick={addAssignedProduct}>Add Item</Button>
                </div>
                <div className="space-y-3">
                  {Array.isArray((formData as any).assignedProducts) && (formData as any).assignedProducts.length > 0 ? (
                    (formData as any).assignedProducts.map((item: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                        <div className="md:col-span-2">
                          <Label className="text-xs text-gray-600">Description</Label>
                          <Input value={item.description || ""} onChange={(e) => updateAssignedProduct(idx, "description", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Quantity</Label>
                          <Input type="number" value={item.quantity || 1} onChange={(e) => updateAssignedProduct(idx, "quantity", Number(e.target.value)||1)} />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Unit</Label>
                          <Input value={item.unit || "nos"} onChange={(e) => updateAssignedProduct(idx, "unit", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Rate</Label>
                          <Input type="number" value={item.rate || 0} onChange={(e) => updateAssignedProduct(idx, "rate", Number(e.target.value)||0)} />
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="destructive" onClick={() => removeAssignedProduct(idx)}>Remove</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No items assigned. Add items to prefill quotation.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Add any additional notes about this lead"
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button 
            type="submit" 
                disabled={isSubmitting}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700"
          >
                {isSubmitting ? "Saving..." : mode === "edit" ? "Update Lead" : "Create Lead"}
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}
