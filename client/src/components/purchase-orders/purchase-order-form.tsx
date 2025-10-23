import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PurchaseOrder } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Search, Package, Edit, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TermsSelector from "../quotations/terms-selector";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const purchaseOrderSchema = z.object({
  poNumber: z.string().min(1, "PO Number is required"),
  supplierId: z.union([z.string(), z.number(), z.null()]).transform((val) => {
    if (val === null) return undefined;
    if (typeof val === 'string') {
      const parsed = parseInt(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }).optional(),
  supplierName: z.string().min(1, "Supplier name is required"),
  supplierCompany: z.string().optional(),
  supplierTitle: z.string().optional(),
  supplierAddress: z.string().optional(),
  supplierCity: z.string().optional(),
  supplierState: z.string().optional(),
  supplierCountry: z.string().optional(),
  supplierPincode: z.string().optional(),
  supplierGstin: z.string().optional(),
  supplierPan: z.string().optional(),
  supplierPhone: z.string().optional(),
  supplierEmail: z.string().optional(),
  orderDate: z.string().min(1, "Order date is required"),
  expectedDelivery: z.union([z.string(), z.null()]).optional(),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unit: z.string().min(1, "Unit is required"),
    unitPrice: z.number().min(0, "Unit price must be positive"),
    amount: z.number().optional(),
  })).min(1, "At least one item is required"),
  subtotal: z.number().optional(),
  taxAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  status: z.string().min(1, "Status is required"),
  notes: z.union([z.string(), z.null()]).optional(),
  terms: z.array(z.string()).optional(),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderFormProps {
  isSubmitting: boolean;
  mode: "create" | "edit";
  defaultValues?: PurchaseOrder;
  submitLabel?: string;
  suppliers?: any[];
  inventory?: any[];
  onSubmit: (data: PurchaseOrderFormData) => void;
}

export default function PurchaseOrderForm({
  isSubmitting,
  mode,
  defaultValues,
  submitLabel = "Create Purchase Order",
  suppliers = [],
  inventory = [],
  onSubmit,
}: PurchaseOrderFormProps) {
  const { toast } = useToast();
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");
  
  // Item editing modal state
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<any>(null);
  const [editItemIndex, setEditItemIndex] = useState<number>(-1);

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: defaultValues ? {
      ...defaultValues,
      // Convert dates to strings if they exist
      orderDate: defaultValues.orderDate ? 
        (typeof defaultValues.orderDate === 'string' ? defaultValues.orderDate : 
         defaultValues.orderDate instanceof Date ? defaultValues.orderDate.toISOString().split('T')[0] : 
         new Date(defaultValues.orderDate).toISOString().split('T')[0]) : 
        undefined,
      expectedDelivery: defaultValues.expectedDelivery ? 
        (typeof defaultValues.expectedDelivery === 'string' ? defaultValues.expectedDelivery : 
         defaultValues.expectedDelivery instanceof Date ? defaultValues.expectedDelivery.toISOString().split('T')[0] : 
         new Date(defaultValues.expectedDelivery).toISOString().split('T')[0]) : 
        undefined,
      // Ensure items have proper structure
      items: Array.isArray(defaultValues.items) ? defaultValues.items.map(item => ({
        ...item,
        quantity: typeof item.quantity === 'string' ? parseInt(item.quantity) || 1 : item.quantity || 1,
        unitPrice: typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) || 0 : item.unitPrice || 0,
        amount: item.amount ? (typeof item.amount === 'string' ? parseFloat(item.amount) || 0 : item.amount || 0) : 0,
      })) : [{ 
        description: "", 
        quantity: 1, 
        unit: "pcs", 
        unitPrice: 0, 
        amount: 0
      }],
      // Ensure numeric fields are properly handled
      subtotal: defaultValues.subtotal ? (typeof defaultValues.subtotal === 'string' ? parseFloat(defaultValues.subtotal) || 0 : defaultValues.subtotal || 0) : 0,
      taxAmount: defaultValues.taxAmount ? (typeof defaultValues.taxAmount === 'string' ? parseFloat(defaultValues.taxAmount) || 0 : defaultValues.taxAmount || 0) : 0,
      totalAmount: defaultValues.totalAmount ? (typeof defaultValues.totalAmount === 'string' ? parseFloat(defaultValues.totalAmount) || 0 : defaultValues.totalAmount || 0) : 0,
      // Handle supplierId properly
      supplierId: defaultValues.supplierId || undefined,
    } : {
      poNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName: "",
      supplierCompany: "",
      supplierTitle: "",
      supplierAddress: "",
      supplierCity: "",
      supplierState: "",
      supplierCountry: "",
      supplierPincode: "",
      supplierGstin: "",
      supplierPan: "",
      supplierPhone: "",
      supplierEmail: "",
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "draft",
      notes: "",
      items: [{ 
        description: "", 
        quantity: 1, 
        unit: "pcs", 
        unitPrice: 0, 
        amount: 0
      }],
      subtotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      terms: [],
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue, control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  // Calculate totals when items change
  useEffect(() => {
    if (watchedItems) {
      const subtotal = watchedItems.reduce((sum, item) => {
        const quantity = typeof item.quantity === 'string' ? parseInt(item.quantity) : item.quantity;
        const unitPrice = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice;
        const amount = (quantity || 0) * (unitPrice || 0);
        return sum + amount;
      }, 0);

      const taxAmount = subtotal * 0.18; // 18% GST
      const totalAmount = subtotal + taxAmount;

      setValue("subtotal", subtotal);
      setValue("taxAmount", taxAmount);
      setValue("totalAmount", totalAmount);
    }
  }, [watchedItems, setValue]);

  const handleAddItem = () => {
    append({ 
      description: "", 
      quantity: 1, 
      unit: "pcs", 
      unitPrice: 0, 
      amount: 0
    });
  };

  const handleRemoveItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleEditItem = (index: number) => {
    const item = watchedItems[index];
    setSelectedItemForEdit({
      ...item,
      quantity: typeof item.quantity === 'string' ? parseInt(item.quantity) || 1 : item.quantity,
    });
    setEditItemIndex(index);
    setShowEditItemModal(true);
  };

  const handleSaveEditedItem = () => {
    if (editItemIndex >= 0 && selectedItemForEdit) {
      const updatedItems = [...watchedItems];
      updatedItems[editItemIndex] = {
        ...selectedItemForEdit,
        amount: (selectedItemForEdit.quantity || 0) * (selectedItemForEdit.unitPrice || 0)
      };
      
      setValue("items", updatedItems);
      setShowEditItemModal(false);
      setSelectedItemForEdit(null);
      setEditItemIndex(-1);
    }
  };

  const handleItemChange = (index: number, field: keyof typeof watchedItems[0], value: any) => {
    const updatedItems = [...watchedItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate amount for this item
    const quantity = typeof updatedItems[index].quantity === 'string' ? parseInt(updatedItems[index].quantity) : updatedItems[index].quantity;
    const unitPrice = typeof updatedItems[index].unitPrice === 'string' ? parseFloat(updatedItems[index].unitPrice) : updatedItems[index].unitPrice;
    updatedItems[index].amount = (quantity || 0) * (unitPrice || 0);
    
    setValue("items", updatedItems);
  };

  const handleSupplierSelect = (supplier: any) => {
    console.log("Selected supplier data:", supplier);
    setSelectedSupplier(supplier);
    
    // Populate all vendor detail fields
    setValue("supplierId", supplier.id);
    setValue("supplierName", supplier.name);
    setValue("supplierCompany", supplier.company || "");
    setValue("supplierTitle", supplier.title || "");
    setValue("supplierAddress", supplier.addressLine1 || "");
    setValue("supplierCity", supplier.city || "");
    setValue("supplierState", supplier.state || "");
    setValue("supplierCountry", supplier.country || "");
    setValue("supplierPincode", supplier.pincode || "");
    setValue("supplierGstin", supplier.gstNumber || "");
    setValue("supplierPan", supplier.panNumber || "");
    setValue("supplierPhone", supplier.phone || "");
    setValue("supplierEmail", supplier.email || "");
    
    setIsCustomerDialogOpen(false);
    setSearchTerm("");
  };

  const handleInventorySelect = (item: any) => {
    const newItem = {
      description: item.name,
      quantity: 1,
      unit: item.unit || "pcs",
      unitPrice: item.costPrice || 0,
      amount: ((item.costPrice || 0) * 1),
    };
    append(newItem);
    setIsInventoryDialogOpen(false);
    setInventorySearchTerm("");
  };

  const onFormSubmit = (data: PurchaseOrderFormData) => {
    // Validate that at least one item has a description
    const validItems = data.items.filter(item => item.description.trim());
    if (validItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one item with description is required",
        variant: "destructive",
      });
      return;
    }

    // Update items with calculated amounts
    const processedData = {
      ...data,
      items: data.items.map(item => ({
        ...item,
        amount: (item.quantity || 0) * (item.unitPrice || 0)
      }))
    };

    // Call the parent's onSubmit
    onSubmit(processedData);
  };

  return (
    <div className="p-6">
      {/* Item Editing Modal */}
      {showEditItemModal && selectedItemForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Edit Item</h2>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleSaveEditedItem()}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditItemModal(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Description Section */}
              <div>
                <Label>Description</Label>
                <Textarea
                  value={selectedItemForEdit?.description || ""}
                  onChange={(e) => setSelectedItemForEdit({
                    ...selectedItemForEdit,
                    description: e.target.value
                  })}
                  rows={3}
                  placeholder="Item description"
                />
              </div>

              {/* Quantity, Unit, Unit Price Section */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={selectedItemForEdit?.quantity || 1}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1;
                      const unitPrice = parseFloat(selectedItemForEdit?.unitPrice || "0") || 0;
                      const amount = newQuantity * unitPrice;
                      
                      setSelectedItemForEdit({
                        ...selectedItemForEdit,
                        quantity: newQuantity,
                        amount: amount,
                      });
                    }}
                    min="1"
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input
                    value={selectedItemForEdit?.unit || "pcs"}
                    onChange={(e) => setSelectedItemForEdit({
                      ...selectedItemForEdit,
                      unit: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>Unit Price</Label>
                  <div className="flex items-center">
                    <span className="text-sm mr-1">@ ₹</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={selectedItemForEdit?.unitPrice || 0}
                      onChange={(e) => {
                        const newUnitPrice = parseFloat(e.target.value) || 0;
                        const quantity = parseInt(selectedItemForEdit?.quantity || "1") || 1;
                        const amount = quantity * newUnitPrice;
                        
                        setSelectedItemForEdit({
                          ...selectedItemForEdit,
                          unitPrice: newUnitPrice,
                          amount: amount,
                        });
                      }}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Totals */}
              <div className="bg-orange-100 p-4 rounded">
                <div className="text-orange-800 font-medium mb-2">
                  Quantity: {selectedItemForEdit?.quantity || 0}
                </div>
                <div className="text-orange-800 font-medium">
                  Unit Price: ₹ {parseFloat(selectedItemForEdit?.unitPrice || "0").toFixed(2)}
                </div>
                <div className="text-orange-800 font-medium mt-2 border-t pt-2">
                  Total Amount: ₹ {parseFloat(selectedItemForEdit?.amount || "0").toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <div className="flex gap-2">
                <Input
                  id="supplier"
                  placeholder="Search customers..."
                  className="flex-1 cursor-pointer"
                  value={selectedSupplier ? `${selectedSupplier.name}${selectedSupplier.company ? ` - ${selectedSupplier.company}` : ''}` : ""}
                  readOnly
                  onClick={() => setIsCustomerDialogOpen(true)}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  className="px-3"
                  onClick={() => setIsCustomerDialogOpen(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  className="px-3"
                  onClick={() => window.open('/customers/new', '_blank')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                💡 Select a customer to use as supplier, or add a new customer
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="poNumber">PO Number <span className="text-red-500">*</span></Label>
                <Input
                  id="poNumber"
                  {...register("poNumber")}
                  placeholder="Auto-generated"
                />
              </div>
              <div>
                <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                <Select onValueChange={(value) => setValue("status", value)} defaultValue={defaultValues?.status || "draft"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orderDate">Order Date <span className="text-red-500">*</span></Label>
                <Input
                  id="orderDate"
                  type="date"
                  {...register("orderDate")}
                />
              </div>
              <div>
                <Label htmlFor="expectedDelivery">Expected Delivery</Label>
                <Input
                  id="expectedDelivery"
                  type="date"
                  {...register("expectedDelivery")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Search Dialog */}
        <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Select Customer as Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {suppliers.filter(supplier =>
                    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (supplier.company && supplier.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).map((supplier) => (
                    <div
                      key={supplier.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSupplierSelect(supplier)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{supplier.name}</div>
                          {supplier.company && (
                            <div className="text-sm text-gray-600">Company: {supplier.company}</div>
                          )}
                          {supplier.email && (
                            <div className="text-sm text-gray-500">Email: {supplier.email}</div>
                          )}
                          {supplier.phone && (
                            <div className="text-sm text-gray-500">Phone: {supplier.phone}</div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSupplierSelect(supplier);
                          }}
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  ))}
                  {suppliers.filter(supplier =>
                    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (supplier.company && supplier.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No customers found matching your search.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>

        {/* Items Section */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end border p-3 rounded">
                  <div className="col-span-4">
                    <Label>Description *</Label>
                    <Input
                      {...register(`items.${index}.description`)}
                      placeholder="Item description"
                      className={errors.items?.[index]?.description ? "border-red-500" : ""}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      {...register(`items.${index}.quantity`)}
                      min="1"
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Unit *</Label>
                    <Input
                      {...register(`items.${index}.unit`)}
                      placeholder="pcs"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Unit Price *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unitPrice`)}
                      min="0"
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Label>Amount</Label>
                    <Input
                      value={watchedItems?.[index]?.amount || 0}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditItem(index)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      disabled={fields.length === 1}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddItem}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
                <Dialog open={isInventoryDialogOpen} onOpenChange={setIsInventoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Package className="h-4 w-4 mr-2" />
                      From Inventory
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Select Item from Inventory</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search inventory by name, SKU, or description..."
                          value={inventorySearchTerm}
                          onChange={(e) => setInventorySearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <ScrollArea className="h-96">
                        <div className="space-y-2">
                          {inventory.filter(item =>
                            item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
                            (item.sku && item.sku.toLowerCase().includes(inventorySearchTerm.toLowerCase())) ||
                            (item.description && item.description.toLowerCase().includes(inventorySearchTerm.toLowerCase()))
                          ).map((item) => (
                            <div
                              key={item.id}
                              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleInventorySelect(item)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  {item.sku && (
                                    <div className="text-sm text-gray-600">SKU: {item.sku}</div>
                                  )}
                                  {item.description && (
                                    <div className="text-sm text-gray-500">{item.description}</div>
                                  )}
                                  <div className="text-sm text-blue-600">
                                    Cost: ₹{item.costPrice || 0} | Stock: {item.quantity || 0}
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInventorySelect(item);
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                          ))}
                          {inventory.filter(item =>
                            item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
                            (item.sku && item.sku.toLowerCase().includes(inventorySearchTerm.toLowerCase())) ||
                            (item.description && item.description.toLowerCase().includes(inventorySearchTerm.toLowerCase()))
                          ).length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              No inventory items found matching your search.
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totals Section */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Subtotal</Label>
                  <Input
                    value={watch("subtotal") || "0"}
                    readOnly
                    className="bg-gray-50 font-semibold"
                  />
                </div>
                <div>
                  <Label>Tax Amount (18% GST)</Label>
                  <Input
                    value={watch("taxAmount") || "0"}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <Input
                    value={watch("totalAmount") || "0"}
                    readOnly
                    className="bg-gray-50 font-semibold text-lg"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Additional notes or special instructions..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <TermsSelector
              selectedTerms={watch("terms") || []}
              onTermsChange={(terms) => setValue("terms", terms)}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
