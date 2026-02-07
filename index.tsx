import React from "react";
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

console.log("DEBUG: index.tsx minimal starting...");

const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("No root element");

const root = createRoot(rootElement);

if (!PUBLISHABLE_KEY) {
  root.render(<div>NO KEY</div>);
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}
