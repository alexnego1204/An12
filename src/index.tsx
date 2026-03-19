
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';


// Polyfills for older browsers
if (typeof window !== 'undefined') {
  // ResizeObserver polyfill check
  if (!window.ResizeObserver) {
    console.warn("ResizeObserver not supported, Recharts might fail.");
  }
  
  // crypto.randomUUID polyfill
  if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
    (crypto as any).randomUUID = function() {
      return ([1e7] as any + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    };
  }
}

// Global error handler for mobile debugging
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global Error:", message, "at", source, ":", lineno, ":", colno, error);
  const root = document.getElementById('root');
  if (root && (root.innerHTML === '' || root.innerHTML.includes('loading') || root.innerHTML.includes('...'))) {
    root.innerHTML = `
      <div style="padding: 40px 20px; font-family: sans-serif; text-align: center; background: #f8fafc; min-height: 100vh;">
        <div style="max-width: 500px; margin: 0 auto; background: white; padding: 32px; border-radius: 16px; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 16px; font-weight: bold;">Erro de Inicialização</h1>
          <p style="color: #4b5563; margin-bottom: 24px;">Ocorreu um erro ao carregar o aplicativo no seu dispositivo.</p>
          
          <div style="background: #1e293b; color: #f1f5f9; padding: 16px; border-radius: 8px; text-align: left; font-family: monospace; font-size: 12px; overflow-x: auto; margin-bottom: 24px; border-left: 4px solid #ef4444;">
            <strong>Mensagem:</strong> ${message}<br>
            <strong>Local:</strong> ${source}:${lineno}:${colno}<br>
            ${error && error.stack ? `<strong>Stack:</strong><br>${error.stack.substring(0, 500)}...` : ''}
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button onclick="window.location.reload()" style="padding: 14px 24px; background: #f97316; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 16px;">
              Tentar Novamente
            </button>
            
            <button onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload();" style="padding: 12px 24px; background: #64748b; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 14px;">
              Limpar Dados e Reiniciar
            </button>

            <button onclick="navigator.serviceWorker.getRegistrations().then(regs => { for(let reg of regs) reg.unregister(); }).then(() => window.location.reload());" style="padding: 12px 24px; background: #94a3b8; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 14px;">
              Remover Cache (Service Worker)
            </button>
          </div>
          
          <p style="margin-top: 32px; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">
            Alex Nego 12 Fitness - v1.0.2
          </p>
        </div>
      </div>
    `;
  }
};

console.log("Index.tsx loading...");
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Clear fallback if it exists
const fallback = document.getElementById('loading-fallback');
if (fallback) {
  rootElement.innerHTML = '';
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
