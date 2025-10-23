import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ManufacturingJob } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const manufacturingSchema = z.object({
  jobNumber: z.string().min(1, "Job number is required"),
  productName: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  orderId: z.number().optional(),
  department: z.string().min(1, "Department is required"),
  priority: z.string().default("medium"),
  status: z.string().default("pending"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  startDate: z.string().min(1, "Start date is required"),
  expectedCompletion: z.string().min(1, "Expected completion date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
  materials: z.string().optional(),
  instructions: z.string().optional(),
});

type ManufacturingFormData = z.infer<typeof manufacturingSchema>;

interface ManufacturingFormProps {
  onSubmit: (data: ManufacturingFormData) => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
  defaultValues?: ManufacturingJob;
}

export default function ManufacturingForm({
  onSubmit,
  isSubmitting,
  mode,
  defaultValues,
}: ManufacturingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ManufacturingFormData>({
    resolver: zodResolver(manufacturingSchema),
    defaultValues: defaultValues ? {
      jobNumber: defaultValues.jobNumber,
      productName: defaultValues.productName,
      description: defaultValues.description,
      orderId: defaultValues.orderId || undefined,
      department: defaultValues.department,
      priority: defaultValues.priority,
      status: defaultValues.status,
      quantity: defaultValues.quantity,
      startDate: defaultValues.startDate,
      expectedCompletion: defaultValues.expectedCompletion,
      dueDate: defaultValues.dueDate,
      notes: defaultValues.notes || "",
      materials: defaultValues.materials || "",
      instructions: defaultValues.instructions || "",
    } : {
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: "medium",
      status: "pending",
      quantity: 1,
      department: "Production",
      expectedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  const handleFormSubmit = (data: ManufacturingFormData) => {
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
              <Label htmlFor="jobNumber">Job Number</Label>
              <Input
                id="jobNumber"
                {...register("jobNumber")}
                placeholder="Auto-generated"
                className={errors.jobNumber ? "border-red-500" : ""}
              />
              {errors.jobNumber && (
                <p className="text-sm text-red-500">{errors.jobNumber.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                {...register("productName")}
                placeholder="Product name"
                className={errors.productName ? "border-red-500" : ""}
              />
              {errors.productName && (
                <p className="text-sm text-red-500">{errors.productName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Job description"
                className={errors.description ? "border-red-500" : ""}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                type="number"
                {...register("orderId", { valueAsNumber: true })}
                placeholder="Order ID (optional)"
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                {...register("quantity", { valueAsNumber: true })}
                placeholder="1"
                min="1"
                className={errors.quantity ? "border-red-500" : ""}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={watch("department")} onValueChange={(value) => setValue("department", value)}>
                <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Assembly">Assembly</SelectItem>
                  <SelectItem value="Quality Control">Quality Control</SelectItem>
                  <SelectItem value="Packaging">Packaging</SelectItem>
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={watch("priority")} onValueChange={(value) => setValue("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={watch("status")} onValueChange={(value) => setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="expectedCompletion">Expected Completion</Label>
                <Input
                  id="expectedCompletion"
                  type="date"
                  {...register("expectedCompletion")}
                  className={errors.expectedCompletion ? "border-red-500" : ""}
                />
                {errors.expectedCompletion && (
                  <p className="text-sm text-red-500">{errors.expectedCompletion.message}</p>
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Materials and Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("materials")}
              placeholder="List required materials..."
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("instructions")}
              placeholder="Manufacturing instructions..."
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

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
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Job" : "Update Job"}
        </Button>
      </div>
    </form>
  );
} 