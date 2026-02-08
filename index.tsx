import React from "react";
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { I18nProvider } from './lib/i18n';
import App from './App';
import './index.css';
import Preview from './Preview';

// GLOBAL EMERGENCY LOGGING
console.log("DEBUG: index.tsx execution started");
window.onerror = (msg, url, lineNo, columnNo, error) => {
  console.error("FATAL BUNDLE ERROR:", { msg, url, lineNo, columnNo, error });
  const root = document.getElementById('root');
  if (root) root.innerHTML = `<div style="padding:20px; color:red; font-family:sans-serif;"><h1>Fatal UI Error</h1><p>${msg}</p></div>`;
  return false;
};

window.onunhandledrejection = (event) => {
  console.error("UNHANDLED REJECTION:", event.reason);
};

try {
  const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_c2FmZS1yZWRoZWQtODQuY2xlcmsuYWNjb3VudHMuZGV2JA";
  console.log("DEBUG: Publishable Key type:", typeof PUBLISHABLE_KEY);

  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error("No root element found");

  console.log("DEBUG: Creating root...");
  const root = createRoot(rootElement);

  console.log("DEBUG: Rendering App...");
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <I18nProvider>
          <Preview />
        </I18nProvider>
      </ClerkProvider>
    </React.StrictMode>
  );
  console.log("DEBUG: root.render called successfully");
} catch (error) {
  console.error("CRITICAL INDEX ERROR:", error);
  const root = document.getElementById('root');
  if (root) root.innerHTML = `<div style="padding:20px; color:red;"><h1>Critical Boot Error</h1><pre>${error instanceof Error ? error.stack : String(error)}</pre></div>`;
}

