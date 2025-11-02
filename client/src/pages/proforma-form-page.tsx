import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { Quotation } from "@shared/schema";
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import QuotationForm from "@/components/quotations/quotation-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft } from "lucide-react";

export default function ProformaFormPage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Extract ID from /proforma/edit/:id
  const proformaId = (() => {
    const match = location.match(/\/proforma\/edit\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  })();

  // Check for copyFrom parameter
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : "");
  const copyFromId = searchParams.get('copyFrom');

  const { data: proforma, isLoading: isLoadingProforma } = useQuery<any>({
    queryKey: ["/api/proformas", proformaId],
    queryFn: async () => {
      if (!proformaId) return null as unknown as any;
      const res = await fetch(`/api/proformas/${proformaId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch proforma");
      return res.json();
    },
    enabled: !!proformaId,
  });

  // Fetch source data for copying
  const { data: copySource, isLoading: copyLoading } = useQuery<any>({
    queryKey: ["/api/proformas", copyFromId],
    queryFn: async () => {
      if (!copyFromId) return null;
      const res = await fetch(`/api/proformas/${copyFromId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch proforma to copy");
      return res.json();
    },
    enabled: !!copyFromId,
  });

  // Process copySource to generate new proforma number and dates
  const processedCopySource = copySource ? {
    ...copySource,
    id: undefined, // Remove ID to create new proforma
    proformaNumber: `PF-${Date.now()}`, // Generate new proforma number
    quotationDate: new Date().toISOString().split('T')[0], // Set to current date
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Set new validity date
    createdAt: undefined, // Remove creation date
    updatedAt: undefined, // Remove update date
    status: 'draft' // Reset status to draft
  } : null;

  const updateProforma = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/proformas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(JSON.stringify(errorData));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proformas"] });
      toast({ title: "Proforma Updated", description: "Proforma invoice has been updated." });
      setLocation("/quotations");
    },
    onError: (error: Error) => {
      try {
        const errorData = JSON.parse(error.message);
        toast({ title: "Error", description: errorData.message || "Failed to update proforma", variant: "destructive" });
      } catch {
        toast({ title: "Error", description: error.message || "Failed to update proforma", variant: "destructive" });
      }
    },
  });

  // Create proforma mutation
  const createProforma = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/proformas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(JSON.stringify(errorData));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proformas"] });
      toast({ title: "Proforma Created", description: "Proforma invoice has been created successfully." });
      setLocation("/quotations");
    },
    onError: (error: Error) => {
      try {
        const errorData = JSON.parse(error.message);
        toast({ title: "Error", description: errorData.message || "Failed to create proforma", variant: "destructive" });
      } catch {
        toast({ title: "Error", description: error.message || "Failed to create proforma", variant: "destructive" });
      }
    },
  });

  const handleSubmit = (data: any) => {
    if (proformaId) {
      updateProforma.mutate({ id: proformaId, data });
    } else {
      createProforma.mutate(data);
    }
  };

  // Check if we're in edit mode
  const isEditMode = !!proformaId;

  return (
    <Layout>
      <div className="px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/quotations")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Proforma Invoices
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit Proforma Invoice" : "Create New Proforma Invoice"}
              </h1>
              <p className="text-sm text-gray-600">
                {isEditMode 
                  ? "Update the proforma invoice details" 
                  : "Fill in the details below to create a new proforma invoice"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {(isEditMode && isLoadingProforma) || (copyFromId && copyLoading) ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading proforma...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm">
            <QuotationForm 
              onSubmit={handleSubmit} 
              isSubmitting={createProforma.isPending || updateProforma.isPending} 
              mode={isEditMode ? "edit" : "create"} 
              defaultValues={proforma || processedCopySource} 
              submitLabel={isEditMode ? "Update Proforma" : "Create Proforma"} 
              documentType="proforma"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}


