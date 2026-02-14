
import React, { useRef } from 'react';
import { Car, TireType } from '../types';
import { analyzeCarDocument } from '../services/geminiService';

interface CarFormProps {
  onSave: (car: Car) => void;
  onCancel: () => void;
  initialData?: Car;
  formData: Partial<Car>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Car>>>;
  isAnalyzing: boolean;
  setIsAnalyzing: (val: boolean) => void;
}

const CarForm: React.FC<CarFormProps> = ({ 
  onSave, 
  onCancel, 
  initialData, 
  formData, 
  setFormData,
  isAnalyzing,
  setIsAnalyzing
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, photoUrl: base64String }));
        
        if (confirm("Vuoi analizzare l'immagine con l'AI per compilare i campi automaticamente?")) {
          setIsAnalyzing(true);
          const result = await analyzeCarDocument(base64String);
          if (result) {
            setFormData(prev => ({ ...prev, ...result }));
          }
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plate || !formData.owner) {
      alert("Targa e Proprietario sono obbligatori");
      return;
    }
    onSave({
      ...formData,
      id: initialData?.id || Date.now().toString(),
    } as Car);
  };

  const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1";

  return (
    <div className="pb-32 p-4 max-w-lg mx-auto bg-white min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">
        {initialData?.id ? 'Modifica Auto' : 'Aggiungi Auto'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto Preview */}
        <div className="relative">
          <img 
            src={formData.photoUrl || 'https://picsum.photos/400/300'} 
            alt="Auto" 
            className="w-full h-44 object-cover rounded-3xl shadow-md border-2 border-slate-100"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-3 right-3 bg-indigo-600 text-white p-3 rounded-2xl shadow-lg active:scale-90 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        </div>

        {isAnalyzing && (
          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl flex items-center gap-3 animate-pulse">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
            <span className="text-xs text-indigo-700 font-bold">L'AI sta leggendo il documento...</span>
          </div>
        )}

        {/* Sezione 1: Dati Identificativi */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Dati Veicolo</h3>
          </div>
          
          <div>
            <label className={labelClass}>Proprietario</label>
            <input
              type="text"
              className={inputClass}
              value={formData.owner || ''}
              onChange={e => setFormData({ ...formData, owner: e.target.value })}
              placeholder="es. Mario Rossi"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Targa</label>
              <input
                type="text"
                className={`${inputClass} font-mono font-bold text-center uppercase`}
                value={formData.plate || ''}
                onChange={e => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                placeholder="AA123BB"
              />
            </div>
            <div>
              <label className={labelClass}>Immatricolazione</label>
              <input
                type="date"
                className={inputClass}
                value={formData.registrationDate || ''}
                onChange={e => setFormData({ ...formData, registrationDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Telaio (Chassis)</label>
            <input
              type="text"
              className={`${inputClass} font-mono text-xs uppercase`}
              value={formData.chassis || ''}
              onChange={e => setFormData({ ...formData, chassis: e.target.value.toUpperCase() })}
              placeholder="Codice telaio..."
            />
          </div>
        </section>

        {/* Sezione 2: Scadenze */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Scadenze Amministrative</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Scadenza Bollo</label>
              <input
                type="date"
                className={inputClass}
                value={formData.taxExpiry || ''}
                onChange={e => setFormData({ ...formData, taxExpiry: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Assicurazione</label>
              <input
                type="date"
                className={inputClass}
                value={formData.insuranceExpiry || ''}
                onChange={e => setFormData({ ...formData, insuranceExpiry: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Revisione</label>
              <input
                type="date"
                className={inputClass}
                value={formData.revisionExpiry || ''}
                onChange={e => setFormData({ ...formData, revisionExpiry: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Prossimo Tagliando</label>
              <input
                type="date"
                className={inputClass}
                value={formData.serviceExpiry || ''}
                onChange={e => setFormData({ ...formData, serviceExpiry: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* Sezione 3: Pneumatici */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Pneumatici</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Stagione</label>
              <select
                className={inputClass}
                value={formData.tires || TireType.SUMMER}
                onChange={e => setFormData({ ...formData, tires: e.target.value as TireType })}
              >
                {Object.values(TireType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Misure</label>
              <input
                type="text"
                className={inputClass}
                value={formData.tireSize || ''}
                onChange={e => setFormData({ ...formData, tireSize: e.target.value })}
                placeholder="es. 205/55 R16"
              />
            </div>
          </div>
        </section>

        {/* Note */}
        <section>
          <label className={labelClass}>Note e Manutenzioni</label>
          <textarea
            className={`${inputClass} min-h-[100px] resize-none`}
            value={formData.notes || ''}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Aggiungi dettagli extra..."
          />
        </section>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 px-4 rounded-2xl font-bold text-slate-500 bg-slate-100 active:scale-95 transition"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="flex-1 py-4 px-4 rounded-2xl font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-100 active:scale-95 transition"
          >
            Salva e Chiudi
          </button>
        </div>
      </form>
    </div>
  );
};

export default CarForm;
