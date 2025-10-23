import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText,
  Download,
  Send,
  MessageSquare,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calculator,
  User,
  Building,
  Package,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
}

interface QuotationTemplate {
  id: string;
  name: string;
  description: string;
  terms: string;
  validity: number;
  isDefault: boolean;
}

interface GeneratedQuote {
  id: string;
  quoteNumber: string;
  customer: Customer;
  products: Array<{
    product: Product;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  sentAt?: string;
  viewedAt?: string;
  trackingPixel?: string;
}

export default function OneClickQuoteGenerator() {
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [quoteData, setQuoteData] = useState<Partial<GeneratedQuote>>({});

  // Get customers
  const {
    data: customers,
    isLoading: customersLoading
  } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Get products
  const {
    data: products,
    isLoading: productsLoading
  } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Get quotation templates
  const {
    data: templates,
    isLoading: templatesLoading
  } = useQuery<QuotationTemplate[]>({
    queryKey: ["/api/quotation-templates"],
  });

  // Generate quotation
  const generateQuote = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/quotations/generate", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quotation Generated",
        description: "Quotation has been generated successfully.",
      });
      setQuoteData(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: `Failed to generate quotation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Send quotation
  const sendQuote = useMutation({
    mutationFn: async (quoteId: string) => {
      const res = await apiRequest("POST", `/api/quotations/${quoteId}/send`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quotation Sent",
        description: "Quotation has been sent to the customer.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Send Failed",
        description: `Failed to send quotation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Download PDF
  const downloadPDF = useMutation({
    mutationFn: async (quoteId: string) => {
      const res = await apiRequest("GET", `/api/quotations/${quoteId}/pdf`);
      return res.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotation-${quoteData.quoteNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error: Error) => {
      toast({
        title: "Download Failed",
        description: `Failed to download PDF: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleGenerateQuote = () => {
    if (!selectedCustomer || selectedProducts.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a customer and at least one product.",
        variant: "destructive",
      });
      return;
    }

    const customer = customers?.find(c => c.id === selectedCustomer);
    const selectedProductsData = products?.filter(p => selectedProducts.includes(p.id));

    if (!customer || !selectedProductsData) return;

    const quoteData = {
      customerId: selectedCustomer,
      templateId: selectedTemplate,
      products: selectedProductsData.map(product => ({
        productId: product.id,
        quantity: 1,
        unitPrice: product.price
      })),
      autoCalculate: true
    };

    generateQuote.mutate(quoteData);
  };

  const calculateTotals = () => {
    if (!quoteData.products) return { subtotal: 0, gst: 0, total: 0 };

    const subtotal = quoteData.products.reduce((sum, item) => sum + item.total, 0);
    const gst = subtotal * 0.18; // 18% GST
    const total = subtotal + gst;

    return { subtotal, gst, total };
  };

  const { subtotal, gst, total } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Quick Quote Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            One-Click Quote Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer
              </label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {customer.name} - {customer.company}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Products
              </label>
              <Select onValueChange={(value) => setSelectedProducts([...selectedProducts, value])}>
                <SelectTrigger>
                  <SelectValue placeholder="Add products" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {product.name} - ₹{product.price}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={handleGenerateQuote}
              disabled={generateQuote.isPending}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate Quote
            </Button>

            {quoteData.id && (
              <>
                <Button 
                  onClick={() => sendQuote.mutate(quoteData.id!)}
                  disabled={sendQuote.isPending}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Quote
                </Button>

                <Button 
                  onClick={() => downloadPDF.mutate(quoteData.id!)}
                  disabled={downloadPDF.isPending}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Quote Preview */}
      {quoteData.id && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quote Preview - {quoteData.quoteNumber}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium mb-2">Customer Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {quoteData.customer?.name}</p>
                    <p><strong>Company:</strong> {quoteData.customer?.company}</p>
                    <p><strong>Email:</strong> {quoteData.customer?.email}</p>
                    <p><strong>Phone:</strong> {quoteData.customer?.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Quote Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Quote #:</strong> {quoteData.quoteNumber}</p>
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Status:</strong> 
                      <Badge className="ml-2" variant={
                        quoteData.status === 'sent' ? 'default' :
                        quoteData.status === 'viewed' ? 'secondary' :
                        quoteData.status === 'accepted' ? 'default' :
                        'outline'
                      }>
                        {quoteData.status}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quoteData.products?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                            <div className="text-sm text-gray-500">{item.product.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{item.unitPrice.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span className="text-sm font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">GST (18%):</span>
                    <span className="text-sm font-medium">₹{gst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quote Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-green-500" />
            Quote Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Send className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Sent</p>
                  <p className="text-sm text-gray-600">5 quotes today</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Eye className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Viewed</p>
                  <p className="text-sm text-gray-600">3 quotes viewed</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Accepted</p>
                  <p className="text-sm text-gray-600">2 quotes accepted</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Quote #QT-2025-001</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Sent</Badge>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Quote #QT-2025-002</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Viewed</Badge>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 