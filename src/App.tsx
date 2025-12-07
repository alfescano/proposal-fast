import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { BrandKitProvider } from "@/contexts/BrandKitContext";
import { AuthProvider } from "@/contexts/AuthContext";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/SignUp";
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

import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrandKitProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* ✅ REQUIRED for Google OAuth */}
              <Route
                path="/login/sso-callback"
                element={<AuthenticateWithRedirectCallback />}
              />

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
        </AuthProvider>
      </BrandKitProvider>
    </ThemeProvider>
  );
}
