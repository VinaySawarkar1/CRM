import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertOrderSchema, InsertOrder, Order, Lead, Inventory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";

// Define array schema for order items
const orderItemSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be a positive number"),
});

// Extend the schema for the form to add validations
const orderFormSchema = insertOrderSchema.extend({
  customerName: z.string().min(2, "Customer name must be at least 2 characters"),
  customerCompany: z.string().min(1, "Company is required"),
  orderNumber: z.string().min(3, "Order number is required"),
  status: z.string().min(1, "Status is required"),
  items: z.array(orderItemSchema),
  amount: z.number().min(0, "Amount must be a positive number"),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  defaultValues?: Partial<InsertOrder>;
  onSubmit: (data: OrderFormValues) => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
  inventoryItems: Inventory[];
  leadData?: Lead | null;
}

export default function OrderForm({
  defaultValues = {
    orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: "",
    customerCompany: "",
    status: "processing",
    items: [],
    amount: 0,
  },
  onSubmit,
  isSubmitting,
  mode,
  inventoryItems,
  leadData,
}: OrderFormProps) {
  // Preset customer data if coming from lead conversion
  useEffect(() => {
    if (leadData) {
      setValue("customerName", leadData.name);
      setValue("customerCompany", leadData.company);
    }
  }, [leadData]);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues,
  });

  const { control, setValue, watch, formState } = form;
  const watchedItems = watch("items") || [];

  // Helper to add a new item to the order
  const addItem = () => {
    const currentItems = form.getValues("items") || [];
    setValue("items", [
      ...currentItems,
      { sku: "", name: "", quantity: 1, price: 0 },
    ]);
  };

  // Helper to remove an item from the order
  const removeItem = (index: number) => {
    const currentItems = form.getValues("items");
    setValue(
      "items",
      currentItems.filter((_, i) => i !== index)
    );
    recalculateTotal();
  };

  // Helper to recalculate the total order amount
  const recalculateTotal = () => {
    const items = form.getValues("items") || [];
    const total = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    setValue("amount", total);
  };

  // When an inventory item is selected, populate its details
  const handleSkuSelect = (sku: string, index: number) => {
    const item = inventoryItems.find(i => i.sku === sku);
    if (item) {
      const currentItems = [...form.getValues("items")];
      currentItems[index] = {
        ...currentItems[index],
        sku: item.sku,
        name: item.name,
        price: item.price,
      };
      setValue("items", currentItems);
      recalculateTotal();
    }
  };

  // When quantity changes, update the total
  const handleQuantityChange = (quantity: number, index: number) => {
    const currentItems = [...form.getValues("items")];
    currentItems[index] = {
      ...currentItems[index],
      quantity,
    };
    setValue("items", currentItems);
    recalculateTotal();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="orderNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Number</FormLabel>
                <FormControl>
                  <Input {...field} readOnly={mode === "edit"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="customerCompany"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Order Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {watchedItems.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No items added to this order yet. Click "Add Item" to begin.
            </div>
          )}

          {watchedItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-end border-b pb-4">
              <div className="col-span-4">
                <FormItem>
                  <FormLabel>Item SKU</FormLabel>
                  <Select
                    onValueChange={(value) => handleSkuSelect(value, index)}
                    value={item.sku}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inventoryItems.map((invItem) => (
                        <SelectItem key={invItem.sku} value={invItem.sku}>
                          {invItem.name} ({invItem.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              </div>
              
              <div className="col-span-2">
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1, index)}
                  />
                </FormItem>
              </div>
              
              <div className="col-span-2">
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <Input
                    type="text"
                    value={formatCurrency(item.price)}
                    disabled
                  />
                </FormItem>
              </div>
              
              <div className="col-span-3">
                <FormItem>
                  <FormLabel>Subtotal</FormLabel>
                  <Input
                    type="text"
                    value={formatCurrency(item.price * item.quantity)}
                    disabled
                  />
                </FormItem>
              </div>
              
              <div className="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removeItem(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center border-t pt-4">
          <div className="text-lg font-medium">Total Amount:</div>
          <div className="text-xl font-bold">
            {formatCurrency(watch("amount") || 0)}
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-[#800000] hover:bg-[#4B0000]"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Order" : "Update Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
