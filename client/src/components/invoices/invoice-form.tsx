// Invoice form now uses QuotationForm component structure
// Import QuotationForm and adapt it for invoices
import QuotationForm from "@/components/quotations/quotation-form";

import { Invoice, Quotation } from "@shared/schema";

interface InvoiceFormProps {
  onSubmit: (data: any) => void;
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
  // Convert invoice to quotation-like format for the form
  const quotationLikeData: Quotation | undefined = defaultValues ? {
    ...defaultValues as any,
    quotationNumber: defaultValues.invoiceNumber,
    quotationDate: defaultValues.invoiceDate,
    validUntil: defaultValues.dueDate,
    items: defaultValues.items || [],
  } : undefined;

  // Transform quotation form data back to invoice format
  const handleFormSubmit = (data: any) => {
    const invoiceData = {
      ...data,
      invoiceNumber: data.quotationNumber,
      invoiceDate: data.quotationDate,
      dueDate: data.validUntil,
      status: data.status || "draft",
    };
    // Remove quotation-specific fields
    delete invoiceData.quotationNumber;
    delete invoiceData.quotationDate;
    delete invoiceData.validUntil;
    onSubmit(invoiceData);
  };

  return (
    <QuotationForm
      onSubmit={handleFormSubmit}
      isSubmitting={isSubmitting}
      mode={mode}
      defaultValues={quotationLikeData}
      submitLabel={mode === "create" ? "Create Invoice" : "Update Invoice"}
      documentType="invoice"
    />
  );
} 