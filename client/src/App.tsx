import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AlumniDashboard from "@/pages/alumni-dashboard";
import CompanyDashboard from "@/pages/company-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import VerifyEmail from "@/pages/verify-email";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Terms from "@/pages/terms";
import Directory from "@/pages/directory";
import Suggestions from "@/pages/suggestions";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component, role }: { component: React.ComponentType; role?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  if (role && user.role !== role) {
    if (user.role === "ADMIN") return <Redirect to="/admin" />;
    return <Redirect to={user.role === "ALUMNI" ? "/dashboard" : "/company"} />;
  }

  return <Component />;
}

function GuestRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    if (user.role === "ADMIN") return <Redirect to="/admin" />;
    return <Redirect to={user.role === "ALUMNI" ? "/dashboard" : "/company"} />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login">{() => <GuestRoute component={Login} />}</Route>
      <Route path="/register">{() => <GuestRoute component={Register} />}</Route>
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password">{() => <GuestRoute component={ForgotPassword} />}</Route>
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/terms" component={Terms} />
      <Route path="/directorio" component={Directory} />
      <Route path="/sugerencias" component={Suggestions} />
      <Route path="/dashboard">{() => <ProtectedRoute component={AlumniDashboard} role="ALUMNI" />}</Route>
      <Route path="/company">{() => <ProtectedRoute component={CompanyDashboard} role="COMPANY" />}</Route>
      <Route path="/admin">{() => <ProtectedRoute component={AdminDashboard} role="ADMIN" />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
