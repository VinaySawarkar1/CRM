import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Invoice } from "@shared/schema";
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import InvoiceTable from "@/components/invoices/invoice-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export default function InvoicesPage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("invoices");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Get all invoices
  const {
    data: invoices,
    isLoading,
    error
  } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });


  // Delete invoice mutation
  const deleteInvoice = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/invoices/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice Deleted",
        description: "Invoice has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete invoice: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Generate PDF mutation
  const generatePDF = useMutation({
    mutationFn: async (invoiceId: number) => {
      // Open PDF in new tab for download
      window.open(`/api/invoices/${invoiceId}/download-pdf`, '_blank');
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "PDF Generated",
        description: "Invoice PDF has been generated and opened in a new tab.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to generate PDF: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (invoice: Invoice) => {
    setLocation(`/invoices/edit/${invoice.id}`);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoice.mutate(id);
    }
  };

  const handleGeneratePDF = (id: number) => {
    generatePDF.mutate(id);
  };

  const handlePrint = (id: number) => {
    // Open PDF in new tab for printing
    window.open(`/api/invoices/${id}/download-pdf`, '_blank');
  };

  const handleAddNew = () => {
    setLocation("/invoices/new");
  };

  // Filter invoices based on search and status
  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ((invoice as any).subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const paginatedInvoices = filteredInvoices.slice((page-1)*pageSize, page*pageSize);

  // Calculate statistics
  const totalInvoices = invoices?.length || 0;
  const totalAmount = invoices?.reduce((sum, i) => sum + parseFloat(i.totalAmount || "0"), 0) || 0;
  const preTaxAmount = invoices?.reduce((sum, i) => sum + parseFloat(i.subtotal || "0"), 0) || 0;
  const paidAmount = invoices?.reduce((sum, i) => sum + parseFloat(i.paidAmount || "0"), 0) || 0;

  if (error) {
    return (
      <Layout>
        <div className="text-center my-8">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Invoices</h2>
          <p className="text-gray-600">{(error as Error).message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Invoices"
          subtitle="Manage your sales invoices"
        />

        {/* Top Bar with Stats and Actions */}
        <div className="mb-6 bg-white p-4 rounded-lg border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">Count</div>
                <div className="text-2xl font-bold">{totalInvoices}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">Pre-Tax</div>
                <div className="text-2xl font-bold text-blue-600">₹{preTaxAmount.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">Total</div>
                <div className="text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">Paid</div>
                <div className="text-2xl font-bold text-purple-600">₹{paidAmount.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-64"
              />
              <Button onClick={handleAddNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("invoices")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "invoices"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setActiveTab("proforma")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "proforma"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Proforma Invoices
              </button>
            </nav>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="2025-2026">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Fin Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-2026">2025-2026</SelectItem>
              <SelectItem value="2024-2025">2024-2025</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              <SelectItem value="maharashtra">Maharashtra</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Executive" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Executives</SelectItem>
              <SelectItem value="vinay">Vinay Sawarkar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invoice Table */}
        <InvoiceTable
          invoices={paginatedInvoices}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onGeneratePDF={handleGeneratePDF}
          onPrint={handlePrint}
        />

        {filteredInvoices.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">Showing {(page-1)*pageSize + 1} - {Math.min(page*pageSize, filteredInvoices.length)} of {filteredInvoices.length}</div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</Button>
              <Button variant="outline" disabled={page*pageSize >= filteredInvoices.length} onClick={() => setPage(p => p+1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 