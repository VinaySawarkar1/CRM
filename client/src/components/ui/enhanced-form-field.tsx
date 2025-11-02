import { forwardRef } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "./form";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface EnhancedFormFieldProps {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "textarea" | "select";
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
  icon?: React.ReactNode;
  autoComplete?: string;
  showStatus?: boolean;
  className?: string;
}

export const EnhancedFormField = forwardRef<HTMLInputElement, EnhancedFormFieldProps>(
  ({ name, label, type = "text", placeholder, description, options, icon, autoComplete, showStatus = true, className }, ref) => {
    return (
      <FormField
        name={name}
        render={({ field, fieldState }) => {
          const { value, onChange, onBlur } = field;
          const { error, isDirty } = fieldState;
          const isValid = isDirty && !error && value;

          return (
            <FormItem className={cn("space-y-2", className)}>
              <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                {icon && <span className="text-blue-600">{icon}</span>}
                {label}
                {showStatus && isValid && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 animate-in fade-in-0 zoom-in-50 duration-200" />
                )}
              </FormLabel>
              {description && (
                <FormDescription className="text-xs text-gray-500">{description}</FormDescription>
              )}
              <FormControl>
                {type === "textarea" ? (
                  <Textarea
                    {...field}
                    placeholder={placeholder}
                    className={cn(
                      "transition-all duration-200",
                      error && "border-red-300 focus:border-red-500 focus:ring-red-200",
                      isValid && "border-green-300 focus:border-green-500"
                    )}
                    rows={3}
                  />
                ) : type === "select" ? (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger
                      className={cn(
                        "transition-all duration-200",
                        error && "border-red-300 focus:border-red-500",
                        isValid && "border-green-300 focus:border-green-500"
                      )}
                    >
                      <SelectValue placeholder={placeholder || `Select ${label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="relative">
                    <Input
                      {...field}
                      type={type}
                      placeholder={placeholder}
                      autoComplete={autoComplete}
                      className={cn(
                        "transition-all duration-200 pr-8",
                        error && "border-red-300 focus:border-red-500 focus:ring-red-200",
                        isValid && "border-green-300 focus:border-green-500 focus:ring-green-200",
                        icon && "pl-10"
                      )}
                      ref={ref}
                    />
                    {icon && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        {icon}
                      </div>
                    )}
                    {showStatus && isValid && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none animate-in fade-in-0 zoom-in-50 duration-200" />
                    )}
                    {showStatus && error && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none animate-in fade-in-0 zoom-in-50 duration-200" />
                    )}
                  </div>
                )}
              </FormControl>
              <FormMessage className="text-xs flex items-center gap-1">
                {error && <AlertCircle className="h-3 w-3" />}
              </FormMessage>
            </FormItem>
          );
        }}
      />
    );
  }
);
EnhancedFormField.displayName = "EnhancedFormField";

