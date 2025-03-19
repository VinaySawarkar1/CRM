import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import DashboardPage from "@/pages/dashboard-page";
import AuthPage from "@/pages/auth-page";
import LeadsPage from "@/pages/leads-page";
import OrdersPage from "@/pages/orders-page";
import InventoryPage from "@/pages/inventory-page";
import TasksPage from "@/pages/tasks-page";
import ToastNotification from "@/components/ui/toast-notification";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/leads" component={LeadsPage} />
      <ProtectedRoute path="/orders" component={OrdersPage} />
      <ProtectedRoute path="/inventory" component={InventoryPage} />
      <ProtectedRoute path="/tasks" component={TasksPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <ToastNotification />
    </>
  );
}

export default App;
