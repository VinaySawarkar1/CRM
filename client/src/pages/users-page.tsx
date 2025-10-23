import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function UsersPage() {
  const { toast } = useToast();
  const { data: users = [] } = useQuery<any[]>({ queryKey: ["/api/users"] });
  const [formOpen, setFormOpen] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  const createUser = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest("POST", "/api/users", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setFormOpen(false);
      toast({ title: "User Created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  const featureList = [
    "dashboard","leads","customers","quotations","orders","invoices","payments","reports",
    "inventory","manufacturing","purchase orders","tasks","employee activities","support tickets","settings"
  ];

  return (
    <Layout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader title="User Management" subtitle="Approve users, create sub-users, and assign permissions" />

        <div className="mb-4 flex justify-end">
          <Button onClick={() => setFormOpen(v => !v)}>{formOpen ? 'Close' : 'Create Sub-User'}</Button>
        </div>

        {formOpen && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Create Sub-User</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const payload = {
                  username: fd.get('username') as string,
                  password: fd.get('password') as string,
                  name: fd.get('name') as string,
                  email: fd.get('email') as string,
                  phone: fd.get('phone') as string,
                  role: fd.get('role') as string,
                  isActive: (fd.get('isActive') as any) === 'on',
                  permissions,
                };
                createUser.mutate(payload);
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input name="username" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input name="password" type="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <select name="role" className="border rounded px-3 py-2 w-full" defaultValue="user">
                      <option value="user">User</option>
                      <option value="sales">Sales</option>
                      <option value="accounts">Accounts</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input name="phone" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {featureList.map(f => (
                      <label key={f} className="text-sm flex items-center gap-2"><input type="checkbox" checked={permissions.includes(f)} onChange={(e) => {
                        setPermissions(prev => e.target.checked ? [...prev, f] : prev.filter(x => x !== f));
                      }} /> {f}</label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm flex items-center gap-2"><input type="checkbox" name="isActive" /> Active</label>
                  <Button type="submit" disabled={createUser.isPending}>Create</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left"><th className="p-2">Name</th><th className="p-2">Username</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Active</th><th className="p-2">Actions</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="p-2">{u.name}</td>
                      <td className="p-2">{u.username}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.role}</td>
                      <td className="p-2">{u.isActive ? 'Yes' : 'No'}</td>
                      <td className="p-2">
                        <Button variant="outline" size="sm" onClick={() => updateUser.mutate({ id: u.id, updates: { isActive: !u.isActive } })}>{u.isActive ? 'Deactivate' : 'Activate'}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}














