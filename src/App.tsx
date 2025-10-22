import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { BrandKitProvider } from "@/contexts/BrandKitContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Generator from "@/pages/Generator";
import Pricing from "@/pages/Pricing";
import Teams from "@/pages/Teams";
import CRMSettings from "@/pages/CRMSettings";
import CalendarSettings from "@/pages/CalendarSettings";
import NotificationSettings from "@/pages/NotificationSettings";
import WebhookSettings from "@/pages/WebhookSettings";
import BrandKitSettings from "@/pages/BrandKitSettings";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Refund from "@/pages/Refund";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/NotFound";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function App() {
  if (!clerkPubKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Configuration Error</h1>
          <p className="text-muted-foreground">Clerk public key is not configured</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ErrorBoundary>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AuthProvider>
            <BrandKitProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/refund" element={<Refund />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/generator"
                    element={
                      <ProtectedRoute>
                        <Generator />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/teams"
                    element={
                      <ProtectedRoute>
                        <Teams />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/crm-settings"
                    element={
                      <ProtectedRoute>
                        <CRMSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/calendar-settings"
                    element={
                      <ProtectedRoute>
                        <CalendarSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/webhooks"
                    element={
                      <ProtectedRoute>
                        <WebhookSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/brand-kit"
                    element={
                      <ProtectedRoute>
                        <BrandKitSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </BrandKitProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </ClerkProvider>
  );
}