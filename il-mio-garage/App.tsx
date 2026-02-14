
import React, { useState, useEffect } from 'react';
import { Car, ViewState, TireType } from './types';
import Dashboard from './components/Dashboard';
import CarForm from './components/CarForm';
import StatusBadge from './components/StatusBadge';
import Settings from './components/Settings';

type SortOrder = 'none' | 'newest' | 'oldest';

const EMPTY_CAR_STATE: Partial<Car> = {
  owner: '',
  plate: '',
  chassis: '',
  photoUrl: 'https://picsum.photos/400/300',
  registrationDate: '',
  taxExpiry: '',
  insuranceExpiry: '',
  revisionExpiry: '',
  serviceExpiry: '',
  tires: TireType.SUMMER,
  tireSize: '',
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  
  // Form State gestito centralmente per permettere il salvataggio rapido dal tasto +
  const [formData, setFormData] = useState<Partial<Car>>(EMPTY_CAR_STATE);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('garage_cars');
    if (saved) {
      setCars(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('garage_cars', JSON.stringify(cars));
  }, [cars]);

  const handleSaveCar = (car: Car, stayInAdd: boolean = false) => {
    setCars(prev => {
      const exists = prev.find(c => c.id === car.id);
      if (exists) {
        return prev.map(c => c.id === car.id ? car : c);
      }
      return [car, ...prev]; // Aggiungi in alto
    });

    if (stayInAdd) {
      // Notifica di salvataggio
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);
      
      // Resetta per il prossimo inserimento senza uscire dalla vista
      setFormData(EMPTY_CAR_STATE);
      setSelectedCar(null);
    } else {
      setView('dashboard');
      setSelectedCar(null);
      setFormData(EMPTY_CAR_STATE);
    }
  };

  const handlePlusButtonClick = () => {
    if (view === 'add') {
      // Se siamo già in modalità aggiunta, il tasto + salva l'attuale e ne prepara una nuova
      if (!formData.plate || !formData.owner) {
        alert("Completa almeno Targa e Proprietario per salvare.");
        return;
      }
      const newCar = {
        ...formData,
        id: selectedCar?.id || Date.now().toString(),
      } as Car;
      handleSaveCar(newCar, true);
    } else {
      // Se siamo altrove, apriamo il modulo vuoto
      setSelectedCar(null);
      setFormData(EMPTY_CAR_STATE);
      setView('add');
    }
  };

  const confirmDelete = () => {
    if (selectedCar) {
      setCars(prev => prev.filter(c => c.id !== selectedCar.id));
      setShowDeleteModal(false);
      setSelectedCar(null);
      setView('dashboard');
    }
  };

  const filteredCars = cars.filter(c => 
    c.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCars = [...filteredCars].sort((a, b) => {
    if (sortOrder === 'none') return 0;
    const dateA = a.registrationDate || '0000-00-00';
    const dateB = b.registrationDate || '0000-00-00';
    return sortOrder === 'newest' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
  });

  const toggleSort = () => {
    if (sortOrder === 'none') setSortOrder('newest');
    else if (sortOrder === 'newest') setSortOrder('oldest');
    else setSortOrder('none');
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto relative shadow-2xl overflow-x-hidden pb-24">
      
      {/* Save Toast Notification */}
      {showSaveToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-in slide-in-from-top-full flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Auto Salvata!
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Elimina Veicolo</h3>
            <p className="text-slate-500 text-center text-sm mb-6">Sei sicuro di voler eliminare definitivamente la targa {selectedCar.plate}?</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition">Sì, elimina</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold active:scale-95 transition">Annulla</button>
            </div>
          </div>
        </div>
      )}

      <main>
        {view === 'dashboard' && (
          <Dashboard cars={cars} onSelectCar={(car) => { setSelectedCar(car); setView('detail'); }} />
        )}

        {view === 'list' && (
          <div className="p-4 pb-24 space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold text-slate-800">Tutti i Veicoli</h1>
              <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{filteredCars.length}</span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type="text" placeholder="Cerca targa o proprietario..." className="w-full p-4 pl-12 bg-white rounded-2xl shadow-sm border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-[18px] text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <button onClick={toggleSort} className={`p-4 rounded-2xl shadow-sm border transition-all ${sortOrder !== 'none' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              {sortedCars.map(car => (
                <div key={car.id} onClick={() => { setSelectedCar(car); setView('detail'); }} className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 active:scale-95 transition cursor-pointer border border-slate-100">
                  <img src={car.photoUrl} alt={car.plate} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{car.plate}</p>
                    <p className="text-xs text-slate-500">{car.owner}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{car.tires}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'add' && (
          <CarForm 
            onSave={(car) => handleSaveCar(car, false)} 
            onCancel={() => { setView(selectedCar ? 'detail' : 'dashboard'); }} 
            initialData={selectedCar || undefined}
            formData={formData}
            setFormData={setFormData}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        )}

        {view === 'detail' && selectedCar && (
          <div className="p-0 pb-24 relative min-h-screen bg-white animate-in slide-in-from-right duration-300">
            <div className="relative h-64">
              <img src={selectedCar.photoUrl} alt={selectedCar.plate} className="w-full h-full object-cover" />
              <button onClick={() => setView('list')} className="absolute top-4 left-4 bg-white/80 backdrop-blur p-2 rounded-full shadow-lg active:scale-90 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            </div>
            <div className="p-6 -mt-8 bg-white rounded-t-3xl relative shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-black text-slate-900">{selectedCar.plate}</h1>
                  <p className="text-slate-500 font-medium">{selectedCar.owner}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase mb-1 shadow-sm">{selectedCar.tires}</div>
                  <p className="text-sm font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{selectedCar.tireSize || '---'}</p>
                </div>
              </div>
              <div className="space-y-6">
                <section className="bg-slate-50 p-5 rounded-2xl space-y-4">
                  <StatusBadge label="Bollo" expiryDate={selectedCar.taxExpiry} />
                  <StatusBadge label="Assicurazione" expiryDate={selectedCar.insuranceExpiry} />
                  <StatusBadge label="Revisione" expiryDate={selectedCar.revisionExpiry} />
                  <StatusBadge label="Tagliando" expiryDate={selectedCar.serviceExpiry} />
                </section>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => { setFormData(selectedCar); setView('add'); }} className="flex-1 py-4 bg-slate-100 text-slate-800 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition">Modifica</button>
                  <button onClick={() => setShowDeleteModal(true)} className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition">Elimina</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'settings' && <Settings />}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 backdrop-blur-md border-t border-slate-100 px-6 py-3 flex justify-between items-center z-50">
        <button onClick={() => { setSelectedCar(null); setView('dashboard'); }} className={`p-2 flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>
        <button onClick={() => { setSelectedCar(null); setView('list'); }} className={`p-2 flex flex-col items-center gap-1 transition-colors ${view === 'list' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          <span className="text-[10px] font-bold">Veicoli</span>
        </button>
        <div className="relative -top-8">
          <button 
            onClick={handlePlusButtonClick}
            className={`${view === 'add' ? 'bg-green-600' : 'bg-indigo-600'} text-white p-4 rounded-full shadow-xl shadow-indigo-200 active:scale-90 transition transform duration-300`}
            title={view === 'add' ? "Salva e aggiungi nuova" : "Aggiungi veicolo"}
          >
            {view === 'add' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
        <button className="p-2 flex flex-col items-center gap-1 text-slate-400 opacity-50 cursor-not-allowed">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[10px] font-bold">Storico</span>
        </button>
        <button onClick={() => { setSelectedCar(null); setView('settings'); }} className={`p-2 flex flex-col items-center gap-1 transition-colors ${view === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="text-[10px] font-bold">Impostazioni</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
