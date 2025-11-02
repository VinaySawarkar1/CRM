import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, Building, MapPin, FileText, DollarSign, CheckCircle2, AlertCircle, Mail, Phone, Globe, CreditCard, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("India"),
  pincode: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  creditLimit: z.string().optional(),
  paymentTerms: z.string().default("30 days"),
  status: z.string().default("active"),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
  defaultValues?: Customer;
}

export default function CustomerForm({
  onSubmit,
  isSubmitting,
  mode,
  defaultValues,
}: CustomerFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [autoSaved, setAutoSaved] = useState(false);
  
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues ? {
      name: defaultValues.name,
      company: defaultValues.company,
      email: defaultValues.email,
      phone: defaultValues.phone,
      address: defaultValues.address || "",
      city: defaultValues.city || "",
      state: defaultValues.state || "",
      country: defaultValues.country || "India",
      pincode: defaultValues.pincode || "",
      gstNumber: defaultValues.gstNumber || "",
      panNumber: defaultValues.panNumber || "",
      creditLimit: defaultValues.creditLimit || "",
      paymentTerms: defaultValues.paymentTerms || "30 days",
      status: defaultValues.status || "active",
      notes: defaultValues.notes || "",
    } : {
      country: "India",
      paymentTerms: "30 days",
      status: "active",
    },
  });

  const watchedValues = form.watch();
  const formState = form.formState;

  // Calculate form completion percentage
  const calculateProgress = () => {
    const fields = ['name', 'company', 'email', 'phone', 'address', 'city', 'state', 'country', 'gstNumber', 'panNumber', 'paymentTerms', 'status'];
    const filledFields = fields.filter(field => {
      const value = watchedValues[field as keyof CustomerFormData];
      return value && value.toString().trim() !== '';
    });
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const progress = calculateProgress();

  // Auto-save functionality
  useEffect(() => {
    if (mode === "edit" && formState.isDirty && !formState.isSubmitting) {
      const timer = setTimeout(() => {
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 3000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [watchedValues, mode, formState.isDirty, formState.isSubmitting]);

  const handleFormSubmit = (data: CustomerFormData) => {
    onSubmit({
      ...data,
      creditLimit: data.creditLimit || "0",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 animate-fade-in-up">
        {/* Progress Indicator */}
        <Card className="border-0 shadow-lg glass-effect">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {mode === "create" ? "Create New Customer" : "Edit Customer"}
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

        {/* Tabbed Form Sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="basic" 
              className="rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-semibold"
            >
              <User className="h-4 w-4 mr-2" />
              Basic
            </TabsTrigger>
            <TabsTrigger 
              value="address" 
              className="rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-semibold"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Address
            </TabsTrigger>
            <TabsTrigger 
              value="business" 
              className="rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-semibold"
            >
              <Building className="h-4 w-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger 
              value="additional" 
              className="rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-semibold"
            >
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg glass-effect card-hover">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <User className="h-5 w-5" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          Full Name *
                          {fieldState.isDirty && !fieldState.error && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John Doe"
                            className={`transition-all duration-200 ${
                              fieldState.error ? "border-red-300 focus:border-red-500 focus:ring-red-200" :
                              fieldState.isDirty && !fieldState.error ? "border-green-300 focus:border-green-500" : ""
                            }`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-blue-600" />
                          Company Name *
                          {fieldState.isDirty && !fieldState.error && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Company Name"
                            className={`transition-all duration-200 ${
                              fieldState.error ? "border-red-300 focus:border-red-500 focus:ring-red-200" :
                              fieldState.isDirty && !fieldState.error ? "border-green-300 focus:border-green-500" : ""
                            }`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg glass-effect card-hover">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          Email Address *
                          {fieldState.isDirty && !fieldState.error && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="customer@example.com"
                              className={`pl-10 transition-all duration-200 ${
                                fieldState.error ? "border-red-300 focus:border-red-500 focus:ring-red-200" :
                                fieldState.isDirty && !fieldState.error ? "border-green-300 focus:border-green-500" : ""
                              }`}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-blue-600" />
                          Phone Number *
                          {fieldState.isDirty && !fieldState.error && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              {...field}
                              type="tel"
                              placeholder="+91 98765 43210"
                              className={`pl-10 transition-all duration-200 ${
                                fieldState.error ? "border-red-300 focus:border-red-500 focus:ring-red-200" :
                                fieldState.isDirty && !fieldState.error ? "border-green-300 focus:border-green-500" : ""
                              }`}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Address Tab */}
          <TabsContent value="address" className="space-y-6 animate-fade-in-up">
            <Card className="border-0 shadow-lg glass-effect card-hover">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-green-100">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <MapPin className="h-5 w-5" />
                  Address Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        Street Address
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter full address" rows={3} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="City" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="State" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-600" />
                          Country
                        </FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="USA">USA</SelectItem>
                            <SelectItem value="UK">UK</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Pincode" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business" className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg glass-effect card-hover">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <FileText className="h-5 w-5" />
                    Tax Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="gstNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GST Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="GST Number" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="panNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="PAN Number" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg glass-effect card-hover">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <CardTitle className="flex items-center gap-2 text-indigo-700">
                    <DollarSign className="h-5 w-5" />
                    Financial Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          Credit Limit (₹)
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0.00" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment terms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Immediate">Immediate</SelectItem>
                            <SelectItem value="7 days">7 days</SelectItem>
                            <SelectItem value="15 days">15 days</SelectItem>
                            <SelectItem value="30 days">30 days</SelectItem>
                            <SelectItem value="45 days">45 days</SelectItem>
                            <SelectItem value="60 days">60 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Additional Notes Tab */}
          <TabsContent value="additional" className="space-y-6 animate-fade-in-up">
            <Card className="border-0 shadow-lg glass-effect card-hover">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <FileText className="h-5 w-5" />
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Add any additional notes about this customer..." rows={8} />
                      </FormControl>
                      <FormDescription>Optional: Add any special notes, preferences, or important information about this customer.</FormDescription>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {progress < 100 ? `Complete ${progress}% to finish` : "All fields completed ✓"}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || progress < 50}
            className="min-w-[160px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold h-11 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {mode === "create" ? "Create Customer" : "Update Customer"}
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 