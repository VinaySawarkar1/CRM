import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorBoundary } from "@/components/error-boundary";
import { applyTheme, getThemeConfig } from "@/lib/theme-fallback";
import { useEffect } from "react";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import LeadsPage from "@/pages/leads-page";
import OrdersPage from "@/pages/orders-page";
import InventoryPage from "@/pages/inventory-page";
import TasksPage from "@/pages/tasks-page";
import EmployeeActivitiesPage from "@/pages/employee-activities-page";
import ReportsPage from "@/pages/reports-page";
import CustomersPage from "@/pages/customers-page";
import QuotationsPage from "@/pages/quotations-page";
import QuotationFormPage from "@/pages/quotation-form-page";
import InvoicesPage from "@/pages/invoices-page";
import InvoiceFormPage from "@/pages/invoice-form-page";
import PaymentsPage from "@/pages/payments-page";
import PurchaseOrdersPage from "@/pages/purchase-orders-page";
import PurchaseOrderFormPage from "@/pages/purchase-order-form-page";
import SalesTargetsPage from "@/pages/sales-targets-page";
import ManufacturingPage from "@/pages/manufacturing-page";
import SettingsPage from "@/pages/settings-page";
import UsersPage from "@/pages/users-page";
import ApprovalsPage from "@/pages/approvals-page";
import ProformaFormPage from "@/pages/proforma-form-page";

import NotFoundPage from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { queryClient } from "./lib/queryClient";

function App() {
  // Apply theme on app load
  useEffect(() => {
    const theme = getThemeConfig();
    applyTheme(theme);
  }, []);

  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/" component={DashboardPage} />
          <ProtectedRoute path="/leads" component={LeadsPage} />
          <ProtectedRoute path="/orders" component={OrdersPage} />
          <ProtectedRoute path="/inventory" component={InventoryPage} />
          <ProtectedRoute path="/tasks" component={TasksPage} />
          <ProtectedRoute path="/employee-activities" component={EmployeeActivitiesPage} />
          <ProtectedRoute path="/reports" component={ReportsPage} />
          <ProtectedRoute path="/customers" component={CustomersPage} />
          <ProtectedRoute path="/quotations" component={QuotationsPage} />
          <ProtectedRoute path="/quotations/new" component={QuotationFormPage} />
          <ProtectedRoute path="/quotations/edit/:id" component={QuotationFormPage} />
          <ProtectedRoute path="/proforma/new" component={ProformaFormPage} />
          <ProtectedRoute path="/proforma/edit/:id" component={ProformaFormPage} />
          <ProtectedRoute path="/invoices" component={InvoicesPage} />
          <ProtectedRoute path="/invoices/new" component={InvoiceFormPage} />
          <ProtectedRoute path="/invoices/edit/:id" component={InvoiceFormPage} />
          <ProtectedRoute path="/payments" component={PaymentsPage} />
          <ProtectedRoute path="/purchase-orders" component={PurchaseOrdersPage} />
          <ProtectedRoute path="/purchase-orders/new" component={PurchaseOrderFormPage} />
          <ProtectedRoute path="/purchase-orders/edit/:id" component={PurchaseOrderFormPage} />
          <ProtectedRoute path="/sales-targets" component={SalesTargetsPage} />
          <ProtectedRoute path="/manufacturing" component={ManufacturingPage} />
          <ProtectedRoute path="/settings" component={SettingsPage} />
          <ProtectedRoute path="/users" component={UsersPage} />
          <ProtectedRoute path="/approvals" component={ApprovalsPage} />

          <Route component={NotFoundPage} />
        </Switch>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
