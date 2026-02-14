
import React, { useState, useEffect, useRef } from 'react';

const Settings: React.FC = () => {
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUrl = window.location.href;
  const isBlob = currentUrl.startsWith('blob:');

  // Recupera l'eventuale URL salvato precedentemente per il QR
  useEffect(() => {
    const savedUrl = localStorage.getItem('garage_public_url');
    if (savedUrl) setManualUrl(savedUrl);
  }, []);

  const handleManualUrlChange = (val: string) => {
    setManualUrl(val);
    localStorage.setItem('garage_public_url', val);
  };

  const displayUrl = manualUrl || (isBlob ? '' : currentUrl);
  const cleanUrl = displayUrl.split('#')[0].split('?')[0];
  
  const qrUrl = cleanUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(cleanUrl)}`
    : null;

  const copyToClipboard = () => {
    if (!cleanUrl) {
      alert("Inserisci prima l'URL reale del progetto.");
      return;
    }
    navigator.clipboard.writeText(cleanUrl);
    alert("Link copiato negli appunti!");
  };

  const resetData = () => {
    if (confirm("Sei sicuro di voler cancellare TUTTI i dati? Questa azione è irreversibile.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // --- Logica Esporta ---
  const exportData = () => {
    const data = {
      cars: JSON.parse(localStorage.getItem('garage_cars') || '[]'),
      publicUrl: localStorage.getItem('garage_public_url') || ''
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `garage_backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Logica Importa ---
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("L'importazione sovrascriverà i dati attuali. Vuoi procedere?")) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (json.cars && Array.isArray(json.cars)) {
          localStorage.setItem('garage_cars', JSON.stringify(json.cars));
          if (json.publicUrl) localStorage.setItem('garage_public_url', json.publicUrl);
          
          alert("Dati importati con successo!");
          window.location.reload();
        } else {
          alert("File non valido. Assicurati che sia un backup del Garage.");
        }
      } catch (err) {
        alert("Errore durante la lettura del file JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="p-6 pb-32 space-y-8 animate-in fade-in duration-500 max-w-md mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Impostazioni</h1>
        <p className="text-slate-500 text-sm">Configura l'accesso e gestisci i dati</p>
      </header>

      {/* Avviso URL BLOB */}
      {isBlob && !manualUrl && (
        <section className="bg-red-50 border border-red-100 p-5 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="font-bold text-sm">Link non condivisibile</h3>
          </div>
          <p className="text-xs text-red-700 leading-relaxed">
            L'app è in modalità anteprima. Copia l'indirizzo reale del browser e incollalo sotto per generare il QR corretto.
          </p>
        </section>
      )}

      {/* Backup e Ripristino */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">Backup e Ripristino</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
          <button 
            onClick={exportData}
            className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition text-left"
          >
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Esporta Dati (JSON)</p>
              <p className="text-[10px] text-slate-400">Scarica un backup di tutte le auto</p>
            </div>
          </button>

          <button 
            onClick={handleImportClick}
            className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition text-left"
          >
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Importa Dati (JSON)</p>
              <p className="text-[10px] text-slate-400">Carica auto da un file di backup</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={importData} 
              className="hidden" 
              accept=".json" 
            />
          </button>
        </div>
      </section>

      {/* Configurazione URL QR */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">URL per QR Code</label>
          <input 
            type="text" 
            placeholder="Incolla qui il link https://..." 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            value={manualUrl}
            onChange={(e) => handleManualUrlChange(e.target.value)}
          />
        </div>

        {qrUrl ? (
          <div className="text-center space-y-4 pt-2">
            <div className="bg-white p-3 rounded-2xl inline-block border border-slate-100 shadow-inner">
              <img src={qrUrl} alt="QR Code" className="w-40 h-40 mx-auto rounded-lg" />
            </div>
            <button 
              onClick={copyToClipboard}
              className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition text-sm"
            >
              Copia Link Condivisibile
            </button>
          </div>
        ) : (
          <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-xs text-slate-400">Inserisci l'URL per il QR</p>
          </div>
        )}
      </section>

      {/* Azioni Sistema */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">Sistema</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
          <div className="p-4 flex justify-between items-center text-sm">
            <span className="text-slate-600 font-medium">Versione App</span>
            <span className="font-bold text-slate-800">v1.5.0</span>
          </div>
          <button 
            onClick={resetData}
            className="w-full p-4 flex justify-between items-center text-red-600 hover:bg-red-50 transition text-left"
          >
            <span className="text-sm font-bold">Resetta Garage</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </section>

      <div className="text-center opacity-20 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest">Garage Famiglia</p>
      </div>
    </div>
  );
};

export default Settings;
