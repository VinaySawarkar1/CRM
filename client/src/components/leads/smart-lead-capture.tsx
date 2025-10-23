import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Mail,
  MessageSquare,
  Globe,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Phone,
  Building,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LeadSource {
  id: string;
  name: string;
  type: 'email' | 'whatsapp' | 'website' | 'indiamart' | 'manual';
  status: 'active' | 'inactive';
  lastSync: string;
  leadsToday: number;
  icon: React.ComponentType<any>;
}

interface CapturedLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  interestLevel: 'cold' | 'warm' | 'hot';
  status: 'new' | 'contacted' | 'quoted' | 'converted';
  assignedTo: string;
  capturedAt: string;
  autoClassified: boolean;
}

export default function SmartLeadCapture() {
  const { toast } = useToast();
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);

  // Lead sources configuration
  const leadSources: LeadSource[] = [
    {
      id: "email-parser",
      name: "Email Parser",
      type: "email",
      status: "active",
      lastSync: "2 minutes ago",
      leadsToday: 5,
      icon: Mail
    },
    {
      id: "whatsapp-api",
      name: "WhatsApp API",
      type: "whatsapp",
      status: "active",
      lastSync: "1 minute ago",
      leadsToday: 3,
      icon: MessageSquare
    },
    {
      id: "website-form",
      name: "Website Form",
      type: "website",
      status: "active",
      lastSync: "5 minutes ago",
      leadsToday: 8,
      icon: Globe
    },
    {
      id: "indiamart-webhook",
      name: "IndiaMART Webhook",
      type: "indiamart",
      status: "active",
      lastSync: "10 minutes ago",
      leadsToday: 12,
      icon: Building
    }
  ];

  // Get captured leads
  const {
    data: capturedLeads,
    isLoading,
    error
  } = useQuery<CapturedLead[]>({
    queryKey: ["/api/leads/captured"],
  });

  // Auto-classify lead
  const classifyLead = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await apiRequest("POST", `/api/leads/${leadId}/classify`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads/captured"] });
      toast({
        title: "Lead Classified",
        description: "Lead has been automatically classified.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Classification Failed",
        description: `Failed to classify lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Auto-assign lead
  const assignLead = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await apiRequest("POST", `/api/leads/${leadId}/assign`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads/captured"] });
      toast({
        title: "Lead Assigned",
        description: "Lead has been automatically assigned to salesperson.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Assignment Failed",
        description: `Failed to assign lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const getInterestLevelColor = (level: string) => {
    switch (level) {
      case 'hot':
        return 'bg-red-100 text-red-800';
      case 'warm':
        return 'bg-yellow-100 text-yellow-800';
      case 'cold':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'quoted':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'new':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Lead Sources Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {leadSources.map((source) => (
          <Card key={source.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <source.icon className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-sm">{source.name}</CardTitle>
                </div>
                <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                  {source.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Leads Today:</span>
                  <span className="font-semibold">{source.leadsToday}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Last Sync:</span>
                  <span className="text-gray-600">{source.lastSync}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    source.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-xs text-gray-600">
                    {source.status === 'active' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-time Lead Capture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Real-time Lead Capture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {leadSources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => setIsCapturing(!isCapturing)}
                variant={isCapturing ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                {isCapturing ? "Stop Capture" : "Start Capture"}
              </Button>
            </div>

            {isCapturing && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-medium">Live capture active</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Monitoring {selectedSource} for new leads...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Captured Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recently Captured Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading captured leads...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">Error loading leads</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {capturedLeads?.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                          <div className="text-sm text-gray-500">{lead.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{lead.source}</Badge>
                          {lead.autoClassified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getInterestLevelColor(lead.interestLevel)}>
                          {lead.interestLevel}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.assignedTo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => classifyLead.mutate(lead.id)}
                            disabled={classifyLead.isPending}
                          >
                            Re-classify
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => assignLead.mutate(lead.id)}
                            disabled={assignLead.isPending}
                          >
                            Re-assign
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Automation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Auto-classification</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Auto-assignment</p>
                <p className="text-sm text-gray-600">Round-robin active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Follow-up reminders</p>
                <p className="text-sm text-gray-600">Scheduled</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 