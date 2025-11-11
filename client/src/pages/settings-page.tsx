import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CompanySettings } from "@shared/schema";
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Upload, Save, Loader2, KeyRound, CalendarClock } from "lucide-react";
import TermsConditionsManager from "./terms-conditions-manager";

export default function SettingsPage() {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  // Get company settings
  const {
    data: companySettings,
    isLoading,
    error,
  } = useQuery<CompanySettings>({
    queryKey: ["/api/company-settings"],
  });

  // Update company settings mutation
  const updateSettings = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/company-settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-settings"] });
      toast({
        title: "Settings Updated",
        description: "Company settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Collect all form data, including empty strings (they should be saved)
    const data: any = {
      name: (formData.get("name") as string) || "",
      address: (formData.get("address") as string) || "",
      phone: (formData.get("phone") as string) || "",
      email: (formData.get("email") as string) || "",
      gstNumber: (formData.get("gstNumber") as string) || "",
      panNumber: (formData.get("panNumber") as string) || "",
      website: (formData.get("website") as string) || "",
      bankDetails: {
        bankName: (formData.get("bankName") as string) || "",
        accountNo: (formData.get("accountNo") as string) || "",
        ifsc: (formData.get("ifsc") as string) || "",
        branch: (formData.get("branch") as string) || "",
        upi: (formData.get("upi") as string) || "",
        swift: (formData.get("swift") as string) || "",
      },
    };
    
    // Only update logo if a new one was selected
    if (logoPreview) {
      data.logo = logoPreview;
    } else if (companySettings?.logo) {
      data.logo = companySettings.logo;
    }

    console.log('Saving settings data:', data);
    updateSettings.mutate(data);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center my-8">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Settings</h2>
          <p className="text-gray-600">{(error as Error).message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Settings"
          subtitle="Manage company information and system settings"
        />

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company">Company Details</TabsTrigger>
            <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Update your company details that will appear on all documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="logo">Company Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        {(logoPreview || companySettings?.logo) ? (
                          <img
                            src={logoPreview || companySettings?.logo}
                            alt="Company Logo"
                            className="w-20 h-20 object-contain"
                          />
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="max-w-xs"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Recommended size: 200x200px, Max size: 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={companySettings?.name}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        defaultValue={companySettings?.website}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      defaultValue={companySettings?.address}
                      placeholder="Enter complete company address"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        defaultValue={companySettings?.phone}
                        placeholder="+91 1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={companySettings?.email}
                        placeholder="info@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        name="gstNumber"
                        defaultValue={companySettings?.gstNumber}
                        placeholder="27XXXXXXXXXXXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="panNumber">PAN Number</Label>
                      <Input
                        id="panNumber"
                        name="panNumber"
                        defaultValue={companySettings?.panNumber}
                        placeholder="XXXXXXXXXX"
                      />
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          name="bankName"
                          defaultValue={companySettings?.bankDetails?.bankName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Input
                          id="branch"
                          name="branch"
                          defaultValue={companySettings?.bankDetails?.branch}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountNo">Account Number</Label>
                        <Input
                          id="accountNo"
                          name="accountNo"
                          defaultValue={companySettings?.bankDetails?.accountNo}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ifsc">IFSC Code</Label>
                        <Input
                          id="ifsc"
                          name="ifsc"
                          defaultValue={companySettings?.bankDetails?.ifsc}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="upi">UPI ID</Label>
                        <Input
                          id="upi"
                          name="upi"
                          defaultValue={companySettings?.bankDetails?.upi}
                          placeholder="company@upi"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="swift">SWIFT Code</Label>
                        <Input
                          id="swift"
                          name="swift"
                          defaultValue={companySettings?.bankDetails?.swift}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateSettings.isPending}
                      className="flex items-center gap-2"
                    >
                      {updateSettings.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terms" className="space-y-6">
            <TermsConditionsManager />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">System settings will be implemented in future updates.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5"/>IndiaMART</CardTitle>
                <CardDescription>Store API key and trigger sync</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget as HTMLFormElement;
                    const apiKey = (form.elements.namedItem('indiaMartApiKey') as HTMLInputElement).value || "";
                    const schedule = (form.elements.namedItem('indiaMartSchedule') as HTMLSelectElement).value || "manual";
                    const integrationsData = { 
                      integrations: { 
                        indiaMart: { 
                          apiKey, 
                          schedule,
                          // Preserve lastSyncedAt if it exists
                          ...(companySettings?.integrations?.indiaMart?.lastSyncedAt && {
                            lastSyncedAt: companySettings.integrations.indiaMart.lastSyncedAt
                          })
                        } 
                      } 
                    };
                    console.log('Saving integrations data:', integrationsData);
                    updateSettings.mutate(integrationsData);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="indiaMartApiKey">API Key (glusr_crm_key)</Label>
                      <Input id="indiaMartApiKey" name="indiaMartApiKey" defaultValue={companySettings?.integrations?.indiaMart?.apiKey || ''} placeholder="mRy2F7pp4X/ETPet7nOJ7liGoVvNmTVhWw=="/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="indiaMartSchedule" className="flex items-center gap-1"><CalendarClock className="h-4 w-4"/>Auto-Sync</Label>
                      <select id="indiaMartSchedule" name="indiaMartSchedule" defaultValue={companySettings?.integrations?.indiaMart?.schedule || 'manual'} className="border rounded px-3 py-2 w-full">
                        <option value="manual">Manual</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <div className="text-xs text-gray-500">Last synced: {companySettings?.integrations?.indiaMart?.lastSyncedAt ? new Date(companySettings.integrations.indiaMart.lastSyncedAt).toLocaleString() : 'Never'}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={updateSettings.isPending}>{updateSettings.isPending ? 'Saving...' : 'Save'}</Button>
                    <Button type="button" variant="outline" onClick={async () => {
                      const apiKey = companySettings?.integrations?.indiaMart?.apiKey;
                      if (!apiKey) { toast({ title: 'Missing API key', description: 'Save IndiaMART API key first.', variant: 'destructive' }); return; }
                      try {
                        const res = await fetch('/api/integrations/indiamart/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey })});
                        const json = await res.json();
                        if (!res.ok) { throw new Error(json.message || 'Sync failed'); }
                        queryClient.invalidateQueries({ queryKey: ["/api/company-settings"] });
                        queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
                        toast({ title: 'IndiaMART Sync Complete', description: `Imported ${json.created} lead(s)` });
                      } catch (e: any) {
                        toast({ title: 'Sync failed', description: String(e.message || e), variant: 'destructive' });
                      }
                    }}>Sync Now</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}



