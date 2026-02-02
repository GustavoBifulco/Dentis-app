import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css'; // Importante para o Tailwind funcionar

// Importa a chave do .env
const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);

if (!PUBLISHABLE_KEY) {
  root.render(
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#e11d48' }}>Configuração Necessária</h1>
      <p>A chave <code>VITE_CLERK_PUBLISHABLE_KEY</code> não foi encontrada no arquivo <code>.env</code>.</p>
      <p>Por favor, adicione a chave para continuar.</p>
    </div>
  );
} else {
  root.render(
    <React.StrictMode>
      {/* O ClerkProvider precisa envolver o App para o login funcionar */}
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}
