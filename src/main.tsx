import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

try {
  createRoot(root).render(<App />);
} catch (e) {
  console.error("Failed to render app:", e);
  root.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background-color: #0a0a0a; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="text-align: center; max-width: 500px;">
        <h1 style="font-size: 32px; margin-bottom: 16px;">Application Error</h1>
        <p style="font-size: 16px; color: #888; margin-bottom: 24px;">The application failed to load. Please try refreshing the page.</p>
        <button id="refresh-btn" style="padding: 12px 24px; background-color: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
          Refresh Page
        </button>
      </div>
    </div>
  `;
  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      location.reload();
    });
  }
}