import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  FileText,
  ShoppingCart,
  Package,
  Send,
  Calendar,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutomationStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  description: string;
  icon: React.ComponentType<any>;
  timestamp?: string;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  steps: AutomationStep[];
  isActive: boolean;
  triggerType: 'manual' | 'automatic';
}

export default function AutomationEngine() {
  const { toast } = useToast();
  const [activeWorkflow, setActiveWorkflow] = useState<AutomationWorkflow | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Sample automation workflows
  const workflows: AutomationWorkflow[] = [
    {
      id: "lead-to-order",
      name: "Lead to Order Automation",
      description: "Automatically convert leads to orders with one click",
      triggerType: "manual",
      isActive: true,
      steps: [
        {
          id: "capture-lead",
          name: "Capture Lead",
          status: "pending",
          description: "Capture lead from multiple sources",
          icon: Users
        },
        {
          id: "classify-lead",
          name: "Classify Lead",
          status: "pending",
          description: "Auto-classify by interest level",
          icon: CheckCircle
        },
        {
          id: "generate-quote",
          name: "Generate Quote",
          status: "pending",
          description: "Auto-generate quotation",
          icon: FileText
        },
        {
          id: "send-quote",
          name: "Send Quote",
          status: "pending",
          description: "Send via email/WhatsApp",
          icon: Send
        },
        {
          id: "schedule-followup",
          name: "Schedule Follow-up",
          status: "pending",
          description: "Auto-schedule meeting",
          icon: Calendar
        },
        {
          id: "create-order",
          name: "Create Order",
          status: "pending",
          description: "Generate order when accepted",
          icon: ShoppingCart
        },
        {
          id: "assign-production",
          name: "Assign to Production",
          status: "pending",
          description: "Auto-assign to manufacturing",
          icon: Package
        }
      ]
    },
    {
      id: "inventory-automation",
      name: "Inventory Automation",
      description: "Auto-manage inventory and purchase orders",
      triggerType: "automatic",
      isActive: true,
      steps: [
        {
          id: "check-stock",
          name: "Check Stock Levels",
          status: "pending",
          description: "Monitor inventory levels",
          icon: Package
        },
        {
          id: "generate-po",
          name: "Generate Purchase Order",
          status: "pending",
          description: "Auto-create PO for low stock",
          icon: FileText
        },
        {
          id: "notify-manager",
          name: "Notify Manager",
          status: "pending",
          description: "Send approval notifications",
          icon: MessageSquare
        }
      ]
    }
  ];

  // Start automation workflow
  const startAutomation = useMutation({
    mutationFn: async (workflowId: string) => {
      const res = await apiRequest("POST", `/api/automation/start/${workflowId}`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Automation Started",
        description: "Workflow has been initiated successfully.",
      });
      setActiveWorkflow(workflows.find(w => w.id === data.workflowId) || null);
      setCurrentStep(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Automation Failed",
        description: `Failed to start automation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleStartWorkflow = (workflow: AutomationWorkflow) => {
    setActiveWorkflow(workflow);
    startAutomation.mutate(workflow.id);
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Automation Workflows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{workflow.name}</CardTitle>
                <Badge variant={workflow.isActive ? "default" : "secondary"}>
                  {workflow.triggerType}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{workflow.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Steps: {workflow.steps.length}</span>
                  <span>Active: {workflow.isActive ? 'Yes' : 'No'}</span>
                </div>
                
                {workflow.triggerType === 'manual' && (
                  <Button 
                    onClick={() => handleStartWorkflow(workflow)}
                    className="w-full"
                    disabled={startAutomation.isPending}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Automation
                  </Button>
                )}
                
                {workflow.triggerType === 'automatic' && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Running automatically
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Workflow Progress */}
      {activeWorkflow && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              {activeWorkflow.name} - Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress 
                value={(currentStep / activeWorkflow.steps.length) * 100} 
                className="w-full" 
              />
              
              <div className="space-y-3">
                {activeWorkflow.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStepStatusIcon(step.status)}
                      <span className="text-sm font-medium">{index + 1}.</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{step.name}</span>
                        <Badge className={getStepStatusColor(step.status)}>
                          {step.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                    
                    {step.timestamp && (
                      <span className="text-xs text-gray-500">{step.timestamp}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automation Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Automation Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium">Lead captured from website form</p>
                <p className="text-sm text-gray-600">2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">Quote generated and sent to client</p>
                <p className="text-sm text-gray-600">5 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div className="flex-1">
                <p className="font-medium">Low stock alert triggered</p>
                <p className="text-sm text-gray-600">10 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 