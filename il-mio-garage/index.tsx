
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Errore critico: Elemento root non trovato");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Errore durante il rendering:", error);
    rootElement.innerHTML = `<div style="padding: 20px; text-align: center; color: #ef4444;">
      <h2 style="font-weight: bold;">Errore di avvio</h2>
      <p style="font-size: 14px;">Il browser del tuo dispositivo potrebbe essere troppo vecchio.</p>
      <p style="font-size: 12px; margin-top: 10px;">Dettaglio: ${error instanceof Error ? error.message : 'Errore sconosciuto'}</p>
    </div>`;
  }
}
