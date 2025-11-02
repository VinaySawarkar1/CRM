import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Invoice } from "@shared/schema";
import Layout from "@/components/layout";
import InvoiceForm from "@/components/invoices/invoice-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function InvoiceFormPage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get invoice ID from URL
  const pathParts = location.split('/');
  const isEditMode = pathParts.includes('edit');
  const invoiceId = isEditMode ? parseInt(pathParts[pathParts.length - 1]) : undefined;
  
  // Fetch invoice data if editing
  const { data: invoice, isLoading: isLoadingInvoice } = useQuery<Invoice>({
    queryKey: [`/api/invoices/${invoiceId}`],
    enabled: !!invoiceId && isEditMode,
  });

  // Create invoice mutation
  const createInvoice = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/invoices", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice Created",
        description: "New invoice has been created successfully.",
      });
      setLocation("/invoices");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create invoice: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update invoice mutation
  const updateInvoice = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/invoices/${invoiceId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: [`/api/invoices/${invoiceId}`] });
      toast({
        title: "Invoice Updated",
        description: "Invoice has been updated successfully.",
      });
      setLocation("/invoices");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update invoice: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && invoiceId) {
        await updateInvoice.mutateAsync(data);
      } else {
        await createInvoice.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if we're in edit mode
  const isEditModeActual = isEditMode && !!invoiceId;

  // Show loading state while fetching invoice data
  if (isEditModeActual && isLoadingInvoice) {
    return (
      <Layout>
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg border p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invoice...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/invoices")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Invoices
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <InvoiceForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting || createInvoice.isPending || updateInvoice.isPending}
            mode={isEditModeActual ? "edit" : "create"}
            defaultValues={invoice || undefined}
          />
        </div>
      </div>
    </Layout>
  );
}

