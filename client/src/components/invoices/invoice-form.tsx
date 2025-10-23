import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Invoice } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  subject: z.string().min(1, "Subject is required"),
  customerId: z.number().optional(),
  quotationId: z.number().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  status: z.string().default("draft"),
  notes: z.string().optional(),
  subtotal: z.string().optional(),
  taxAmount: z.string().optional(),
  totalAmount: z.string().optional(),
  paidAmount: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
  defaultValues?: Invoice;
}

export default function InvoiceForm({
  onSubmit,
  isSubmitting,
  mode,
  defaultValues,
}: InvoiceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: defaultValues ? {
      invoiceNumber: defaultValues.invoiceNumber,
      subject: defaultValues.subject,
      customerId: defaultValues.customerId || undefined,
      quotationId: defaultValues.quotationId || undefined,
      dueDate: defaultValues.dueDate,
      invoiceDate: defaultValues.invoiceDate,
      status: defaultValues.status,
      notes: defaultValues.notes || "",
      subtotal: defaultValues.subtotal || "",
      taxAmount: defaultValues.taxAmount || "",
      totalAmount: defaultValues.totalAmount || "",
      paidAmount: defaultValues.paidAmount || "",
    } : {
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "draft",
      subtotal: "0",
      taxAmount: "0",
      totalAmount: "0",
      paidAmount: "0",
    },
  });

  const handleFormSubmit = (data: InvoiceFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                {...register("invoiceNumber")}
                placeholder="Auto-generated"
                className={errors.invoiceNumber ? "border-red-500" : ""}
              />
              {errors.invoiceNumber && (
                <p className="text-sm text-red-500">{errors.invoiceNumber.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                {...register("subject")}
                placeholder="Invoice subject"
                className={errors.subject ? "border-red-500" : ""}
              />
              {errors.subject && (
                <p className="text-sm text-red-500">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                type="number"
                {...register("customerId", { valueAsNumber: true })}
                placeholder="Customer ID"
              />
            </div>

            <div>
              <Label htmlFor="quotationId">Quotation ID</Label>
              <Input
                id="quotationId"
                type="number"
                {...register("quotationId", { valueAsNumber: true })}
                placeholder="Quotation ID (optional)"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dates & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                {...register("invoiceDate")}
                className={errors.invoiceDate ? "border-red-500" : ""}
              />
              {errors.invoiceDate && (
                <p className="text-sm text-red-500">{errors.invoiceDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                {...register("dueDate")}
                className={errors.dueDate ? "border-red-500" : ""}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={watch("status")} onValueChange={(value) => setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="subtotal">Subtotal (₹)</Label>
              <Input
                id="subtotal"
                type="number"
                step="0.01"
                {...register("subtotal")}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="taxAmount">Tax Amount (₹)</Label>
              <Input
                id="taxAmount"
                type="number"
                step="0.01"
                {...register("taxAmount")}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="totalAmount">Total Amount (₹)</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                {...register("totalAmount")}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="paidAmount">Paid Amount (₹)</Label>
              <Input
                id="paidAmount"
                type="number"
                step="0.01"
                {...register("paidAmount")}
                placeholder="0.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register("notes")}
            placeholder="Additional notes..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Invoice" : "Update Invoice"}
        </Button>
      </div>
    </form>
  );
} 