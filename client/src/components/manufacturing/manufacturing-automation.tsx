import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause,
  Settings,
  Users,
  FileText,
  ShoppingCart,
  Factory,
  Wrench,
  Truck,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RawMaterial {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
  supplier: string;
  lastOrderDate: string;
  leadTime: number;
}

interface Job {
  id: string;
  jobNumber: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'started' | 'in-assembly' | 'qa' | 'packed' | 'shipped';
  assignedTo: string;
  startDate: string;
  estimatedCompletion: string;
  materials: Array<{
    material: RawMaterial;
    required: number;
    allocated: number;
    available: number;
  }>;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  materials: Array<{
    material: RawMaterial;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received';
  createdAt: string;
  approvedBy?: string;
}

export default function ManufacturingAutomation() {
  const { toast } = useToast();
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [pendingPOs, setPendingPOs] = useState<PurchaseOrder[]>([]);

  // Get raw materials
  const {
    data: rawMaterials,
    isLoading: materialsLoading
  } = useQuery<RawMaterial[]>({
    queryKey: ["/api/raw-materials"],
  });

  // Get active jobs
  const {
    data: jobs,
    isLoading: jobsLoading
  } = useQuery<Job[]>({
    queryKey: ["/api/manufacturing/jobs"],
  });

  // Get purchase orders
  const {
    data: purchaseOrders,
    isLoading: posLoading
  } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });

  // Auto-check stock and generate PO
  const checkStockAndGeneratePO = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/manufacturing/check-stock");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Stock Check Complete",
        description: `Generated ${data.purchaseOrders.length} purchase orders for low stock items.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Stock Check Failed",
        description: `Failed to check stock: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Assign job to production
  const assignJobToProduction = useMutation({
    mutationFn: async (jobId: string) => {
      const res = await apiRequest("POST", `/api/manufacturing/jobs/${jobId}/assign`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Job Assigned",
        description: "Job has been assigned to production team.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/jobs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Assignment Failed",
        description: `Failed to assign job: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Approve purchase order
  const approvePurchaseOrder = useMutation({
    mutationFn: async (poId: string) => {
      const res = await apiRequest("POST", `/api/purchase-orders/${poId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "PO Approved",
        description: "Purchase order has been approved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: `Failed to approve PO: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'packed':
        return 'bg-green-100 text-green-800';
      case 'qa':
        return 'bg-blue-100 text-blue-800';
      case 'in-assembly':
        return 'bg-yellow-100 text-yellow-800';
      case 'started':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPOStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'ordered':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate low stock items
  const lowStockItems = rawMaterials?.filter(material => 
    material.currentStock <= material.minStock
  ) || [];

  // Calculate job progress
  const jobProgress = jobs?.reduce((acc, job) => {
    const statusOrder = ['pending', 'started', 'in-assembly', 'qa', 'packed', 'shipped'];
    const currentIndex = statusOrder.indexOf(job.status);
    return acc + (currentIndex / (statusOrder.length - 1));
  }, 0) || 0;

  const averageProgress = jobs?.length ? jobProgress / jobs.length : 0;

  return (
    <div className="space-y-6">
      {/* Manufacturing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Jobs</CardTitle>
              <Factory className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs?.length || 0}</div>
            <p className="text-xs text-gray-600">In production</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Low Stock Items</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
            <p className="text-xs text-gray-600">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Pending POs</CardTitle>
              <FileText className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {purchaseOrders?.filter(po => po.status === 'pending').length || 0}
            </div>
            <p className="text-xs text-gray-600">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Production Progress</CardTitle>
              <Settings className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(averageProgress * 100)}%
            </div>
            <p className="text-xs text-gray-600">Average completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Automation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Manufacturing Automation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium">Auto Stock Check</h4>
                <p className="text-sm text-gray-600">Automatically check stock levels and generate POs</p>
              </div>
              <Button 
                onClick={() => checkStockAndGeneratePO.mutate()}
                disabled={checkStockAndGeneratePO.isPending}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Run Check
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium">Auto Job Assignment</h4>
                <p className="text-sm text-gray-600">Automatically assign jobs to production team</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-700">Active</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <h4 className="font-medium">Material Allocation</h4>
                <p className="text-sm text-gray-600">Auto-allocate materials to jobs</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-700">Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Active Production Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading jobs...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs?.map((job) => (
                <div key={job.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{job.jobNumber} - {job.productName}</h4>
                      <p className="text-sm text-gray-600">Quantity: {job.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getJobStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => assignJobToProduction.mutate(job.id)}
                        disabled={assignJobToProduction.isPending}
                      >
                        Assign
                      </Button>
                    </div>
                  </div>

                  {/* Job Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round((job.status === 'packed' ? 1 : 0.5) * 100)}%</span>
                    </div>
                    <Progress value={job.status === 'packed' ? 100 : 50} className="w-full" />
                  </div>

                  {/* Material Status */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                    {job.materials?.map((material, index) => (
                      <div key={index} className="text-xs">
                        <span className="font-medium">{material.material.name}:</span>
                        <span className={`ml-1 ${
                          material.allocated >= material.required ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {material.allocated}/{material.required} {material.material.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {posLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading purchase orders...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchaseOrders?.map((po) => (
                <div key={po.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">{po.poNumber}</p>
                      <p className="text-sm text-gray-600">{po.supplier}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium">₹{po.totalAmount.toLocaleString()}</p>
                      <Badge className={getPOStatusColor(po.status)}>
                        {po.status}
                      </Badge>
                    </div>
                    
                    {po.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => approvePurchaseOrder.mutate(po.id)}
                        disabled={approvePurchaseOrder.isPending}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lowStockItems.map((material) => (
              <div key={material.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="font-medium">{material.name}</p>
                    <p className="text-sm text-gray-600">
                      Current: {material.currentStock} {material.unit} | 
                      Min: {material.minStock} {material.unit}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-red-600 font-medium">
                    {Math.max(0, material.minStock - material.currentStock)} {material.unit} needed
                  </p>
                  <p className="text-xs text-gray-500">Lead time: {material.leadTime} days</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 