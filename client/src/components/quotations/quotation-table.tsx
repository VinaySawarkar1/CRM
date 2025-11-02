import { Quotation } from "@shared/schema";

// Extended quotation type with customer information
interface EnrichedQuotation extends Omit<Quotation, 'customerCompany'> {
  customerName?: string;
  customerCompany?: string;
  customerEmail?: string;
  customerPhone?: string;
}
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Edit, 
  Trash, 
  FileText, 
  FileCheck, 
  Truck, 
  ShoppingCart,
  Download,
  Printer,
  Copy
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

interface QuotationTableProps {
  quotations: EnrichedQuotation[];
  onEdit: (quotation: EnrichedQuotation) => void;
  onDelete: (id: number) => void;
  onGeneratePDF: (id: number) => void;
  onPrint: (id: number) => void;
  onConvertToInvoice: (id: number) => void;
  onGenerateProformaInvoice: (id: number) => void;
  onGenerateDeliveryChallan: (id: number) => void;
  onConvertToOrder: (id: number) => void;
  onChangeStatus?: (id: number, status: string) => void;
  mode?: "quotation" | "proforma";
  isLoading?: boolean;
  onRevise?: (id: number) => void;
  onSaveAsTemplate?: (quotation: EnrichedQuotation) => void;
  onCopy?: (quotation: EnrichedQuotation) => void;
  onCopyProforma?: (proforma: EnrichedQuotation) => void;
}

export default function QuotationTable({
  quotations,
  onEdit,
  onDelete,
  onGeneratePDF,
  onPrint,
  onConvertToInvoice,
  onGenerateProformaInvoice,
  onGenerateDeliveryChallan,
  onConvertToOrder,
  onChangeStatus,
  mode = "quotation",
  isLoading,
  onRevise,
  onSaveAsTemplate,
  onCopy,
  onCopyProforma,
}: QuotationTableProps) {
  const [, setLocation] = useLocation();
  const [active, setActive] = useState<EnrichedQuotation | null>(null);
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number | string) => {
    const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount;
    const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(safeValue);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      'sent': { color: 'bg-blue-100 text-blue-800', label: 'Sent' },
      'accepted': { color: 'bg-green-100 text-green-800', label: 'Accepted' },
      'rejected': { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      'expired': { color: 'bg-yellow-100 text-yellow-800', label: 'Expired' }
    };
    
    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{mode === "proforma" ? "Proforma Invoice" : "Quotation"}</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 bg-gray-50">
            <TableHead className="font-semibold text-gray-700">{mode === "proforma" ? "Proforma Invoice" : "Quotation"}</TableHead>
            <TableHead className="font-semibold text-gray-700">Customer</TableHead>
            <TableHead className="font-semibold text-gray-700">Amount</TableHead>
            <TableHead className="font-semibold text-gray-700">Status</TableHead>
            <TableHead className="font-semibold text-gray-700">Date</TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.length > 0 ? (
            quotations.map((quotation) => (
              <TableRow key={quotation.id} className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer" onClick={() => setActive(quotation)}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                       <div className="font-medium text-gray-900">
                         {quotation.quotationNumber || `QT-${quotation.id}`}
                       </div>
                       <div className="text-sm text-gray-500">
                         {mode === "proforma" ? "Proforma Invoice" : "Quotation"}
                       </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                   <div className="text-gray-900 font-medium">
                     {quotation.customerCompany || quotation.customerName || `Customer #${quotation.customerId}`}
                   </div>
                   <div className="text-sm text-gray-500">
                     {quotation.contactPerson || quotation.customerName || `Lead #${quotation.leadId}`}
                   </div>
              </TableCell>
              <TableCell>
                   <div className="text-gray-900 font-semibold">
                     {formatCurrency(quotation.subtotal ?? quotation.totalAmount ?? '0')}
                   </div>
                   <div className="text-xs text-gray-500">
                     Basic Amount
                   </div>
              </TableCell>
              <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(quotation.status)}
                    {mode !== 'proforma' && (
                      <select
                        className="text-xs border rounded px-1 py-0.5"
                        defaultValue={quotation.status || 'draft'}
                        onChange={(e) => onChangeStatus && onChangeStatus(quotation.id, e.target.value)}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                      </select>
                    )}
                  </div>
                </TableCell>
              <TableCell>
                  <div className="text-sm text-gray-600">{formatDate(quotation.createdAt)}</div>
              </TableCell>
              <TableCell className="text-right"></TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <p className="text-gray-500">No quotations found</p>
                  <p className="text-sm text-gray-400">Get started by creating your first quotation</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quotation Actions</DialogTitle>
          </DialogHeader>
          {active && (
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="text-gray-900 hover:bg-gray-100 border-gray-300"
                onClick={(e) => { e.stopPropagation(); mode === 'proforma' ? setLocation(`/proforma/edit/${active.id}`) : onEdit(active); setActive(null); }}
              >
                <Edit className="h-4 w-4 mr-2" />Edit
              </Button>
              {onCopy && (
                <Button 
                  variant="outline" 
                  className="text-gray-900 hover:bg-gray-100 border-gray-300"
                  onClick={(e) => { e.stopPropagation(); onCopy(active); setActive(null); }}
                >
                  <Copy className="h-4 w-4 mr-2" />Copy
                </Button>
              )}
              {mode === 'proforma' && onCopyProforma && (
                <Button 
                  variant="outline" 
                  className="text-gray-900 hover:bg-gray-100 border-gray-300"
                  onClick={(e) => { e.stopPropagation(); onCopyProforma(active); setActive(null); }}
                >
                  <Copy className="h-4 w-4 mr-2" />Copy
                </Button>
              )}
              {mode !== 'proforma' ? (
                <Button 
                  variant="outline" 
                  className="text-gray-900 hover:bg-gray-100 border-gray-300"
                  onClick={(e) => { e.stopPropagation(); onGeneratePDF(active.id); setActive(null); }}
                >
                  <Download className="h-4 w-4 mr-2" />Download PDF
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="text-gray-900 hover:bg-gray-100 border-gray-300"
                  onClick={(e) => { e.stopPropagation(); window.open(`/api/proformas/${active.id}/download-pdf`, '_blank'); setActive(null); }}
                >
                  <Download className="h-4 w-4 mr-2" />Download Proforma
                </Button>
              )}
              {mode !== 'proforma' ? (
                <Button 
                  variant="outline" 
                  className="text-gray-900 hover:bg-gray-100 border-gray-300"
                  onClick={(e) => { e.stopPropagation(); onPrint(active.id); setActive(null); }}
                >
                  <Printer className="h-4 w-4 mr-2" />Print
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="text-gray-900 hover:bg-gray-100 border-gray-300"
                  onClick={(e) => { e.stopPropagation(); window.open(`/api/proformas/${active.id}/download-pdf`, '_blank'); setActive(null); }}
                >
                  <Printer className="h-4 w-4 mr-2" />Print Proforma
                </Button>
              )}
              {mode !== 'proforma' && (
                <Button 
                  variant="outline" 
                  className="text-gray-900 hover:bg-gray-100 border-gray-300"
                  onClick={(e) => { e.stopPropagation(); onGenerateProformaInvoice(active.id); setActive(null); }}
                >
                  <FileCheck className="h-4 w-4 mr-2" />Proforma Invoice
                </Button>
              )}
              <Button 
                variant="outline" 
                className="text-gray-900 hover:bg-gray-100 border-gray-300"
                onClick={(e) => { e.stopPropagation(); onGenerateDeliveryChallan(active.id); setActive(null); }}
              >
                <Truck className="h-4 w-4 mr-2" />Delivery Challan
              </Button>
              <Button 
                variant="outline" 
                className="text-gray-900 hover:bg-gray-100 border-gray-300"
                onClick={(e) => { e.stopPropagation(); onConvertToOrder(active.id); setActive(null); }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />Convert to Order
              </Button>
              {mode !== 'proforma' && (
                <Button 
                  variant="outline" 
                  className="text-gray-900 hover:bg-gray-100 border-gray-300"
                  onClick={(e) => { e.stopPropagation(); onConvertToInvoice(active.id); setActive(null); }}
                >
                  <FileText className="h-4 w-4 mr-2" />Convert to Invoice
                </Button>
              )}
              <Button variant="destructive" onClick={(e) => { e.stopPropagation(); onDelete(active.id); setActive(null); }}>
                <Trash className="h-4 w-4 mr-2" />Delete
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 