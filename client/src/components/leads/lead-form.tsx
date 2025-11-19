import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { X, User, Building, Mail, Phone, MapPin, Target, FileText, Package, CheckCircle2, Save, Loader2, Plus, Trash2, Globe } from "lucide-react";
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

const useSources = () => {
  const { data: allSources = [] } = useQuery<any[]>({ queryKey: ["/api/lead-sources"] });
  return allSources.filter((s: any) => s.isActive).map((s: any) => ({ value: s.key, label: s.name }));
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
  const sources = useSources();
  const [activeTab, setActiveTab] = useState("basic");
  const [autoSaved, setAutoSaved] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: defaultValues?.name || "",
    email: defaultValues?.email || "",
    phone: defaultValues?.phone || "",
    company: defaultValues?.company || "",
    position: defaultValues?.position || "",
    address: defaultValues?.address || "",
    city: defaultValues?.city || "",
    state: defaultValues?.state || "",
    country: defaultValues?.country || "India",
    pincode: defaultValues?.pincode || "",
    gstNumber: defaultValues?.gstNumber || "",
    panNumber: defaultValues?.panNumber || "",
    category: defaultValues?.category || "industry",
    source: defaultValues?.source || "website",
    status: defaultValues?.status || "new",
    notes: defaultValues?.notes || "",
    probability: (defaultValues as any)?.probability ?? 0,
    opportunityStage: (defaultValues as any)?.opportunityStage || "prospecting",
    assignedProducts: Array.isArray((defaultValues as any)?.assignedProducts) ? (defaultValues as any)?.assignedProducts : [],
  });
  const { data: inventoryItems } = useQuery<any[]>({ queryKey: ["/api/inventory"] });

  // Calculate progress
  const calculateProgress = () => {
    if (!formData) return 0;
    const required = ['name', 'email', 'company', 'category', 'source', 'status'];
    const filled = required.filter(f => formData[f] && formData[f].toString().trim() !== '');
    return Math.round((filled.length / required.length) * 100);
  };

  const progress = calculateProgress();

  // Auto-save
  useEffect(() => {
    if (mode === "edit" && formData.name && formData.email) {
      const timer = setTimeout(() => {
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 3000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, mode]);

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
    <div className="w-full animate-fade-in-up">
      {/* Progress Header */}
      <Card className="border-0 shadow-lg glass-effect mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {mode === "edit" ? "Edit Lead" : "Create New Lead"}
                </h3>
                <p className="text-sm text-gray-500">
                  {progress}% Complete • Fill all required fields
                </p>
              </div>
            </div>
            {autoSaved && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <Save className="h-3 w-3" />
                Auto-saved
              </Badge>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="basic" className="rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-semibold">
              <User className="h-4 w-4 mr-2" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="company" className="rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-semibold">
              <Building className="h-4 w-4 mr-2" />
              Company
            </TabsTrigger>
            <TabsTrigger value="opportunity" className="rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-semibold">
              <Target className="h-4 w-4 mr-2" />
              Opportunity
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-semibold">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-6 animate-fade-in-up">
            <Card className="border-0 shadow-lg glass-effect card-hover">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="John Doe"
                      required
                      className="h-10 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="h-10 pl-10 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+91 98765 43210"
                        className="h-10 pl-10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-semibold">Position</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleChange("position", e.target.value)}
                      placeholder="Job Title"
                      className="h-10 transition-all duration-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-6 animate-fade-in-up">
            <Card className="border-0 shadow-lg glass-effect card-hover">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-green-100">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Building className="h-5 w-5" />
                  Company Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-semibold flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    Company Name *
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    placeholder="Company Name"
                    required
                    className="h-10 transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Street Address
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Enter company address"
                    rows={3}
                    className="resize-none transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="City"
                      className="h-10 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      placeholder="State"
                      className="h-10 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      Country
                    </Label>
                    <Select value={formData.country} onValueChange={(value) => handleChange("country", value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="UK">UK</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => handleChange("pincode", e.target.value)}
                      placeholder="Pincode"
                      className="h-10 transition-all duration-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg glass-effect card-hover">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <FileText className="h-5 w-5" />
                  Tax Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input
                      id="gstNumber"
                      value={formData.gstNumber}
                      onChange={(e) => handleChange("gstNumber", e.target.value)}
                      placeholder="GST Number"
                      className="h-10 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input
                      id="panNumber"
                      value={formData.panNumber}
                      onChange={(e) => handleChange("panNumber", e.target.value)}
                      placeholder="PAN Number"
                      className="h-10 transition-all duration-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Opportunity Tab */}
          <TabsContent value="opportunity" className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg glass-effect card-hover">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Target className="h-5 w-5" />
                    Lead Classification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
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
                    <Label htmlFor="source" className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      Lead Source *
                    </Label>
                    <Select value={formData.source} onValueChange={(value) => handleChange("source", value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {sources.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-semibold">Status *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
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
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg glass-effect card-hover">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <Target className="h-5 w-5" />
                    Opportunity Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="probability" className="text-sm font-semibold">Probability (%)</Label>
                    <Input
                      id="probability"
                      type="number"
                      min={0}
                      max={100}
                      value={(formData as any).probability}
                      onChange={(e) => setFormData(prev => ({ ...prev, probability: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))}
                      className="h-10 transition-all duration-200"
                    />
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(formData as any).probability || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opportunityStage" className="text-sm font-semibold">Opportunity Stage</Label>
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
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg glass-effect card-hover">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Add any additional notes about this lead..."
                  rows={6}
                  className="resize-none transition-all duration-200"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6 animate-fade-in-up">
            <Card className="border-0 shadow-lg glass-effect card-hover">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-indigo-700">
                    <Package className="h-5 w-5" />
                    Assigned Products
                  </CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addAssignedProduct}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 border-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {formData && Array.isArray((formData as any).assignedProducts) && (formData as any).assignedProducts.length > 0 ? (
                  <div className="space-y-3">
                    {(formData as any).assignedProducts.map((item: any, idx: number) => (
                      <Card key={idx} className="border border-gray-200 hover:border-blue-300 transition-all duration-200">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                            <div className="md:col-span-2">
                              <Label className="text-xs font-semibold text-gray-700">Description</Label>
                              <Input 
                                value={item.description || ""} 
                                onChange={(e) => updateAssignedProduct(idx, "description", e.target.value)}
                                placeholder="Product description"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-gray-700">Quantity</Label>
                              <Input 
                                type="number" 
                                value={item.quantity || 1} 
                                onChange={(e) => updateAssignedProduct(idx, "quantity", Number(e.target.value)||1)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-gray-700">Rate (₹)</Label>
                              <Input 
                                type="number" 
                                value={item.rate || 0} 
                                onChange={(e) => updateAssignedProduct(idx, "rate", Number(e.target.value)||0)}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex justify-end">
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="sm"
                                onClick={() => removeAssignedProduct(idx)}
                                className="h-9"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-4">No products assigned yet</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addAssignedProduct}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {progress < 100 ? `Complete ${progress}% to finish` : "All fields completed ✓"}
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || progress < 50}
            className="min-w-[160px] bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold h-11 text-base disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {mode === "edit" ? "Update Lead" : "Create Lead"}
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
