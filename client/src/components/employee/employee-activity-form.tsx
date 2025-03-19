import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertEmployeeActivitySchema, InsertEmployeeActivity } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Extended schema with validation for the form
const employeeActivityFormSchema = insertEmployeeActivitySchema.extend({
  date: z.date({
    required_error: "Please select a date",
  }),
  activitiesPerformed: z.string().min(5, "Activities must be at least 5 characters"),
  employeeName: z.string().min(2, "Employee name is required"),
});

type EmployeeActivityFormValues = z.infer<typeof employeeActivityFormSchema>;

interface EmployeeActivityFormProps {
  defaultValues?: Partial<InsertEmployeeActivity>;
  onSubmit: (data: EmployeeActivityFormValues) => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
}

export default function EmployeeActivityForm({
  defaultValues = {
    employeeName: "",
    date: new Date(),
    activitiesPerformed: "",
    issues: "",
    notes: "",
  },
  onSubmit,
  isSubmitting,
  mode,
}: EmployeeActivityFormProps) {
  // Convert string date to Date object if needed
  if (typeof defaultValues.date === 'string') {
    defaultValues.date = new Date(defaultValues.date);
  }

  const form = useForm<EmployeeActivityFormValues>({
    resolver: zodResolver(employeeActivityFormSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="employeeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter employee name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activitiesPerformed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activities Performed</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the activities performed" 
                  className="min-h-24"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="issues"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issues (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe any issues encountered" 
                  className="min-h-20"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional notes" 
                  className="min-h-20"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Add Activity Record" : "Update Activity Record"}
        </Button>
      </form>
    </Form>
  );
}