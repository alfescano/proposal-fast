import { supabase } from "@/lib/supabase";

export type ErrorSeverity = "info" | "warning" | "error" | "critical";

export interface ErrorLogData {
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  pageUrl?: string;
  severity?: ErrorSeverity;
  properties?: Record<string, any>;
}

// Track errors to error_logs table
export async function logError(errorData: ErrorLogData): Promise<void> {
  try {
    if (!supabase) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    await supabase.from("error_logs").insert({
      user_id: userId,
      error_type: errorData.errorType,
      error_message: errorData.errorMessage,
      error_stack: errorData.errorStack,
      page_url: errorData.pageUrl || window.location.pathname,
      user_agent: navigator.userAgent,
      severity: errorData.severity || "error",
      properties: errorData.properties || {},
    });
  } catch (error) {
    console.error("Error logging failed:", error);
  }
}

// Global error handler for unhandled errors
export function setupGlobalErrorHandler(): void {
  try {
    window.addEventListener("error", (event: ErrorEvent) => {
      try {
        logError({
          errorType: "UncaughtError",
          errorMessage: event.message,
          errorStack: event.error?.stack,
          severity: "critical",
          properties: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        });
      } catch (e) {
        console.debug("Failed to log error:", e);
      }
    });

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
      try {
        const message =
          event.reason instanceof Error ? event.reason.message : String(event.reason);
        logError({
          errorType: "UnhandledRejection",
          errorMessage: message,
          errorStack: event.reason?.stack,
          severity: "critical",
        });
      } catch (e) {
        console.debug("Failed to log rejection:", e);
      }
    });
  } catch (e) {
    console.debug("Failed to setup global error handler:", e);
  }
}

// Error boundary helper
export async function logBoundaryError(
  error: Error,
  errorInfo: { componentStack: string }
): Promise<void> {
  logError({
    errorType: "ReactError",
    errorMessage: error.message,
    errorStack: error.stack,
    severity: "critical",
    properties: {
      componentStack: errorInfo.componentStack,
    },
  });
}

// API error tracking
export async function logApiError(
  endpoint: string,
  status: number,
  errorMessage: string,
  duration?: number
): Promise<void> {
  logError({
    errorType: "APIError",
    errorMessage: `${endpoint} returned ${status}`,
    severity: status >= 500 ? "critical" : "error",
    properties: {
      endpoint,
      status,
      duration,
      message: errorMessage,
    },
  });
}

// Performance error (e.g., slow API)
export async function logPerformanceError(
  metric: string,
  value: number,
  threshold: number
): Promise<void> {
  logError({
    errorType: "PerformanceError",
    errorMessage: `${metric} exceeded threshold`,
    severity: "warning",
    properties: {
      metric,
      value,
      threshold,
    },
  });
}